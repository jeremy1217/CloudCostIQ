# Standard library imports
import datetime
import json

# Third-party imports
import boto3

# Local imports
from backend.database.db import SessionLocal
from backend.models.cloud_cost import CloudCost

def store_aws_cost():
    """Return mock AWS cost data"""
    return [
        {"provider": "AWS", "service": "EC2", "cost": 120.50, "date": "2025-02-20"},
        {"provider": "Azure", "service": "VM", "cost": 98.75, "date": "2025-02-21"},
        {"provider": "GCP", "service": "Compute Engine", "cost": 85.20, "date": "2025-02-22"},
    ]

'''
client = boto3.client("ce")

def get_aws_cost():
    today = datetime.date.today()
    start_date = today - datetime.timedelta(days=7)

    response = client.get_cost_and_usage(
        TimePeriod={"Start": str(start_date), "End": str(today)},
        Granularity="DAILY",
        Metrics=["UnblendedCost"],
        GroupBy=[{"Type": "DIMENSION", "Key": "SERVICE"}],
    )

    return response["ResultsByTime"]

def store_aws_cost():
    db = SessionLocal()
    aws_data = get_aws_cost()

    for day in aws_data:
        date = day["TimePeriod"]["Start"]
        for group in day["Groups"]:
            service = group["Keys"][0]
            cost = float(group["Metrics"]["UnblendedCost"]["Amount"])

            cloud_cost = CloudCost(
                provider="AWS", 
                service=service, 
                cost=cost, 
                date=date, 
                extra_data=json.dumps(group)  # Use extra_data instead of metadata
            )
            db.add(cloud_cost)

    db.commit()
    db.close()

    '''