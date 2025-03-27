# backend/scripts/create_cloud_accounts.py
import sys
import os
import json
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import User, CloudAccount

def create_cloud_accounts(email):
    """Create sample cloud accounts for a user"""
    db = SessionLocal()
    try:
        # Find the user
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"User with email {email} not found.")
            return
        
        # Sample AWS account
        aws_account = CloudAccount(
            name="AWS Production",
            provider="AWS",
            credentials={
                "access_key_id": "sample-access-key",
                "secret_access_key": "sample-secret-key",
                "region": "us-west-2"
            },
            owner_id=user.id,
            created_at=datetime.utcnow()
        )
        
        # Sample Azure account
        azure_account = CloudAccount(
            name="Azure Development",
            provider="Azure",
            credentials={
                "tenant_id": "sample-tenant-id",
                "client_id": "sample-client-id",
                "client_secret": "sample-client-secret"
            },
            owner_id=user.id,
            created_at=datetime.utcnow()
        )
        
        # Sample GCP account
        gcp_account = CloudAccount(
            name="GCP Analytics",
            provider="GCP",
            credentials={
                "project_id": "sample-project-id",
                "service_account_key": "sample-service-account-key"
            },
            owner_id=user.id,
            created_at=datetime.utcnow()
        )
        
        db.add(aws_account)
        db.add(azure_account)
        db.add(gcp_account)
        db.commit()
        
        print(f"Created 3 cloud accounts for user {email}:")
        print(f"  - AWS Production (ID: {aws_account.id})")
        print(f"  - Azure Development (ID: {azure_account.id})")
        print(f"  - GCP Analytics (ID: {gcp_account.id})")
        
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python create_cloud_accounts.py <user_email>")
        sys.exit(1)
    
    email = sys.argv[1]
    create_cloud_accounts(email)