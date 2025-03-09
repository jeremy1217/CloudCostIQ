# Local imports
from backend.ai.anomaly import detect_anomalies as original_anomaly
from backend.ai.base_models import BaseForecasting, BaseAnomalyDetector, BaseOptimizer
from backend.ai.enhanced_anomaly import EnhancedAnomalyDetection
from backend.ai.enhanced_forecast import EnhancedForecasting
from backend.ai.enhanced_optimizer import EnhancedOptimizer
from backend.ai.forecast import predict_future_costs as original_forecast
from backend.ai.optimizer import generate_optimization_suggestions as original_optimizer
# backend/ai/model_factory.py (update)

# Original function-based implementations

class ModelFactory:
    """Factory for creating appropriate AI models based on requirements"""
    
    @staticmethod
    def create_forecasting_model(enhanced=False):
        """Create appropriate forecasting model"""
        if enhanced:
            return EnhancedForecasting()
        else:
            # Function-based implementation or a class wrapper
            return original_forecast
            
    @staticmethod
    def create_anomaly_detector(enhanced=False):
        """Create appropriate anomaly detector"""
        if enhanced:
            return EnhancedAnomalyDetection()
        else:
            return original_anomaly
            
    @staticmethod
    def create_optimizer(enhanced=False):
        """Create appropriate optimizer"""
        if enhanced:
            return EnhancedOptimizer()
        else:
            return original_optimizer