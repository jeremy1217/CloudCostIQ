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
    session.commit()
    session.close()
    
    print("✅ Database reset and seeded successfully!")

if __name__ == "__main__":
    reset_database()