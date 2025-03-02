import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from statsmodels.tsa.seasonal import seasonal_decompose
from datetime import datetime, timedelta
import logging
from typing import List, Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)

class EnhancedAnomalyDetection:
    """
    Advanced anomaly detection for cloud costs with multiple detection methods
    and automated root cause analysis.
    """
    
    DETECTION_METHODS = {
        "zscore": "Z-Score Statistical",
        "isolation_forest": "Isolation Forest (ML)",
        "dbscan": "DBSCAN Clustering",
        "seasonal_decompose": "Seasonal Decomposition",
        "ensemble": "Ensemble Method"
    }
    
    # Common causes of cost anomalies by service
    COMMON_CAUSES = {
        # AWS services
        "EC2": [
            "Instance count increased (autoscaling or manual)",
            "Changed instance types (more expensive tier)",
            "Spot instance to On-Demand transition",
            "Reserved Instance expiration",
            "Sustained CPU utilization increase",
            "EBS optimized option enabled"
        ],
        "S3": [
            "Large data upload/migration",
            "Increased data retrieval (GET requests)",
            "Cross-region data transfer",
            "Reduced object lifecycle efficiency",
            "Changed storage class",
            "Versioning explosion"
        ],
        "RDS": [
            "Database instance resizing",
            "Backup retention period extended",
            "Read replica added",
            "Multi-AZ deployment enabled",
            "Increased storage allocation",
            "Heavy query load causing I/O spikes"
        ],
        "Lambda": [
            "Invocation count spike",
            "Function execution timeout increase",
            "Memory allocation increase",
            "Code inefficiency causing longer runtimes",
            "Infinite recursion/loop",
            "Increased concurrent executions"
        ],
        "CloudFront": [
            "Traffic spike to edge locations",
            "Origin data transfer increase",
            "SSL certificate custom usage",
            "HTTPS usage increase",
            "Real-time log enablement"
        ],
        
        # Azure services
        "VM": [
            "VM count increased",
            "VM series/size upgraded",
            "Reserved Instance expiration",
            "Premium disk usage increase",
            "Windows VM instead of Linux",
            "Additional licensing costs"
        ],
        "Storage": [
            "Hot tier instead of cool/archive",
            "Geo-redundancy enabled",
            "Large data ingress/egress",
            "Transaction count increase",
            "Bandwidth usage spike",
            "Premium tier storage usage"
        ],
        "SQL Database": [
            "Database tier upgrade",
            "Additional databases provisioned",
            "Elastic pool setup change",
            "Backup retention increase",
            "Geo-replication enabled",
            "vCore model pricing change"
        ],
        
        # GCP services
        "Compute Engine": [
            "Instance count increased",
            "Machine type upgrade",
            "Sustained use discount loss",
            "Committed use discount expiration",
            "Premium OS licensing",
            "GPU/TPU addition"
        ],
        "Cloud Storage": [
            "Standard tier instead of Nearline/Coldline",
            "Retrieval pattern change",
            "Multi-regional instead of regional",
            "Excessive operations (Class A/B)",
            "Data replication settings change",
            "Accelerated network usage"
        ],
        "BigQuery": [
            "Query complexity/volume increase",
            "Storage growth",
            "Flat-rate model expired to on-demand",
            "Slot commitment change",
            "Data streaming insert volume",
            "Long-term storage discount loss"
        ]
    }
    
    # Default cause for unknown services
    DEFAULT_CAUSES = [
        "Significant usage increase",
        "Pricing tier/model change",
        "Resource count increase",
        "New feature enablement",
        "Cross-region/zone data transfer",
        "Reservation or commitment expiration"
    ]
    
    def __init__(self, min_data_points=7, default_threshold=3.0):
        """Initialize anomaly detection with configuration parameters."""
        self.min_data_points = min_data_points
        self.default_threshold = default_threshold
        
    def preprocess_data(self, cost_data: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Preprocess cost data for anomaly detection.
        
        Args:
            cost_data: List of dicts with service, date, cost, etc.
            
        Returns:
            pd.DataFrame: Processed dataframe
        """
        if not cost_data or len(cost_data) < self.min_data_points:
            logger.warning(f"Insufficient data points ({len(cost_data) if cost_data else 0}) "
                          f"for reliable anomaly detection. Minimum required: {self.min_data_points}")
            return None
            
        # Convert to dataframe
        df = pd.DataFrame(cost_data)
        
        # Convert dates to datetime
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'])
            
        # Sort by date if available
        if 'date' in df.columns:
            df = df.sort_values('date')
            
        # Handle missing values if any
        if 'cost' in df.columns:
            df['cost'] = df['cost'].fillna(df['cost'].median())
            
        return df
        
    def detect_anomalies(self, 
                         cost_data: List[Dict[str, Any]], 
                         method: str = "ensemble",
                         threshold: float = None,
                         analyze_root_cause: bool = True) -> Dict[str, Any]:
        """
        Detect anomalies in cloud costs and optionally analyze root causes.
        
        Args:
            cost_data: List of dicts with 'date', 'cost', 'service', etc.
            method: Detection method ('zscore', 'isolation_forest', 'dbscan', 
                   'seasonal_decompose', 'ensemble')
            threshold: Detection sensitivity threshold (lower = more sensitive)
            analyze_root_cause: Whether to perform root cause analysis
            
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
                "detection_method": method,
                "threshold": threshold,
                "data_points": 0,
                "error": "Insufficient data for anomaly detection"
            }
        
        # Perform anomaly detection using specified method
        try:
            if method == "zscore":
                anomalies = self._detect_with_zscore(df, threshold)
            elif method == "isolation_forest":
                anomalies = self._detect_with_isolation_forest(df, threshold)
            elif method == "dbscan":
                anomalies = self._detect_with_dbscan(df, threshold)
            elif method == "seasonal_decompose":
                anomalies = self._detect_with_seasonal_decompose(df, threshold)
            elif method == "ensemble":
                anomalies = self._detect_with_ensemble(df, threshold)
            else:
                logger.warning(f"Unknown detection method: {method}. Falling back to Z-Score.")
                anomalies = self._detect_with_zscore(df, threshold)
                method = "zscore"
        except Exception as e:
            logger.error(f"Error during anomaly detection with {method}: {str(e)}")
            # Fall back to z-score on error
            try:
                anomalies = self._detect_with_zscore(df, threshold)
                method = "zscore"
            except Exception as fallback_error:
                logger.error(f"Fallback detection also failed: {str(fallback_error)}")
                return {
                    "anomalies": [],
                    "detection_method": method,
                    "threshold": threshold,
                    "data_points": len(df),
                    "error": f"Anomaly detection failed: {str(e)}"
                }
        
        # Perform root cause analysis if requested
        if analyze_root_cause and anomalies:
            anomalies = self._analyze_root_causes(anomalies, df)
            
        return {
            "anomalies": anomalies,
            "detection_method": method,
            "method_name": self.DETECTION_METHODS.get(method, "Unknown"),
            "threshold": threshold,
            "data_points": len(df),
            "detection_timestamp": datetime.now().isoformat()
        }
            
    def _detect_with_zscore(self, df: pd.DataFrame, threshold: float) -> List[Dict[str, Any]]:
        """Detect anomalies using Z-Score method."""
        # Compute z-scores
        df['zscore'] = np.abs(StandardScaler().fit_transform(df[['cost']]))
        
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
    
    def _detect_with_seasonal_decompose(self, df: pd.DataFrame, threshold: float) -> List[Dict[str, Any]]:
        """Detect anomalies using seasonal decomposition."""
        # Require at least 14 data points (2 weeks)
        if len(df) < 14:
            logger.warning("Insufficient data points for Seasonal Decomposition. Falling back to Z-Score.")
            return self._detect_with_zscore(df, threshold)
            
        # Require date column
        if 'date' not in df.columns:
            logger.warning("Date column required for Seasonal Decomposition. Falling back to Z-Score.")
            return self._detect_with_zscore(df, threshold)
            
        # Set date as index
        df_indexed = df.set_index('date')
        
        # Try to detect period automatically
        # Try common periods: 7 (weekly), 30 (monthly)
        periods = [7, 30]
        best_period = None
        best_autocorr = 0
        
        for period in periods:
            if len(df) >= 2 * period:  # Need at least 2 full periods
                autocorr = df_indexed['cost'].autocorr(lag=period)
                if autocorr > best_autocorr:
                    best_autocorr = autocorr
                    best_period = period
                    
        # If no good period found, use z-score
        if best_period is None or best_autocorr < 0.3:
            logger.warning("No significant seasonality detected. Falling back to Z-Score.")
            return self._detect_with_zscore(df, threshold)
            
        # Perform seasonal decomposition
        result = seasonal_decompose(df_indexed['cost'], model='additive', period=best_period)
        
        # Calculate residuals (observed - trend - seasonal)
        df['residual'] = result.resid
        
        # Compute z-scores of residuals
        df['zscore'] = np.abs(StandardScaler().fit_transform(df[['residual']].fillna(0)))
        
        # Identify anomalies
        anomalies = []
        for idx, row in df[df['zscore'] > threshold].iterrows():
            # Skip entries with NaN residuals
            if pd.isna(row['residual']):
                continue
                
            anomaly = {
                "date": row['date'].strftime("%Y-%m-%d") if isinstance(row['date'], pd.Timestamp) else row['date'],
                "service": row.get('service', 'Unknown'),
                "provider": row.get('provider', 'Unknown'),
                "cost": row['cost'],
                "anomaly_score": round(float(row['zscore']), 2),
                "detection_method": "seasonal_decompose",
                "seasonality_period": best_period
            }
            
            # Get trend value as baseline
            date_idx = df[df['date'] == row['date']].index[0]
            trend_value = result.trend.iloc[date_idx] if date_idx < len(result.trend) else result.trend.iloc[-1]
            if pd.isna(trend_value):
                trend_value = df['cost'].median()
                
            anomaly["baseline_cost"] = round(float(trend_value), 2)
            anomaly["cost_difference"] = round(float(row['cost'] - trend_value), 2)
            anomaly["percentage_increase"] = round(float((row['cost'] - trend_value) / trend_value * 100 if trend_value > 0 else 0), 2)
            
            anomalies.append(anomaly)
            
        return anomalies
    
    def _detect_with_ensemble(self, df: pd.DataFrame, threshold: float) -> List[Dict[str, Any]]:
        """Detect anomalies using an ensemble of methods."""
        # Use all available methods
        methods = ["zscore"]
        
        # Add more advanced methods if we have enough data
        if len(df) >= 10:
            methods.extend(["isolation_forest", "dbscan"])
            
        if len(df) >= 14 and 'date' in df.columns:
            methods.append("seasonal_decompose")
            
        # Collect anomalies from all methods
        all_anomalies = []
        for method in methods:
            try:
                if method == "zscore":
                    anomalies = self._detect_with_zscore(df, threshold)
                elif method == "isolation_forest":
                    anomalies = self._detect_with_isolation_forest(df, threshold)
                elif method == "dbscan":
                    anomalies = self._detect_with_dbscan(df, threshold)
                elif method == "seasonal_decompose":
                    anomalies = self._detect_with_seasonal_decompose(df, threshold)
                else:
                    continue
                    
                # Add method to each anomaly
                for anomaly in anomalies:
                    anomaly["detection_method"] = method
                    
                all_anomalies.extend(anomalies)
            except Exception as e:
                logger.warning(f"Method {method} failed: {str(e)}")
                
        # If all methods failed, return empty list
        if not all_anomalies:
            return []
            
        # Consolidate anomalies by date and service
        # An anomaly is considered valid if it's detected by at least N/2 methods
        date_service_map = {}
        for anomaly in all_anomalies:
            key = (anomaly["date"], anomaly["service"])
            if key not in date_service_map:
                date_service_map[key] = []
            date_service_map[key].append(anomaly)
            
        # Keep anomalies detected by multiple methods
        min_methods = max(1, len(methods) // 2)  # At least half of the methods
        ensemble_anomalies = []
        
        for key, anomalies in date_service_map.items():
            if len(anomalies) >= min_methods:
                # Merge anomaly information
                merged = anomalies[0].copy()
                merged["detection_method"] = "ensemble"
                merged["methods_agreement"] = len(anomalies)
                merged["methods_total"] = len(methods)
                merged["confidence"] = round(len(anomalies) / len(methods), 2)
                
                # Calculate average scores
                merged["anomaly_score"] = round(np.mean([a["anomaly_score"] for a in anomalies if "anomaly_score" in a]), 2)
                merged["baseline_cost"] = round(np.mean([a["baseline_cost"] for a in anomalies if "baseline_cost" in a]), 2)
                merged["cost_difference"] = round(np.mean([a["cost_difference"] for a in anomalies if "cost_difference" in a]), 2)
                merged["percentage_increase"] = round(np.mean([a["percentage_increase"] for a in anomalies if "percentage_increase" in a]), 2)
                
                ensemble_anomalies.append(merged)
                
        return sorted(ensemble_anomalies, key=lambda x: x["confidence"], reverse=True)
    
    def _analyze_root_causes(self, anomalies: List[Dict[str, Any]], df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Analyze potential root causes for each anomaly.
        
        Args:
            anomalies: List of detected anomalies
            df: Original dataframe with cost data
            
        Returns:
            List[Dict]: Anomalies with added root cause information
        """
        for anomaly in anomalies:
            service = anomaly.get("service", "Unknown")
            
            # Get potential causes for this service
            potential_causes = self.COMMON_CAUSES.get(service, self.DEFAULT_CAUSES)
            
            # Calculate additional metrics that can help determine cause
            anomaly_date = anomaly["date"]
            
            # Additional context for the anomaly
            context = {}
            
            # Check for patterns in the anomaly
            if 'date' in df.columns:
                # Convert date strings to datetime if needed
                if isinstance(df['date'].iloc[0], str):
                    df['date'] = pd.to_datetime(df['date'])
                    
                # Convert anomaly date to datetime if it's a string
                if isinstance(anomaly_date, str):
                    anomaly_date = pd.to_datetime(anomaly_date)
                    
                # Get data for the anomaly date
                anomaly_data = df[df['date'] == anomaly_date]
                
                if not anomaly_data.empty:
                    # Check if there are other anomalies on the same date
                    other_services = df[df['date'] == anomaly_date]['service'].unique()
                    if len(other_services) > 1:
                        context["multi_service_impact"] = True
                        context["affected_services"] = other_services.tolist()
                    else:
                        context["multi_service_impact"] = False
                        
                    # Check for cost growth rate
                    df_service = df[df['service'] == service].sort_values('date')
                    if len(df_service) > 1:
                        # Calculate day-over-day growth rates
                        df_service['prev_cost'] = df_service['cost'].shift(1)
                        df_service['growth_rate'] = (df_service['cost'] - df_service['prev_cost']) / df_service['prev_cost']
                        
                        # Get growth rate for the anomaly
                        anomaly_growth = df_service[df_service['date'] == anomaly_date]['growth_rate'].iloc[0]
                        context["growth_rate"] = round(float(anomaly_growth * 100), 2)  # as percentage
                        
                        # Check if growth is gradual or sudden
                        recent_entries = df_service[df_service['date'] < anomaly_date].tail(7)
                        if len(recent_entries) > 0:
                            recent_growth = recent_entries['growth_rate'].mean()
                            if recent_growth > 0.05:  # 5% average daily growth
                                context["growth_pattern"] = "gradual_increase"
                            else:
                                context["growth_pattern"] = "sudden_spike"
                                
            # Select the most likely causes based on context
            likely_causes = []
            
            # If we have a gradual increase, prioritize causes that match that pattern
            if context.get("growth_pattern") == "gradual_increase":
                gradual_keywords = ["gradual", "increase", "growing", "scaling", "retention"]
                likely_causes = [cause for cause in potential_causes 
                               if any(keyword in cause.lower() for keyword in gradual_keywords)]
                               
            # If we have a sudden spike, prioritize causes that match that pattern
            elif context.get("growth_pattern") == "sudden_spike":
                spike_keywords = ["spike", "sudden", "migration", "enabled", "added", "changed"]
                likely_causes = [cause for cause in potential_causes 
                               if any(keyword in cause.lower() for keyword in spike_keywords)]
                               
            # If we have multiple services affected, prioritize global causes
            elif context.get("multi_service_impact", False):
                global_keywords = ["migration", "region", "account", "licensing", "commitment", "reservation"]
                likely_causes = [cause for cause in potential_causes 
                               if any(keyword in cause.lower() for keyword in global_keywords)]
                               
            # If we couldn't determine likely causes, use all potential causes
            if not likely_causes:
                likely_causes = potential_causes
                
            # Limit to top 3 causes
            top_causes = likely_causes[:3]
            
            # Add root cause analysis to the anomaly
            anomaly["root_cause"] = {
                "primary_cause": top_causes[0] if top_causes else "Unknown cause",
                "potential_causes": top_causes,
                "context": context
            }
            
        return anomalies

# Main function to use in API endpoints
def detect_anomalies(cost_data, method="ensemble", threshold=3.0, analyze_root_cause=True):
    """
    Detect anomalies in cloud costs and provide root cause insights.
    
    Args:
        cost_data (list of dicts): [{'date': '2025-02-20', 'cost': 120.5, 'service': 'EC2'}]
        method (str): Detection method ('zscore', 'isolation_forest', 'dbscan', 'seasonal_decompose', 'ensemble')
        threshold (float): Detection sensitivity (lower = more sensitive)
        analyze_root_cause (bool): Whether to perform root cause analysis
        
    Returns:
        dict: Detection results including anomalies and metadata
    """
    detector = EnhancedAnomalyDetection()
    return detector.detect_anomalies(cost_data, method, threshold, analyze_root_cause)
        
    def _detect_with_isolation_forest(self, df: pd.DataFrame, threshold: float) -> List[Dict[str, Any]]:
        """Detect anomalies using Isolation Forest."""
        # Require at least 10 data points
        if len(df) < 10:
            logger.warning("Insufficient data points for Isolation Forest. Falling back to Z-Score.")
            return self._detect_with_zscore(df, threshold)
            
        # Train isolation forest
        # Convert threshold (higher threshold means fewer anomalies)
        # Isolation Forest contamination is opposite: lower means fewer anomalies
        contamination = min(0.5, max(0.01, 1.0/threshold))
        
        model = IsolationForest(contamination=contamination, random_state=42)
        
        # Handle numerical features
        numeric_cols = ['cost']
        if 'date' in df.columns:
            # Add numerical date feature (days since earliest date)
            df['days_since_start'] = (df['date'] - df['date'].min()).dt.days
            numeric_cols.append('days_since_start')
        
        # Fit the model
        model.fit(df[numeric_cols])
        
        # Predict anomalies (-1 for anomalies, 1 for normal)
        df['anomaly'] = model.predict(df[numeric_cols])
        df['anomaly_score'] = model.decision_function(df[numeric_cols])
        # Convert to positive anomaly score (higher = more anomalous)
        df['anomaly_score'] = -df['anomaly_score']
        
        # Identify anomalies
        anomalies = []
        for idx, row in df[df['anomaly'] == -1].iterrows():
            anomaly = {
                "date": row['date'].strftime("%Y-%m-%d") if isinstance(row['date'], pd.Timestamp) else row['date'],
                "service": row.get('service', 'Unknown'),
                "provider": row.get('provider', 'Unknown'),
                "cost": row['cost'],
                "anomaly_score": round(float(row['anomaly_score']), 2),
                "detection_method": "isolation_forest"
            }
            
            # Calculate baseline cost (median of non-anomalous points)
            baseline = df[df['anomaly'] == 1]['cost'].median()
            anomaly["baseline_cost"] = round(float(baseline), 2)
            anomaly["cost_difference"] = round(float(row['cost'] - baseline), 2)
            anomaly["percentage_increase"] = round(float((row['cost'] - baseline) / baseline * 100 if baseline > 0 else 0), 2)
            
            anomalies.append(anomaly)
            
        return anomalies
    
    def _detect_with_dbscan(self, df: pd.DataFrame, threshold: float) -> List[Dict[str, Any]]:
        """Detect anomalies using DBSCAN clustering."""
        # Require at least 10 data points
        if len(df) < 10:
            logger.warning("Insufficient data points for DBSCAN. Falling back to Z-Score.")
            return self._detect_with_zscore(df, threshold)
            
        # Handle numerical features
        numeric_cols = ['cost']
        if 'date' in df.columns:
            # Add numerical date feature (days since earliest date)
            df['days_since_start'] = (df['date'] - df['date'].min()).dt.days
            numeric_cols.append('days_since_start')
            
        # Scale the features
        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(df[numeric_cols])
        
        # DBSCAN parameters
        # eps is the maximum distance between samples
        # min_samples is minimum samples in a neighborhood to form a cluster
        # Higher threshold means we expect fewer anomalies, so increase eps
        eps = 0.5 * threshold
        min_samples = max(3, int(len(df) * 0.05))  # At least 5% of data points
        
        # Apply DBSCAN
        dbscan = DBSCAN(eps=eps, min_samples=min_samples)
        clusters = dbscan.fit_predict(scaled_features)
        
        # Add cluster labels to the dataframe
        df['cluster'] = clusters
        
        # Points with cluster label -1 are outliers/anomalies
        anomalies = []
        for idx, row in df[df['cluster'] == -1].iterrows():
            anomaly = {
                "date": row['date'].strftime("%Y-%m-%d") if isinstance(row['date'], pd.Timestamp) else row['date'],
                "service": row.get('service', 'Unknown'),
                "provider": row.get('provider', 'Unknown'),
                "cost": row['cost'],
                "anomaly_score": 1.0,  # DBSCAN doesn't provide scores, use binary
                "detection_method": "dbscan"
            }
            
            # Calculate baseline cost (median of non-anomalous points)
            baseline = df[df['cluster'] != -1]['cost'].median()
            anomaly["baseline_cost"] = round(float(baseline), 2)
            anomaly["cost_difference"] = round(float(row['cost'] - baseline), 2)
            anomaly["percentage_increase"] = round(float((row['cost'] - baseline) / baseline * 100 if baseline > 0 else 0), 2)
            
            anomalies.append(anomaly)
            
        return anomalies