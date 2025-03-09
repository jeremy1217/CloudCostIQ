# Standard library imports
from datetime import datetime, timedelta

# Third-party imports
from sqlalchemy.orm import Session
import numpy as np
import pandas as pd

# Local imports
from backend.models.cloud_cost import CloudCost
# backend/services/forecast_service.py

def generate_forecast(db: Session, service: str, time_range: str, confidence_level: str):
    """
    Generate a cost forecast based on historical data
    
    Args:
        db: Database session
        service: Service to forecast costs for (or 'all' for all services)
        time_range: Time range for forecast ('week', 'month', 'quarter', 'year')
        confidence_level: Confidence level for forecast ('low', 'medium', 'high')
        
    Returns:
        Dictionary with forecast data
    """
    # Get historical data
    historical_data = get_historical_data(db, service, time_range)
    
    # Convert to dataframe for easier analysis
    df = pd.DataFrame(historical_data)
    
    # Generate forecast using appropriate algorithm
    forecast_data = linear_regression(df, time_range)
    
    # Calculate confidence intervals
    intervals = calculate_confidence_intervals(forecast_data, confidence_level)
    
    return {
        "historical_data": historical_data,
        "forecast_data": forecast_data,
        "confidence_intervals": intervals
    }

def get_historical_data(db: Session, service: str, time_range: str):
    """
    Get historical cost data from the database
    
    Args:
        db: Database session
        service: Service to get costs for
        time_range: Time range to fetch data for
        
    Returns:
        List of dictionaries with historical cost data
    """
    # Convert time_range to months
    months = int(time_range) if time_range.isdigit() else {
        "week": 1, "month": 1, "quarter": 3, "year": 12
    }.get(time_range, 1)
    
    start_date = (datetime.utcnow() - timedelta(days=30*months)).strftime("%Y-%m-%d")
    
    # Build the query
    query = db.query(CloudCost).filter(CloudCost.date >= start_date)
    
    if service and service != 'all':
        query = query.filter(CloudCost.service == service)
    
    # Execute query and get results
    result = query.all()
    
    # Process and return data
    # This is a simplified example - in a real application, you'd do more processing
    # such as grouping by day/month and calculating totals
    return [
        {
            "date": item.date,
            "cost": float(item.cost)
        }
        for item in result
    ]

def linear_regression(df, time_range):
    """
    Perform linear regression on historical data to forecast future costs
    
    Args:
        df: DataFrame with historical cost data
        time_range: Time range for forecast
        
    Returns:
        List of dictionaries with forecasted costs
    """
    # This is a simplified implementation
    # In a real app, you would use a more sophisticated model
    
    # If no data or not enough data, return empty forecast
    if len(df) < 3:
        return []
    
    # Convert dates to numerical values
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'])
        df['days'] = (df['date'] - df['date'].min()).dt.days
    else:
        # Generate sequence for days if no date column
        df['days'] = range(len(df))
    
    # Calculate forecast period based on time_range
    forecast_days = {
        "week": 7,
        "month": 30,
        "quarter": 90,
        "year": 365
    }.get(time_range, 30)
    
    # Simple linear regression
    X = df['days'].values.reshape(-1, 1)
    y = df['cost'].values
    
    # Calculate slope and intercept
    slope, intercept = np.polyfit(df['days'], df['cost'], 1)
    
    # Generate forecast
    forecast = []
    last_date = df['date'].max() if 'date' in df.columns else datetime.now()
    
    for i in range(1, forecast_days + 1):
        if 'date' in df.columns:
            forecast_date = last_date + timedelta(days=i)
            forecast_date_str = forecast_date.strftime("%Y-%m-%d")
        else:
            forecast_date_str = f"Day {i}"
        
        # Predict cost
        days_from_start = df['days'].max() + i
        predicted_cost = slope * days_from_start + intercept
        
        forecast.append({
            "date": forecast_date_str,
            "cost": max(0, round(predicted_cost, 2))  # Ensure non-negative costs
        })
    
    return forecast

def calculate_confidence_intervals(forecast_data, confidence_level):
    """
    Calculate confidence intervals for forecasted costs
    
    Args:
        forecast_data: List of dictionaries with forecasted costs
        confidence_level: Confidence level ('low', 'medium', 'high')
        
    Returns:
        List of dictionaries with confidence intervals
    """
    # Calculate confidence intervals based on selected level
    intervals = []
    margin_multiplier = {
        "low": 0.05,
        "medium": 0.10,
        "high": 0.20
    }.get(confidence_level, 0.10)
    
    for item in forecast_data:
        cost = item["cost"]
        margin = cost * margin_multiplier
        intervals.append({
            "date": item["date"],
            "lower": max(0, round(cost - margin, 2)),
            "upper": round(cost + margin, 2)
        })
    
    return intervals

def update_settings(db: Session, algorithm_type: str, parameters: dict):
    """
    Update forecast algorithm settings
    
    Args:
        db: Database session
        algorithm_type: Type of forecasting algorithm to use
        parameters: Dictionary of algorithm parameters
        
    Returns:
        Boolean indicating success
    """
    # Update forecast algorithm settings
    # This would typically update a settings table or configuration
    # Simplified for this example
    print(f"Updating forecast settings: algorithm={algorithm_type}, parameters={parameters}")
    return True