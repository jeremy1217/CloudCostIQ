from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, Field

from backend.database.db import get_db
from backend.models.anomaly import CostAnomaly
from backend.ai.integration import detect_anomalies

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])

# Request and Response Models
class CloudContext(BaseModel):
    probable_causes: List[Dict[str, Any]] = []
    pattern_type: Optional[str] = None
    affected_resources: List[str] = []
    related_services: List[Dict[str, Any]] = []
    mitigation_suggestions: List[str] = []

class RootCause(BaseModel):
    primary_cause: str
    potential_causes: List[str] = []
    confidence: Optional[str] = None

class AnomalyCreate(BaseModel):
    provider: str
    service: str
    resource_id: Optional[str] = None
    date: str
    cost: float
    baseline_cost: Optional[float] = None
    deviation: Optional[float] = None
    anomaly_score: Optional[float] = None
    detection_method: Optional[str] = None
    root_cause: Optional[Dict[str, Any]] = None
    cloud_context: Optional[Dict[str, Any]] = None

class AnomalyUpdate(BaseModel):
    status: Optional[str] = None
    resolution: Optional[str] = None
    root_cause: Optional[Dict[str, Any]] = None
    cloud_context: Optional[Dict[str, Any]] = None

class AnomalyResponse(BaseModel):
    id: int
    provider: str
    service: str
    resource_id: Optional[str] = None
    date: str
    cost: float
    baseline_cost: Optional[float] = None
    deviation: Optional[float] = None
    anomaly_score: Optional[float] = None
    detection_method: Optional[str] = None
    status: str
    resolution: Optional[str] = None
    root_cause: Optional[Dict[str, Any]] = None
    cloud_context: Optional[Dict[str, Any]] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[AnomalyResponse])
async def get_anomalies(
    provider: Optional[str] = None,
    service: Optional[str] = None,
    status: Optional[str] = None,
    days: int = Query(30, ge=1, le=365),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get anomalies with optional filtering.
    """
    query = db.query(CostAnomaly)
    
    # Apply filters
    if provider:
        query = query.filter(CostAnomaly.provider == provider)
    if service:
        query = query.filter(CostAnomaly.service == service)
    if status:
        query = query.filter(CostAnomaly.status == status)
        
    # Filter by date range
    if days:
        date_threshold = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        query = query.filter(CostAnomaly.date >= date_threshold)
    
    # Apply pagination
    total = query.count()
    anomalies = query.order_by(CostAnomaly.date.desc()).offset(skip).limit(limit).all()
    
    return anomalies

@router.get("/{anomaly_id}", response_model=AnomalyResponse)
async def get_anomaly(
    anomaly_id: int = Path(..., ge=1),
    db: Session = Depends(get_db)
):
    """
    Get a specific anomaly by ID.
    """
    anomaly = db.query(CostAnomaly).filter(CostAnomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Anomaly with ID {anomaly_id} not found"
        )
    return anomaly

@router.post("/", response_model=AnomalyResponse, status_code=status.HTTP_201_CREATED)
async def create_anomaly(
    anomaly: AnomalyCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new anomaly record.
    """
    db_anomaly = CostAnomaly(
        provider=anomaly.provider,
        service=anomaly.service,
        resource_id=anomaly.resource_id,
        date=anomaly.date,
        cost=anomaly.cost,
        baseline_cost=anomaly.baseline_cost,
        deviation=anomaly.deviation,
        anomaly_score=anomaly.anomaly_score,
        detection_method=anomaly.detection_method,
        status="open",
        root_cause=anomaly.root_cause,
        cloud_context=anomaly.cloud_context
    )
    
    db.add(db_anomaly)
    db.commit()
    db.refresh(db_anomaly)
    return db_anomaly

@router.put("/{anomaly_id}", response_model=AnomalyResponse)
async def update_anomaly(
    anomaly_id: int = Path(..., ge=1),
    anomaly_update: AnomalyUpdate = ...,
    db: Session = Depends(get_db)
):
    """
    Update an existing anomaly.
    """
    db_anomaly = db.query(CostAnomaly).filter(CostAnomaly.id == anomaly_id).first()
    if not db_anomaly:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Anomaly with ID {anomaly_id} not found"
        )
    
    # Update the fields if they are provided
    if anomaly_update.status is not None:
        db_anomaly.status = anomaly_update.status
    if anomaly_update.resolution is not None:
        db_anomaly.resolution = anomaly_update.resolution
    if anomaly_update.root_cause is not None:
        db_anomaly.root_cause = anomaly_update.root_cause
    if anomaly_update.cloud_context is not None:
        db_anomaly.cloud_context = anomaly_update.cloud_context
    
    # Update the updated_at timestamp
    db_anomaly.updated_at = datetime.now()
    
    db.commit()
    db.refresh(db_anomaly)
    return db_anomaly

