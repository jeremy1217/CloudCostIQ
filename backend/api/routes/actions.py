from fastapi import APIRouter
from services.optimization import rightsizing_recommendation

router = APIRouter()

@router.get("/optimize")
async def optimize_costs():
    """Provide AI-powered cost-saving recommendations"""
    recommendations = rightsizing_recommendation()
    return {"recommendations": recommendations}
