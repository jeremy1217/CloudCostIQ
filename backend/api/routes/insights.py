from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from datetime import datetime, timedelta
import random
from backend.database.db import get_db
from backend.ai.anomaly import detect_anomalies
from backend.ai.forecast import predict_future_costs
from backend.models.cloud_cost import CloudCost

router = APIRouter()

mock_costs = [
    {"date": "2025-02-20", "cost": 120.50, "service": "EC2"},
    {"date": "2025-02-21", "cost": 98.75, "service": "VM"},
    {"date": "2025-02-22", "cost": 85.20, "service": "Compute Engine"},
    {"date": "2025-02-23", "cost": 500.00, "service": "RDS"},  # Anomaly
    {"date": "2025-02-24", "cost": 92.10, "service": "S3"},
]

@router.get("/anomalies")
def get_anomalies(db: Session = Depends(get_db)):
    """Detect and return cost anomalies"""
    # Use mock data for now
    return detect_anomalies(mock_costs)

@router.get("/cost-breakdown")
def get_cost_breakdown(db: Session = Depends(get_db)):
    """Return cost breakdown data for dashboard"""
    try:
        # Try to get data from database first
        cost_data = db.query(CloudCost).all()
        
        if cost_data:
            breakdown = [
                {"provider": cost.provider, "service": cost.service, "cost": cost.cost} 
                for cost in cost_data
            ]
        else:
            # Fall back to mock data
            breakdown = [
                {"provider": "AWS", "service": "EC2", "cost": 120.50},
                {"provider": "Azure", "service": "VM", "cost": 98.75},
                {"provider": "GCP", "service": "Compute Engine", "cost": 85.20}
            ]
        
        return {"cost_breakdown": breakdown}
    except Exception as e:
        # Log the error and return mock data
        print(f"Error getting cost breakdown: {str(e)}")
        return {
            "cost_breakdown": [
                {"provider": "AWS", "service": "EC2", "cost": 120.50},
                {"provider": "Azure", "service": "VM", "cost": 98.75},
                {"provider": "GCP", "service": "Compute Engine", "cost": 85.20}
            ]
        }

@router.get("/forecast")
def get_forecast(days_ahead: int = 7, db: Session = Depends(get_db)):
    """Generate cost forecast"""
    # Mock cost data
    cost_trend = generate_mock_costs()
    forecast = predict_future_costs(cost_trend, days_ahead)
    return {"forecast": forecast}

def generate_mock_costs():
    """Generate mock cost data for the last 7 days"""
    today = datetime.today()
    cost_trend = [
        {"date": (today - timedelta(days=i)).strftime("%Y-%m-%d"), "cost": round(random.uniform(50, 200), 2)}
        for i in range(7)
    ]
    return cost_trend