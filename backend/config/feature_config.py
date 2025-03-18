from enum import Enum
from typing import Dict, Any

class PlanFeatures(Enum):
    BASIC = "basic"
    PRO = "pro"
    ENTERPRISE = "enterprise"

FEATURE_METADATA: Dict[str, Dict[str, Any]] = {
    "cost_analysis": {
        "name": "Cost Analysis",
        "description": "Detailed cost analysis and breakdown",
        "plans": {
            PlanFeatures.BASIC: {"enabled": True, "limits": {"months": 3}},
            PlanFeatures.PRO: {"enabled": True, "limits": {"months": 12}},
            PlanFeatures.ENTERPRISE: {"enabled": True, "limits": {"months": 36}}
        }
    },
    "cost_optimization": {
        "name": "Cost Optimization",
        "description": "AI-powered cost optimization recommendations",
        "plans": {
            PlanFeatures.BASIC: {"enabled": False},
            PlanFeatures.PRO: {"enabled": True, "limits": {"recommendations_per_month": 10}},
            PlanFeatures.ENTERPRISE: {"enabled": True, "limits": {"recommendations_per_month": 100}}
        }
    },
    "budget_alerts": {
        "name": "Budget Alerts",
        "description": "Custom budget alerts and notifications",
        "plans": {
            PlanFeatures.BASIC: {"enabled": True, "limits": {"alerts": 3}},
            PlanFeatures.PRO: {"enabled": True, "limits": {"alerts": 10}},
            PlanFeatures.ENTERPRISE: {"enabled": True, "limits": {"alerts": 50}}
        }
    },
    "team_collaboration": {
        "name": "Team Collaboration",
        "description": "Team sharing and collaboration features",
        "plans": {
            PlanFeatures.BASIC: {"enabled": False},
            PlanFeatures.PRO: {"enabled": True, "limits": {"team_members": 5}},
            PlanFeatures.ENTERPRISE: {"enabled": True, "limits": {"team_members": 50}}
        }
    },
    "custom_reports": {
        "name": "Custom Reports",
        "description": "Create and schedule custom reports",
        "plans": {
            PlanFeatures.BASIC: {"enabled": False},
            PlanFeatures.PRO: {"enabled": True, "limits": {"reports": 5}},
            PlanFeatures.ENTERPRISE: {"enabled": True, "limits": {"reports": 20}}
        }
    },
    "api_access": {
        "name": "API Access",
        "description": "Access to REST API endpoints",
        "plans": {
            PlanFeatures.BASIC: {"enabled": False},
            PlanFeatures.PRO: {"enabled": True, "limits": {"requests_per_day": 1000}},
            PlanFeatures.ENTERPRISE: {"enabled": True, "limits": {"requests_per_day": 10000}}
        }
    },
    "data_retention": {
        "name": "Data Retention",
        "description": "Historical data retention period",
        "plans": {
            PlanFeatures.BASIC: {"enabled": True, "limits": {"months": 3}},
            PlanFeatures.PRO: {"enabled": True, "limits": {"months": 12}},
            PlanFeatures.ENTERPRISE: {"enabled": True, "limits": {"months": 36}}
        }
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