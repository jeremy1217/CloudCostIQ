# app/schemas/cost.py
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class CostSummary(BaseModel):
    """Summary of cost data for dashboard."""
    total_spend: float
    month_over_month_change: float
    projected_spend: float
    top_services: List[Dict[str, Any]]
    
class CostDetail(BaseModel):
    """Detailed cost information."""
    service: str
    cost: float
    change_percentage: Optional[float] = None
    resource_count: Optional[int] = None

class CostAnomaly(BaseModel):
    """Cost anomaly model."""
    service: str
    date: datetime
    resource_id: str
    cost: float
    z_score: float
    avg_cost: float
    percent_difference: float

class IdleResource(BaseModel):
    """Idle resource recommendation."""
    resource_id: str
    service: str
    avg_daily_cost: float
    recommendation: str
    estimated_savings: float

class RightsizingRecommendation(BaseModel):
    """Recommendation for rightsizing resources."""
    resource_id: str
    service: str
    current_cost: float
    recommendation: str
    estimated_savings: float

class ReservedInstanceRecommendation(BaseModel):
    """Recommendation for Reserved Instance purchases."""
    resource_id: str
    service: str
    current_monthly_cost: float
    recommendation: str
    estimated_savings_1yr: float
    estimated_savings_3yr: float

class RecommendationSummary(BaseModel):
    """Summary of all recommendation types."""
    anomalies: List[CostAnomaly]
    idle_resources: List[IdleResource]
    rightsizing_recommendations: List[RightsizingRecommendation]
    reserved_instance_recommendations: List[ReservedInstanceRecommendation]
    total_estimated_savings: float