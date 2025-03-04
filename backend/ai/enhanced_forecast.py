import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Any, Optional, Union

# Add these imports
import statsmodels.api as sm
from statsmodels.tsa.statespace.sarimax import SARIMAX
try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False
    logging.warning("Prophet not installed. Prophet forecasting will not be available.")

from backend.ai.base_models import BaseForecasting
from backend.ai.utils import detect_seasonality, calculate_confidence_intervals, preprocess_time_series_data

logger = logging.getLogger(__name__)

class EnhancedForecasting(BaseForecasting):
    """
    Advanced forecasting module for cloud cost prediction 
    with multiple algorithm support including ARIMA and Prophet.
    """
    
    ALGORITHMS = {
        "linear": "Linear Regression",
        "arima": "ARIMA Time Series",
        "exp_smoothing": "Exponential Smoothing",
        "random_forest": "Random Forest",
        "prophet": "Facebook Prophet",
        "auto": "Auto-selected Best Model"
    }
    
    def predict_future_costs(self, cost_trend: List[Dict[str, Any]], days_ahead: int = 7, algorithm: str = "auto"):
        """
        Predict future cloud costs using selected algorithm.
        
        Args:
            cost_trend: List of dicts with 'date' and 'cost'
            days_ahead: Number of days to forecast
            algorithm: Algorithm to use ('linear', 'arima', 'exp_smoothing', 'random_forest', 'prophet', or 'auto')
            
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
            elif algorithm == "prophet" and PROPHET_AVAILABLE:
                predictions = self._prophet_forecast(df, days_ahead)
            else:
                if algorithm == "prophet" and not PROPHET_AVAILABLE:
                    logger.warning("Prophet not installed. Falling back to ARIMA.")
                    algorithm = "arima"
                    predictions = self._arima_forecast(df, days_ahead, seasonality)
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
    
    def _select_best_algorithm(self, df: pd.DataFrame) -> str:
        """
        Select the best algorithm based on data characteristics.
        
        Args:
            df: DataFrame with time series data
            
        Returns:
            str: Selected algorithm name
        """
        # Data length thresholds
        MIN_DATA_FOR_ARIMA = 10
        MIN_DATA_FOR_PROPHET = 14
        
        data_length = len(df)
        seasonality = detect_seasonality(df)
        has_seasonality = seasonality.get("has_seasonality", False)
        
        # For very small datasets, use linear regression
        if data_length < MIN_DATA_FOR_ARIMA:
            return "linear"
            
        # For datasets with strong seasonality, prefer Prophet or ARIMA
        if has_seasonality:
            if data_length >= MIN_DATA_FOR_PROPHET and PROPHET_AVAILABLE:
                return "prophet"
            else:
                return "arima"
                
        # For datasets with moderate length, use ARIMA
        if MIN_DATA_FOR_ARIMA <= data_length < 30:
            return "arima"
            
        # For larger datasets, use Random Forest
        if data_length >= 30:
            return "random_forest"
            
        # Default to exponential smoothing
        return "exp_smoothing"
        
    def _arima_forecast(self, df: pd.DataFrame, days_ahead: int, seasonality: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Forecast using ARIMA model.
        
        Args:
            df: DataFrame with time series data
            days_ahead: Number of days to forecast
            seasonality: Dictionary with seasonality information
            
        Returns:
            List of predicted values with dates
        """
        # Extract the time series data
        y = df['cost'].values
        
        # Auto-determine ARIMA parameters (p, d, q)
        # This is a simplified approach - for production you might want to use more sophisticated
        # parameter selection like auto_arima from pmdarima
        p, d, q = 1, 1, 0  # Default parameters
        
        # If seasonality detected, use seasonal ARIMA
        if seasonality.get("has_seasonality", False):
            # Extract seasonal parameters
            s = seasonality.get("suggested_period", 7)  # Default to weekly
            P, D, Q = 1, 1, 0  # Default seasonal parameters
            
            # Create and fit SARIMA model
            model = SARIMAX(y, order=(p, d, q), seasonal_order=(P, D, Q, s),
                           enforce_stationarity=False, enforce_invertibility=False)
        else:
            # Create and fit standard ARIMA model
            model = ARIMA(y, order=(p, d, q))
        
        # Fit the model
        fitted_model = model.fit(disp=False)
        
        # Generate predictions
        predictions = fitted_model.forecast(steps=days_ahead)
        
        # Generate future dates
        last_date = df.index.max() if isinstance(df.index, pd.DatetimeIndex) else pd.to_datetime(df['date'].max())
        future_dates = [last_date + timedelta(days=i+1) for i in range(days_ahead)]
        
        # Format results
        result = []
        for i, date in enumerate(future_dates):
            result.append({
                "date": date.strftime("%Y-%m-%d"),
                "predicted_cost": max(0, round(float(predictions[i]), 2))
            })
            
        return result
        
    def _exponential_smoothing_forecast(self, df: pd.DataFrame, days_ahead: int, seasonality: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Forecast using Exponential Smoothing.
        
        Args:
            df: DataFrame with time series data
            days_ahead: Number of days to forecast
            seasonality: Dictionary with seasonality information
            
        Returns:
            List of predicted values with dates
        """
        from statsmodels.tsa.holtwinters import ExponentialSmoothing
        
        # Extract the time series data
        y = df['cost'].values
        
        # Determine if seasonal component should be used
        has_seasonality = seasonality.get("has_seasonality", False)
        seasonal_period = seasonality.get("suggested_period", None)
        
        if has_seasonality and seasonal_period and len(y) >= 2 * seasonal_period:
            # Use multiplicative seasonality by default, but can be changed to 'additive'
            # based on data characteristics
            model = ExponentialSmoothing(
                y,
                trend='add',
                seasonal='mul',
                seasonal_periods=seasonal_period,
                damped=True
            )
        else:
            # Simple exponential smoothing without seasonality
            model = ExponentialSmoothing(
                y,
                trend='add',
                damped=True
            )
        
        # Fit the model
        fitted_model = model.fit(optimized=True)
        
        # Generate predictions
        predictions = fitted_model.forecast(days_ahead)
        
        # Generate future dates
        last_date = df.index.max() if isinstance(df.index, pd.DatetimeIndex) else pd.to_datetime(df['date'].max())
        future_dates = [last_date + timedelta(days=i+1) for i in range(days_ahead)]
        
        # Format results
        result = []
        for i, date in enumerate(future_dates):
            result.append({
                "date": date.strftime("%Y-%m-%d"),
                "predicted_cost": max(0, round(float(predictions[i]), 2))
            })
            
        return result
        
    def _random_forest_forecast(self, df: pd.DataFrame, days_ahead: int) -> List[Dict[str, Any]]:
        """
        Forecast using Random Forest.
        
        Args:
            df: DataFrame with time series data
            days_ahead: Number of days to forecast
            
        Returns:
            List of predicted values with dates
        """
        # Create features from the time series
        df_features = self._create_time_features(df)
        
        # Split features and target
        X = df_features.drop(columns=['cost'])
        y = df_features['cost']
        
        # Train the model
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X, y)
        
        # Generate features for future dates
        future_features = self._create_future_features(df, days_ahead)
        
        # Predict
        predictions = model.predict(future_features)
        
        # Generate future dates
        last_date = df.index.max() if isinstance(df.index, pd.DatetimeIndex) else pd.to_datetime(df['date'].max())
        future_dates = [last_date + timedelta(days=i+1) for i in range(days_ahead)]
        
        # Format results
        result = []
        for i, date in enumerate(future_dates):
            result.append({
                "date": date.strftime("%Y-%m-%d"),
                "predicted_cost": max(0, round(float(predictions[i]), 2))
            })
            
        return result
        
    def _prophet_forecast(self, df: pd.DataFrame, days_ahead: int) -> List[Dict[str, Any]]:
        """
        Forecast using Facebook Prophet.
        
        Args:
            df: DataFrame with time series data
            days_ahead: Number of days to forecast
            
        Returns:
            List of predicted values with dates
        """
        if not PROPHET_AVAILABLE:
            raise ImportError("Prophet is not installed. Please install it with 'pip install prophet'.")
            
        # Prophet requires 'ds' (date) and 'y' (value) columns
        prophet_df = pd.DataFrame({
            'ds': df.index if isinstance(df.index, pd.DatetimeIndex) else pd.to_datetime(df['date']),
            'y': df['cost']
        })
        
        # Create and fit the model
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            seasonality_mode='multiplicative' if df['cost'].mean() > 0 else 'additive'
        )
        
        model.fit(prophet_df)
        
        # Create future dataframe
        future = model.make_future_dataframe(periods=days_ahead)
        
        # Make predictions
        forecast = model.predict(future)
        
        # Extract the relevant part of the forecast (just the future)
        future_forecast = forecast.iloc[-days_ahead:].copy()
        
        # Format results
        result = []
        for _, row in future_forecast.iterrows():
            result.append({
                "date": row['ds'].strftime("%Y-%m-%d"),
                "predicted_cost": max(0, round(row['yhat'], 2)),
                "lower_bound": max(0, round(row['yhat_lower'], 2)),
                "upper_bound": max(0, round(row['yhat_upper'], 2))
            })
            
        return result
        
    def _create_time_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create time-based features for machine learning forecasting.
        
        Args:
            df: DataFrame with time series data
            
        Returns:
            DataFrame with time features
        """
        # Get datetime index
        if isinstance(df.index, pd.DatetimeIndex):
            dates = df.index
        else:
            dates = pd.to_datetime(df['date'])
            
        # Create a new dataframe with the original data
        features_df = df.copy()
        
        # Add time-based features
        features_df['day_of_week'] = dates.dayofweek
        features_df['day_of_month'] = dates.day
        features_df['month'] = dates.month
        features_df['quarter'] = dates.quarter
        features_df['year'] = dates.year
        features_df['is_weekend'] = dates.dayofweek.isin([5, 6]).astype(int)
        
        # Add lag features
        for lag in [1, 3, 7, 14]:
            if len(df) > lag:
                features_df[f'lag_{lag}'] = df['cost'].shift(lag).fillna(df['cost'].median())
                
        # Add rolling statistics features
        for window in [3, 7, 14]:
            if len(df) >= window:
                features_df[f'rolling_mean_{window}'] = df['cost'].rolling(window=window).mean().fillna(df['cost'].median())
                features_df[f'rolling_std_{window}'] = df['cost'].rolling(window=window).std().fillna(0)
                
        # Drop any remaining NaN values with the median
        features_df = features_df.fillna(df.median())
        
        return features_df
        
    def _create_future_features(self, df: pd.DataFrame, days_ahead: int) -> pd.DataFrame:
        """
        Create features for future dates for machine learning forecasting.
        
        Args:
            df: DataFrame with time series data
            days_ahead: Number of days to forecast
            
        Returns:
            DataFrame with future time features
        """
        # Get the last date
        if isinstance(df.index, pd.DatetimeIndex):
            last_date = df.index.max()
        else:
            last_date = pd.to_datetime(df['date']).max()
            
        # Create future dates
        future_dates = [last_date + timedelta(days=i+1) for i in range(days_ahead)]
        
        # Create a new dataframe for future dates
        future_df = pd.DataFrame({
            'date': future_dates
        })
        
        # Add time-based features
        future_df['day_of_week'] = future_df['date'].dt.dayofweek
        future_df['day_of_month'] = future_df['date'].dt.day
        future_df['month'] = future_df['date'].dt.month
        future_df['quarter'] = future_df['date'].dt.quarter
        future_df['year'] = future_df['date'].dt.year
        future_df['is_weekend'] = future_df['date'].dt.dayofweek.isin([5, 6]).astype(int)
        
        # Get the most recent values from the original data
        last_values = df.copy().sort_index(ascending=False).head(14)['cost'].values
        
        # Add lag features
        for lag in [1, 3, 7, 14]:
            if len(df) > lag:
                if lag <= len(last_values):
                    # Use the most recent values for the initial lags
                    future_df[f'lag_{lag}'] = [last_values[lag-1]] * days_ahead
                else:
                    # Use the median for lags beyond available data
                    future_df[f'lag_{lag}'] = df['cost'].median()
                
        # Add rolling statistics features
        for window in [3, 7, 14]:
            if len(df) >= window:
                future_df[f'rolling_mean_{window}'] = df['cost'].rolling(window=window).mean().iloc[-1]
                future_df[f'rolling_std_{window}'] = df['cost'].rolling(window=window).std().iloc[-1]
                
        # Drop the date column before returning
        future_df = future_df.drop(columns=['date'])
        
        return future_df

# Add to requirements.txt:
# pmdarima==2.0.3
# prophet==1.1.4