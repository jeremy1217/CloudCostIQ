# Standard library imports
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
import logging

# Third-party imports
from sklearn.cluster import DBSCAN
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from statsmodels.tsa.seasonal import seasonal_decompose
import numpy as np
import pandas as pd

# Local imports
from backend.ai.cloud_context import CloudContextAnomalyDetection

# Import the CloudContextAnomalyDetection class from our core module

logger = logging.getLogger(__name__)

class EnhancedAnomalyDetection:
    """
    Advanced anomaly detection for cloud costs with multiple detection methods
    and automated root cause analysis.
    
    This class provides several anomaly detection algorithms and enriches
    the detected anomalies with cloud-specific context using the
    CloudContextAnomalyDetection module.
    """
    
    # Define common patterns for root cause analysis
    CAUSE_PATTERNS = {
        "EC2": [
            "Increase in running instances or workload spikes",
            "Reserved instance expiration",
            "Change in instance types",
            "Auto-scaling events"
        ],
        "S3": [
            "High data transfer",
            "Increased storage consumption",
            "Cross-region replication",
            "Lifecycle policy changes"
        ],
        "RDS": [
            "Unexpected database queries",
            "Connection spikes",
            "Backup storage costs",
            "Instance class upgrades"
        ],
        "Compute Engine": [
            "Autoscaling triggered additional VMs",
            "Spot instance interruptions",
            "Sustained use discounts changes",
            "Machine type changes"
        ],
        "Blob Storage": [
            "Large file uploads",
            "Backup processes",
            "Read/write operation volume",
            "Storage tier changes"
        ]
    }
    
    DETECTION_METHODS = {
        "zscore": "Z-Score Statistical",
        "isolation_forest": "Isolation Forest (ML)",
        "dbscan": "DBSCAN Clustering",
        "seasonal_decompose": "Seasonal Decomposition",
        "ensemble": "Ensemble Method"
    }
    
    def __init__(self, min_data_points=7, default_threshold=3.0):
        """Initialize anomaly detection with configuration parameters."""
        self.min_data_points = min_data_points
        self.default_threshold = default_threshold
        
        # Initialize the cloud context detector
        self.cloud_context_detector = CloudContextAnomalyDetection(
            min_data_points=min_data_points,
            default_threshold=default_threshold
        )
    
    def preprocess_data(self, cost_data):
        """Preprocess cost data for analysis."""
        # Convert to dataframe
        if not cost_data or len(cost_data) < self.min_data_points:
            logger.warning(f"Insufficient data points ({len(cost_data) if cost_data else 0}) "
                         f"for analysis. Minimum required: {self.min_data_points}")
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
                         analyze_root_cause: bool = True,
                         analyze_cloud_context: bool = True,
                         utilization_data: Optional[List[Dict[str, Any]]] = None,
                         custom_events: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Detect anomalies in cloud costs and optionally analyze root causes and cloud context.
        
        Args:
            cost_data: List of dicts with 'date', 'cost', 'service', etc.
            method: Detection method ('zscore', 'isolation_forest', 'dbscan', 
                   'seasonal_decompose', 'ensemble')
            threshold: Detection sensitivity threshold (lower = more sensitive)
            analyze_root_cause: Whether to perform root cause analysis
            analyze_cloud_context: Whether to add cloud-specific context
            utilization_data: Optional resource utilization metrics for context
            custom_events: Optional known events that might affect costs
            
        Returns:
            dict: Detection results including anomalies and metadata
        """
        # First perform regular anomaly detection with root cause analysis
        results = self._detect_anomalies_base(cost_data, method, threshold, analyze_root_cause)
        
        # If requested and we have anomalies, add cloud context analysis
        if analyze_cloud_context and results["anomalies"]:
            try:
                # Use the CloudContextAnomalyDetection to enhance the anomalies
                enhanced_anomalies = self.cloud_context_detector._add_cloud_context(
                    anomalies=results["anomalies"],
                    cost_data=cost_data,
                    utilization_data=utilization_data,
                    custom_events=custom_events
                )
                
                # Update the anomalies with cloud context information
                results["anomalies"] = enhanced_anomalies
                results["cloud_context_applied"] = True
                
                logger.info(f"Added cloud context to {len(enhanced_anomalies)} anomalies")
            except Exception as e:
                logger.error(f"Error adding cloud context to anomalies: {str(e)}")
                # Don't fail the whole operation if cloud context fails
                results["cloud_context_error"] = str(e)
        
        return results
    
    def _detect_anomalies_base(self, cost_data, method, threshold, analyze_root_cause):
        """
        Original anomaly detection method without cloud context.
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
        """
        Detect anomalies using Z-Score method.
        
        Args:
            df: DataFrame with time series data
            threshold: Z-score threshold for anomaly detection
            
        Returns:
            List of anomalies
        """
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
    
    def _detect_with_isolation_forest(self, df: pd.DataFrame, threshold: float) -> List[Dict[str, Any]]:
        """
        Detect anomalies using Isolation Forest algorithm.
        
        Args:
            df: DataFrame with time series data
            threshold: Contamination parameter (0 to 0.5)
            
        Returns:
            List of anomalies
        """
        # Adjust threshold for Isolation Forest (convert from z-score scale)
        contamination = min(0.5, max(0.01, 1.0 / threshold))
        
        # Prepare features (use cost and date features)
        if 'date' in df.columns:
            # Extract date features
            date_features = pd.DataFrame()
            date_features['day_of_week'] = df['date'].dt.dayofweek
            date_features['day_of_month'] = df['date'].dt.day
            date_features['month'] = df['date'].dt.month
            
            # Combine with cost
            features = pd.DataFrame()
            features['cost'] = df['cost']
            features = pd.concat([features, date_features], axis=1)
        else:
            # If no date, just use cost
            features = df[['cost']]
        
        # Scale features
        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(features)
        
        # Train Isolation Forest model
        model = IsolationForest(contamination=contamination, random_state=42)
        predictions = model.fit_predict(scaled_features)
        scores = model.decision_function(scaled_features)
        
        # Convert scores to anomaly scores (higher is more anomalous)
        anomaly_scores = -scores
        
        # Identify anomalies
        anomalies = []
        for i, pred in enumerate(predictions):
            if pred == -1:  # -1 indicates anomaly
                row = df.iloc[i]
                
                anomaly = {
                    "date": row['date'].strftime("%Y-%m-%d") if isinstance(row['date'], pd.Timestamp) else row['date'],
                    "service": row.get('service', 'Unknown'),
                    "provider": row.get('provider', 'Unknown'),
                    "cost": row['cost'],
                    "anomaly_score": round(float(anomaly_scores[i]), 2),
                    "detection_method": "isolation_forest"
                }
                
                # Calculate baseline cost (median of non-anomalous points)
                non_anomalous = df.iloc[[j for j, p in enumerate(predictions) if p == 1]]
                baseline = non_anomalous['cost'].median() if len(non_anomalous) > 0 else df['cost'].median()
                
                anomaly["baseline_cost"] = round(float(baseline), 2)
                anomaly["cost_difference"] = round(float(row['cost'] - baseline), 2)
                anomaly["percentage_increase"] = round(float((row['cost'] - baseline) / baseline * 100 if baseline > 0 else 0), 2)
                
                anomalies.append(anomaly)
                
        return anomalies
    
    def _detect_with_dbscan(self, df: pd.DataFrame, threshold: float) -> List[Dict[str, Any]]:
        """
        Detect anomalies using DBSCAN clustering.
        
        Args:
            df: DataFrame with time series data
            threshold: Epsilon parameter adjustment factor
            
        Returns:
            List of anomalies
        """
        # Scale the cost data
        costs = df['cost'].values.reshape(-1, 1)
        scaler = StandardScaler()
        scaled_costs = scaler.fit_transform(costs)
        
        # Calculate epsilon based on data distribution and threshold
        # Higher threshold means less sensitive (larger epsilon)
        std_dev = np.std(scaled_costs)
        epsilon = std_dev / threshold
        
        # Apply DBSCAN
        dbscan = DBSCAN(eps=epsilon, min_samples=2)
        clusters = dbscan.fit_predict(scaled_costs)
        
        # Identify anomalies (points with cluster label -1)
        anomalies = []
        for i, cluster in enumerate(clusters):
            if cluster == -1:  # -1 indicates outlier
                row = df.iloc[i]
                
                # Calculate anomaly score based on distance to nearest cluster
                if len(set(clusters)) > 1:  # If we have actual clusters
                    distances = []
                    for cluster_id in set(clusters):
                        if cluster_id != -1:
                            cluster_points = scaled_costs[clusters == cluster_id]
                            min_dist = np.min(np.linalg.norm(scaled_costs[i] - cluster_points, axis=1))
                            distances.append(min_dist)
                    anomaly_score = min(distances) if distances else 1.0
                else:
                    # If no actual clusters, use distance from mean
                    anomaly_score = np.abs((costs[i] - np.mean(costs)) / np.std(costs))[0]
                
                anomaly = {
                    "date": row['date'].strftime("%Y-%m-%d") if isinstance(row['date'], pd.Timestamp) else row['date'],
                    "service": row.get('service', 'Unknown'),
                    "provider": row.get('provider', 'Unknown'),
                    "cost": row['cost'],
                    "anomaly_score": round(float(anomaly_score), 2),
                    "detection_method": "dbscan"
                }
                
                # Calculate baseline cost (median of non-anomalous points)
                non_anomalous = df.iloc[[j for j, c in enumerate(clusters) if c != -1]]
                baseline = non_anomalous['cost'].median() if len(non_anomalous) > 0 else df['cost'].median()
                
                anomaly["baseline_cost"] = round(float(baseline), 2)
                anomaly["cost_difference"] = round(float(row['cost'] - baseline), 2)
                anomaly["percentage_increase"] = round(float((row['cost'] - baseline) / baseline * 100 if baseline > 0 else 0), 2)
                
                anomalies.append(anomaly)
                
        return anomalies
    
    def _detect_with_seasonal_decompose(self, df: pd.DataFrame, threshold: float) -> List[Dict[str, Any]]:
        """
        Detect anomalies using seasonal decomposition.
        
        Args:
            df: DataFrame with time series data
            threshold: Threshold for residuals
            
        Returns:
            List of anomalies
        """
        # Ensure we have enough data for decomposition
        if len(df) < 14:  # Minimum required for weekly seasonality
            return self._detect_with_zscore(df, threshold)
        
        # Set index to date for decomposition
        if 'date' in df.columns:
            ts_df = df.set_index('date')
        else:
            # If no date column, can't use seasonal decomposition
            return self._detect_with_zscore(df, threshold)
        
        try:
            # Try to detect seasonality (weekly or monthly)
            # For simplicity, default to weekly (7 days)
            period = 7
            
            # Perform seasonal decomposition
            result = seasonal_decompose(ts_df['cost'], model='additive', period=period)
            
            # Calculate normalized residuals
            residuals = result.resid
            std_resid = np.std(residuals.dropna())
            normalized_residuals = np.abs(residuals / std_resid)
            
            # Identify anomalies where residual exceeds threshold
            anomalies = []
            for idx, value in normalized_residuals.dropna().items():
                if value > threshold:
                    # Get original row data
                    try:
                        row = df[df['date'] == idx].iloc[0]
                    except:
                        # In case of index mismatch, locate by position
                        row = df.iloc[ts_df.index.get_loc(idx)]
                    
                    anomaly = {
                        "date": idx.strftime("%Y-%m-%d") if isinstance(idx, pd.Timestamp) else idx,
                        "service": row.get('service', 'Unknown'),
                        "provider": row.get('provider', 'Unknown'),
                        "cost": row['cost'],
                        "anomaly_score": round(float(value), 2),
                        "detection_method": "seasonal_decompose"
                    }
                    
                    # Calculate baseline cost (trend + seasonal component)
                    baseline = result.trend[idx] + result.seasonal[idx]
                    
                    anomaly["baseline_cost"] = round(float(baseline), 2)
                    anomaly["cost_difference"] = round(float(row['cost'] - baseline), 2)
                    anomaly["percentage_increase"] = round(float((row['cost'] - baseline) / baseline * 100 if baseline > 0 else 0), 2)
                    
                    anomalies.append(anomaly)
                    
            return anomalies
            
        except:
            # Fall back to z-score if decomposition fails
            logger.warning("Seasonal decomposition failed, falling back to z-score.")
            return self._detect_with_zscore(df, threshold)
    
    def _detect_with_ensemble(self, df: pd.DataFrame, threshold: float) -> List[Dict[str, Any]]:
        """
        Detect anomalies using an ensemble of multiple methods.
        
        Args:
            df: DataFrame with time series data
            threshold: Base threshold for detection
            
        Returns:
            List of anomalies
        """
        # Adjust thresholds for each method to balance sensitivity
        zscore_threshold = threshold
        isolation_threshold = threshold * 0.8  # Make slightly more sensitive
        dbscan_threshold = threshold * 1.2    # Make slightly less sensitive
        seasonal_threshold = threshold * 0.9  # Make slightly more sensitive
        
        # Run all detection methods
        try:
            zscore_anomalies = self._detect_with_zscore(df, zscore_threshold)
        except:
            zscore_anomalies = []
            
        try:
            isolation_anomalies = self._detect_with_isolation_forest(df, isolation_threshold)
        except:
            isolation_anomalies = []
            
        try:
            dbscan_anomalies = self._detect_with_dbscan(df, dbscan_threshold)
        except:
            dbscan_anomalies = []
            
        try:
            seasonal_anomalies = self._detect_with_seasonal_decompose(df, seasonal_threshold)
        except:
            seasonal_anomalies = []
        
        # Combine results using voting mechanism
        dates_dict = {}
        
        # Function to add an anomaly to our dates dictionary
        def add_anomaly(anomaly, method_weight=1.0):
            date = anomaly["date"]
            if date not in dates_dict:
                dates_dict[date] = {
                    "count": 0,
                    "anomaly": None,
                    "total_score": 0,
                    "methods": []
                }
            
            dates_dict[date]["count"] += 1 * method_weight
            dates_dict[date]["total_score"] += anomaly["anomaly_score"] * method_weight
            dates_dict[date]["methods"].append(anomaly["detection_method"])
            
            # Keep the anomaly with the highest score
            if dates_dict[date]["anomaly"] is None or anomaly["anomaly_score"] > dates_dict[date]["anomaly"]["anomaly_score"]:
                dates_dict[date]["anomaly"] = anomaly
        
        # Add results from each method with different weights
        for anomaly in zscore_anomalies:
            add_anomaly(anomaly, 1.0)
            
        for anomaly in isolation_anomalies:
            add_anomaly(anomaly, 1.2)  # Weight isolation forest slightly higher
            
        for anomaly in dbscan_anomalies:
            add_anomaly(anomaly, 0.9)  # Weight DBSCAN slightly lower
            
        for anomaly in seasonal_anomalies:
            add_anomaly(anomaly, 1.1)  # Weight seasonal slightly higher
        
        # Select anomalies that were detected by multiple methods or have high scores
        ensemble_anomalies = []
        for date, info in dates_dict.items():
            # Include if detected by multiple methods or has a very high score
            if info["count"] >= 1.5 or (len(info["methods"]) == 1 and info["total_score"] > threshold * 2):
                anomaly = info["anomaly"].copy()
                anomaly["detection_method"] = "ensemble"
                anomaly["methods_agreement"] = round(info["count"], 2)
                anomaly["detection_methods"] = info["methods"]
                ensemble_anomalies.append(anomaly)
        
        return ensemble_anomalies
    
    def _analyze_root_causes(self, anomalies: List[Dict[str, Any]], df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Analyze root causes for detected anomalies.
        
        Args:
            anomalies: List of detected anomalies
            df: DataFrame with time series data
            
        Returns:
            List of anomalies with root cause analysis
        """
        for anomaly in anomalies:
            service = anomaly.get("service", "Unknown")
            date_str = anomaly.get("date")
            
            # Try to identify patterns in the data
            root_cause = {
                "primary_cause": "Cost spike detected",
                "potential_causes": [],
                "confidence": "medium" 
            }
            
            # Get potential causes for this service
            potential_causes = self.CAUSE_PATTERNS.get(service, ["Unknown cause"])
            
            # Add service-specific potential causes
            root_cause["potential_causes"] = potential_causes[:2]  # Just add top 2 for brevity
            
            # Look for patterns in the data
            try:
                # Convert date string to datetime for comparison
                anomaly_date = pd.to_datetime(date_str)
                
                # Filter for same service
                service_df = df[df["service"] == service].copy()
                
                if len(service_df) > 1:
                    # Check for sudden increase
                    service_df = service_df.sort_values('date')
                    service_df["prev_cost"] = service_df["cost"].shift(1)
                    service_df["pct_change"] = (service_df["cost"] - service_df["prev_cost"]) / service_df["prev_cost"] * 100
                    
                    # Find the row for our anomaly date
                    date_row = service_df[service_df["date"] == anomaly_date]
                    
                    if len(date_row) > 0:
                        pct_change = date_row["pct_change"].iloc[0]
                        
                        if not pd.isna(pct_change):
                            if pct_change > 80:
                                root_cause["primary_cause"] = f"Extreme cost spike (+{pct_change:.1f}%)"
                                root_cause["confidence"] = "high"
                            elif pct_change > 30:
                                root_cause["primary_cause"] = f"Significant cost increase (+{pct_change:.1f}%)"
                                root_cause["confidence"] = "medium"
                        
                        # Check if this is the beginning of a trend or a one-time spike
                        future_rows = service_df[service_df["date"] > anomaly_date]
                        if len(future_rows) > 0:
                            future_avg = future_rows["cost"].mean()
                            prev_rows = service_df[service_df["date"] < anomaly_date]
                            prev_avg = prev_rows["cost"].mean() if len(prev_rows) > 0 else date_row["cost"].iloc[0]
                            
                            if future_avg > prev_avg * 1.3:  # 30% higher
                                root_cause["primary_cause"] = "Beginning of a sustained cost increase"
                                root_cause["potential_causes"].append("Possible permanent infrastructure change")
                            
            except Exception as e:
                logger.warning(f"Error during root cause analysis: {str(e)}")
            
            # Add root cause to the anomaly
            anomaly["root_cause"] = root_cause
            
        return anomalies