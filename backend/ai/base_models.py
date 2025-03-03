import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
import logging

from backend.ai.utils import preprocess_time_series_data, calculate_confidence_intervals, detect_seasonality

logger = logging.getLogger(__name__)

class BaseForecasting:
    """Base class for all forecasting models"""
    
    def __init__(self, min_data_points=5):
        """Initialize forecasting with minimum required data points."""
        self.min_data_points = min_data_points
    
    def preprocess_data(self, cost_trend):
        """Preprocess cost data for forecasting."""
        return preprocess_time_series_data(
            cost_trend, 
            date_column='date', 
            value_column='cost', 
            min_data_points=self.min_data_points
        )
    
    def linear_regression_forecast(self, df, days_ahead):
        """Forecast using simple linear regression."""
        # Create feature for days since start
        dates = df.index.to_series()
        X = (dates - dates.min()).dt.days.values.reshape(-1, 1)
        y = df['cost'].values
        
        # Train model
        model = LinearRegression()
        model.fit(X, y)
        
        # Generate future dates
        last_date = df.index.max()
        future_dates = [last_date + timedelta(days=i+1) for i in range(days_ahead)]
        
        # Create features for prediction
        future_X = ((pd.Series(future_dates) - dates.min()).dt.days.values.reshape(-1, 1))
        
        # Predict
        predictions = model.predict(future_X)
        
        # Create result dataframe
        result = []
        for i, date in enumerate(future_dates):
            result.append({
                "date": date.strftime("%Y-%m-%d"),
                "predicted_cost": max(0, round(predictions[i], 2))
            })
            
        return result
    
    def predict_future_costs(self, cost_trend, days_ahead=7, algorithm=None):
        """Base implementation for cost prediction."""
        df = self.preprocess_data(cost_trend)
        if df is None:
            # Return empty predictions if not enough data
            return self._create_empty_prediction(days_ahead)
            
        # Default to linear regression in base class
        predictions = self.linear_regression_forecast(df, days_ahead)
        
        # Add confidence intervals
        predictions = calculate_confidence_intervals(predictions)
        
        return {
            "forecast": predictions,
            "algorithm_used": "linear",
            "algorithm_name": "Linear Regression",
            "data_points_used": len(df),
            "forecast_generated_at": datetime.now().isoformat()
        }
    
    def _create_empty_prediction(self, days_ahead):
        """Create empty prediction when forecasting fails."""
        last_date = datetime.now()
        
        predictions = []
        for i in range(days_ahead):
            date = last_date + timedelta(days=i+1)
            predictions.append({
                "date": date.strftime("%Y-%m-%d"),
                "predicted_cost": None,
                "lower_bound": None,
                "upper_bound": None
            })
            
        return {
            "forecast": predictions,
            "algorithm_used": None,
            "algorithm_name": "Not Applied",
            "data_points_used": 0,
            "forecast_generated_at": datetime.now().isoformat(),
            "error": "Insufficient data for forecasting"
        }

class BaseAnomalyDetector:
    """Base class for all anomaly detection models"""
    
    def __init__(self, min_data_points=7, default_threshold=2.0):
        """Initialize anomaly detection with configuration parameters."""
        self.min_data_points = min_data_points
        self.default_threshold = default_threshold
        
    def preprocess_data(self, cost_data):
        """
        Preprocess cost data for anomaly detection.
        
        Args:
            cost_data: List of dicts with service, date, cost, etc.
            
        Returns:
            pd.DataFrame: Processed dataframe
        """
        # Reuse the utility function
        return preprocess_time_series_data(
            cost_data, 
            date_column='date', 
            value_column='cost', 
            min_data_points=self.min_data_points
        )
            
    def detect_anomalies(self, cost_data, threshold=None):
        """
        Basic implementation to detect anomalies using z-score method.
        
        Args:
            cost_data: List of dicts with 'date', 'cost', 'service', etc.
            threshold: Detection sensitivity threshold (lower = more sensitive)
            
        Returns:
            dict: Detection results including anomalies and metadata
        """
        # Use default threshold if not specified
        if threshold is None:
            threshold = self.default_threshold
            
        df = self.preprocess_data(cost_data)
        if df is None:
            return {
                "anomalies": [],
                "detection_method": "zscore",
                "threshold": threshold,
                "data_points": 0,
                "error": "Insufficient data for anomaly detection"
            }
        
        try:
            anomalies = self._detect_with_zscore(df, threshold)
        except Exception as e:
            logger.error(f"Error during anomaly detection: {str(e)}")
            return {
                "anomalies": [],
                "detection_method": "zscore",
                "threshold": threshold,
                "data_points": len(df) if df is not None else 0,
                "error": f"Anomaly detection failed: {str(e)}"
            }
            
        return {
            "anomalies": anomalies,
            "detection_method": "zscore",
            "method_name": "Z-Score Statistical",
            "threshold": threshold,
            "data_points": len(df),
            "detection_timestamp": datetime.now().isoformat()
        }
    
    def _detect_with_zscore(self, df, threshold):
        """Detect anomalies using Z-Score method."""
        # Compute z-scores
        df['zscore'] = np.abs((df['cost'] - df['cost'].mean()) / df['cost'].std())
        
        # Identify anomalies
        anomalies = []
        for idx, row in df[df['zscore'] > threshold].iterrows():
            anomaly = {
                "date": row['date'].strftime("%Y-%m-%d") if isinstance(row['date'], pd.Timestamp) else row['date'],
                "service": row.get('service', 'Unknown'),
                "provider": row.get('provider', 'Unknown'),
                "cost": row['cost'],
                "anomaly_score": round(float(row['zscore']), 2),
                "detection_method": "zscore"
            }
            # Calculate baseline cost (median of non-anomalous points)
            baseline = df[df['zscore'] <= threshold]['cost'].median()
            anomaly["baseline_cost"] = round(float(baseline), 2)
            anomaly["cost_difference"] = round(float(row['cost'] - baseline), 2)
            anomaly["percentage_increase"] = round(float((row['cost'] - baseline) / baseline * 100 if baseline > 0 else 0), 2)
            
            anomalies.append(anomaly)
            
        return anomalies

