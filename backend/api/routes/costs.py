# Third-party imports
from fastapi import APIRouter
from datetime import datetime, timedelta

# Local imports
from backend.services.aws_cost import store_aws_cost
from backend.services.azure_cost import store_azure_cost
from backend.services.gcp_cost import store_gcp_cost

router = APIRouter(prefix="/api/costs", tags=["costs"])

@router.get("/mock-costs")
def get_mock_costs():
    # Get costs from all providers
    aws_costs = store_aws_cost()
    azure_costs = store_azure_cost()
    gcp_costs = store_gcp_cost()
    
    # Combine all costs
    all_costs = aws_costs + azure_costs + gcp_costs
    
    # Calculate total cost
    total_cost = sum(cost.get('cost', 0) for cost in all_costs)
    
    # Get date range
    if all_costs:
        dates = [cost.get('date') for cost in all_costs if cost.get('date')]
        start_date = min(dates) if dates else datetime.now().isoformat()
        end_date = max(dates) if dates else datetime.now().isoformat()
    else:
        start_date = datetime.now().isoformat()
        end_date = (datetime.now() + timedelta(days=30)).isoformat()
    
    return {
        "costs": all_costs,
        "total_cost": total_cost,
        "date_range": {
            "start": start_date,
            "end": end_date
        }
    }

@router.get("/ingest")
async def ingest_cost_data():
    """Trigger cost data ingestion for AWS, Azure, and GCP."""
    # For now, just return mock data since the actual cloud provider APIs aren't implemented
    aws_costs = store_aws_cost()
    azure_costs = store_azure_cost() 
    gcp_costs = store_gcp_cost()
    
    all_costs = aws_costs + azure_costs + gcp_costs
    
    return {"message": "Cloud cost data ingested successfully", "costs": all_costs}
