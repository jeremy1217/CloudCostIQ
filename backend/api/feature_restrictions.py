from enum import Enum

class PlanLevel(str, Enum):
    STANDARD = "standard"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"

# Feature requirements for different API endpoints
FEATURE_REQUIREMENTS = {
    # Cost Analysis Features
    "/api/costs/basic": {
        "min_plan": PlanLevel.STANDARD,
        "required_features": ["cost_analytics"]
    },
    "/api/costs/by-service": {
        "min_plan": PlanLevel.STANDARD,
        "required_features": ["service_breakdown"]
    },
    "/api/costs/by-provider": {
        "min_plan": PlanLevel.STANDARD,
        "required_features": ["provider_analysis"]
    },
    "/api/costs/attribution": {
        "min_plan": PlanLevel.PROFESSIONAL,
        "required_features": ["cost_attribution"]
    },
    
    # AI Features
    "/api/ai/basic-insights": {
        "min_plan": PlanLevel.STANDARD,
        "required_features": ["ai_insights"]
    },
    "/api/ai/advanced-recommendations": {
        "min_plan": PlanLevel.PROFESSIONAL,
        "required_features": ["advanced_ai"]
    },
    "/api/ai/custom-training": {
        "min_plan": PlanLevel.ENTERPRISE,
        "required_features": ["custom_ai_training"]
    },
    
    # Dashboard Features
    "/api/dashboards/basic": {
        "min_plan": PlanLevel.STANDARD,
        "required_features": ["cost_analytics"]
    },
    "/api/dashboards/custom": {
        "min_plan": PlanLevel.PROFESSIONAL,
        "required_features": ["custom_dashboards"]
    },
    
    # Multi-Cloud Features
    "/api/multi-cloud/comparison": {
        "min_plan": PlanLevel.PROFESSIONAL,
        "required_features": ["multi_cloud_comparison"]
    },
    
    # Integration Features
    "/api/integrations/slack": {
        "min_plan": PlanLevel.PROFESSIONAL,
        "required_features": ["slack_integration"]
    },
    "/api/integrations/teams": {
        "min_plan": PlanLevel.PROFESSIONAL,
        "required_features": ["teams_integration"]
    },
    
    # API Access
    "/api/api-keys/read": {
        "min_plan": PlanLevel.STANDARD,
        "required_features": ["api_access"]
    },
    "/api/api-keys/write": {
        "min_plan": PlanLevel.PROFESSIONAL,
        "required_features": ["api_access"]
    },
    "/api/api-keys/unlimited": {
        "min_plan": PlanLevel.ENTERPRISE,
        "required_features": ["api_access"]
    },
    
    # Reports
    "/api/reports/basic": {
        "min_plan": PlanLevel.STANDARD,
        "required_features": ["cost_reports"]
    },
    "/api/reports/custom": {
        "min_plan": PlanLevel.PROFESSIONAL,
        "required_features": ["cost_reports"]
    },
    
    # White Labeling
    "/api/white-labeling": {
        "min_plan": PlanLevel.ENTERPRISE,
        "required_features": ["white_labeling"]
    }
}

# Feature levels for different plan tiers
FEATURE_LEVELS = {
    "cost_analytics": {
        PlanLevel.STANDARD: "basic",
        PlanLevel.PROFESSIONAL: "advanced",
        PlanLevel.ENTERPRISE: "enterprise"
    },
    "ai_insights": {
        PlanLevel.STANDARD: "basic",
        PlanLevel.PROFESSIONAL: "advanced",
        PlanLevel.ENTERPRISE: "custom"
    },
    "api_access": {
        PlanLevel.STANDARD: "readonly",
        PlanLevel.PROFESSIONAL: "full",
        PlanLevel.ENTERPRISE: "unlimited"
    }
}

def get_feature_level(feature: str, plan_level: PlanLevel) -> str:
    """Get the level of a feature for a specific plan"""
    if feature in FEATURE_LEVELS:
        return FEATURE_LEVELS[feature].get(plan_level, None)
    return None 