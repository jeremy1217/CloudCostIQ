# Standard library imports
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import json

# Third-party imports
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from backend.services.multi_cloud_service import MultiCloudService

# Local imports
from backend.api.routes.costs import router as costs_router
from backend.api.routes.insights import router as insights_router
from backend.api.routes.ai_routes import router as ai_router
from backend.api.routes.resource_routes import router as resources_router
from backend.api.routes.attribution import router as attribution_router
from backend.auth.models import User
from backend.auth.utils import get_current_active_user, has_role
from backend.auth.utils import get_current_user

app = FastAPI(title="CloudCostIQ API")

# Configure CORS - Move this before any router includes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Add auth routers first
from backend.auth.routes import router as auth_router
app.include_router(auth_router, prefix="/auth", tags=["auth"])

# Add API keys router
from backend.api.routes.api_keys import router as api_keys_router
app.include_router(api_keys_router)

# Add existing routers with auth protection
app.include_router(costs_router, dependencies=[Depends(get_current_active_user)])
app.include_router(insights_router, prefix="/insights", dependencies=[Depends(get_current_active_user)])
app.include_router(ai_router, dependencies=[Depends(get_current_active_user)])
app.include_router(resources_router, dependencies=[Depends(get_current_active_user)])
app.include_router(attribution_router, prefix="/attribution", dependencies=[Depends(get_current_active_user)])

# Add admin-only routes with role-based protection
from backend.api.admin import router as admin_router
app.include_router(
    admin_router,
    dependencies=[Depends(has_role(["admin"]))],
    tags=["admin"]
)

# Create router for multi-cloud endpoints
multi_cloud_router = APIRouter(
    prefix="/multi-cloud",
    tags=["multi-cloud"],
    dependencies=[Depends(get_current_user)]
)

# Models for request/response data
class ResourceConfig(BaseModel):
    compute: Dict[str, int]
    storage: Dict[str, int]
    database: Dict[str, int]
    networking: Dict[str, int]

class MigrationRequest(BaseModel):
    sourceProvider: str
    targetProvider: str
    resources: ResourceConfig

class OptimizationApplyRequest(BaseModel):
    optimizationIds: List[str]

class TimeRange(BaseModel):
    startDate: str
    endDate: str
    granularity: Optional[str] = "MONTHLY"

class ProviderCostRequest(BaseModel):
    providers: List[str]
    timeRange: TimeRange

# Initialize the multi-cloud service
multi_cloud_service = MultiCloudService()

# Routes

@multi_cloud_router.get("/comparison")
async def get_provider_comparison(current_user: User = Depends(get_current_user)):
    """Get cost comparison data across cloud providers"""
    try:
        comparison_data = multi_cloud_service.get_provider_comparison(current_user.id)
        return comparison_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching provider comparison: {str(e)}"
        )

@multi_cloud_router.get("/service-mapping")
async def get_service_mapping(current_user: User = Depends(get_current_user)):
    """Get mapping of equivalent services across providers"""
    try:
        mapping_data = multi_cloud_service.get_service_mapping()
        return mapping_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching service mapping: {str(e)}"
        )

@multi_cloud_router.post("/migration-analysis")
async def analyze_migration(
    request: MigrationRequest,
    current_user: User = Depends(get_current_user)
):
    """Analyze migration costs between providers"""
    try:
        analysis = multi_cloud_service.analyze_migration(
            current_user.id,
            request.sourceProvider,
            request.targetProvider,
            request.resources.dict()
        )
        return analysis
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing migration: {str(e)}"
        )

@multi_cloud_router.post("/migration-plan")
async def generate_migration_plan(
    request: MigrationRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Generate a detailed migration plan"""
    try:
        plan = multi_cloud_service.generate_migration_plan(
            current_user.id,
            request.sourceProvider,
            request.targetProvider,
            request.resources.dict()
        )
        return plan
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating migration plan: {str(e)}"
        )

@multi_cloud_router.get("/optimizations")
async def get_optimization_opportunities(current_user: User = Depends(get_current_user)):
    """Get cross-cloud optimization opportunities"""
    try:
        opportunities = multi_cloud_service.get_optimization_opportunities(current_user.id)
        return opportunities
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching optimization opportunities: {str(e)}"
        )

@multi_cloud_router.get("/optimizations/{opportunity_id}")
async def get_optimization_details(
    opportunity_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get details for a specific optimization opportunity"""
    try:
        details = multi_cloud_service.get_optimization_details(current_user.id, opportunity_id)
        return details
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching optimization details: {str(e)}"
        )

@multi_cloud_router.get("/provider-costs/{provider}")
async def get_provider_cost_details(
    provider: str,
    time_range: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed costs for a specific provider"""
    try:
        # Parse the time_range JSON string
        time_range_data = json.loads(time_range)
        time_range_obj = TimeRange(**time_range_data)
        
        cost_details = multi_cloud_service.get_provider_cost_details(
            current_user.id,
            provider,
            time_range_obj.dict()
        )
        return cost_details
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid time_range format. Expected a JSON string."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching provider cost details: {str(e)}"
        )

@multi_cloud_router.post("/service-cost-breakdown")
async def get_service_cost_breakdown(
    request: ProviderCostRequest,
    current_user: User = Depends(get_current_user)
):
    """Get detailed cost breakdown by service"""
    try:
        service_costs = multi_cloud_service.get_service_cost_breakdown(
            current_user.id,
            request.providers,
            request.timeRange.dict()
        )
        return service_costs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching service cost breakdown: {str(e)}"
        )

@multi_cloud_router.get("/generate-optimization-report")
async def generate_optimization_report(
    format: str = "pdf",
    current_user: User = Depends(get_current_user)
):
    """Generate optimization report in the specified format"""
    try:
        report = multi_cloud_service.generate_optimization_report(current_user.id, format)
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating optimization report: {str(e)}"
        )

@multi_cloud_router.post("/apply-optimization")
async def apply_optimization_plan(
    request: OptimizationApplyRequest,
    current_user: User = Depends(get_current_user)
):
    """Apply selected optimization plans"""
    try:
        result = multi_cloud_service.apply_optimization_plan(
            current_user.id,
            request.optimizationIds
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error applying optimization plan: {str(e)}"
        )

# Add the multi-cloud router to the main app
app.include_router(multi_cloud_router)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to CloudCostIQ API"}