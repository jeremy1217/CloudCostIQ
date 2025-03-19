from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime

from backend.database.db import get_db
from backend.auth.utils import get_current_user
from backend.auth.middleware import require_admin
from backend.services.feature_tracking import FeatureTrackingService
from backend.config.feature_config import FEATURE_METADATA, PlanFeatures
from backend.models.models import UserModel, FeatureConfig, AuditLog
from backend.schemas.user import UserResponse

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/features")
@require_admin
async def list_features(
    request: Request,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all features and their current status"""
    features = []
    
    # Combine features from all plan levels
    all_features = set()
    for plan in [PlanFeatures.STANDARD, PlanFeatures.PROFESSIONAL, PlanFeatures.ENTERPRISE]:
        all_features.update(plan.keys())
    
    for feature in all_features:
        if feature.endswith('_limit'):  # Skip limit configurations
            continue
            
        feature_data = {
            "name": feature,
            "description": FEATURE_METADATA.get(feature, {}).get("description", ""),
            "enabled": True,  # Default to enabled
            "requirements": FEATURE_METADATA.get(feature, {}).get("requirements", []),
            "plans": {
                "standard": feature in PlanFeatures.STANDARD,
                "professional": feature in PlanFeatures.PROFESSIONAL,
                "enterprise": feature in PlanFeatures.ENTERPRISE
            }
        }
        features.append(feature_data)
    
    return features

@router.get("/features/{feature}/usage")
@require_admin
async def get_feature_usage(
    feature: str,
    request: Request,
    days: int = 30,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get usage statistics for a feature"""
    tracking_service = FeatureTrackingService(request.app.state.redis)
    
    # Get usage for all users
    all_users = db.query(User).all()
    total_stats = {
        "total_usage": 0,
        "daily_average": 0,
        "peak_usage": 0,
        "peak_day": None,
        "usage_by_plan": {
            "standard": 0,
            "professional": 0,
            "enterprise": 0
        },
        "daily_usage": []
    }
    
    for user in all_users:
        stats = await tracking_service.get_feature_usage_stats(
            user_id=str(user.id),
            feature=feature,
            days=days
        )
        
        total_stats["total_usage"] += stats["total_usage"]
        if stats["peak_usage"] > total_stats["peak_usage"]:
            total_stats["peak_usage"] = stats["peak_usage"]
            total_stats["peak_day"] = stats["peak_day"]
            
        # Track usage by plan
        if user.subscription:
            plan = user.subscription.plan.name.lower()
            total_stats["usage_by_plan"][plan] = total_stats["usage_by_plan"].get(plan, 0) + stats["total_usage"]
    
    if days > 0:
        total_stats["daily_average"] = total_stats["total_usage"] / days
    
    return total_stats

@router.post("/features/{feature}/toggle")
@require_admin
async def toggle_feature(
    feature: str,
    enabled: bool,
    request: Request,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enable or disable a feature"""
    if feature not in FEATURE_METADATA:
        raise HTTPException(status_code=404, detail="Feature not found")
        
    # Update feature status in database
    feature_config = db.query(FeatureConfig).filter_by(name=feature).first()
    if not feature_config:
        feature_config = FeatureConfig(name=feature)
        db.add(feature_config)
    
    feature_config.enabled = enabled
    feature_config.updated_by = current_user.id
    feature_config.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"status": "success", "enabled": enabled}

@router.post("/features/{feature}/limit")
@require_admin
async def update_feature_limit(
    feature: str,
    limit: int,
    request: Request,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update usage limit for a feature"""
    if feature not in FEATURE_METADATA:
        raise HTTPException(status_code=404, detail="Feature not found")
        
    # Update feature limit in database
    feature_config = db.query(FeatureConfig).filter_by(name=feature).first()
    if not feature_config:
        feature_config = FeatureConfig(name=feature)
        db.add(feature_config)
    
    feature_config.usage_limit = limit
    feature_config.updated_by = current_user.id
    feature_config.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"status": "success", "limit": limit}

@router.get("/audit-log")
@require_admin
async def get_audit_log(
    request: Request,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get audit log of feature management actions"""
    audit_logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
    return audit_logs 