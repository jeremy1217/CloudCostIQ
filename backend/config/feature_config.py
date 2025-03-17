from enum import Enum

class FeatureLevel(Enum):
    READ_ONLY = "readonly"
    BASIC = "basic"
    ADVANCED = "advanced"
    FULL = "full"

class PlanFeatures:
    STANDARD = {
        "basic_analytics": FeatureLevel.FULL,
        "cost_attribution": FeatureLevel.READ_ONLY,
        "export_formats": ["csv"],
        "data_retention_days": 30,
        "cloud_accounts_limit": 3,
        "api_rate_limit": 1000,
        "report_generation": FeatureLevel.BASIC
    }
    
    PROFESSIONAL = {
        **STANDARD,
        "basic_analytics": FeatureLevel.FULL,
        "cost_attribution": FeatureLevel.FULL,
        "advanced_analytics": FeatureLevel.BASIC,
        "export_formats": ["csv", "excel", "pdf"],
        "data_retention_days": 90,
        "cloud_accounts_limit": 10,
        "api_rate_limit": 10000,
        "report_generation": FeatureLevel.ADVANCED,
        "team_management": FeatureLevel.BASIC
    }
    
    ENTERPRISE = {
        **PROFESSIONAL,
        "advanced_analytics": FeatureLevel.FULL,
        "ai_insights": FeatureLevel.FULL,
        "export_formats": ["csv", "excel", "pdf", "custom"],
        "data_retention_days": -1,  # Unlimited
        "cloud_accounts_limit": -1,  # Unlimited
        "api_rate_limit": -1,       # Unlimited
        "report_generation": FeatureLevel.FULL,
        "team_management": FeatureLevel.FULL,
        "custom_integrations": FeatureLevel.FULL
    }

# Feature descriptions and requirements
FEATURE_METADATA = {
    "basic_analytics": {
        "description": "Basic cost analysis and reporting",
        "requirements": [],
        "upgrade_message": "Upgrade to Professional for advanced analytics features"
    },
    "cost_attribution": {
        "description": "Cost attribution across teams and projects",
        "requirements": ["basic_analytics"],
        "upgrade_message": "Upgrade to Professional for full cost attribution capabilities"
    },
    "advanced_analytics": {
        "description": "Advanced cost analysis and optimization",
        "requirements": ["basic_analytics", "cost_attribution"],
        "upgrade_message": "Upgrade to Enterprise for full advanced analytics capabilities"
    },
    "ai_insights": {
        "description": "AI-powered cost insights and predictions",
        "requirements": ["advanced_analytics"],
        "upgrade_message": "AI insights are only available in Enterprise plan"
    }
}

# API endpoint requirements
API_REQUIREMENTS = {
    "/api/reports/cost-report": {
        "min_plan": "standard",
        "required_features": ["basic_analytics"],
        "rate_limit": True
    },
    "/api/reports/export-report": {
        "min_plan": "standard",
        "required_features": ["basic_analytics"],
        "rate_limit": True
    },
    "/api/analytics/advanced": {
        "min_plan": "professional",
        "required_features": ["advanced_analytics"],
        "rate_limit": True
    },
    "/api/insights/ai": {
        "min_plan": "enterprise",
        "required_features": ["ai_insights"],
        "rate_limit": True
    }
} 