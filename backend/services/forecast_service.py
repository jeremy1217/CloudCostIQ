# app/services/forecast_service.py
from sqlalchemy.orm import Session
from app.models.cost import Cost
from app.models.forecast import Forecast
from app.utils.algorithms import linear_regression, exponential_smoothing
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

def generate_forecast(db: Session, service: str, time_range: str, confidence_level: str):
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
    # Convert time_range to months
    months = int(time_range) if time_range.isdigit() else {
        "week": 1, "month": 1, "quarter": 3, "year": 12
    }.get(time_range, 1)
    
    start_date = datetime.utcnow() - timedelta(days=30*months)
    
    # Build the query
    query = db.query(Cost).filter(Cost.timestamp >= start_date)
    
    if service and service != 'all':
        query = query.filter(Cost.service == service)
    
    # Execute query and get results
    result = query.all()
    
    # Process and return data
    # This is a simplified example - in a real application, you'd do more processing
    # such as grouping by day/month and calculating totals
    return [
        {
            "date": item.timestamp.strftime("%Y-%m-%d"),
            "cost": float(item.amount)
        }
        for item in result
    ]

def calculate_confidence_intervals(forecast_data, confidence_level):
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
            "lower": cost - margin,
            "upper": cost + margin
        })
    
    return intervals

def update_settings(db: Session, algorithm_type: str, parameters: dict):
    # Update forecast algorithm settings
    # This would typically update a settings table or configuration
    # Simplified for this example
    print(f"Updating forecast settings: algorithm={algorithm_type}, parameters={parameters}")
    return True

# app/services/anomaly_service.py
def detect_anomalies(db: Session, sensitivity: str, time_range: str, services: list):
    # Fetch recent cost data
    cost_data = fetch_recent_cost_data(db, time_range, services)
    
    # Calculate baseline metrics
    baseline = calculate_baseline(cost_data)
    
    # Detect anomalies based on sensitivity
    anomalies = find_anomalies(cost_data, baseline, sensitivity)
    
    # Save detected anomalies to database
    save_anomalies(db, anomalies)
    
    return anomalies

def fetch_recent_cost_data(db: Session, time_range: str, services: list):
    # Convert time_range to days
    days = int(time_range) if time_range.isdigit() else {
        "week": 7, "month": 30, "quarter": 90, "year": 365
    }.get(time_range, 30)
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Build the query
    query = db.query(Cost).filter(Cost.timestamp >= start_date)
    
    if services and 'all' not in services:
        query = query.filter(Cost.service.in_(services))
    
    # Execute query and return results
    return query.all()

# Similar implementations for other services...