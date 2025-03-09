# Standard library imports
import datetime
import json
import os

# Third-party imports
from azure.mgmt.costmanagement import CostManagementClient

# Local imports
from backend.database.db import SessionLocal
from backend.models.cloud_cost import CloudCost
# from azure.identity import ClientSecretCredential

def store_azure_cost():
    """Return mock Azure cost data"""
    return [
        {"provider": "Azure", "service": "VM", "cost": 98.75, "date": "2025-02-21"},
        {"provider": "Azure", "service": "Storage", "cost": 50.25, "date": "2025-02-22"},
    ]

'''
# Authenticate with Azure
credentials = ClientSecretCredential(
    client_id=os.getenv("AZURE_CLIENT_ID"),
    client_secret=os.getenv("AZURE_CLIENT_SECRET"),
    tenant_id=os.getenv("AZURE_TENANT_ID"),
)

client = CostManagementClient(credentials)

def get_azure_cost():
    """Fetch Azure cost data for the last 7 days."""
    today = datetime.date.today()
    start_date = today - datetime.timedelta(days=7)

    response = client.forecast.usage(
        scope=f"/subscriptions/{os.getenv('AZURE_SUBSCRIPTION_ID')}",
        parameters={"timeframe": "Custom", "timePeriod": {"from": str(start_date), "to": str(today)}}
    )

    return response.value

def store_azure_cost():
    db = SessionLocal()
    azure_data = get_azure_cost()

    for item in azure_data:
        cloud_cost = CloudCost(
            provider="Azure",
            service=item.service_name,
            cost=item.cost,
            date=item.date,
            extra_data=json.dumps(item)  # Use extra_data instead of metadata
        )
        db.add(cloud_cost)

    db.commit()
    db.close()

    print("✅ Azure Cost Data Stored")
'''