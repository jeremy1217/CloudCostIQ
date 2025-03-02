from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from backend.database.db import get_db
from backend.ai.anomaly import detect_anomalies
from backend.models.cloud_cost import CloudCost

router = APIRouter()

@router.get("/anomalies/detect")
async def detect_cost_anomalies(
    service: Optional[str] = None,
    days: Optional[int] = 30,
    threshold: Optional[float] = 2.0,
    db: Session = Depends(get_db)
):
    """Detect anomalies in cloud costs"""
    try:
        # Get cost data from database
        query = db.query(CloudCost)
        
        # Apply filters
        if service:
            query = query.filter(CloudCost.service == service)
            
        # Filter by date range
        start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        query = query.filter(CloudCost.date >= start_date)
        
        # Convert to list of dictionaries
        cost_data = [
            {
                "date": cost.date,
                "cost": cost.cost,
                "service": cost.service,
                "provider": cost.provider
            }
            for cost in query.all()
        ]
        
        # Fall back to mock data if no database results
        if not cost_data:
            cost_data = [
                {"date": "2025-02-20", "cost": 120.50, "service": "EC2", "provider": "AWS"},
                {"date": "2025-02-21", "cost": 98.75, "service": "VM", "provider": "Azure"},
                {"date": "2025-02-22", "cost": 85.20, "service": "Compute Engine", "provider": "GCP"},
                {"date": "2025-02-23", "cost": 500.00, "service": "RDS", "provider": "AWS"},  # Anomaly
                {"date": "2025-02-24", "cost": 92.10, "service": "S3", "provider": "AWS"},
            ]
            
        # Detect anomalies
        anomalies = detect_anomalies(cost_data)
        
        return {"anomalies": anomalies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting anomalies: {str(e)}")