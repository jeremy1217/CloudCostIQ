# Standard library imports
from typing import List, Optional

# Third-party imports
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Local imports
from backend.database.db import get_db
from backend.models.cloud_cost import CloudCost

router = APIRouter()

@router.get("/by-service")
async def get_attribution_by_service(
    time_range: Optional[str] = "month",
    db: Session = Depends(get_db)
):
    """Get cost attribution by service"""
    try:
        # Mock data for now
        attribution_data = [
            {"service": "EC2", "cost": 4587.23, "percentage": 36.7},
            {"service": "S3", "cost": 2145.67, "percentage": 17.2},
            {"service": "RDS", "cost": 3256.78, "percentage": 26.1},
            {"service": "Lambda", "cost": 1234.56, "percentage": 9.9},
            {"service": "Other", "cost": 1274.43, "percentage": 10.1}
        ]
        
        return {"attribution": attribution_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting attribution data: {str(e)}")

@router.get("/by-team")
async def get_attribution_by_team(
    time_range: Optional[str] = "month",
    db: Session = Depends(get_db)
):
    """Get cost attribution by team"""
    try:
        # Mock data for now
        attribution_data = [
            {"team": "Engineering", "cost": 28456.78, "percentage": 45.7},
            {"team": "DevOps", "cost": 15687.92, "percentage": 25.2},
            {"team": "Data Science", "cost": 12345.67, "percentage": 19.8},
            {"team": "Frontend", "cost": 5876.54, "percentage": 9.3}
        ]
        
        return {"attribution": attribution_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting attribution data: {str(e)}")

@router.get("/by-environment")
async def get_attribution_by_environment(
    time_range: Optional[str] = "month",
    db: Session = Depends(get_db)
):
    """Get cost attribution by environment"""
    try:
        # Mock data for now
        attribution_data = [
            {"environment": "Production", "cost": 45678.90, "percentage": 52.3},
            {"environment": "Staging", "cost": 23456.78, "percentage": 26.8},
            {"environment": "Development", "cost": 12345.67, "percentage": 14.1},
            {"environment": "QA", "cost": 5678.90, "percentage": 6.8}
        ]
        
        return {"attribution": attribution_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting attribution data: {str(e)}")

@router.get("/untagged")
async def get_untagged_resources(
    db: Session = Depends(get_db)
):
    """Get untagged resources"""
    try:
        # Mock data for now
        untagged_data = [
            {"id": "i-0abc12345", "type": "EC2 Instance", "cost": 567.89, "age": 45},
            {"id": "vol-def67890", "type": "EBS Volume", "cost": 123.45, "age": 67},
            {"id": "eni-ghi12345", "type": "Network Interface", "cost": 45.67, "age": 32}
        ]
        
        return {"untagged_resources": untagged_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting untagged resources: {str(e)}")