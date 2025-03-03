from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.ensemble import RandomForestRegressor
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import logging

from backend.ai.base_models import BaseForecasting
from backend.ai.utils import detect_seasonality, calculate_confidence_intervals

logger = logging.getLogger(__name__)

class EnhancedForecasting(BaseForecasting):
    """
    Advanced forecasting module for cloud cost prediction 
    with multiple algorithm support.
    """
    
    ALGORITHMS = {
        "linear": "Linear Regression",
        "arima": "ARIMA Time Series",
        "exp_smoothing": "Exponential Smoothing",
        "random_forest": "Random Forest"
    }
    
    def predict_future_costs(self, cost_trend, days_ahead=7, algorithm="auto"):
        """
        Predict future cloud costs using selected algorithm.
        
        Args:
            cost_trend: List of dicts with 'date' and 'cost'
            days_ahead: Number of days to forecast
            algorithm: Algorithm to use ('linear', 'arima', 'exp_smoothing', 'random_forest', or 'auto')
            
        Returns:
            dict: Forecast results including predictions and metadata
        """
        df = self.preprocess_data(cost_trend)
        if df is None:
            # Return empty predictions if not enough data
            return self._create_empty_prediction(days_ahead)
            
        # If algorithm is auto, select the best one based on data characteristics
        if algorithm == "auto":
            algorithm = self._select_best_algorithm(df)
            
        # Detect seasonality
        seasonality = detect_seasonality(df)
        
        # Get predictions based on algorithm
        try:
            if algorithm == "linear":
                predictions = self.linear_regression_forecast(df, days_ahead)
            elif algorithm == "arima":
                predictions = self._arima_forecast(df, days_ahead, seasonality)
            elif algorithm == "exp_smoothing":
                predictions = self._exponential_smoothing_forecast(df, days_ahead, seasonality)
            elif algorithm == "random_forest":
                predictions = self._random_forest_forecast(df, days_ahead)
            else:
                logger.warning(f"Unknown algorithm: {algorithm}. Falling back to linear regression.")
                predictions = self.linear_regression_forecast(df, days_ahead)
                algorithm = "linear"
                
            # Calculate confidence intervals
            predictions = calculate_confidence_intervals(predictions, 'medium', True)
            
            return {
                "forecast": predictions,
                "algorithm_used": algorithm,
                "algorithm_name": self.ALGORITHMS.get(algorithm, "Unknown"),
                "seasonality_detected": seasonality["has_seasonality"],
                "data_points_used": len(df),
                "forecast_generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error during forecasting with {algorithm}: {str(e)}")
            # Fall back to linear regression on error
            try:
                # Use parent class method for fallback
                return super().predict_future_costs(cost_trend, days_ahead)
            except Exception as fallback_error:
                logger.error(f"Fallback forecasting also failed: {str(fallback_error)}")
                return self._create_empty_prediction(days_ahead)
    
    # Then implement the specialized methods:
    def _select_best_algorithm(self, df):
        """Select the best algorithm based on data characteristics."""
        # Implementation...
        
    def _arima_forecast(self, df, days_ahead, seasonality):
        """Forecast using ARIMA model."""
        # Implementation...
        
    def _exponential_smoothing_forecast(self, df, days_ahead, seasonality):
        """Forecast using Exponential Smoothing."""
        # Implementation...
        
    def _random_forest_forecast(self, df, days_ahead):
        """Forecast using Random Forest."""
        # Implementation...