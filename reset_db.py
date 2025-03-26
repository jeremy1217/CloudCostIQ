import os
import sys
from datetime import datetime
import importlib
from alembic.config import Config
from alembic import command
from passlib.context import CryptContext

# Add the current directory to the path so imports work
sys.path.append(os.path.abspath("."))

# Import Base and engine first
from backend.database.db import Base, engine, SessionLocal

# Import models from models.py
from backend.models.models import UserModel, RoleModel, CloudCost
from backend.models.resource import CloudResource, ResourceTag

def reset_database():
    print("🗑️ Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("🏗️ Running migrations...")
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")
    
    print("🌱 Seeding database with initial data...")
    session = SessionLocal()
    
    now = datetime.utcnow()
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    # Create admin role
    admin_role = RoleModel(
        name="admin",
        description="Administrator role",
        created_at=now,
        updated_at=now
    )
    session.add(admin_role)
    session.flush()
    
    # Create admin user
    admin_user = UserModel(
        email="jeremy1217@gmail.com",
        username="jeremy1217",
        full_name="Jeremy Hamel",
        hashed_password=pwd_context.hash("admin123"),
        is_active=True,
        created_at=now,
        updated_at=now
    )
    admin_user.roles.append(admin_role)
    session.add(admin_user)
    session.flush()
    
    # Add cloud cost data
    cloud_costs = [
        CloudCost(provider="AWS", service="EC2", cost=120.50, date=now, timestamp=now, user_id=admin_user.id),
        CloudCost(provider="Azure", service="Blob Storage", cost=80.30, date=now, timestamp=now, user_id=admin_user.id),
        CloudCost(provider="GCP", service="Compute Engine", cost=95.75, date=now, timestamp=now, user_id=admin_user.id),
    ]
    session.add_all(cloud_costs)
    session.flush()
    
    # Add mock tags
    mock_tags = [
        ResourceTag(
            key="Environment",
            value="Production",
            created_at=now,
            updated_at=now
        ),
        ResourceTag(
            key="Project",
            value="WebApp",
            created_at=now,
            updated_at=now
        ),
        ResourceTag(
            key="Owner",
            value="DevOps",
            created_at=now,
            updated_at=now
        )
    ]
    session.add_all(mock_tags)
    session.flush()
    
    # Add mock cloud resources
    mock_resources = [
        CloudResource(
            resource_id="i-1234567890abcdef0",
            provider="AWS",
            account_id="123456789012",
            region="us-east-1",
            service="EC2",
            resource_type="Instance",
            name="Web Server",
            status="running",
            creation_date=now,
            last_active=now,
            attributes={"instance_type": "t2.micro", "vpc_id": "vpc-12345678"},
            is_active=True,
            created_at=now,
            updated_at=now
        ),
        CloudResource(
            resource_id="blob-1234567890abcdef0",
            provider="Azure",
            account_id="subscription-123",
            region="eastus",
            service="Blob Storage",
            resource_type="Container",
            name="Data Storage",
            status="active",
            creation_date=now,
            last_active=now,
            attributes={"sku": "Standard_LRS", "access_tier": "Hot"},
            is_active=True,
            created_at=now,
            updated_at=now
        ),
        CloudResource(
            resource_id="instance-1234567890abcdef0",
            provider="GCP",
            account_id="project-123",
            region="us-central1",
            service="Compute Engine",
            resource_type="Instance",
            name="App Server",
            status="running",
            creation_date=now,
            last_active=now,
            attributes={"machine_type": "e2-micro", "network": "default"},
            is_active=True,
            created_at=now,
            updated_at=now
        )
    ]
    
    # Add tags to resources
    for resource in mock_resources:
        resource.tags.extend(mock_tags)
    
    session.add_all(mock_resources)
    session.commit()
    session.close()
    
    print("✅ Database reset and seeded successfully!")

if __name__ == "__main__":
    reset_database()