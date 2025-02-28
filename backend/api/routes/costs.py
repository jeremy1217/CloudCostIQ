from fastapi import APIRouter
from services.aws_cost import store_aws_cost
from services.azure_cost import store_azure_cost
from services.gcp_cost import store_gcp_cost

router = APIRouter()

@router.get("/mock-costs")
def get_mock_costs():
    return store_aws_cost() + store_azure_cost() + store_gcp_cost()

'''
@router.get("/ingest")
async def ingest_cost_data():
    """Trigger cost data ingestion for AWS, Azure, and GCP."""
    store_aws_cost()
    store_azure_cost()
    store_gcp_cost()
    return {"message": "Cloud cost data ingested successfully"}
'''