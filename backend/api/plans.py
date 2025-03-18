from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from backend.database.db import get_db
from backend.auth.utils import get_current_user
from backend.models.plan import Plan
from backend.models.user import UserModel, SubscriptionModel
from backend.auth.middleware import require_feature, require_plan_level

router = APIRouter()

@router.get("/plans", response_model=List[dict])
async def get_plans():
    """Get all available plans"""
    return Plan.get_default_plans()

@router.get("/plans/current")
async def get_current_plan(current_user: UserModel = Depends(get_current_user)):
    """Get the current user's plan details"""
    if not current_user.subscription or not current_user.subscription.is_active:
        raise HTTPException(
            status_code=404,
            detail="No active subscription found"
        )
    
    plan = current_user.subscription.plan
    return {
        "plan_name": plan.name,
        "features": plan.features,
        "max_cloud_accounts": plan.max_cloud_accounts,
        "data_retention_days": plan.data_retention_days,
        "subscription": {
            "start_date": current_user.subscription.start_date,
            "end_date": current_user.subscription.end_date,
            "is_active": current_user.subscription.is_active,
            "auto_renew": current_user.subscription.auto_renew
        }
    }

@router.post("/plans/{plan_name}/subscribe")
async def subscribe_to_plan(
    plan_name: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Subscribe to a new plan"""
    # Get the plan
    plan = db.query(Plan).filter(Plan.name == plan_name).first()
    if not plan:
        raise HTTPException(
            status_code=404,
            detail=f"Plan {plan_name} not found"
        )
    
    # Check if user already has an active subscription
    if current_user.subscription and current_user.subscription.is_active:
        # Deactivate the current subscription
        current_user.subscription.is_active = False
        current_user.subscription.end_date = datetime.utcnow()
    
    # Create new subscription
    subscription = SubscriptionModel(
        user_id=current_user.id,
        plan_id=plan.id,
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=30),  # 30-day subscription
        is_active=True,
        auto_renew=True
    )
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    
    return {
        "message": f"Successfully subscribed to {plan_name} plan",
        "subscription": {
            "plan": plan_name,
            "start_date": subscription.start_date,
            "end_date": subscription.end_date,
            "is_active": subscription.is_active,
            "auto_renew": subscription.auto_renew
        }
    }

@router.post("/plans/cancel")
async def cancel_subscription(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Cancel the current subscription"""
    if not current_user.subscription or not current_user.subscription.is_active:
        raise HTTPException(
            status_code=404,
            detail="No active subscription found"
        )
    
    current_user.subscription.is_active = False
    current_user.subscription.end_date = datetime.utcnow()
    current_user.subscription.auto_renew = False
    
    db.commit()
    
    return {"message": "Subscription successfully cancelled"} 