from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, Field

from backend.database.db import get_db
from backend.models.forecast import CostForecast
from backend.ai.integration import predict_costs

router = APIRouter(prefix="/forecasts", tags=["Forecasts"])

# Request and Response Models
class ForecastCreate(BaseModel):
    provider: Optional[str] = None
    service: Optional[str] = None
    target_date: str
    predicted_cost: float
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    confidence: Optional[str] = None
    algorithm: Optional[str] = None
    data_points_used: Optional[int] = None

class ForecastResponse(BaseModel):
    id: int
    provider: Optional[str] = None
    service: Optional[str] = None
    target_date: str
    predicted_cost: float
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    confidence: Optional[str] = None
    algorithm: Optional[str] = None
    data_points_used: Optional[int] = None
    created_at: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ForecastResponse])
async def get_forecasts(
    provider: Optional[str] = None,
    service: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get forecasts with optional filtering.
    """
    query = db.query(CostForecast)
    
    # Apply filters
    if provider:
        query = query.filter(CostForecast.provider == provider)
    if service:
        query = query.filter(CostForecast.service == service)
    if start_date:
        query = query.filter(CostForecast.target_date >= start_date)
    if end_date:
        query = query.filter(CostForecast.target_date <= end_date)
    
    # Apply pagination
    total = query.count()
    forecasts = query.order_by(CostForecast.target_date.asc()).offset(skip).limit(limit).all()
    
    return forecasts

@router.get("/{forecast_id}", response_model=ForecastResponse)
async def get_forecast(
    forecast_id: int = Path(..., ge=1),
    db: Session = Depends(get_db)
):
    """
    Get a specific forecast by ID.
    """
    forecast = db.query(CostForecast).filter(CostForecast.id == forecast_id).first()
    if not forecast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Forecast with ID {forecast_id} not found"
        )
    return forecast

@router.post("/", response_model=ForecastResponse, status_code=status.HTTP_201_CREATED)
async def create_forecast(
    forecast: ForecastCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new forecast record.
    """
    db_forecast = CostForecast(
        provider=forecast.provider,
        service=forecast.service,
        target_date=forecast.target_date,
        predicted_cost=forecast.predicted_cost,
        lower_bound=forecast.lower_bound,
        upper_bound=forecast.upper_bound,
        confidence=forecast.confidence,
        algorithm=forecast.algorithm,
        data_points_used=forecast.data_points_used
    )
    
    db.add(db_forecast)
    db.commit()
    db.refresh(db_forecast)
    return db_forecast

@router.delete("/{forecast_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_forecast(
    forecast_id: int = Path(..., ge=1),
    db: Session = Depends(get_db)
):
    """
    Delete a forecast.
    """
    db_forecast = db.query(CostForecast).filter(CostForecast.id == forecast_id).first()
    if not db_forecast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Forecast with ID {forecast_id} not found"
        )
    
    db.delete(db_forecast)
    db.commit()
    return None

@router.post("/generate", response_model=Dict[str, Any])
async def generate_and_store_forecasts(
    service: Optional[str] = None,
    days_ahead: int = Query(14, ge=1, le=365),
    algorithm: str = Query("auto", regex="^(linear|arima|exp_smoothing|random_forest|prophet|auto)$"),
    store_results: bool = True,
    db: Session = Depends(get_db)
):
    """
    Generate forecasts and optionally store them in the database.
    """
    from backend.services.mock_data import generate_mock_costs
    from backend.models.cloud_cost import CloudCost
    
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
            "service": cost.service,
            "provider": cost.provider
        }
        for cost in query.all()
    ]
    
    # Fall back to mock data if no database results
    if not cost_trend:
        cost_trend = generate_mock_costs(days=30)
        
    # Generate forecast using the integration
    forecast_result = predict_costs(
        cost_data=cost_trend, 
        days_ahead=days_ahead,
        algorithm=algorithm
    )
    
    # Store forecasts if requested
    if store_results and forecast_result.get("forecast"):
        stored_forecasts = []
        
        # Get the service and provider from the data
        service_value = service
        provider_value = None
        
        if not service_value and cost_trend:
            # Try to get service from the cost data
            service_counts = {}
            provider_counts = {}
            
            for cost in cost_trend:
                service_name = cost.get("service")
                if service_name:
                    service_counts[service_name] = service_counts.get(service_name, 0) + 1
                
                provider_name = cost.get("provider")
                if provider_name:
                    provider_counts[provider_name] = provider_counts.get(provider_name, 0) + 1
            
            # Use the most common service/provider
            if service_counts:
                service_value = max(service_counts.items(), key=lambda x: x[1])[0]
            
            if provider_counts:
                provider_value = max(provider_counts.items(), key=lambda x: x[1])[0]
        
        for forecast_item in forecast_result["forecast"]:
            # Check if this forecast already exists
            existing = db.query(CostForecast).filter(
                CostForecast.target_date == forecast_item.get("date"),
                CostForecast.service == service_value
            ).first()
            
            if not existing:
                # Create new forecast record
                db_forecast = CostForecast(
                    provider=provider_value,
                    service=service_value,
                    target_date=forecast_item.get("date"),
                    predicted_cost=forecast_item.get("predicted_cost"),
                    lower_bound=forecast_item.get("lower_bound"),
                    upper_bound=forecast_item.get("upper_bound"),
                    confidence=forecast_result.get("algorithm_name", "medium"),
                    algorithm=forecast_result.get("algorithm_used"),
                    data_points_used=forecast_result.get("data_points_used")
                )
                
                db.add(db_forecast)
                stored_forecasts.append(db_forecast)
        
        # Commit new forecasts to the database
        if stored_forecasts:
            db.commit()
            
            # Add storage info to the response
            forecast_result["stored_forecasts_count"] = len(stored_forecasts)
    
    return forecast_result