# backend/ai/base_models.py (add to existing file)

class BaseOptimizer:
    """Base class for all optimization engines"""
    
    def __init__(self, utilization_threshold=0.3):
        """Initialize the optimizer with configuration parameters."""
        self.utilization_threshold = utilization_threshold
    
    def _create_empty_result(self):
        """Create empty result when no cost data is available."""
        return {
            "recommendations": [],
            "potential_savings": 0,
            "coverage": 0,
            "timestamp": datetime.now().isoformat()
        }
    
    def generate_optimization_suggestions(self, cost_data, *args, **kwargs):
        """
        Generate basic cost optimization recommendations.
        
        Args:
            cost_data: List of dicts with provider, service, cost, etc.
            
        Returns:
            dict: Optimization results including recommendations and metadata
        """
        if not cost_data:
            return self._create_empty_result()
        
        # Extract costs for clustering
        costs = np.array([entry.get("cost", 0) for entry in cost_data]).reshape(-1, 1)
        
        # Skip ML if not enough data
        if len(costs) < 3:
            return self._basic_recommendations(cost_data)
        
        # Use KMeans to identify cost groups
        from sklearn.cluster import KMeans
        kmeans = KMeans(n_clusters=min(3, len(costs)))
        kmeans.fit(costs)
        
        # Get cluster centers (average cost for each cluster)
        centers = kmeans.cluster_centers_.flatten()
        
        # Map each cost entry to its cluster
        labels = kmeans.labels_
        
        recommendations = []
        for i, entry in enumerate(cost_data):
            # High-cost cluster gets stronger recommendations
            provider = entry.get("provider")
            service = entry.get("service")
            cost = entry.get("cost")
            
            cluster = labels[i]
            # If in the highest cost cluster
            if centers[cluster] == max(centers):
                # Generate a stronger recommendation
                rec = self._generate_recommendation(provider, service, "high")
            # If in the middle cost cluster
            elif centers[cluster] == sorted(centers)[len(centers)//2]:
                rec = self._generate_recommendation(provider, service, "medium")
            # If in the lowest cost cluster
            else:
                rec = self._generate_recommendation(provider, service, "low")
                
            recommendations.append(rec)
        
        return {
            "recommendations": recommendations,
            "potential_savings": sum(rec.get("savings", 0) for rec in recommendations),
            "coverage": len(recommendations) / len(cost_data) if cost_data else 0,
            "timestamp": datetime.now().isoformat()
        }
    
    def _generate_recommendation(self, provider, service, cost_level):
        """Generate a basic recommendation based on provider, service, and cost level."""
        # Default recommendation content based on provider and service
        if provider == "AWS":
            if service == "EC2":
                suggestion = "Consider using Reserved Instances for consistent workloads."
                savings = 100.0 if cost_level == "high" else 50.0 if cost_level == "medium" else 20.0
            elif service == "S3":
                suggestion = "Implement lifecycle policies to move data to lower-cost storage tiers."
                savings = 80.0 if cost_level == "high" else 40.0 if cost_level == "medium" else 15.0
            else:
                suggestion = "Review AWS cost optimization best practices."
                savings = 50.0 if cost_level == "high" else 25.0 if cost_level == "medium" else 10.0
                
        elif provider == "Azure":
            if service == "VM":
                suggestion = "Consider Azure Reserved VM Instances for consistent workloads."
                savings = 90.0 if cost_level == "high" else 45.0 if cost_level == "medium" else 18.0
            else:
                suggestion = "Review Azure cost optimization best practices."
                savings = 45.0 if cost_level == "high" else 22.0 if cost_level == "medium" else 9.0
                
        elif provider == "GCP":
            if service == "Compute Engine":
                suggestion = "Consider Committed Use Discounts for consistent workloads."
                savings = 95.0 if cost_level == "high" else 47.0 if cost_level == "medium" else 19.0
            else:
                suggestion = "Review GCP cost optimization best practices."
                savings = 48.0 if cost_level == "high" else 24.0 if cost_level == "medium" else 9.5
                
        else:
            suggestion = "Review cloud cost optimization best practices."
            savings = 40.0 if cost_level == "high" else 20.0 if cost_level == "medium" else 8.0
            
        return {
            "provider": provider,
            "service": service,
            "suggestion": suggestion,
            "savings": savings,
            "command": "N/A"
        }
    
    def _basic_recommendations(self, cost_data):
        """Generate basic recommendations for small datasets."""
        recommendations = []

        for entry in cost_data:
            provider = entry.get("provider")
            service = entry.get("service")
            cost = entry.get("cost")

            if cost > 100:  # Example threshold for high cost
                rec = self._generate_recommendation(provider, service, "high")
            elif cost > 50:
                rec = self._generate_recommendation(provider, service, "medium")
            else:
                rec = self._generate_recommendation(provider, service, "low")
                
            recommendations.append(rec)

        return {
            "recommendations": recommendations,
            "potential_savings": sum(rec.get("savings", 0) for rec in recommendations),
            "coverage": len(recommendations) / len(cost_data) if cost_data else 0,
            "timestamp": datetime.now().isoformat()
        }