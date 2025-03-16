from functools import wraps
from fastapi import HTTPException, Depends, Request
from backend.auth.dependencies import get_current_user
from backend.api.feature_restrictions import FEATURE_REQUIREMENTS, PlanLevel, get_feature_level
from typing import List, Union

def require_feature(feature_name: str):
    """Decorator to check if the user's plan includes a specific feature"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user=Depends(get_current_user), **kwargs):
            if not current_user.can_access_feature(feature_name):
                raise HTTPException(
                    status_code=403,
                    detail=f"Your current plan does not include access to this feature. Please upgrade your plan."
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

def require_plan_level(min_plan_level: str):
    """Decorator to check if the user's plan meets the minimum required level"""
    PLAN_LEVELS = {
        "standard": 1,
        "professional": 2,
        "enterprise": 3
    }
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user=Depends(get_current_user), **kwargs):
            if not current_user.subscription or not current_user.subscription.is_active:
                raise HTTPException(
                    status_code=403,
                    detail="Active subscription required to access this feature."
                )
            
            required_level = PLAN_LEVELS.get(min_plan_level.lower(), 0)
            user_plan_level = PLAN_LEVELS.get(current_user.subscription.plan.name.lower(), 0)
            
            if user_plan_level < required_level:
                raise HTTPException(
                    status_code=403,
                    detail=f"This feature requires {min_plan_level} plan or higher. Please upgrade your plan."
                )
            
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

def check_cloud_accounts_limit(current_user):
    """Check if the user has reached their cloud accounts limit"""
    current_count = len(current_user.api_keys)
    max_allowed = current_user.get_cloud_accounts_limit()
    
    if max_allowed != -1 and current_count >= max_allowed:  # -1 means unlimited
        raise HTTPException(
            status_code=403,
            detail=f"You have reached the maximum number of cloud accounts ({max_allowed}) allowed for your plan. Please upgrade to add more accounts."
        )

def check_data_retention_access(days: int, current_user):
    """Check if the user's plan allows access to data of a certain age"""
    retention_days = current_user.get_data_retention_days()
    if retention_days != -1 and days > retention_days:  # -1 means unlimited
        raise HTTPException(
            status_code=403,
            detail=f"Your plan only allows access to data from the last {retention_days} days. Please upgrade to access older data."
        )

def check_feature_access(request: Request, current_user):
    """Check if the user has access to the requested endpoint based on their plan"""
    path = request.url.path
    
    # Check if endpoint has feature requirements
    if path in FEATURE_REQUIREMENTS:
        requirements = FEATURE_REQUIREMENTS[path]
        
        # Check minimum plan level
        user_plan = current_user.subscription.plan.name.lower()
        required_plan = requirements["min_plan"].value
        
        plan_levels = {
            "standard": 1,
            "professional": 2,
            "enterprise": 3
        }
        
        if plan_levels[user_plan] < plan_levels[required_plan]:
            raise HTTPException(
                status_code=403,
                detail=f"This feature requires {required_plan} plan or higher"
            )
        
        # Check required features
        user_features = current_user.get_plan_features()
        for feature in requirements["required_features"]:
            if not user_features.get(feature):
                raise HTTPException(
                    status_code=403,
                    detail=f"Your plan does not include access to {feature}"
                )
            
            # Check feature level if applicable
            feature_level = get_feature_level(feature, PlanLevel(user_plan))
            if feature_level == "readonly" and request.method not in ["GET", "HEAD"]:
                raise HTTPException(
                    status_code=403,
                    detail=f"Your plan only includes read-only access to {feature}"
                )

def restrict_endpoint(func):
    """Decorator to restrict endpoint access based on plan and features"""
    @wraps(func)
    async def wrapper(request: Request, current_user=Depends(get_current_user), *args, **kwargs):
        check_feature_access(request, current_user)
        return await func(request=request, current_user=current_user, *args, **kwargs)
    return wrapper

def check_api_limits(current_user):
    """Check API rate limits based on plan level"""
    plan_limits = {
        "standard": {"daily": 1000, "rate": 10},  # 10 requests per second, 1000 per day
        "professional": {"daily": 10000, "rate": 50},  # 50 requests per second, 10000 per day
        "enterprise": {"daily": -1, "rate": 100}  # 100 requests per second, unlimited daily
    }
    
    user_plan = current_user.subscription.plan.name.lower()
    return plan_limits.get(user_plan, plan_limits["standard"])

def check_data_access(days: int, current_user):
    """Check if user can access data for the specified time range"""
    retention_limits = {
        "standard": 30,
        "professional": 90,
        "enterprise": -1  # Unlimited
    }
    
    user_plan = current_user.subscription.plan.name.lower()
    limit = retention_limits.get(user_plan, 30)
    
    if limit != -1 and days > limit:
        raise HTTPException(
            status_code=403,
            detail=f"Your plan only allows access to {limit} days of historical data"
        )

def check_export_access(format: str, current_user):
    """Check if user can export data in the specified format"""
    export_formats = {
        "standard": ["csv"],
        "professional": ["csv", "excel", "pdf"],
        "enterprise": ["csv", "excel", "pdf", "custom"]
    }
    
    user_plan = current_user.subscription.plan.name.lower()
    allowed_formats = export_formats.get(user_plan, ["csv"])
    
    if format.lower() not in allowed_formats:
        raise HTTPException(
            status_code=403,
            detail=f"Your plan does not support export to {format} format"
        ) 