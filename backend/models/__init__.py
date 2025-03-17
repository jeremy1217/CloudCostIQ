# Local imports
from backend.models.allocation import CostAllocation, CostCategory
from backend.models.anomaly import CostAnomaly
from backend.models.budget import BudgetAlert, AlertHistory
from backend.models.cloud_cost import CloudCost
from backend.models.forecast import CostForecast
from backend.models.organization import OrganizationUnit
from backend.models.policy import OptimizationPolicy
from backend.models.recommendation import Recommendation
from backend.models.report import SavedReport
from backend.models.resource import CloudResource, ResourceTag
from backend.models.utilization import ResourceUtilization
from backend.models.user import UserModel
from backend.models.plan import PlanModel
from backend.models.subscription import SubscriptionModel
from backend.models.role import RoleModel
# Import all models to make them available through the package

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

# This ensures all models are loaded and their relationships are properly set up
__all__ = ['UserModel', 'PlanModel', 'SubscriptionModel', 'RoleModel']