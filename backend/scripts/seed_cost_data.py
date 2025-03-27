# backend/scripts/seed_cost_data.py
import sys
import os
import random
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import User, CloudAccount, CostData

def create_sample_resources(account_id, service, num_resources=5):
    """Create sample resources for a specific service"""
    resources = []
    for i in range(num_resources):
        resource_id = f"{service}-{i+1:04d}"
        resources.append(resource_id)
    return resources

def generate_cost_data(db: Session, days=90):
    """Generate sample cost data for the past 90 days"""
    # Get all cloud accounts
    accounts = db.query(CloudAccount).all()
    
    if not accounts:
        print("No cloud accounts found. Please create at least one cloud account first.")
        return
    
    print(f"Found {len(accounts)} cloud accounts. Generating cost data...")
    
    # Define services and daily costs for AWS
    aws_services = {
        'EC2': {'base_cost': 50.0, 'variance': 10.0, 'resources': []},
        'S3': {'base_cost': 20.0, 'variance': 5.0, 'resources': []},
        'RDS': {'base_cost': 30.0, 'variance': 8.0, 'resources': []},
        'Lambda': {'base_cost': 5.0, 'variance': 2.0, 'resources': []},
        'EBS': {'base_cost': 10.0, 'variance': 3.0, 'resources': []}
    }
    
    # Define services and daily costs for Azure
    azure_services = {
        'Virtual Machines': {'base_cost': 45.0, 'variance': 12.0, 'resources': []},
        'Blob Storage': {'base_cost': 18.0, 'variance': 4.0, 'resources': []},
        'SQL Database': {'base_cost': 35.0, 'variance': 9.0, 'resources': []},
        'Functions': {'base_cost': 4.0, 'variance': 1.5, 'resources': []},
        'Managed Disks': {'base_cost': 12.0, 'variance': 3.0, 'resources': []}
    }
    
    # Define services and daily costs for GCP
    gcp_services = {
        'Compute Engine': {'base_cost': 48.0, 'variance': 11.0, 'resources': []},
        'Cloud Storage': {'base_cost': 22.0, 'variance': 6.0, 'resources': []},
        'Cloud SQL': {'base_cost': 32.0, 'variance': 7.0, 'resources': []},
        'Cloud Functions': {'base_cost': 6.0, 'variance': 2.0, 'resources': []},
        'Persistent Disk': {'base_cost': 11.0, 'variance': 2.5, 'resources': []}
    }
    
    # Map providers to services
    provider_services = {
        'AWS': aws_services,
        'Azure': azure_services,
        'GCP': gcp_services
    }
    
    # Generate resources for each service
    for provider, services in provider_services.items():
        for service_name, service_info in services.items():
            # Create between 3-10 resources for each service
            num_resources = random.randint(3, 10)
            service_info['resources'] = create_sample_resources(0, service_name, num_resources)
    
    # Generate daily cost data for each account
    end_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    start_date = end_date - timedelta(days=days)
    
    print(f"Generating cost data from {start_date.date()} to {end_date.date()}")
    
    total_records = 0
    
    for account in accounts:
        print(f"Processing account: {account.name} (ID: {account.id})")
        
        if account.provider not in provider_services:
            print(f"  Unknown provider: {account.provider}. Skipping.")
            continue
        
        services = provider_services[account.provider]
        
        # Create cost entries for each day, service, and resource
        current_date = start_date
        while current_date < end_date:
            for service_name, service_info in services.items():
                for resource_id in service_info['resources']:
                    # Base cost with some variance
                    base_cost = service_info['base_cost']
                    variance = service_info['variance']
                    
                    # Add weekly pattern - higher on weekdays
                    weekday_factor = 1.0 if current_date.weekday() < 5 else 0.7
                    
                    # Add monthly growth trend (3% per month)
                    days_factor = (current_date - start_date).days / 30.0 * 0.03 + 1
                    
                    # Add some randomness
                    random_factor = random.uniform(0.9, 1.1)
                    
                    daily_cost = base_cost * weekday_factor * days_factor * random_factor
                    
                    # Add occasional spikes
                    if random.random() < 0.02:  # 2% chance of a cost spike
                        daily_cost *= random.uniform(1.5, 3.0)
                    
                    # Create tags
                    tags = {
                        "environment": random.choice(["production", "development", "staging", "test"]),
                        "department": random.choice(["engineering", "marketing", "finance", "operations", "research"]),
                        "project": f"project-{random.randint(1, 10)}"
                    }
                    
                    # Create cost data entry
                    cost_entry = CostData(
                        cloud_account_id=account.id,
                        date=current_date,
                        service=service_name,
                        resource_id=resource_id,
                        tags=tags,
                        cost=daily_cost
                    )
                    
                    db.add(cost_entry)
                    total_records += 1
                    
                    # Commit in batches to avoid memory issues
                    if total_records % 1000 == 0:
                        db.commit()
                        print(f"  Committed {total_records} records...")
            
            current_date += timedelta(days=1)
    
    # Commit any remaining records
    db.commit()
    print(f"Done! Generated {total_records} cost data records.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        generate_cost_data(db)
    finally:
        db.close()