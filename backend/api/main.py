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
from backend.auth.models import User  # Import User from auth.models instead of models.user
from backend.auth.utils import get_current_active_user, has_role

# Import auth dependencies
from backend.auth.utils import get_current_user

app = FastAPI(title="CloudCostIQ API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add auth routers
from backend.auth.routes import router as auth_router
app.include_router(auth_router)

# Add API keys router
from backend.api.routes.api_keys import router as api_keys_router
app.include_router(api_keys_router)

# Add existing routers with auth protection
app.include_router(costs_router, dependencies=[Depends(get_current_active_user)])
app.include_router(insights_router, dependencies=[Depends(get_current_active_user)])

# Add admin-only routes with role-based protection
admin_router = APIRouter()
app.include_router(
    admin_router,
    prefix="/admin",
    dependencies=[Depends(has_role(["admin"]))],
    tags=["admin"]
)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to CloudCostIQ API"}

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
    """Compare costs across cloud providers"""
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
        migration_data = multi_cloud_service.analyze_migration(
            current_user.id,
            request.sourceProvider,
            request.targetProvider,
            request.resources.dict()
        )
        return migration_data
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
        plan_data = multi_cloud_service.generate_migration_plan(
            current_user.id,
            request.sourceProvider,
            request.targetProvider,
            request.resources.dict()
        )
        
        # In a real implementation, we might generate a PDF and store it
        # background_tasks.add_task(generate_and_store_pdf, plan_data, current_user.id)
        
        return plan_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating migration plan: {str(e)}"
        )

@multi_cloud_router.get("/optimizations")
async def get_optimization_opportunities(current_user: User = Depends(get_current_user)):
    """Get cross-cloud optimization opportunities"""
    try:
        optimization_data = multi_cloud_service.get_optimization_opportunities(current_user.id)
        return optimization_data
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
        optimization_details = multi_cloud_service.get_optimization_details(
            current_user.id,
            opportunity_id
        )
        return optimization_details
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching optimization details: {str(e)}"
        )

@multi_cloud_router.get("/provider-costs/{provider}")
async def get_provider_cost_details(
    provider: str,
    time_range: TimeRange,
    current_user: User = Depends(get_current_user)
):
    """Get detailed costs for a specific provider"""
    try:
        provider_costs = multi_cloud_service.get_provider_cost_details(
            current_user.id,
            provider,
            time_range.dict()
        )
        return provider_costs
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
        # In a real implementation, we would generate a PDF/Excel report here
        report_data = multi_cloud_service.generate_optimization_report(
            current_user.id,
            format
        )
        
        # This would return a file download
        # content = report_data["content"]
        # filename = report_data["filename"]
        # return Response(
        #     content=content,
        #     media_type="application/pdf" if format == "pdf" else "application/vnd.ms-excel",
        #     headers={"Content-Disposition": f"attachment; filename={filename}"}
        # )
        
        # For demonstration, just return a success message
        return {"message": "Report generated successfully", "timestamp": datetime.now().isoformat()}
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