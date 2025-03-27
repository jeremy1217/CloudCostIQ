# app/api/cost_analysis.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import User, CloudAccount
from app.schemas.cost import (
    CostSummary, CostDetail, CostAnomaly, 
    IdleResource, RightsizingRecommendation,
    ReservedInstanceRecommendation, RecommendationSummary
)
from app.services.cost_analysis import CostAnalysisService

router = APIRouter()

@router.get("/summary", response_model=CostSummary)
async def get_cost_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None,
    days: int = Query(30, ge=1, le=365)
):
    """
    Get a summary of costs for the dashboard.
    """
    # Check if the user has access to the requested account
    if account_id:
        account = db.query(CloudAccount).filter(
            CloudAccount.id == account_id,
            CloudAccount.owner_id == current_user.id
        ).first()
        
        if not account and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Access denied to this cloud account")
    
    service = CostAnalysisService(db)
    
    # Get daily costs for trend analysis
    daily_costs = service.get_daily_costs(account_id, days)
    
    # Calculate total spend
    total_spend = sum(day.total_cost for day in daily_costs) if daily_costs else 0
    
    # Calculate month-over-month change
    # In a real implementation, you'd compare with the previous month
    month_over_month_change = -5.2  # Placeholder
    
    # Calculate projected spend
    # In a real implementation, you'd use time series forecasting
    projected_spend = total_spend * 1.2  # Placeholder
    
    # Get top services by cost
    top_services = service.get_costs_by_service(account_id, days)
    top_services_data = [
        {"service": service.service, "cost": service.total_cost}
        for service in top_services[:5]
    ]
    
    return CostSummary(
        total_spend=total_spend,
        month_over_month_change=month_over_month_change,
        projected_spend=projected_spend,
        top_services=top_services_data
    )

@router.get("/by-service", response_model=List[CostDetail])
async def get_costs_by_service(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None,
    days: int = Query(30, ge=1, le=365)
):
    """
    Get costs grouped by service.
    """
    # Check if the user has access to the requested account
    if account_id:
        account = db.query(CloudAccount).filter(
            CloudAccount.id == account_id,
            CloudAccount.owner_id == current_user.id
        ).first()
        
        if not account and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Access denied to this cloud account")
    
    service = CostAnalysisService(db)
    services_costs = service.get_costs_by_service(account_id, days)
    
    result = []
    for service_cost in services_costs:
        result.append(CostDetail(
            service=service_cost.service,
            cost=service_cost.total_cost,
            # In a real implementation, you'd calculate these values
            change_percentage=5.0,  # Placeholder
            resource_count=10  # Placeholder
        ))
    
    return result

@router.get("/anomalies", response_model=List[CostAnomaly])
async def get_cost_anomalies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None,
    days: int = Query(30, ge=1, le=90),
    sensitivity: float = Query(2.0, ge=1.0, le=5.0)
):
    """
    Detect cost anomalies in the specified time period.
    """
    # Check account access
    if account_id:
        account = db.query(CloudAccount).filter(
            CloudAccount.id == account_id,
            CloudAccount.owner_id == current_user.id
        ).first()
        
        if not account and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Access denied to this cloud account")
    
    service = CostAnalysisService(db)
    anomalies = service.detect_anomalies(account_id, days, sensitivity)
    
    return anomalies

@router.get("/idle-resources", response_model=List[IdleResource])
async def get_idle_resources(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None,
    days: int = Query(30, ge=1, le=90)
):
    """
    Identify potentially idle resources that could be terminated.
    """
    # Check account access
    if account_id:
        account = db.query(CloudAccount).filter(
            CloudAccount.id == account_id,
            CloudAccount.owner_id == current_user.id
        ).first()
        
        if not account and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Access denied to this cloud account")
    
    service = CostAnalysisService(db)
    idle_resources = service.get_idle_resources(account_id, days)
    
    return idle_resources

@router.get("/rightsizing", response_model=List[RightsizingRecommendation])
async def get_rightsizing_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None,
    days: int = Query(30, ge=1, le=90)
):
    """
    Get recommendations for rightsizing resources.
    """
    # Check account access
    if account_id:
        account = db.query(CloudAccount).filter(
            CloudAccount.id == account_id,
            CloudAccount.owner_id == current_user.id
        ).first()
        
        if not account and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Access denied to this cloud account")
    
    service = CostAnalysisService(db)
    recommendations = service.get_right_sizing_recommendations(account_id, days)
    
    return recommendations

@router.get("/reserved-instances", response_model=List[ReservedInstanceRecommendation])
async def get_reserved_instance_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None,
    days: int = Query(90, ge=30, le=365)
):
    """
    Get recommendations for Reserved Instance purchases.
    """
    # Check account access
    if account_id:
        account = db.query(CloudAccount).filter(
            CloudAccount.id == account_id,
            CloudAccount.owner_id == current_user.id
        ).first()
        
        if not account and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Access denied to this cloud account")
    
    service = CostAnalysisService(db)
    recommendations = service.get_reserved_instance_recommendations(account_id, days)
    
    return recommendations

@router.get("/all", response_model=RecommendationSummary)
async def get_all_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None
):
    """
    Get all recommendation types in a single call.
    """
    # Check account access
    if account_id:
        account = db.query(CloudAccount).filter(
            CloudAccount.id == account_id,
            CloudAccount.owner_id == current_user.id
        ).first()
        
        if not account and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Access denied to this cloud account")
    
    service = CostAnalysisService(db)
    all_recommendations = service.get_all_recommendations(account_id)
    
    return all_recommendations