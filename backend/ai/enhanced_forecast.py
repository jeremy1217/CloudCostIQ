import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class EnhancedForecasting:
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
    
    def __init__(self, min_data_points=5):
        """Initialize forecasting engine with minimum required data points."""
        self.min_data_points = min_data_points
        
    def preprocess_data(self, cost_trend):
        """
        Preprocess cost data for forecasting.
        
        Args:
            cost_trend: List of dicts with 'date' and 'cost'
            
        Returns:
            pd.DataFrame: Processed dataframe with dates as index
        """
        if not cost_trend or len(cost_trend) < self.min_data_points:
            logger.warning(f"Insufficient data points ({len(cost_trend) if cost_trend else 0}) "
                          f"for reliable forecasting. Minimum required: {self.min_data_points}")
            return None
            
        # Convert to dataframe
        df = pd.DataFrame(cost_trend)
        
        # Convert dates to datetime
        df['date'] = pd.to_datetime(df['date'])
        
        # Sort by date
        df = df.sort_values('date')
        
        # Set date as index
        df = df.set_index('date')
        
        # Handle missing values if any
        df = df.interpolate()
        
        return df
        
    def detect_seasonality(self, df):
        """
        Detect if there's seasonality in the data.
        
        Args:
            df: DataFrame with date index and cost column
            
        Returns:
            dict: Seasonality information
        """
        # Simple seasonality detection based on autocorrelation
        if len(df) < 14:  # Need at least 2 weeks of data
            return {"has_seasonality": False}
            
        # Calculate autocorrelation at 7-day lag (weekly pattern)
        weekly_autocorr = df['cost'].autocorr(lag=7)
        
        # Calculate autocorrelation at 30-day lag (monthly pattern)
        monthly_autocorr = df['cost'].autocorr(lag=30) if len(df) >= 60 else 0
        
        return {
            "has_seasonality": weekly_autocorr > 0.5 or monthly_autocorr > 0.5,
            "weekly_correlation": weekly_autocorr,
            "monthly_correlation": monthly_autocorr,
            "suggested_period": 7 if weekly_autocorr > monthly_autocorr else 30
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
        seasonality = self.detect_seasonality(df)
        
        # Get predictions based on algorithm
        try:
            if algorithm == "linear":
                predictions = self._linear_regression_forecast(df, days_ahead)
            elif algorithm == "arima":
                predictions = self._arima_forecast(df, days_ahead, seasonality)
            elif algorithm == "exp_smoothing":
                predictions = self._exponential_smoothing_forecast(df, days_ahead, seasonality)
            elif algorithm == "random_forest":
                predictions = self._random_forest_forecast(df, days_ahead)
            else:
                logger.warning(f"Unknown algorithm: {algorithm}. Falling back to linear regression.")
                predictions = self._linear_regression_forecast(df, days_ahead)
                algorithm = "linear"
                
            # Calculate confidence intervals
            predictions = self._add_confidence_intervals(predictions, algorithm)
            
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
                predictions = self._linear_regression_forecast(df, days_ahead)
                predictions = self._add_confidence_intervals(predictions, "linear")
                return {
                    "forecast": predictions,
                    "algorithm_used": "linear",
                    "algorithm_name": self.ALGORITHMS["linear"],
                    "seasonality_detected": seasonality["has_seasonality"],
                    "data_points_used": len(df),
                    "forecast_generated_at": datetime.now().isoformat(),
                    "error_in_preferred_algorithm": str(e)
                }
            except Exception as fallback_error:
                logger.error(f"Fallback forecasting also failed: {str(fallback_error)}")
                return self._create_empty_prediction(days_ahead)
    
    def _select_best_algorithm(self, df):
        """Select the best algorithm based on data characteristics."""
        num_points = len(df)
        
        # Detect seasonality
        seasonality = self.detect_seasonality(df)
        
        # For very small datasets, use linear regression
        if num_points < 10:
            return "linear"
            
        # If we detect strong seasonality, use exponential smoothing
        if seasonality["has_seasonality"] and (
           seasonality["weekly_correlation"] > 0.7 or seasonality["monthly_correlation"] > 0.7):
            return "exp_smoothing"
            
        # For medium-sized datasets with potential patterns, use ARIMA
        if num_points >= 14 and num_points < 60:
            return "arima"
            
        # For larger datasets, use random forest
        if num_points >= 60:
            return "random_forest"
            
        # Default to linear regression
        return "linear"
        
    def _linear_regression_forecast(self, df, days_ahead):
        """Forecast using linear regression."""
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
        
    def _arima_forecast(self, df, days_ahead, seasonality):
        """Forecast using ARIMA model."""
        # Default ARIMA order
        order = (1, 1, 1)
        
        # If seasonality detected, use seasonal parameters
        seasonal_order = (0, 0, 0, 0)
        if seasonality["has_seasonality"]:
            seasonal_order = (1, 0, 1, seasonality["suggested_period"])
        
        # Fit ARIMA model
        model = ARIMA(df['cost'], order=order)
        model_fit = model.fit()
        
        # Make predictions
        predictions = model_fit.forecast(steps=days_ahead)
        
        # Create result dataframe
        last_date = df.index.max()
        result = []
        for i in range(days_ahead):
            date = last_date + timedelta(days=i+1)
            result.append({
                "date": date.strftime("%Y-%m-%d"),
                "predicted_cost": max(0, round(predictions[i], 2))
            })
            
        return result
        
    def _exponential_smoothing_forecast(self, df, days_ahead, seasonality):
        """Forecast using Exponential Smoothing."""
        # Default to non-seasonal model
        seasonal_periods = None
        seasonal = None
        
        # If seasonality detected, use seasonal model
        if seasonality["has_seasonality"]:
            seasonal_periods = seasonality["suggested_period"]
            seasonal = 'add'  # additive seasonality
        
        # Fit exponential smoothing model
        model = ExponentialSmoothing(
            df['cost'],
            trend='add',  # additive trend
            seasonal=seasonal,
            seasonal_periods=seasonal_periods
        )
        model_fit = model.fit()
        
        # Make predictions
        predictions = model_fit.forecast(days_ahead)
        
        # Create result dataframe
        last_date = df.index.max()
        result = []
        for i in range(days_ahead):
            date = last_date + timedelta(days=i+1)
            result.append({
                "date": date.strftime("%Y-%m-%d"),
                "predicted_cost": max(0, round(predictions[i], 2))
            })
            
        return result
        
    def _random_forest_forecast(self, df, days_ahead):
        """Forecast using Random Forest."""
        # Feature engineering
        df_features = df.copy()
        
        # Add day of week, day of month, month features
        df_features['dayofweek'] = df.index.dayofweek
        df_features['day'] = df.index.day
        df_features['month'] = df.index.month
        
        # Add lag features
        for lag in [1, 2, 3, 7]:
            if len(df) > lag:
                df_features[f'lag_{lag}'] = df['cost'].shift(lag)
                
        # Add rolling mean and std features
        for window in [3, 7, 14]:
            if len(df) > window:
                df_features[f'rolling_mean_{window}'] = df['cost'].rolling(window=window).mean()
                df_features[f'rolling_std_{window}'] = df['cost'].rolling(window=window).std()
        
        # Drop NaN rows
        df_features = df_features.dropna()
        
        if len(df_features) < 5:
            # Fall back to linear regression if we lost too many rows
            return self._linear_regression_forecast(df, days_ahead)
            
        # Prepare features and target
        features = [col for col in df_features.columns if col != 'cost']
        X = df_features[features]
        y = df_features['cost']
        
        # Train model
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X, y)
        
        # Generate future dates and features
        result = []
        last_date = df.index.max()
        last_values = df_features.iloc[-1].copy()
        
        for i in range(days_ahead):
            next_date = last_date + timedelta(days=i+1)
            
            # Create features for this date
            prediction_features = last_values.copy()
            prediction_features['dayofweek'] = next_date.dayofweek
            prediction_features['day'] = next_date.day
            prediction_features['month'] = next_date.month
            
            # Update lag features
            for lag in range(1, 4):
                lag_col = f'lag_{lag}'
                if lag_col in prediction_features:
                    if lag == 1:
                        prediction_features[lag_col] = last_values['cost']
                    else:
                        old_lag_col = f'lag_{lag-1}'
                        if old_lag_col in prediction_features:
                            prediction_features[lag_col] = prediction_features[old_lag_col]
            
            # Predict
            X_pred = prediction_features[features].values.reshape(1, -1)
            predicted_cost = model.predict(X_pred)[0]
            
            # Update for next iteration
            last_values['cost'] = predicted_cost
            
            # Add to results
            result.append({
                "date": next_date.strftime("%Y-%m-%d"),
                "predicted_cost": max(0, round(predicted_cost, 2))
            })
            
        return result
    
    def _add_confidence_intervals(self, predictions, algorithm):
        """Add confidence intervals to predictions."""
        # Define confidence interval widths based on algorithm
        ci_factors = {
            "linear": 0.15,  # ±15%
            "arima": 0.12,   # ±12%
            "exp_smoothing": 0.10,  # ±10%
            "random_forest": 0.08   # ±8%
        }
        
        ci_factor = ci_factors.get(algorithm, 0.15)
        
        # Add intervals to predictions
        for pred in predictions:
            cost = pred["predicted_cost"]
            # Wider intervals for farther predictions
            position_factor = 1.0
            if len(predictions) > 1:
                position = predictions.index(pred)
                position_factor = 1.0 + (position / len(predictions)) * 0.5
                
            interval = cost * ci_factor * position_factor
            pred["lower_bound"] = max(0, round(cost - interval, 2))
            pred["upper_bound"] = round(cost + interval, 2)
            
        return predictions
    
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
            "seasonality_detected": False,
            "data_points_used": 0,
            "forecast_generated_at": datetime.now().isoformat(),
            "error": "Insufficient data for forecasting"
        }

# Main forecasting function to use in API endpoints
def predict_future_costs(cost_trend, days_ahead=7, algorithm="auto"):
    """
    Predict future cloud costs based on historical data using selected algorithm.
    
    Args:
        cost_trend: List of dicts with 'date' and 'cost'
        days_ahead: Number of future days to predict
        algorithm: Algorithm to use ('linear', 'arima', 'exp_smoothing', 'random_forest', or 'auto')
        
    Returns:
        dict: Forecast results including predictions and metadata
    """
    forecaster = EnhancedForecasting()
    return forecaster.predict_future_costs(cost_trend, days_ahead, algorithm)