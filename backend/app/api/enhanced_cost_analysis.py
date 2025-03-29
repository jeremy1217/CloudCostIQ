# app/api/enhanced_cost_analysis.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import User, CloudAccount
from app.services.enhanced_anomaly_detection import EnhancedAnomalyDetection
from app.services.enhanced_recommendations import EnhancedRecommendations
from app.schemas.cost import (
    CostAnomaly, RecommendationSummary, IdleResource, 
    RightsizingRecommendation, ReservedInstanceRecommendation
)
from app.schemas.enhanced_cost import (
    StorageOptimizationRecommendation, NetworkOptimizationRecommendation,
    EnhancedCostAnomaly, ContextualAnomaly, EnhancedRecommendationSummary
)

router = APIRouter()

@router.get("/anomalies/enhanced", response_model=List[CostAnomaly])
async def get_enhanced_anomalies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None,
    days: int = Query(30, ge=1, le=90),
    sensitivity: float = Query(2.0, ge=1.0, le=5.0),
    methods: Optional[str] = Query(None, description="Comma-separated list of detection methods to use")
):
    """
    Detect cost anomalies using enhanced algorithms.
    Available methods: z_score, isolation_forest, time_series
    """
    # Check account access
    if account_id:
        _verify_account_access(db, current_user, account_id)
    
    # Parse methods if provided
    detection_methods = None
    if methods:
        detection_methods = [m.strip() for m in methods.split(",")]
    
    # Initialize enhanced anomaly detection service
    service = EnhancedAnomalyDetection(db)
    
    # Detect anomalies with specified methods
    anomalies = service.detect_anomalies(
        account_id=account_id,
        days=days,
        sensitivity=sensitivity,
        detection_methods=detection_methods
    )
    
    return anomalies

@router.get("/anomalies/contextual", response_model=List[Dict[str, Any]])
async def get_contextual_anomalies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None,
    days: int = Query(30, ge=1, le=90)
):
    """
    Detect contextual anomalies like unusual weekend patterns or end-of-month spikes.
    """
    # Check account access
    if account_id:
        _verify_account_access(db, current_user, account_id)
    
    # Initialize enhanced anomaly detection service
    service = EnhancedAnomalyDetection(db)
    
    # Get contextual anomalies
    anomalies = service.get_contextual_anomalies(account_id, days)
    
    return anomalies

@router.get("/recommendations/enhanced", response_model=RecommendationSummary)
async def get_enhanced_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None
):
    """
    Get all recommendation types from the enhanced recommendation engine.
    """
    # Check account access
    if account_id:
        _verify_account_access(db, current_user, account_id)
    
    # Initialize enhanced recommendations service
    service = EnhancedRecommendations(db)
    
    # Get all recommendations
    recommendations = service.get_all_recommendations(account_id)
    
    return recommendations

@router.get("/recommendations/storage", response_model=List[StorageOptimizationRecommendation])
async def get_storage_optimization_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None,
    days: int = Query(30, ge=1, le=90)
):
    """
    Get storage optimization recommendations like storage tier changes and disk size adjustments.
    """
    # Check account access
    if account_id:
        _verify_account_access(db, current_user, account_id)
    
    # Initialize enhanced recommendations service
    service = EnhancedRecommendations(db)
    
    # Get storage optimization recommendations
    recommendations = service.get_storage_optimization_recommendations(account_id, days)
    
    return recommendations

@router.get("/recommendations/network", response_model=List[NetworkOptimizationRecommendation])
async def get_network_optimization_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None,
    days: int = Query(30, ge=1, le=90)
):
    """
    Get network optimization recommendations for reducing data transfer costs.
    """
    # Check account access
    if account_id:
        _verify_account_access(db, current_user, account_id)
    
    # Initialize enhanced recommendations service
    service = EnhancedRecommendations(db)
    
    # Get network optimization recommendations
    recommendations = service.get_network_optimization_recommendations(account_id, days)
    
    return recommendations

@router.get("/top-recommendations", response_model=List[Dict[str, Any]])
async def get_top_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None,
    limit: int = Query(10, ge=1, le=50)
):
    """
    Get prioritized top recommendations across all categories.
    """
    # Check account access
    if account_id:
        _verify_account_access(db, current_user, account_id)
    
    # Initialize enhanced recommendations service
    service = EnhancedRecommendations(db)
    
    # Get all recommendations
    all_recommendations = service.get_all_recommendations(account_id)
    
    # Return the top recommendations
    return all_recommendations.get('top_recommendations', [])[:limit]

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