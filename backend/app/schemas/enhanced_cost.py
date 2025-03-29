# app/schemas/enhanced_cost.py
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime

class EnhancedCostAnomaly(BaseModel):
    """Enhanced cost anomaly model with detection method and confidence."""
    service: str
    date: datetime
    resource_id: str
    cost: float
    avg_cost: float
    percent_difference: float
    detection_method: str = Field(description="Algorithm used for detection: z_score, isolation_forest, time_series")
    confidence: float = Field(description="Confidence score from 0-1")
    explanation: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None

class ContextualAnomaly(BaseModel):
    """Contextual anomaly like unusual weekend patterns."""
    type: str = "contextual"
    subtype: str = Field(description="Type of contextual anomaly: weekend_pattern, end_of_month, etc.")
    service: str
    account_id: Optional[int] = None
    description: str
    confidence: float
    ratio: Optional[float] = None
    metrics: Optional[Dict[str, Any]] = None

class EnhancedIdleResource(BaseModel):
    """Enhanced idle resource recommendation with metrics and confidence."""
    resource_id: str
    service: str
    avg_daily_cost: float
    recommendation: str
    estimated_savings: float
    confidence: str = Field(description="Confidence level: high, medium, low")
    metrics: Optional[Dict[str, Any]] = None

class EnhancedRightsizingRecommendation(BaseModel):
    """Enhanced rightsizing recommendation with instance type details."""
    resource_id: str
    service: str
    current_type: str
    current_cost: float
    recommended_type: str
    recommendation: str
    estimated_savings: float
    confidence: str
    metrics: Optional[Dict[str, Any]] = None
    recommendation_type: Optional[str] = None

class EnhancedReservedInstanceRecommendation(BaseModel):
    """Enhanced reserved instance recommendation with provider and metrics."""
    resource_id: str
    service: str
    provider: str
    instance_type: str
    current_monthly_cost: float
    recommendation: str
    estimated_savings_1yr: float
    estimated_savings_3yr: float
    confidence: str
    metrics: Optional[Dict[str, Any]] = None

class StorageOptimizationRecommendation(BaseModel):
    """Storage optimization recommendation."""
    resource_id: str
    service: str
    storage_class: Optional[str] = None
    volume_type: Optional[str] = None
    avg_daily_cost: float
    recommendation: str
    estimated_savings: float
    confidence: str
    metrics: Optional[Dict[str, Any]] = None

class NetworkOptimizationRecommendation(BaseModel):
    """Network optimization recommendation."""
    resource_id: str
    service: str
    avg_daily_cost: float
    recommendation: str
    estimated_savings: float
    confidence: str
    metrics: Optional[Dict[str, Any]] = None

class EnhancedRecommendationSummary(BaseModel):
    """Enhanced summary of all recommendation types."""
    idle_resources: List[EnhancedIdleResource]
    rightsizing_recommendations: List[EnhancedRightsizingRecommendation]
    reserved_instance_recommendations: List[EnhancedReservedInstanceRecommendation]
    storage_optimization_recommendations: List[StorageOptimizationRecommendation]
    network_optimization_recommendations: List[NetworkOptimizationRecommendation]
    top_recommendations: List[Dict[str, Any]]
    total_estimated_savings: float

class RecommendationPriority(BaseModel):
    """Recommendation with priority score."""
    category: str
    recommendation: Dict[str, Any]
    priority: float