from datetime import datetime, timedelta
from typing import Dict, Optional
from fastapi import HTTPException
from redis import Redis
from backend.config.feature_config import PlanFeatures

class FeatureTrackingService:
    def __init__(self, redis_client: Redis):
        self.redis = redis_client
        self.cache_ttl = 24 * 60 * 60  # 24 hours in seconds

    def _get_usage_key(self, user_id: str, feature: str) -> str:
        """Generate Redis key for feature usage"""
        today = datetime.now().strftime('%Y-%m-%d')
        return f"feature_usage:{user_id}:{feature}:{today}"

    def _get_rate_limit_key(self, user_id: str, feature: str) -> str:
        """Generate Redis key for rate limiting"""
        minute = datetime.now().strftime('%Y-%m-%d-%H-%M')
        return f"rate_limit:{user_id}:{feature}:{minute}"

    async def track_feature_usage(
        self,
        user_id: str,
        feature: str,
        plan_name: str,
        quantity: int = 1
    ) -> Dict:
        """Track feature usage and check against limits"""
        # Get plan limits
        plan_features = getattr(PlanFeatures, plan_name.upper(), PlanFeatures.STANDARD)
        
        # Check if feature has a limit
        feature_limit = plan_features.get(f"{feature}_limit")
        if not feature_limit:
            return {"success": True, "current_usage": 0, "limit": None}

        # Track daily usage
        usage_key = self._get_usage_key(user_id, feature)
        current_usage = int(self.redis.get(usage_key) or 0)
        new_usage = current_usage + quantity

        # Check against limit
        if feature_limit != -1 and new_usage > feature_limit:
            raise HTTPException(
                status_code=429,
                detail=f"Daily usage limit ({feature_limit}) exceeded for {feature}"
            )

        # Update usage
        self.redis.set(usage_key, new_usage, ex=self.cache_ttl)
        
        return {
            "success": True,
            "current_usage": new_usage,
            "limit": feature_limit
        }

    async def check_rate_limit(
        self,
        user_id: str,
        feature: str,
        plan_name: str
    ) -> bool:
        """Check API rate limits"""
        plan_features = getattr(PlanFeatures, plan_name.upper(), PlanFeatures.STANDARD)
        rate_limit = plan_features.get("api_rate_limit", 1000)

        if rate_limit == -1:  # Unlimited
            return True

        rate_key = self._get_rate_limit_key(user_id, feature)
        current_rate = int(self.redis.get(rate_key) or 0)

        if current_rate >= rate_limit:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later."
            )

        # Increment rate counter (expires after 1 minute)
        self.redis.set(rate_key, current_rate + 1, ex=60)
        return True

    async def get_feature_usage_stats(
        self,
        user_id: str,
        feature: str,
        days: int = 30
    ) -> Dict:
        """Get feature usage statistics for a period"""
        stats = {
            "total_usage": 0,
            "daily_average": 0,
            "peak_usage": 0,
            "peak_day": None,
            "current_period_usage": 0
        }

        start_date = datetime.now() - timedelta(days=days)
        
        for day in range(days):
            date = start_date + timedelta(days=day)
            key = self._get_usage_key(user_id, feature).replace(
                datetime.now().strftime('%Y-%m-%d'),
                date.strftime('%Y-%m-%d')
            )
            
            usage = int(self.redis.get(key) or 0)
            stats["total_usage"] += usage
            
            if usage > stats["peak_usage"]:
                stats["peak_usage"] = usage
                stats["peak_day"] = date.strftime('%Y-%m-%d')

        if days > 0:
            stats["daily_average"] = stats["total_usage"] / days

        # Get current period usage
        current_key = self._get_usage_key(user_id, feature)
        stats["current_period_usage"] = int(self.redis.get(current_key) or 0)

        return stats

    async def reset_usage_counters(self, user_id: str, feature: Optional[str] = None):
        """Reset usage counters for a user"""
        pattern = f"feature_usage:{user_id}:*" if not feature else f"feature_usage:{user_id}:{feature}:*"
        keys = self.redis.keys(pattern)
        if keys:
            self.redis.delete(*keys) 