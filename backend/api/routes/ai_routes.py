# Standard library imports
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

# Third-party imports
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Local imports
from backend.ai.integration import predict_costs, detect_anomalies, optimize_costs, get_ai_status, enable_enhanced_ai
from backend.database.db import get_db
from backend.models.cloud_cost import CloudCost
from backend.services.mock_data import generate_mock_costs

# Import the enhanced AI capabilities integration

router = APIRouter(prefix="/ai", tags=["AI Capabilities"])

# Models for request validation
class ForecastRequest(BaseModel):
    service: Optional[str] = None
    days_ahead: Optional[int] = 7
    algorithm: Optional[str] = "auto"

class AnomalyRequest(BaseModel):
    service: Optional[str] = None
    threshold: Optional[float] = 2.0
    method: Optional[str] = "ensemble"
    analyze_root_cause: Optional[bool] = True
    days: Optional[int] = 30

class OptimizationRequest(BaseModel):
    targeted_services: Optional[List[str]] = None
    include_utilization_data: Optional[bool] = True

class AIConfigRequest(BaseModel):
    enable_enhanced_ai: bool = True

@router.get("/status")
async def ai_status():
    """Get current AI capabilities status"""
    return get_ai_status()

@router.post("/config")
async def configure_ai(config: AIConfigRequest):
    """Configure AI capabilities"""
    enable_enhanced_ai(config.enable_enhanced_ai)
    return {"message": f"Enhanced AI capabilities {'enabled' if config.enable_enhanced_ai else 'disabled'}", "status": get_ai_status()}

@router.post("/forecast")
async def generate_forecast(request: ForecastRequest, db: Session = Depends(get_db)):
    """Generate enhanced cost forecasts"""
    try:
        # Get cost data from database
        query = db.query(CloudCost)
        
        # Apply filters
        if request.service:
            query = query.filter(CloudCost.service == request.service)
            
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
            
        # Generate forecast using enhanced capabilities
        forecast_result = predict_costs(
            cost_trend, 
            days_ahead=request.days_ahead,
            algorithm=request.algorithm
        )
        
        # Add request parameters to response
        forecast_result["request"] = {
            "service": request.service,
            "days_ahead": request.days_ahead,
            "algorithm": request.algorithm
        }
        
        return forecast_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating forecast: {str(e)}")

@router.post("/anomalies")
async def detect_cost_anomalies(request: AnomalyRequest, db: Session = Depends(get_db)):
    """Detect anomalies using enhanced algorithms"""
    try:
        # Get cost data from database
        query = db.query(CloudCost)
        
        # Apply filters
        if request.service:
            query = query.filter(CloudCost.service == request.service)
            
        # Filter by date range
        start_date = (datetime.now() - timedelta(days=request.days)).strftime("%Y-%m-%d")
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
            cost_data = generate_mock_costs(days=request.days)
            
        # Detect anomalies using enhanced capabilities
        anomaly_result = detect_anomalies(
            cost_data,
            method=request.method,
            threshold=request.threshold,
            analyze_root_cause=request.analyze_root_cause
        )
        
        # Add request parameters to response
        anomaly_result["request"] = {
            "service": request.service,
            "days": request.days,
            "threshold": request.threshold,
            "method": request.method
        }
        
        return anomaly_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting anomalies: {str(e)}")

@router.post("/optimize")
async def generate_optimizations(request: OptimizationRequest, db: Session = Depends(get_db)):
    """Generate cost optimization recommendations"""
    try:
        # Get cost data from database
        query = db.query(CloudCost)
        
        # Convert to list of dictionaries
        cost_data = [
            {
                "date": cost.date,
                "cost": cost.cost,
                "service": cost.service,
                "provider": cost.provider,
                "resource_id": f"{cost.service.lower()}-{cost.id}"  # Generate mock resource IDs
            }
            for cost in query.all()
        ]
        
        # Fall back to mock data if no database results
        if not cost_data:
            cost_data = generate_mock_costs(days=30)
            # Add resource IDs to mock data
            for i, item in enumerate(cost_data):
                item["resource_id"] = f"{item['service'].lower()}-{i+1000}"
        
        # Generate utilization data (mock data)
        utilization_data = None
        if request.include_utilization_data:
            utilization_data = []
            for item in cost_data:
                # Create mock utilization metrics for each resource
                import random
                utilization_data.append({
                    "resource_id": item["resource_id"],
                    "cpu_utilization": random.uniform(0.05, 0.8),
                    "memory_utilization": random.uniform(0.1, 0.75),
                    "idle_time_percent": random.uniform(0, 0.3),
                    "attached": random.random() > 0.1  # 10% chance of being unattached
                })
        
        # Generate optimization recommendations using enhanced capabilities
        optimization_result = optimize_costs(
            cost_data,
            utilization_data=utilization_data,
            targeted_services=request.targeted_services
        )
        
        # Add request parameters to response
        optimization_result["request"] = {
            "targeted_services": request.targeted_services,
            "include_utilization_data": request.include_utilization_data
        }
        
        return optimization_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating optimizations: {str(e)}")

@router.get("/combined-insights")
async def get_combined_insights(
    days: int = Query(30, description="Number of days of historical data"),
    forecast_days: int = Query(14, description="Number of days to forecast"),
    db: Session = Depends(get_db)
):
    """
    Get combined AI insights with forecasting, anomalies, and optimization recommendations
    """
    try:
        # Get cost data from database
        query = db.query(CloudCost)
        
        # Filter by date range
        start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        query = query.filter(CloudCost.date >= start_date)
        
        # Convert to list of dictionaries
        cost_data = [
            {
                "date": cost.date,
                "cost": cost.cost,
                "service": cost.service,
                "provider": cost.provider,
                "resource_id": f"{cost.service.lower()}-{cost.id}"
            }
            for cost in query.all()
        ]
        
        # Fall back to mock data if no database results
        if not cost_data:
            cost_data = generate_mock_costs(days=days)
            # Add resource IDs to mock data
            for i, item in enumerate(cost_data):
                item["resource_id"] = f"{item['service'].lower()}-{i+1000}"
        
        # Generate all insights in parallel
        # In a production environment, you might want to use async/await or threading
        forecast_result = predict_costs(cost_data, days_ahead=forecast_days)
        anomaly_result = detect_anomalies(cost_data)
        optimization_result = optimize_costs(cost_data)
        
        # Combine results
        combined_result = {
            "forecast": forecast_result.get("forecast", []),
            "anomalies": anomaly_result.get("anomalies", []),
            "optimizations": optimization_result.get("recommendations", []),
            "summary": {
                "total_cost": sum(item["cost"] for item in cost_data),
                "anomaly_count": len(anomaly_result.get("anomalies", [])),
                "forecast_total": sum(item["predicted_cost"] for item in forecast_result.get("forecast", []) if "predicted_cost" in item and item["predicted_cost"] is not None),
                "potential_savings": optimization_result.get("potential_savings", 0),
                "days_analyzed": days,
                "days_forecasted": forecast_days
            },
            "ai_metadata": {
                "forecast_algorithm": forecast_result.get("algorithm_used", "unknown"),
                "anomaly_method": anomaly_result.get("detection_method", "unknown"),
                "optimization_categories": len(set(rec.get("category", "") for rec in optimization_result.get("recommendations", [])))
            }
        }
        
        return combined_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating combined insights: {str(e)}")