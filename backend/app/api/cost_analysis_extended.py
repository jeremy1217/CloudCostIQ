# app/api/cost_analysis_extended.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
import pandas as pd
import io
from starlette.responses import StreamingResponse

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import User, CloudAccount, CostData
from app.services.cost_analysis import CostAnalysisService

router = APIRouter()

@router.get("/trend")
async def get_cost_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None,
    service: Optional[str] = None,
    tag: Optional[str] = None,
    days: int = Query(30, ge=1, le=365)
):
    """
    Get cost trend data for charting.
    Returns data formatted for time-series visualization.
    """
    # Verify account access
    if account_id:
        _verify_account_access(db, current_user, account_id)
    
    service_obj = CostAnalysisService(db)
    
    # Get start and end dates
    end_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    start_date = end_date - timedelta(days=days)
    
    # Get daily costs for trend analysis
    daily_costs = service_obj.get_daily_costs_by_date(
        start_date, 
        end_date, 
        account_id, 
        service, 
        tag
    )
    
    # Get daily costs for the previous period for comparison
    previous_start_date = start_date - timedelta(days=days)
    previous_end_date = end_date - timedelta(days=days)
    
    previous_daily_costs = service_obj.get_daily_costs_by_date(
        previous_start_date,
        previous_end_date,
        account_id,
        service,
        tag
    )
    
    # Format the response for Chart.js
    dates = [(start_date + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days)]
    
    # Create lookup dicts for faster access
    daily_cost_dict = {item.date.strftime("%Y-%m-%d"): item.total_cost for item in daily_costs}
    previous_cost_dict = {item.date.strftime("%Y-%m-%d"): item.total_cost for item in previous_daily_costs}
    
    # Align current and previous period costs for comparison
    current_costs = [daily_cost_dict.get(date, 0) for date in dates]
    
    # Shift previous period dates to align with current period
    previous_dates = [(previous_start_date + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days)]
    previous_costs = [previous_cost_dict.get(date, 0) for date in previous_dates]
    
    return {
        "labels": dates,
        "datasets": {
            "totalCost": current_costs,
            "previousPeriod": previous_costs
        }
    }

@router.get("/comparison")
async def get_cost_comparison(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None,
    service: Optional[str] = None,
    tag: Optional[str] = None,
    days: int = Query(30, ge=1, le=365)
):
    """
    Get cost comparison data (month-over-month, year-over-year).
    Returns data formatted for bar chart visualization.
    """
    # Verify account access
    if account_id:
        _verify_account_access(db, current_user, account_id)
    
    service_obj = CostAnalysisService(db)
    
    # Determine the comparison type based on the time range
    comparison_type = "month"
    if days <= 7:
        comparison_type = "day"
    elif days >= 300:
        comparison_type = "year"
    
    # Get data for current and previous periods
    end_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    start_date = end_date - timedelta(days=days)
    
    current_data = service_obj.get_grouped_costs(
        start_date,
        end_date,
        account_id,
        service,
        tag,
        comparison_type
    )
    
    # Previous period
    previous_start_date = start_date - timedelta(days=days)
    previous_end_date = end_date - timedelta(days=days)
    
    previous_data = service_obj.get_grouped_costs(
        previous_start_date,
        previous_end_date,
        account_id,
        service,
        tag,
        comparison_type
    )
    
    # Format the data for chart.js
    if comparison_type == "day":
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    elif comparison_type == "month":
        labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    else:  # year
        current_year = datetime.utcnow().year
        labels = [str(year) for year in range(current_year - 4, current_year + 1)]
    
    # Create lookup dicts
    current_dict = {item.group: item.total_cost for item in current_data}
    previous_dict = {item.group: item.total_cost for item in previous_data}
    
    # Prepare data for each label
    current_values = [current_dict.get(label, 0) for label in labels]
    previous_values = [previous_dict.get(label, 0) for label in labels]
    
    return {
        "labels": labels,
        "datasets": {
            "current": current_values,
            "previous": previous_values
        }
    }

