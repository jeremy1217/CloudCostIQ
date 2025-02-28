import sys
import os
from sqlalchemy.orm import Session
from backend.database.db import engine
from backend.models.cloud_cost import CloudCost
from backend.models.recommendations import Recommendation

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

# Create database session
session = Session(bind=engine)

# Insert mock data
cloud_cost_data = [
    CloudCost(provider="AWS", service="EC2", cost=120.50),
    CloudCost(provider="Azure", service="Blob Storage", cost=80.30),
]

recommendation_data = [
    Recommendation(provider="AWS", service="EC2", suggestion="Use Reserved Instances", command="aws ec2 modify-instance-attribute ...", savings=15.0),
]

session.add_all(cloud_cost_data)
session.add_all(recommendation_data)

session.commit()
session.close()
print("✅ Data seeded successfully!")
