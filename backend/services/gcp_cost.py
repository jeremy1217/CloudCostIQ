from google.cloud import billing_v1
import datetime
import json
from backend.database.db import SessionLocal
from backend.models.cloud_cost import CloudCost
import os

def store_gcp_cost():
    return [
        {"provider": "GCP", "service": "VM", "cost": 98.75, "date": "2025-02-21"},
        {"provider": "GCP", "service": "Storage", "cost": 50.25, "date": "2025-02-22"},
    ]

'''# Initialize GCP Billing Client
client = billing_v1.CloudBillingClient()

def get_gcp_cost():
    """Fetch GCP billing data for the last 7 days."""
    project_id = "your-project-id"
    billing_account = f"billingAccounts/{project_id}"

    response = client.list_billing_accounts()
    today = datetime.date.today()

    data = [
        {
            "service": account.display_name,
            "cost": account.open,  # Mocked for now
            "date": str(today),
        }
        for account in response
    ]

    return data

def store_gcp_cost():
    db = SessionLocal()
    gcp_data = get_gcp_cost()

    for item in gcp_data:
        cloud_cost = CloudCost(
            provider="GCP",
            service=item["service"],
            cost=item["cost"],
            date=item["date"],
            metadata=json.dumps(item),
        )
        db.add(cloud_cost)

    db.commit()
    db.close()

    print("✅ GCP Cost Data Stored")

    '''
