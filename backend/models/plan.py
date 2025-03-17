from sqlalchemy import Column, Integer, String, Float, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database.db import Base

class PlanModel(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)  # standard, professional, enterprise
    description = Column(String, nullable=True)
    price = Column(Float)
    features = Column(JSON, default=dict)
    limits = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship with subscriptions
    subscriptions = relationship("SubscriptionModel", back_populates="plan")

    def __repr__(self):
        return f"<Plan {self.name}>"

    # Define the default plans
    @staticmethod
    def get_default_plans():
        return [
            {
                "name": "Standard",
                "description": "Perfect for small to medium businesses starting with cloud cost optimization",
                "price": "$299",
                "period": "/month",
                "max_cloud_accounts": 5,
                "data_retention_days": 30,
                "features": {
                    "cost_analytics": "basic",
                    "service_breakdown": True,
                    "provider_analysis": True,
                    "optimization_recommendations": "basic",
                    "cost_reports": "monthly",
                    "support_level": "email",
                    "support_response_time": 48,
                    "ai_insights": "basic",
                    "api_access": "readonly",
                    "cost_attribution": False,
                    "multi_cloud_comparison": False,
                    "custom_dashboards": False,
                    "advanced_ai": False,
                    "slack_integration": False,
                    "teams_integration": False,
                    "custom_ai_training": False,
                    "on_premise": False,
                    "white_labeling": False
                },
                "is_popular": False
            },
            {
                "name": "Professional",
                "description": "For growing organizations with complex cloud infrastructure",
                "price": "$799",
                "period": "/month",
                "max_cloud_accounts": 15,
                "data_retention_days": 90,
                "features": {
                    "cost_analytics": "advanced",
                    "service_breakdown": True,
                    "provider_analysis": True,
                    "optimization_recommendations": "advanced",
                    "cost_reports": "custom",
                    "support_level": "priority",
                    "support_response_time": 24,
                    "ai_insights": "advanced",
                    "api_access": "full",
                    "cost_attribution": True,
                    "multi_cloud_comparison": True,
                    "custom_dashboards": True,
                    "advanced_ai": True,
                    "slack_integration": True,
                    "teams_integration": True,
                    "custom_ai_training": False,
                    "on_premise": False,
                    "white_labeling": False
                },
                "is_popular": True
            },
            {
                "name": "Enterprise",
                "description": "Custom solutions for large enterprises with mission-critical needs",
                "price": "Custom",
                "period": "",
                "max_cloud_accounts": -1,  # Unlimited
                "data_retention_days": -1,  # Unlimited
                "features": {
                    "cost_analytics": "enterprise",
                    "service_breakdown": True,
                    "provider_analysis": True,
                    "optimization_recommendations": "predictive",
                    "cost_reports": "custom",
                    "support_level": "dedicated",
                    "support_response_time": 1,  # 24/7
                    "ai_insights": "custom",
                    "api_access": "unlimited",
                    "cost_attribution": True,
                    "multi_cloud_comparison": True,
                    "custom_dashboards": True,
                    "advanced_ai": True,
                    "slack_integration": True,
                    "teams_integration": True,
                    "custom_ai_training": True,
                    "on_premise": True,
                    "white_labeling": True,
                    "msp_reseller": True,
                    "dedicated_success_manager": True,
                    "quarterly_reviews": True
                },
                "is_popular": False
            }
        ] 