"""
CloudCostIQ AI Integration Module

This module integrates the enhanced AI capabilities for forecasting, anomaly detection, 
and optimization recommendations, providing a unified interface for the API endpoints.
"""

from backend.ai.forecast import predict_future_costs as original_predict_future_costs
from backend.ai.anomaly import detect_anomalies as original_detect_anomalies
from backend.ai.optimizer import generate_optimization_suggestions as original_generate_optimization_suggestions

# Import enhanced AI capabilities
from backend.ai.enhanced_forecast import predict_future_costs as enhanced_predict_future_costs
from backend.ai.enhanced_anomaly import detect_anomalies as enhanced_detect_anomalies
from backend.ai.enhanced_optimizer import generate_optimization_suggestions as enhanced_generate_optimization_suggestions

import logging
from typing import List, Dict, Any, Optional, Union
from datetime import datetime

logger = logging.getLogger(__name__)

# Feature flag for enabling enhanced AI capabilities
ENABLE_ENHANCED_AI = True

class CloudCostIQ_AI:
    """
    Integrated AI capabilities for CloudCostIQ platform
    """
    
    def __init__(self, enable_enhanced_ai=ENABLE_ENHANCED_AI):
        """Initialize with configuration for enhanced AI capabilities."""
        self.enable_enhanced_ai = enable_enhanced_ai
        self.ai_metadata = {
            "enhanced_ai_enabled": enable_enhanced_ai,
            "version": "1.0.0",
            "last_updated": "2025-03-02"
        }
        
    def predict_costs(self, 
                     cost_data: List[Dict[str, Any]], 
                     days_ahead: int = 7, 
                     algorithm: str = "auto") -> Dict[str, Any]:
        """
        Predict future costs based on historical data.
        
        Args:
            cost_data: List of dicts with date and cost info
            days_ahead: Number of days to forecast
            algorithm: Forecasting algorithm to use
            
        Returns:
            dict: Forecast results with predictions and metadata
        """
        try:
            if self.enable_enhanced_ai:
                forecast = enhanced_predict_future_costs(cost_data, days_ahead, algorithm)
                # Add AI metadata
                forecast["ai_engine"] = "enhanced"
                forecast["ai_metadata"] = self.ai_metadata
                return forecast
            else:
                # Use original implementation
                forecast = original_predict_future_costs(cost_data, days_ahead)
                # Add basic metadata
                result = {
                    "forecast": forecast,
                    "ai_engine": "basic",
                    "ai_metadata": {"enhanced_ai_enabled": False}
                }
                return result
        except Exception as e:
            logger.error(f"Error in cost prediction: {str(e)}")
            # Return empty forecast
            return {
                "forecast": [],
                "error": str(e),
                "ai_engine": "failed",
                "ai_metadata": self.ai_metadata
            }
    
    def detect_anomalies(self,
                        cost_data: List[Dict[str, Any]],
                        method: str = "ensemble",
                        threshold: float = 2.0,
                        analyze_root_cause: bool = True) -> Dict[str, Any]:
        """
        Detect anomalies in cloud costs.
        
        Args:
            cost_data: List of dicts with cost data
            method: Detection method 
            threshold: Sensitivity threshold
            analyze_root_cause: Whether to perform root cause analysis
            
        Returns:
            dict: Detection results with anomalies and metadata
        """
        try:
            if self.enable_enhanced_ai:
                results = enhanced_detect_anomalies(
                    cost_data, method, threshold, analyze_root_cause)
                # Add AI metadata
                results["ai_engine"] = "enhanced"
                results["ai_metadata"] = self.ai_metadata
                return results
            else:
                # Use original implementation
                anomalies = original_detect_anomalies(cost_data)
                # Format to match enhanced version
                results = {
                    "anomalies": anomalies,
                    "detection_method": "zscore",
                    "threshold": threshold,
                    "ai_engine": "basic",
                    "ai_metadata": {"enhanced_ai_enabled": False}
                }
                return results
        except Exception as e:
            logger.error(f"Error in anomaly detection: {str(e)}")
            # Return empty anomalies
            return {
                "anomalies": [],
                "error": str(e),
                "ai_engine": "failed",
                "ai_metadata": self.ai_metadata
            }
    
    def optimize_costs(self,
                      cost_data: List[Dict[str, Any]],
                      utilization_data: Optional[List[Dict[str, Any]]] = None,
                      targeted_services: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Generate cost optimization recommendations.
        
        Args:
            cost_data: List of dicts with cost data
            utilization_data: Optional resource utilization metrics
            targeted_services: Optional list of services to focus on
            
        Returns:
            dict: Optimization results with recommendations and metadata
        """
        try:
            if self.enable_enhanced_ai:
                results = enhanced_generate_optimization_suggestions(
                    cost_data, utilization_data, targeted_services)
                # Add AI metadata
                results["ai_engine"] = "enhanced"
                results["ai_metadata"] = self.ai_metadata
                return results
            else:
                # Use original implementation
                recommendations = original_generate_optimization_suggestions(cost_data)
                # Format to match enhanced version
                results = {
                    "recommendations": recommendations,
                    "ai_engine": "basic",
                    "ai_metadata": {"enhanced_ai_enabled": False}
                }
                return results
        except Exception as e:
            logger.error(f"Error in cost optimization: {str(e)}")
            # Return empty recommendations
            return {
                "recommendations": [],
                "error": str(e),
                "ai_engine": "failed",
                "ai_metadata": self.ai_metadata
            }
    
    def get_ai_status(self) -> Dict[str, Any]:
        """Get the status of AI capabilities."""
        return {
            "enhanced_ai_enabled": self.enable_enhanced_ai,
            "capabilities": {
                "forecasting": {
                    "algorithms": ["linear", "arima", "exp_smoothing", "random_forest", "auto"],
                    "max_forecast_days": 365,
                    "min_data_points": 5
                },
                "anomaly_detection": {
                    "methods": ["zscore", "isolation_forest", "dbscan", "seasonal_decompose", "ensemble"],
                    "root_cause_analysis": True
                },
                "optimization": {
                    "categories": [
                        "instance_rightsizing",
                        "reserved_instances",
                        "storage_optimization",
                        "idle_resources",
                        "licensing_optimization"
                    ],
                    "requires_utilization_data": False
                }
            },
            "version": self.ai_metadata["version"],
            "last_updated": self.ai_metadata["last_updated"]
        }
    
    def enable_enhanced_capabilities(self, enable: bool = True):
        """Enable or disable enhanced AI capabilities."""
        self.enable_enhanced_ai = enable
        self.ai_metadata["enhanced_ai_enabled"] = enable
        logger.info(f"Enhanced AI capabilities: {'enabled' if enable else 'disabled'}")

# Create a singleton instance
ai_engine = CloudCostIQ_AI()

# Convenience functions for API endpoints
def predict_costs(*args, **kwargs):
    return ai_engine.predict_costs(*args, **kwargs)
    
def detect_anomalies(*args, **kwargs):
    return ai_engine.detect_anomalies(*args, **kwargs)
    
def optimize_costs(*args, **kwargs):
    return ai_engine.optimize_costs(*args, **kwargs)
    
def get_ai_status():
    return ai_engine.get_ai_status()
    
def enable_enhanced_ai(enable=True):
    ai_engine.enable_enhanced_capabilities(enable)