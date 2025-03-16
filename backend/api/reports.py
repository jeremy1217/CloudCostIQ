from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta

from backend.database.db import get_db
from backend.auth.dependencies import get_current_user
from backend.models.user import UserModel
from backend.auth.middleware import (
    restrict_endpoint,
    check_data_access,
    check_export_access,
    check_api_limits
)

router = APIRouter()

@router.get("/cost-report")
@restrict_endpoint
async def get_cost_report(
    request: Request,
    days: int = Query(default=30, ge=1),
    format: str = Query(default="csv"),
    include_predictions: bool = False,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a cost report with restrictions based on plan level"""
    # Check data retention access
    check_data_access(days, current_user)
    
    # Check export format access
    check_export_access(format, current_user)
    
    # Get API limits for the user's plan
    api_limits = check_api_limits(current_user)
    
    # Basic report data available to all plans
    report_data = {
        "total_cost": 1000.00,
        "time_range": f"Last {days} days",
        "export_format": format,
        "api_limits": api_limits
    }
    
    # Add advanced features based on plan
    user_features = current_user.get_plan_features()
    
    if "cost_attribution" in user_features:
        report_data["cost_by_team"] = {
            "team1": 500.00,
            "team2": 500.00
        }
    
    if "advanced_analytics" in user_features:
        report_data["detailed_metrics"] = {
            "cost_per_service": {"service1": 300.00, "service2": 700.00},
            "usage_efficiency": 0.85
        }
    
    if include_predictions and current_user.subscription.plan.name.lower() == "enterprise":
        report_data["cost_predictions"] = {
            "next_month": 1200.00,
            "next_quarter": 3800.00
        }
    
    return report_data

@router.post("/export-report")
@restrict_endpoint
async def export_report(
    request: Request,
    format: str,
    report_id: str,
    include_details: bool = False,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export a report with format restrictions based on plan level"""
    # Check export format access
    check_export_access(format, current_user)
    
    # Basic export data
    export_data = {
        "report_id": report_id,
        "format": format,
        "timestamp": datetime.now().isoformat()
    }
    
    # Add detailed data based on plan level
    if include_details:
        user_plan = current_user.subscription.plan.name.lower()
        if user_plan in ["professional", "enterprise"]:
            export_data["detailed_data"] = {
                "custom_fields": True,
                "historical_trends": True
            }
        
        if user_plan == "enterprise":
            export_data["advanced_data"] = {
                "ai_insights": True,
                "predictive_metrics": True
            }
    
    return export_data 