@router.get("/breakdown")
async def get_cost_breakdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None,
    service: Optional[str] = None,
    tag: Optional[str] = None,
    days: int = Query(30, ge=1, le=365),
    group_by: str = Query("service", regex="^(service|account|region|tag)$")
):
    """
    Get cost breakdown data by the specified grouping.
    Returns data formatted for pie/doughnut chart visualization.
    """
    # Verify account access
    if account_id:
        _verify_account_access(db, current_user, account_id)
    
    service_obj = CostAnalysisService(db)
    
    # Get start and end dates
    end_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    start_date = end_date - timedelta(days=days)
    
    # Get previous period for comparison
    previous_start_date = start_date - timedelta(days=days)
    previous_end_date = end_date - timedelta(days=days)
    
    # Get breakdown data for current period
    breakdown_data = service_obj.get_cost_breakdown(
        start_date,
        end_date,
        account_id,
        service,
        tag,
        group_by
    )
    
    # Get breakdown data for previous period
    previous_breakdown_data = service_obj.get_cost_breakdown(
        previous_start_date,
        previous_end_date,
        account_id,
        service,
        tag,
        group_by
    )
    
    # Prepare data for visualization
    labels = [item.group for item in breakdown_data]
    values = [item.total_cost for item in breakdown_data]
    
    # Create dict for previous period data
    previous_dict = {item.group: item.total_cost for item in previous_breakdown_data}
    previous_values = [previous_dict.get(label, 0) for label in labels]
    
    return {
        "labels": labels,
        "values": values,
        "previousValues": previous_values
    }

@router.get("/daily")
async def get_daily_costs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None,
    service: Optional[str] = None,
    tag: Optional[str] = None,
    days: int = Query(30, ge=1, le=90)
):
    """
    Get detailed daily cost data.
    Returns data formatted for bar chart visualization.
    """
    # Verify account access
    if account_id:
        _verify_account_access(db, current_user, account_id)
    
    service_obj = CostAnalysisService(db)
    
    # Get start and end dates
    end_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    start_date = end_date - timedelta(days=days)
    
    # Get daily costs
    daily_costs = service_obj.get_daily_costs_by_date(
        start_date,
        end_date,
        account_id,
        service,
        tag
    )
    
    # Format for visualization
    dates = []
    costs = []
    
    for day_cost in daily_costs:
        dates.append(day_cost.date.strftime("%Y-%m-%d"))
        costs.append(day_cost.total_cost)
    
    return {
        "dates": dates,
        "costs": costs
    }

@router.get("/services")
async def get_available_services(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None
):
    """
    Get a list of all available services for filtering.
    """
    # Verify account access
    if account_id:
        _verify_account_access(db, current_user, account_id)
    
    service_obj = CostAnalysisService(db)
    services = service_obj.get_available_services(account_id)
    
    return services

@router.get("/tags")
async def get_available_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None
):
    """
    Get a list of all available tags and their values for filtering.
    """
    # Verify account access
    if account_id:
        _verify_account_access(db, current_user, account_id)
    
    service_obj = CostAnalysisService(db)
    tags = service_obj.get_available_tags(account_id)
    
    return tags

@router.get("/export")
async def export_cost_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None,
    service: Optional[str] = None,
    tag: Optional[str] = None,
    days: int = Query(30, ge=1, le=365)
):
    """
    Export cost data as CSV.
    """
    # Verify account access
    if account_id:
        _verify_account_access(db, current_user, account_id)
    
    service_obj = CostAnalysisService(db)
    
    # Get start and end dates
    end_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    start_date = end_date - timedelta(days=days)
    
    # Get detailed cost data
    cost_data = service_obj.get_detailed_costs(
        start_date,
        end_date,
        account_id,
        service,
        tag
    )
    
    # Convert to DataFrame for CSV export
    data_list = []
    for item in cost_data:
        data_dict = {
            "date": item.date.strftime("%Y-%m-%d"),
            "service": item.service,
            "resource_id": item.resource_id,
            "cost": item.cost
        }
        
        # Add account name if available
        if hasattr(item, 'cloud_account') and item.cloud_account:
            data_dict["account_name"] = item.cloud_account.name
            data_dict["provider"] = item.cloud_account.provider
        
        # Add tags if available
        if item.tags:
            for key, value in item.tags.items():
                data_dict[f"tag_{key}"] = value
        
        data_list.append(data_dict)
    
    # Create DataFrame and CSV
    df = pd.DataFrame(data_list)
    
    # Create in-memory CSV
    output = io.StringIO()
    df.to_csv(output, index=False)
    
    # Return CSV as download
    response = StreamingResponse(
        iter([output.getvalue()]), 
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = f"attachment; filename=cost_data_{start_date.strftime('%Y%m%d')}_to_{end_date.strftime('%Y%m%d')}.csv"
    
    return response

# Helper function to verify account access
def _verify_account_access(db: Session, current_user: User, account_id: int):
    """Verify the user has access to the specified cloud account."""
    account = db.query(CloudAccount).filter(
        CloudAccount.id == account_id
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Cloud account not found")
    
    if account.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Access denied to this cloud account")
    
    return account