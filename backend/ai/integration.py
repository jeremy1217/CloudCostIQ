import logging
from typing import List, Dict, Any, Optional, Union
from datetime import datetime

from backend.ai.model_factory import ModelFactory
from backend.ai.decorators import with_fallback
from backend.ai.forecast import predict_future_costs as original_predict_future_costs
from backend.ai.anomaly import detect_anomalies as original_detect_anomalies
from backend.ai.optimizer import generate_optimization_suggestions as original_generate_optimization_suggestions

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
        
        # Create appropriate models based on the configuration
        self._init_models()
        
    def _init_models(self):
        """Initialize AI models based on current configuration"""
        # Use the factory to create appropriate models
        self.forecasting_model = ModelFactory.create_forecasting_model(self.enable_enhanced_ai)
        self.anomaly_detector = ModelFactory.create_anomaly_detector(self.enable_enhanced_ai)
        self.optimizer = ModelFactory.create_optimizer(self.enable_enhanced_ai)
        
    
    def detect_anomalies(self, cost_data, method="ensemble", threshold=2.0, analyze_root_cause=True):
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
                # For class-based models
                if hasattr(self.anomaly_detector, 'detect_anomalies'):
                    results = self.anomaly_detector.detect_anomalies(
                        cost_data, method, threshold, analyze_root_cause)
                else:
                    # For function-based models
                    results = self.anomaly_detector(cost_data)
                
                # Add AI metadata
                results["ai_engine"] = "enhanced"
                results["ai_metadata"] = self.ai_metadata
                return results
            else:
                # Use original implementation
                anomalies = original_anomaly(cost_data)
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
    
    def optimize_costs(self, cost_data, utilization_data=None, targeted_services=None):
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
                # For class-based models
                if hasattr(self.optimizer, 'generate_optimization_suggestions'):
                    results = self.optimizer.generate_optimization_suggestions(
                        cost_data, utilization_data, targeted_services)
                else:
                    # For function-based models
                    results = self.optimizer(cost_data)
                
                # Add AI metadata
                results["ai_engine"] = "enhanced"
                results["ai_metadata"] = self.ai_metadata
                return results
            else:
                # Use original implementation
                recommendations = original_optimizer(cost_data)
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
    
    def __init__(self, enable_enhanced_ai=ENABLE_ENHANCED_AI):
        """Initialize with configuration for enhanced AI capabilities."""
        self.enable_enhanced_ai = enable_enhanced_ai
        self.ai_metadata = {
            "enhanced_ai_enabled": enable_enhanced_ai,
            "version": "1.0.0",
            "last_updated": "2025-03-02"
        }
        
        # Create appropriate models based on the configuration
        self._init_models()
        
    def _init_models(self):
        """Initialize AI models based on current configuration"""
        # Use the factory to create appropriate models
        self.forecasting_model = ModelFactory.create_forecasting_model(self.enable_enhanced_ai)
        self.anomaly_detector = ModelFactory.create_anomaly_detector(self.enable_enhanced_ai)
        
        # More model initialization as needed
        
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
                # Use the enhanced model
                if hasattr(self.forecasting_model, 'predict_future_costs'):
                    # Instance method for class-based models
                    forecast = self.forecasting_model.predict_future_costs(cost_data, days_ahead, algorithm)
                else:
                    # Function-based models
                    forecast = self.forecasting_model(cost_data, days_ahead)
                
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
    
    # Implement other methods similarly...
    
    def enable_enhanced_capabilities(self, enable: bool = True):
        """Enable or disable enhanced AI capabilities."""
        if self.enable_enhanced_ai != enable:
            self.enable_enhanced_ai = enable
            self.ai_metadata["enhanced_ai_enabled"] = enable
            # Reinitialize models to reflect the new setting
            self._init_models()
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

