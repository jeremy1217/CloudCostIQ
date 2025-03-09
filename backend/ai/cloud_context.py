# Standard library imports
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import logging

# Third-party imports
import numpy as np
import pandas as pd

class CloudContextAnomalyDetection:
    """
    Cloud-specific context aware anomaly detection that incorporates domain knowledge
    about common cloud cost patterns and behaviors.
    """
    
    # Cloud provider-specific event patterns that can cause cost anomalies
    CLOUD_EVENTS = {
        "AWS": {
            "new_region_deployment": {
                "pattern": "sudden_increase",
                "services": ["EC2", "S3", "RDS", "CloudFront", "EBS"],
                "timeline": "persistent"
            },
            "reserved_instance_expiration": {
                "pattern": "step_increase",
                "services": ["EC2", "RDS", "ElastiCache"],
                "timeline": "persistent"
            },
            "data_transfer_spike": {
                "pattern": "temporary_spike",
                "services": ["S3", "CloudFront", "EC2"],
                "timeline": "temporary"
            },
            "autoscaling_event": {
                "pattern": "temporary_spike",
                "services": ["EC2", "ECS", "EKS"],
                "timeline": "temporary"
            },
            "end_of_month_billing": {
                "pattern": "cyclical_spike",
                "services": ["All"],
                "timeline": "recurring",
                "period": "monthly"
            }
        },
        "Azure": {
            "reserved_instance_expiration": {
                "pattern": "step_increase",
                "services": ["VM", "SQL Database"],
                "timeline": "persistent"
            },
            "auto_scaling_event": {
                "pattern": "temporary_spike",
                "services": ["VM", "App Service"],
                "timeline": "temporary"
            }
        },
        "GCP": {
            "committed_use_discount_expiration": {
                "pattern": "step_increase",
                "services": ["Compute Engine", "Cloud SQL"],
                "timeline": "persistent"
            },
            "autoscaling_event": {
                "pattern": "temporary_spike",
                "services": ["Compute Engine", "GKE"],
                "timeline": "temporary"
            }
        }
    }
    
    # Billing and infrastructure events that can cause cost anomalies
    RESOURCE_PATTERNS = {
        "instance_count_increase": {
            "metrics": ["instance_count", "cpu_hours"],
            "threshold_multiplier": 1.5
        },
        "storage_increase": {
            "metrics": ["storage_gb", "storage_operations"],
            "threshold_multiplier": 2.0
        },
        "network_traffic_spike": {
            "metrics": ["data_transfer_gb", "request_count"],
            "threshold_multiplier": 3.0
        },
        "idleness_decrease": {
            "metrics": ["cpu_utilization", "memory_utilization"],
            "threshold_multiplier": 1.5
        }
    }
    
    def __init__(self, min_data_points=7, default_threshold=2.0):
        """Initialize with configuration parameters."""
        self.min_data_points = min_data_points
        self.default_threshold = default_threshold
        self.logger = logging.getLogger(__name__)
    
    def detect_cloud_context_anomalies(self, 
                                     cost_data: List[Dict[str, Any]], 
                                     utilization_data: Optional[List[Dict[str, Any]]] = None, 
                                     custom_events: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Detect anomalies with cloud context awareness.
        
        Args:
            cost_data: List of dicts with 'date', 'cost', 'service', 'provider', etc.
            utilization_data: Optional resource utilization metrics
            custom_events: Optional known events that might affect costs
            
        Returns:
            dict: Detection results with enhanced context
        """
        # First run regular anomaly detection
        basic_anomalies = self._detect_basic_anomalies(cost_data)
        
        # If we have no anomalies, return the basic results
        if not basic_anomalies["anomalies"]:
            return basic_anomalies
        
        # Enhance anomalies with cloud context
        enhanced_anomalies = self._add_cloud_context(
            basic_anomalies["anomalies"], 
            cost_data,
            utilization_data,
            custom_events
        )
        
        # Update the results with enhanced anomalies
        basic_anomalies["anomalies"] = enhanced_anomalies
        basic_anomalies["cloud_context_applied"] = True
        
        return basic_anomalies
    
    def _detect_basic_anomalies(self, cost_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Run basic anomaly detection using existing methods."""
        # This would call the existing anomaly detection methods
        # For demonstration, let's return a mock result
        return {
            "anomalies": [
                {
                    "date": "2025-03-01",
                    "service": "EC2",
                    "provider": "AWS",
                    "cost": 250.0,
                    "baseline_cost": 150.0,
                    "anomaly_score": 3.5,
                    "detection_method": "ensemble"
                }
            ],
            "detection_method": "ensemble",
            "threshold": self.default_threshold,
            "detection_timestamp": datetime.now().isoformat()
        }
    
    def _add_cloud_context(self, 
                         anomalies: List[Dict[str, Any]], 
                         cost_data: List[Dict[str, Any]],
                         utilization_data: Optional[List[Dict[str, Any]]] = None,
                         custom_events: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Enhance anomalies with cloud-specific context.
        
        Args:
            anomalies: List of detected anomalies
            cost_data: Full cost data time series
            utilization_data: Optional resource utilization metrics
            custom_events: Optional known events that might affect costs
            
        Returns:
            List[Dict]: Enhanced anomalies with cloud context
        """
        # Convert data to DataFrames for easier analysis
        cost_df = pd.DataFrame(cost_data)
        cost_df['date'] = pd.to_datetime(cost_df['date'])
        cost_df = cost_df.sort_values('date')
        
        util_df = None
        if utilization_data:
            util_df = pd.DataFrame(utilization_data)
            if 'date' in util_df.columns:
                util_df['date'] = pd.to_datetime(util_df['date'])
                util_df = util_df.sort_values('date')
        
        enhanced_anomalies = []
        
        for anomaly in anomalies:
            # Start with the original anomaly
            enhanced_anomaly = anomaly.copy()
            
            # Add cloud context
            enhanced_anomaly["cloud_context"] = self._analyze_cloud_context(
                anomaly, cost_df, util_df, custom_events
            )
            
            enhanced_anomalies.append(enhanced_anomaly)
        
        return enhanced_anomalies
    
    def _analyze_cloud_context(self,
                             anomaly: Dict[str, Any],
                             cost_df: pd.DataFrame,
                             util_df: Optional[pd.DataFrame] = None,
                             custom_events: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Analyze cloud-specific context for an anomaly.
        
        Args:
            anomaly: Detected anomaly
            cost_df: Cost data DataFrame
            util_df: Utilization data DataFrame
            custom_events: Known events
            
        Returns:
            Dict: Cloud context information
        """
        context = {
            "probable_causes": [],
            "pattern_type": "unknown",
            "affected_resources": [],
            "related_services": [],
            "mitigation_suggestions": []
        }
        
        # Extract anomaly details
        anomaly_date = pd.to_datetime(anomaly["date"])
        service = anomaly.get("service", "Unknown")
        provider = anomaly.get("provider", "Unknown")
        
        # 1. Check against known cloud event patterns
        provider_events = self.CLOUD_EVENTS.get(provider, {})
        
        for event_name, event_info in provider_events.items():
            if service in event_info["services"] or event_info["services"] == ["All"]:
                # Check if this event matches the anomaly pattern
                if self._match_anomaly_pattern(anomaly, event_info["pattern"], cost_df):
                    context["probable_causes"].append({
                        "cause": event_name,
                        "confidence": "high" if service in event_info["services"] else "medium",
                        "description": f"Detected {event_info['pattern']} pattern typical of {event_name}"
                    })
                    context["pattern_type"] = event_info["pattern"]
        
        # 2. Analyze resource utilization if available
        if util_df is not None:
            resource_context = self._analyze_resource_utilization(
                anomaly, cost_df, util_df
            )
            
            # Add resource-specific causes
            if resource_context["causes"]:
                context["probable_causes"].extend(resource_context["causes"])
                
            # Add affected resources
            context["affected_resources"] = resource_context["affected_resources"]
        
        # 3. Consider custom events if provided
        if custom_events:
            custom_context = self._check_custom_events(anomaly, custom_events)
            if custom_context["causes"]:
                # Custom events take precedence, add them first
                context["probable_causes"] = custom_context["causes"] + context["probable_causes"]
        
        # 4. Find related services that might be affected
        related_services = self._find_related_services(anomaly, cost_df)
        context["related_services"] = related_services
        
        # 5. Generate mitigation suggestions based on the context
        context["mitigation_suggestions"] = self._generate_mitigation_suggestions(
            anomaly, context
        )
        
        return context
    
    def _match_anomaly_pattern(self, 
                             anomaly: Dict[str, Any], 
                             pattern_type: str, 
                             cost_df: pd.DataFrame) -> bool:
        """
        Check if an anomaly matches a specific pattern type.
        
        Args:
            anomaly: Detected anomaly
            pattern_type: Type of pattern to match
            cost_df: Cost data DataFrame
            
        Returns:
            bool: True if the anomaly matches the pattern
        """
        anomaly_date = pd.to_datetime(anomaly["date"])
        service = anomaly.get("service", "Unknown")
        
        # Filter the cost data for this service
        service_df = cost_df[cost_df["service"] == service].copy()
        
        if len(service_df) < 3:
            return False
        
        # Calculate day-to-day changes
        service_df["prev_cost"] = service_df["cost"].shift(1)
        service_df["cost_change"] = service_df["cost"] - service_df["prev_cost"]
        service_df["pct_change"] = service_df["cost_change"] / service_df["prev_cost"] * 100
        
        # Get the cost change for the anomaly date
        anomaly_row = service_df[service_df["date"] == anomaly_date]
        if len(anomaly_row) == 0:
            return False
            
        anomaly_pct_change = float(anomaly_row["pct_change"].iloc[0]) if not anomaly_row["pct_change"].isna().iloc[0] else 0
        
        # Check patterns
        if pattern_type == "sudden_increase":
            # Big spike, over 50% increase
            return anomaly_pct_change > 50
            
        elif pattern_type == "step_increase":
            # Moderate increase that persists
            if anomaly_pct_change > 20:
                # Check if cost stays elevated after the anomaly
                future_costs = service_df[service_df["date"] > anomaly_date]
                if len(future_costs) > 0:
                    avg_future_cost = future_costs["cost"].mean()
                    avg_past_cost = service_df[service_df["date"] < anomaly_date]["cost"].mean()
                    return avg_future_cost > (avg_past_cost * 1.1)  # 10% higher on average
                return False
            
        elif pattern_type == "temporary_spike":
            # Significant spike that returns to normal
            if anomaly_pct_change > 40:
                # Check if cost returns to normal after the anomaly
                future_costs = service_df[service_df["date"] > anomaly_date]
                if len(future_costs) > 0:
                    avg_future_cost = future_costs["cost"].mean()
                    avg_past_cost = service_df[service_df["date"] < anomaly_date]["cost"].mean()
                    return abs(avg_future_cost - avg_past_cost) / avg_past_cost < 0.2  # Within 20% of previous average
                return False
            
        elif pattern_type == "cyclical_spike":
            # Detect regular patterns like weekly or monthly spikes
            try:
                # Convert dates to period format for easier cycle detection
                period_df = service_df.copy()
                period_df["day_of_week"] = period_df["date"].dt.dayofweek
                period_df["day_of_month"] = period_df["date"].dt.day
                
                # Check if this day of week or day of month regularly has higher costs
                day_of_week = anomaly_date.dayofweek
                day_of_month = anomaly_date.day
                
                weekly_pattern = period_df.groupby("day_of_week")["cost"].mean()
                monthly_pattern = period_df.groupby("day_of_month")["cost"].mean()
                
                # If this day of week or month typically has higher costs (>10% above average)
                avg_cost = period_df["cost"].mean()
                weekly_ratio = weekly_pattern[day_of_week] / avg_cost
                monthly_ratio = monthly_pattern[day_of_month] / avg_cost
                
                return weekly_ratio > 1.1 or monthly_ratio > 1.1
            except:
                return False
                
        return False
    
    def _analyze_resource_utilization(self,
                                    anomaly: Dict[str, Any],
                                    cost_df: pd.DataFrame,
                                    util_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Analyze resource utilization metrics to provide context for cost anomalies.
        
        Args:
            anomaly: Detected anomaly
            cost_df: Cost data DataFrame
            util_df: Utilization metrics DataFrame
            
        Returns:
            Dict: Resource utilization context
        """
        result = {
            "causes": [],
            "affected_resources": []
        }
        
        anomaly_date = pd.to_datetime(anomaly["date"])
        service = anomaly.get("service", "Unknown")
        
        # Look for utilization anomalies around the same time
        date_range_start = anomaly_date - timedelta(days=1)
        date_range_end = anomaly_date + timedelta(days=1)
        
        # Filter utilization data by date range and service
        if "date" in util_df.columns and "service" in util_df.columns:
            time_util_df = util_df[(util_df["date"] >= date_range_start) & 
                                 (util_df["date"] <= date_range_end) &
                                 (util_df["service"] == service)]
        elif "date" in util_df.columns:
            time_util_df = util_df[(util_df["date"] >= date_range_start) & 
                                 (util_df["date"] <= date_range_end)]
        else:
            # Can't filter by date, return empty result
            return result
            
        if len(time_util_df) == 0:
            return result
            
        # Check for anomalies in resource patterns
        for pattern_name, pattern_info in self.RESOURCE_PATTERNS.items():
            pattern_match = False
            relevant_metrics = {}
            
            # Check each metric in the pattern
            for metric in pattern_info["metrics"]:
                if metric in time_util_df.columns:
                    # Calculate the average and threshold
                    avg_value = util_df[metric].mean()
                    threshold = avg_value * pattern_info["threshold_multiplier"]
                    
                    # Find max value in the time window
                    max_value = time_util_df[metric].max()
                    
                    if max_value > threshold:
                        pattern_match = True
                        relevant_metrics[metric] = {
                            "avg": avg_value,
                            "max": max_value,
                            "change_pct": ((max_value - avg_value) / avg_value) * 100
                        }
            
            if pattern_match:
                # Add this pattern as a probable cause
                result["causes"].append({
                    "cause": pattern_name,
                    "confidence": "high" if len(relevant_metrics) >= 2 else "medium",
                    "description": f"Detected {pattern_name} with unusual metrics: " + 
                                  ", ".join([f"{m} +{metrics['change_pct']:.1f}%" for m, metrics in relevant_metrics.items()])
                })
                
                # Add affected resources if available
                if "resource_id" in time_util_df.columns:
                    # Find resources with anomalous metrics
                    for metric in relevant_metrics:
                        anomalous_resources = time_util_df[time_util_df[metric] > util_df[metric].mean() * pattern_info["threshold_multiplier"]]
                        if len(anomalous_resources) > 0:
                            resource_ids = anomalous_resources["resource_id"].unique().tolist()
                            result["affected_resources"].extend(resource_ids)
                            
        # Remove duplicates from affected resources
        result["affected_resources"] = list(set(result["affected_resources"]))
        
        return result
    
    def _check_custom_events(self,
                           anomaly: Dict[str, Any],
                           custom_events: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check if the anomaly coincides with known custom events.
        
        Args:
            anomaly: Detected anomaly
            custom_events: Dictionary of custom events
            
        Returns:
            Dict: Custom event context
        """
        result = {
            "causes": []
        }
        
        anomaly_date = pd.to_datetime(anomaly["date"])
        service = anomaly.get("service", "Unknown")
        
        for event_name, event_info in custom_events.items():
            event_date = pd.to_datetime(event_info.get("date"))
            event_services = event_info.get("services", [])
            
            # Check if the event is close to the anomaly date (within 1 day)
            date_diff = abs((event_date - anomaly_date).days)
            
            if date_diff <= 1 and (service in event_services or not event_services):
                result["causes"].append({
                    "cause": event_name,
                    "confidence": "very high",
                    "description": event_info.get("description", f"Custom event: {event_name}"),
                    "event_info": event_info
                })
                
        return result
    
    def _find_related_services(self,
                             anomaly: Dict[str, Any],
                             cost_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Find other services that might be related to the anomaly.
        
        Args:
            anomaly: Detected anomaly
            cost_df: Cost data DataFrame
            
        Returns:
            List[Dict]: Related services information
        """
        related_services = []
        
        anomaly_date = pd.to_datetime(anomaly["date"])
        anomaly_service = anomaly.get("service", "Unknown")
        
        # Look for cost changes in other services on the same day
        date_costs = cost_df[cost_df["date"] == anomaly_date]
        
        for service in date_costs["service"].unique():
            if service == anomaly_service:
                continue
                
            service_row = date_costs[date_costs["service"] == service]
            
            if len(service_row) == 0:
                continue
                
            service_cost = service_row["cost"].iloc[0]
            
            # Compare with previous data for this service
            prev_data = cost_df[(cost_df["service"] == service) & (cost_df["date"] < anomaly_date)]
            
            if len(prev_data) == 0:
                continue
                
            avg_prev_cost = prev_data["cost"].mean()
            
            # Calculate percent change
            pct_change = ((service_cost - avg_prev_cost) / avg_prev_cost) * 100 if avg_prev_cost > 0 else 0
            
            # If there's a significant change in this service too
            if abs(pct_change) > 20:
                related_services.append({
                    "service": service,
                    "cost": service_cost,
                    "pct_change": pct_change,
                    "avg_prev_cost": avg_prev_cost,
                    "correlation": "strong" if abs(pct_change) > 50 else "moderate"
                })
                
        # Sort related services by absolute percent change
        related_services.sort(key=lambda x: abs(x["pct_change"]), reverse=True)
        
        return related_services
    
    def _generate_mitigation_suggestions(self,
                                       anomaly: Dict[str, Any],
                                       context: Dict[str, Any]) -> List[str]:
        """
        Generate mitigation suggestions based on the anomaly and context.
        
        Args:
            anomaly: Detected anomaly
            context: Cloud context information
            
        Returns:
            List[str]: Mitigation suggestions
        """
        suggestions = []
        
        service = anomaly.get("service", "Unknown")
        provider = anomaly.get("provider", "Unknown")
        pattern_type = context.get("pattern_type", "unknown")
        probable_causes = context.get("probable_causes", [])
        
        # Get causes ordered by confidence
        ordered_causes = sorted(probable_causes, key=lambda x: {
            "very high": 4,
            "high": 3, 
            "medium": 2, 
            "low": 1
        }.get(x.get("confidence", "low"), 0), reverse=True)
        
        # Add general suggestion based on service
        if service == "EC2" or service == "VM" or service == "Compute Engine":
            suggestions.append("Review instance rightsizing opportunities")
            suggestions.append("Check for unintended auto-scaling events")
            
            if pattern_type == "step_increase":
                suggestions.append("Verify if reserved instances or committed use discounts have expired")
                suggestions.append("Check if instances have switched from spot/preemptible to on-demand pricing")
                
        elif service == "S3" or service == "Storage" or service == "Cloud Storage":
            suggestions.append("Implement lifecycle policies to move data to lower-cost storage tiers")
            
            if pattern_type == "temporary_spike":
                suggestions.append("Review data transfer patterns and potential cross-region transfer costs")
                suggestions.append("Check for large backup or data migration operations")
                
        elif service == "RDS" or service == "SQL Database" or service == "Cloud SQL":
            suggestions.append("Review database performance and query optimization")
            suggestions.append("Check for database snapshot or backup storage costs")
            
        # Add specific suggestions based on causes
        for cause in ordered_causes:
            cause_name = cause.get("cause", "")
            
            if "instance_count" in cause_name:
                suggestions.append("Review auto-scaling policies and thresholds")
                suggestions.append("Check for unintentional provisioning of new resources")
                
            elif "reserved_instance_expiration" in cause_name or "committed_use" in cause_name:
                suggestions.append("Renew or purchase new reserved instances/committed use discounts")
                suggestions.append("Evaluate on-demand vs. reserved instance mix")
                
            elif "network" in cause_name or "data_transfer" in cause_name:
                suggestions.append("Optimize network traffic patterns and data transfer routes")
                suggestions.append("Review CDN or caching strategies to reduce data transfer")
                
        # Remove duplicates while preserving order
        seen = set()
        unique_suggestions = []
        for suggestion in suggestions:
            if suggestion not in seen:
                seen.add(suggestion)
                unique_suggestions.append(suggestion)
                
        return unique_suggestions