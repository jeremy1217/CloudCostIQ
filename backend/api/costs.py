from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from backend.database.db import get_db
from backend.auth.dependencies import get_current_user
from backend.models.user import UserModel
from backend.auth.middleware import require_feature, require_plan_level, check_data_retention_access

router = APIRouter()

@router.get("/basic")
@require_feature("cost_analytics")
async def get_basic_costs(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Basic cost analysis - Available to all plans"""
    return {
        "message": "Basic cost analysis data",
        "level": current_user.get_plan_features()["cost_analytics"]
    }

@router.get("/by-service")
@require_feature("service_breakdown")
async def get_costs_by_service(
    days: Optional[int] = 30,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cost breakdown by service - Available to all plans"""
    # Check data retention access
    check_data_retention_access(days, current_user)
    
    return {
        "message": "Cost breakdown by service",
        "days": days
    }

@router.get("/attribution")
@require_plan_level("professional")
@require_feature("cost_attribution")
async def get_cost_attribution(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cost attribution analysis - Professional and Enterprise plans only"""
    return {
        "message": "Cost attribution analysis"
    }

@router.get("/advanced-analytics")
@require_plan_level("enterprise")
async def get_advanced_analytics(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Advanced cost analytics - Enterprise plan only"""
    return {
        "message": "Advanced cost analytics with predictive insights"
    } 