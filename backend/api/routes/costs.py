from fastapi import APIRouter
from backend.services.aws_cost import store_aws_cost
from backend.services.azure_cost import store_azure_cost
from backend.services.gcp_cost import store_gcp_cost

router = APIRouter()

@router.get("/mock-costs")
def get_mock_costs():
    return store_aws_cost() + store_azure_cost() + store_gcp_cost()

@router.get("/ingest")
async def ingest_cost_data():
    """Trigger cost data ingestion for AWS, Azure, and GCP."""
    # For now, just return mock data since the actual cloud provider APIs aren't implemented
    aws_costs = store_aws_cost()
    azure_costs = store_azure_cost() 
    gcp_costs = store_gcp_cost()
    
    all_costs = aws_costs + azure_costs + gcp_costs
    
    return {"message": "Cloud cost data ingested successfully", "costs": all_costs}
