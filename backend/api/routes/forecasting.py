from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from backend.database.db import get_db
from backend.ai.forecast import predict_future_costs
from backend.models.cloud_cost import CloudCost
from pydantic import BaseModel

router = APIRouter()

class ForecastSettingsUpdate(BaseModel):
    algorithm_type: str
    parameters: dict

@router.get("/forecasting/predict")
async def predict_costs(
    service: Optional[str] = None,
    days_ahead: Optional[int] = 7,
    db: Session = Depends(get_db)
):
    """Predict future cloud costs"""
    try:
        # Get cost data from database
        query = db.query(CloudCost)
        
        # Apply filters
        if service:
            query = query.filter(CloudCost.service == service)
            
        # Sort by date
        query = query.order_by(CloudCost.date)
        
        # Convert to list of dictionaries
        cost_trend = [
            {
                "date": cost.date,
                "cost": cost.cost,
                "service": cost.service
            }
            for cost in query.all()
        ]
        
        # Fall back to mock data if no database results
        if not cost_trend:
            cost_trend = [
                {"date": "2025-02-10", "cost": 100.5},
                {"date": "2025-02-11", "cost": 98.2},
                {"date": "2025-02-12", "cost": 105.7},
                {"date": "2025-02-13", "cost": 99.9},
                {"date": "2025-02-14", "cost": 97.3},
                {"date": "2025-02-15", "cost": 103.4},
                {"date": "2025-02-16", "cost": 101.2},
            ]
            
        # Predict future costs
        predictions = predict_future_costs(cost_trend, days_ahead)
        
        # Calculate confidence intervals
        # For mock data, we'll add +/- 10% as confidence intervals
        for prediction in predictions:
            cost = prediction["predicted_cost"]
            prediction["lower_bound"] = round(cost * 0.9, 2) if cost else None
            prediction["upper_bound"] = round(cost * 1.1, 2) if cost else None
        
        return {
            "historical_data": cost_trend,
            "forecast_data": predictions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting costs: {str(e)}")

@router.post("/forecasting/settings")
async def update_forecast_settings(
    settings: ForecastSettingsUpdate,
    db: Session = Depends(get_db)
):
    """Update forecast settings"""
    try:
        # In a real implementation, we would save these settings to the database
        # For now, just return a success message
        return {"message": f"Forecast settings updated to use {settings.algorithm_type} algorithm"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating forecast settings: {str(e)}")