@router.delete("/{anomaly_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_anomaly(
    anomaly_id: int = Path(..., ge=1),
    db: Session = Depends(get_db)
):
    """
    Delete an anomaly.
    """
    db_anomaly = db.query(CostAnomaly).filter(CostAnomaly.id == anomaly_id).first()
    if not db_anomaly:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Anomaly with ID {anomaly_id} not found"
        )
    
    db.delete(db_anomaly)
    db.commit()
    return None

@router.post("/detect", response_model=Dict[str, Any])
async def detect_and_store_anomalies(
    service: Optional[str] = None,
    days: int = Query(30, ge=1, le=90),
    threshold: float = Query(2.0, ge=0.5, le=10.0),
    method: str = Query("ensemble", regex="^(zscore|isolation_forest|dbscan|seasonal_decompose|ensemble)$"),
    analyze_root_cause: bool = True,
    analyze_cloud_context: bool = True,
    store_results: bool = True,
    db: Session = Depends(get_db)
):
    """
    Detect anomalies and optionally store them in the database.
    """
    from backend.services.mock_data import generate_mock_costs
    from backend.models.cloud_cost import CloudCost
    
    # Get cost data from database
    query = db.query(CloudCost)
    
    # Apply filters
    if service:
        query = query.filter(CloudCost.service == service)
        
    # Filter by date range
    if days:
        date_threshold = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        query = query.filter(CloudCost.date >= date_threshold)
    
    # Convert to list of dictionaries
    cost_data = [
        {
            "date": cost.date,
            "cost": cost.cost,
            "service": cost.service,
            "provider": cost.provider,
            "resource_id": cost.resource_id
        }
        for cost in query.all()
    ]
    
    # Fall back to mock data if no database results
    if not cost_data:
        cost_data = generate_mock_costs(days=days)
    
    # Detect anomalies using the integration
    anomaly_results = detect_anomalies(
        cost_data=cost_data,
        method=method,
        threshold=threshold,
        analyze_root_cause=analyze_root_cause,
        analyze_cloud_context=analyze_cloud_context
    )
    
    # Store detected anomalies if requested
    if store_results and anomaly_results.get("anomalies"):
        stored_anomalies = []
        for anomaly in anomaly_results["anomalies"]:
            # Check if this anomaly already exists
            existing = db.query(CostAnomaly).filter(
                CostAnomaly.provider == anomaly.get("provider"),
                CostAnomaly.service == anomaly.get("service"),
                CostAnomaly.date == anomaly.get("date")
            ).first()
            
            if not existing:
                # Create new anomaly record
                db_anomaly = CostAnomaly(
                    provider=anomaly.get("provider"),
                    service=anomaly.get("service"),
                    resource_id=anomaly.get("resource_id"),
                    date=anomaly.get("date"),
                    cost=anomaly.get("cost"),
                    baseline_cost=anomaly.get("baseline_cost"),
                    deviation=anomaly.get("deviation") or (
                        ((anomaly.get("cost") - anomaly.get("baseline_cost")) / anomaly.get("baseline_cost") * 100)
                        if anomaly.get("baseline_cost") and anomaly.get("baseline_cost") > 0 else None
                    ),
                    anomaly_score=anomaly.get("anomaly_score"),
                    detection_method=anomaly.get("detection_method") or method, 
                    status="open", 
                    root_cause=anomaly.get("root_cause"), 
                    cloud_context=anomaly.get("cloud_context")
                )
                
                db.add(db_anomaly)
                stored_anomalies.append(db_anomaly)
        
        # Commit new anomalies to the database
        if stored_anomalies:
            db.commit()
            
            # Add IDs to the response
            for i, anomaly in enumerate(anomaly_results["anomalies"]):
                if i < len(stored_anomalies):
                    anomaly["id"] = stored_anomalies[i].id
            
            # Add storage info to the response
            anomaly_results["stored_anomalies_count"] = len(stored_anomalies)
    
    return anomaly_results