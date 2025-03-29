# app/services/enhanced_anomaly_detection.py
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import numpy as np
from scipy import stats
from sklearn.ensemble import IsolationForest
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sqlalchemy.orm import Session

from app.db.models import CostData, CloudAccount

class EnhancedAnomalyDetection:
    """Enhanced service for detecting cost anomalies using multiple algorithms."""
    
    def __init__(self, db: Session):
        self.db = db

    def detect_anomalies(self, 
                         account_id: Optional[int] = None, 
                         days: int = 30, 
                         sensitivity: float = 2.0,
                         detection_methods: List[str] = None) -> List[Dict[str, Any]]:
        """
        Detect cost anomalies using multiple methods.
        
        Parameters:
        - account_id: Optional cloud account ID to filter by
        - days: Number of days to analyze
        - sensitivity: Z-score threshold (default 2.0, lower = more sensitive)
        - detection_methods: List of methods to use ['z_score', 'isolation_forest', 'time_series']
                            Default is all methods
        
        Returns list of anomalies with service, date, cost, detection method, and confidence
        """
        if detection_methods is None:
            detection_methods = ['z_score', 'isolation_forest', 'time_series']
            
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Get cost data
        query = self.db.query(
            CostData.date,
            CostData.service,
            CostData.resource_id,
            CostData.cost,
            CostData.tags
        ).filter(CostData.date >= cutoff_date)
        
        if account_id:
            query = query.filter(CostData.cloud_account_id == account_id)
            
        costs = query.order_by(CostData.service, CostData.date).all()
        
        if not costs:
            return []
        
        # Group by service and resource_id
        grouped_costs = {}
        for cost in costs:
            key = (cost.service, cost.resource_id)
            if key not in grouped_costs:
                grouped_costs[key] = []
            grouped_costs[key].append({
                'date': cost.date,
                'cost': cost.cost,
                'tags': cost.tags
            })
        
        # Apply different detection methods
        anomalies = []
        
        if 'z_score' in detection_methods:
            z_score_anomalies = self._detect_with_z_score(grouped_costs, sensitivity)
            anomalies.extend(z_score_anomalies)
            
        if 'isolation_forest' in detection_methods and len(costs) >= 10:
            isolation_forest_anomalies = self._detect_with_isolation_forest(grouped_costs, sensitivity)
            anomalies.extend(isolation_forest_anomalies)
            
        if 'time_series' in detection_methods and days >= 14:
            time_series_anomalies = self._detect_with_time_series(grouped_costs, sensitivity)
            anomalies.extend(time_series_anomalies)
        
        # Deduplicate anomalies (same resource on same date)
        deduplicated_anomalies = {}
        for anomaly in anomalies:
            key = (anomaly['service'], anomaly['resource_id'], anomaly['date'].strftime('%Y-%m-%d'))
            if key not in deduplicated_anomalies or anomaly['confidence'] > deduplicated_anomalies[key]['confidence']:
                deduplicated_anomalies[key] = anomaly
        
        # Sort anomalies by confidence (most anomalous first)
        return sorted(deduplicated_anomalies.values(), key=lambda x: x['confidence'], reverse=True)

    def _detect_with_z_score(self, grouped_costs: Dict[Tuple[str, str], List[Dict]], sensitivity: float) -> List[Dict[str, Any]]:
        """Detect anomalies using Z-score method."""
        anomalies = []
        
        for (service, resource_id), cost_data in grouped_costs.items():
            # Need enough data points for statistical significance
            if len(cost_data) < 5:
                continue
                
            costs_array = np.array([item['cost'] for item in cost_data])
            mean = np.mean(costs_array)
            std = np.std(costs_array)
            
            if std == 0:  # Skip if all values are the same
                continue
                
            for item in cost_data:
                z_score = (item['cost'] - mean) / std
                if abs(z_score) > sensitivity:
                    confidence = min(abs(z_score) / 10, 0.99)  # Normalize to 0-0.99 range
                    anomalies.append({
                        'service': service,
                        'resource_id': resource_id,
                        'date': item['date'],
                        'cost': item['cost'],
                        'avg_cost': mean,
                        'percent_difference': ((item['cost'] - mean) / mean) * 100,
                        'detection_method': 'z_score',
                        'confidence': confidence,
                        'explanation': f"Cost is {abs(z_score):.1f} standard deviations from the mean"
                    })
        
        return anomalies

    def _detect_with_isolation_forest(self, grouped_costs: Dict[Tuple[str, str], List[Dict]], sensitivity: float) -> List[Dict[str, Any]]:
        """Detect anomalies using Isolation Forest algorithm."""
        anomalies = []
        
        for (service, resource_id), cost_data in grouped_costs.items():
            # Need enough data points for model training
            if len(cost_data) < 10:
                continue
            
            # Extract features: cost, day of week, and lag-1 cost
            X = []
            for i, item in enumerate(cost_data):
                features = [
                    item['cost'],
                    item['date'].weekday(),  # Day of week (0=Monday, 6=Sunday)
                ]
                
                # Add lag-1 feature if available
                if i > 0:
                    features.append(cost_data[i-1]['cost'])
                else:
                    features.append(item['cost'])  # Use same cost for first point
                
                X.append(features)
            
            # Train isolation forest model
            contamination = min(0.1, max(0.01, 1.0 / sensitivity))  # Adjust contamination based on sensitivity
            model = IsolationForest(contamination=contamination, random_state=42)
            model.fit(X)
            
            # Get anomaly scores (-1 for anomalies, 1 for normal)
            predictions = model.predict(X)
            scores = model.decision_function(X)  # Lower score = more anomalous
            
            # Find anomalies
            for i, (pred, score) in enumerate(zip(predictions, scores)):
                if pred == -1:  # Anomaly detected
                    item = cost_data[i]
                    
                    # Calculate mean excluding this point
                    other_costs = [c['cost'] for j, c in enumerate(cost_data) if j != i]
                    mean = np.mean(other_costs) if other_costs else 0
                    
                    # Convert score to confidence (0-1 range, higher = more confident it's an anomaly)
                    confidence = min(0.95, max(0.5, 0.5 - score / 2))
                    
                    anomalies.append({
                        'service': service,
                        'resource_id': resource_id,
                        'date': item['date'],
                        'cost': item['cost'],
                        'avg_cost': mean,
                        'percent_difference': ((item['cost'] - mean) / mean) * 100 if mean > 0 else 0,
                        'detection_method': 'isolation_forest',
                        'confidence': confidence,
                        'explanation': "Unusual pattern detected by machine learning model"
                    })
        
        return anomalies

    def _detect_with_time_series(self, grouped_costs: Dict[Tuple[str, str], List[Dict]], sensitivity: float) -> List[Dict[str, Any]]:
        """Detect anomalies using time series analysis."""
        anomalies = []
        
        for (service, resource_id), cost_data in grouped_costs.items():
            # Need sufficient data for time series analysis
            if len(cost_data) < 14:
                continue
            
            # Sort by date
            cost_data = sorted(cost_data, key=lambda x: x['date'])
            
            # Extract dates and costs
            dates = [item['date'] for item in cost_data]
            costs = [item['cost'] for item in cost_data]
            
            # Check if we have daily data
            days_diff = [(dates[i+1] - dates[i]).days for i in range(len(dates)-1)]
            
            if not all(diff == 1 for diff in days_diff):
                # If data is not daily, we'll use a simpler approach
                anomalies.extend(self._detect_with_exponential_smoothing(service, resource_id, cost_data, sensitivity))
                continue
            
            try:
                # Try to decompose the time series into trend, seasonal, and residual components
                # Use period=7 for weekly seasonality
                decomposition = seasonal_decompose(costs, period=7, extrapolate_trend='freq')
                
                # Calculate residuals
                residuals = decomposition.resid
                
                # Find anomalies where residual is larger than sensitivity * std
                residual_std = np.std(residuals[~np.isnan(residuals)])
                if residual_std == 0:
                    continue
                
                for i, (date, cost, residual) in enumerate(zip(dates, costs, residuals)):
                    if np.isnan(residual):
                        continue
                        
                    if abs(residual) > sensitivity * residual_std:
                        # Calculate expected value (original - residual)
                        expected = cost - residual
                        
                        # Calculate confidence based on how extreme the residual is
                        confidence = min(abs(residual) / (10 * residual_std), 0.95)
                        
                        anomalies.append({
                            'service': service,
                            'resource_id': resource_id,
                            'date': date,
                            'cost': cost,
                            'avg_cost': expected,
                            'percent_difference': ((cost - expected) / expected) * 100 if expected > 0 else 0,
                            'detection_method': 'time_series_decomposition',
                            'confidence': confidence,
                            'explanation': "Unusual deviation from expected seasonal pattern"
                        })
            except Exception as e:
                # If decomposition fails, fall back to exponential smoothing
                anomalies.extend(self._detect_with_exponential_smoothing(service, resource_id, cost_data, sensitivity))
        
        return anomalies

    def _detect_with_exponential_smoothing(self, service: str, resource_id: str, cost_data: List[Dict], sensitivity: float) -> List[Dict[str, Any]]:
        """Detect anomalies using exponential smoothing."""
        anomalies = []
        
        # Extract costs
        costs = np.array([item['cost'] for item in cost_data])
        
        try:
            # Apply exponential smoothing
            model = ExponentialSmoothing(costs, trend='add', seasonal=None, damped=True)
            result = model.fit()
            
            # Get fitted values (one-step ahead forecasts)
            fitted_values = result.fittedvalues
            
            # Calculate residuals
            residuals = costs - fitted_values
            residual_std = np.std(residuals)
            
            if residual_std == 0:
                return []
            
            # Find anomalies
            for i, (item, residual, fitted) in enumerate(zip(cost_data, residuals, fitted_values)):
                if abs(residual) > sensitivity * residual_std:
                    confidence = min(abs(residual) / (5 * residual_std), 0.9)
                    
                    anomalies.append({
                        'service': service,
                        'resource_id': resource_id,
                        'date': item['date'],
                        'cost': item['cost'],
                        'avg_cost': fitted,
                        'percent_difference': ((item['cost'] - fitted) / fitted) * 100 if fitted > 0 else 0,
                        'detection_method': 'exponential_smoothing',
                        'confidence': confidence,
                        'explanation': "Unexpected spike compared to recent trend"
                    })
        except Exception as e:
            # If exponential smoothing fails, skip this resource
            pass
        
        return anomalies

    def get_contextual_anomalies(self, account_id: Optional[int] = None, days: int = 30) -> List[Dict[str, Any]]:
        """
        Detect contextual anomalies like:
        1. Weekend vs weekday patterns
        2. End-of-month spikes
        3. Correlated resources (when one goes up, others usually do too)
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        anomalies = []
        
        # Helper to check if date is a weekend
        def is_weekend(date):
            return date.weekday() >= 5  # 5=Saturday, 6=Sunday
        
        # Helper to check if date is end of month (last 3 days)
        def is_end_of_month(date):
            next_month = date.replace(day=28) + timedelta(days=4)
            last_day = next_month.replace(day=1) - timedelta(days=1)
            return (last_day.day - date.day) <= 2
        
        # Get daily costs grouped by service
        query = self.db.query(
            CostData.date,
            CostData.service,
            CostData.cloud_account_id
        ).filter(
            CostData.date >= cutoff_date
        )
        
        if account_id:
            query = query.filter(CostData.cloud_account_id == account_id)
            
        daily_costs = {}
        for item in query:
            key = (item.date.strftime('%Y-%m-%d'), item.service, item.cloud_account_id)
            if key not in daily_costs:
                daily_costs[key] = 0
            daily_costs[key] += item.cost
        
        # Analyze weekend vs weekday patterns
        weekend_costs = {}
        weekday_costs = {}
        
        for (date_str, service, acct_id), cost in daily_costs.items():
            date = datetime.strptime(date_str, '%Y-%m-%d')
            
            service_key = (service, acct_id)
            if is_weekend(date):
                if service_key not in weekend_costs:
                    weekend_costs[service_key] = []
                weekend_costs[service_key].append(cost)
            else:
                if service_key not in weekday_costs:
                    weekday_costs[service_key] = []
                weekday_costs[service_key].append(cost)
        
        # Find services with unusual weekend/weekday patterns
        for service_key in set(weekend_costs.keys()) | set(weekday_costs.keys()):
            service, acct_id = service_key
            
            wknd_costs = weekend_costs.get(service_key, [])
            wkdy_costs = weekday_costs.get(service_key, [])
            
            if len(wknd_costs) < 2 or len(wkdy_costs) < 2:
                continue
            
            wknd_avg = np.mean(wknd_costs)
            wkdy_avg = np.mean(wkdy_costs)
            
            # Skip very small costs
            if wknd_avg < 1.0 and wkdy_avg < 1.0:
                continue
            
            # Calculate ratio
            if wkdy_avg > 0:
                ratio = wknd_avg / wkdy_avg
                
                # Flag if weekend costs are unusually high compared to weekdays
                # (most services have lower usage on weekends)
                if ratio > 1.5:
                    anomalies.append({
                        'type': 'contextual',
                        'service': service,
                        'account_id': acct_id,
                        'subtype': 'weekend_pattern',
                        'description': f"Weekend costs are {ratio:.1f}x higher than weekday costs for {service}",
                        'weekday_avg': wkdy_avg,
                        'weekend_avg': wknd_avg,
                        'ratio': ratio,
                        'confidence': min(0.9, 0.5 + (ratio - 1.5) / 5)
                    })
                # Or flag if weekday costs are extremely high compared to weekend
                elif ratio < 0.2:  # weekday costs 5x+ higher than weekend
                    anomalies.append({
                        'type': 'contextual',
                        'service': service,
                        'account_id': acct_id,
                        'subtype': 'extreme_weekday_pattern',
                        'description': f"Weekday costs are {1/ratio:.1f}x higher than weekend costs for {service}",
                        'weekday_avg': wkdy_avg,
                        'weekend_avg': wknd_avg,
                        'ratio': ratio,
                        'confidence': min(0.8, 0.5 + (0.2 - ratio) / 0.4)
                    })
        
        # TO-DO: Analyze end-of-month patterns and correlated resources
        # This could be expanded in future versions
        
        return anomalies