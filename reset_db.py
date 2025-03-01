import os
import sys
from datetime import datetime
import importlib

# Add the current directory to the path so imports work
sys.path.append(os.path.abspath("."))

# Import Base and engine first
from backend.database.db import Base, engine, SessionLocal

# Then import models
from backend.models.cloud_cost import CloudCost
from backend.models.recommendation import Recommendation

def reset_database():
    print("🗑️ Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("🏗️ Creating tables from models...")
    Base.metadata.create_all(bind=engine)
    
    print("🌱 Seeding database with initial data...")
    session = SessionLocal()
    
    now = datetime.utcnow()
    
    # Add cloud cost data
    cloud_costs = [
        CloudCost(provider="AWS", service="EC2", cost=120.50, timestamp=now),
        CloudCost(provider="Azure", service="Blob Storage", cost=80.30, timestamp=now),
        CloudCost(provider="GCP", service="Compute Engine", cost=95.75, timestamp=now),
    ]
    
    # Add recommendations
    recommendations = [
        Recommendation(provider="AWS", service="EC2", suggestion="Use Reserved Instances", 
                    command="aws ec2 modify-instance-attribute ...", savings=15.0, 
                    applied=False, timestamp=now),
        Recommendation(provider="Azure", service="Blob Storage", suggestion="Optimize storage usage", 
                    command="az storage blob set-tier ...", savings=10.0, 
                    applied=False, timestamp=now),
    ]
    
    session.add_all(cloud_costs)
    session.add_all(recommendations)
    session.commit()
    session.close()
    
    print("✅ Database reset and seeded successfully!")

if __name__ == "__main__":
    reset_database()