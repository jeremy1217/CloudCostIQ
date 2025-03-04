# Import all models to make them available through the package
from backend.models.cloud_cost import CloudCost
from backend.models.recommendation import Recommendation
from backend.models.anomaly import CostAnomaly
from backend.models.forecast import CostForecast
from backend.models.resource import CloudResource, ResourceTag
from backend.models.budget import BudgetAlert, AlertHistory
from backend.models.organization import OrganizationUnit
from backend.models.allocation import CostAllocation, CostCategory
from backend.models.utilization import ResourceUtilization
from backend.models.report import SavedReport
from backend.models.policy import OptimizationPolicy

# Convenience list of all models for database initialization
ALL_MODELS = [
    CloudCost,
    Recommendation,
    CostAnomaly,
    CostForecast,
    CloudResource,
    ResourceTag,
    BudgetAlert,
    AlertHistory,
    OrganizationUnit,
    CostAllocation,
    CostCategory,
    ResourceUtilization,
    SavedReport,
    OptimizationPolicy
]