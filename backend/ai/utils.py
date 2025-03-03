import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

def preprocess_time_series_data(data, date_column='date', value_column='cost', min_data_points=5):
    """
    Preprocess time series data for analysis.
    
    Args:
        data (list of dicts): Input data with dates and values
        date_column (str): Name of the date column
        value_column (str): Name of the value column
        min_data_points (int): Minimum required data points
        
    Returns:
        pd.DataFrame: Processed dataframe or None if insufficient data
    """
    if not data or len(data) < min_data_points:
        logger.warning(f"Insufficient data points ({len(data) if data else 0}) "
                     f"for analysis. Minimum required: {min_data_points}")
        return None
        
    # Convert to dataframe
    df = pd.DataFrame(data)
    
    # Convert dates to datetime
    if date_column in df.columns:
        df[date_column] = pd.to_datetime(df[date_column])
        
    # Sort by date if available
    if date_column in df.columns:
        df = df.sort_values(date_column)
        
    # Handle missing values if any
    if value_column in df.columns:
        df[value_column] = df[value_column].fillna(df[value_column].median())
        
    return df

def calculate_confidence_intervals(predictions, confidence_level='medium', increasing_uncertainty=True):
    """
    Add confidence intervals to predictions.
    
    Args:
        predictions (list): List of prediction dictionaries
        confidence_level (str): Confidence level ('low', 'medium', 'high')
        increasing_uncertainty (bool): Whether uncertainty should increase with time
        
    Returns:
        list: Predictions with added confidence intervals
    """
    # Define confidence interval widths based on level
    ci_factors = {
        "low": 0.05,    # ±5%
        "medium": 0.10, # ±10%
        "high": 0.20    # ±20%
    }
    
    ci_factor = ci_factors.get(confidence_level, 0.10)
    
    # Add intervals to predictions
    for i, pred in enumerate(predictions):
        cost = pred.get("predicted_cost") or pred.get("cost")
        if cost is None:
            continue
            
        # Apply wider intervals for farther predictions if requested
        position_factor = 1.0
        if increasing_uncertainty and len(predictions) > 1:
            position_factor = 1.0 + (i / len(predictions)) * 0.5
            
        interval = cost * ci_factor * position_factor
        pred["lower_bound"] = max(0, round(cost - interval, 2))
        pred["upper_bound"] = round(cost + interval, 2)
        
    return predictions

def detect_seasonality(time_series, date_column='date', value_column='cost'):
    """
    Detect if there's seasonality in the data.
    
    Args:
        time_series (pd.DataFrame): DataFrame with date and value columns
        date_column (str): Name of the date column
        value_column (str): Name of the value column
        
    Returns:
        dict: Seasonality information
    """
    if len(time_series) < 14:  # Need at least 2 weeks of data
        return {"has_seasonality": False}
    
    # Set date as index if it's not already
    if time_series.index.name != date_column and date_column in time_series.columns:
        time_series = time_series.set_index(date_column)
    
    # Calculate autocorrelation at 7-day lag (weekly pattern)
    weekly_autocorr = time_series[value_column].autocorr(lag=7)
    
    # Calculate autocorrelation at 30-day lag (monthly pattern)
    monthly_autocorr = time_series[value_column].autocorr(lag=30) if len(time_series) >= 60 else 0
    
    return {
        "has_seasonality": weekly_autocorr > 0.5 or monthly_autocorr > 0.5,
        "weekly_correlation": weekly_autocorr,
        "monthly_correlation": monthly_autocorr,
        "suggested_period": 7 if weekly_autocorr > monthly_autocorr else 30
    }