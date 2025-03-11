"""
Database initialization script to populate mock data for development.
"""

# Standard library imports
from datetime import datetime, timedelta
import os
import sys
import json
import random
import uuid
from pathlib import Path

# Third-party imports
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from sqlalchemy.exc import IntegrityError

# Configure path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

# Local imports
from backend.database.db import engine
from backend.models.cloud_cost import CloudCost
from backend.models.recommendation import Recommendation
from backend.models.user import UserModel, RoleModel, ApiKeyModel

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_password_hash(password):
    return pwd_context.hash(password)

# Create database session
session = Session(bind=engine)

# Generate sample data
def seed_database():
    """Seed database with sample data for all models"""
    print("🌱 Starting database seeding...")
    
    # --- 1. Create Roles (super cautious approach - one by one) ---
    print("👥 Creating roles...")
    
    # First check if each role exists and only create if missing
    admin_role = session.query(RoleModel).filter_by(name="admin").first()
    if not admin_role:
        try:
            admin_role = RoleModel(
                name="admin",
                description="Administrator with full access",
                permissions=["read", "write", "delete", "admin"]
            )
            session.add(admin_role)
            session.commit()
            print("  ✅ Admin role created")
        except IntegrityError:
            session.rollback()
            print("  ⚠️ Admin role already exists")
            admin_role = session.query(RoleModel).filter_by(name="admin").first()
    else:
        print("  ⚠️ Admin role already exists")
    
    user_role = session.query(RoleModel).filter_by(name="user").first()
    if not user_role:
        try:
            user_role = RoleModel(
                name="user",
                description="Standard user with limited access",
                permissions=["read", "write"]
            )
            session.add(user_role)
            session.commit()
            print("  ✅ User role created")
        except IntegrityError:
            session.rollback()
            print("  ⚠️ User role already exists")
            user_role = session.query(RoleModel).filter_by(name="user").first()
    else:
        print("  ⚠️ User role already exists")
    
    viewer_role = session.query(RoleModel).filter_by(name="viewer").first()
    if not viewer_role:
        try:
            viewer_role = RoleModel(
                name="viewer",
                description="Read-only access",
                permissions=["read"]
            )
            session.add(viewer_role)
            session.commit()
            print("  ✅ Viewer role created")
        except IntegrityError:
            session.rollback()
            print("  ⚠️ Viewer role already exists")
            viewer_role = session.query(RoleModel).filter_by(name="viewer").first()
    else:
        print("  ⚠️ Viewer role already exists")
    
    # --- 2. Create Users ---
    print("👤 Creating users...")
    
    # Check if each user exists and create only if missing
    admin_user = session.query(UserModel).filter_by(username="admin").first()
    if not admin_user:
        try:
            admin_user = UserModel(
                username="admin",
                email="admin@example.com",
                full_name="Admin User",
                hashed_password=get_password_hash("adminpassword"),
                is_active=True
            )
            if admin_role:
                admin_user.roles.append(admin_role)
            session.add(admin_user)
            session.commit()
            print("  ✅ Admin user created")
        except IntegrityError:
            session.rollback()
            print("  ⚠️ Admin user already exists")
            admin_user = session.query(UserModel).filter_by(username="admin").first()
    else:
        print("  ⚠️ Admin user already exists")
    
    regular_user = session.query(UserModel).filter_by(username="user").first()
    if not regular_user:
        try:
            regular_user = UserModel(
                username="user",
                email="user@example.com",
                full_name="Regular User",
                hashed_password=get_password_hash("userpassword"),
                is_active=True
            )
            if user_role:
                regular_user.roles.append(user_role)
            session.add(regular_user)
            session.commit()
            print("  ✅ Regular user created")
        except IntegrityError:
            session.rollback()
            print("  ⚠️ Regular user already exists")
            regular_user = session.query(UserModel).filter_by(username="user").first()
    else:
        print("  ⚠️ Regular user already exists")
    
    # --- 3. Create Cloud Costs ---
    print("💸 Creating cloud costs...")
    
    # Check if we already have cloud costs
    existing_costs = session.query(CloudCost).count()
    if existing_costs > 0:
        print(f"  ⚠️ Already have {existing_costs} cloud cost records, skipping")
    else:
        cloud_costs = []
        
        # Generate costs for just 7 days to keep it simple
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        providers = ["AWS", "Azure", "GCP"]
        services = {
            "AWS": ["EC2", "S3"],
            "Azure": ["VM", "Storage"],
            "GCP": ["Compute Engine", "Cloud Storage"]
        }
        
        for provider in providers:
            for service in services[provider]:
                # Base daily cost for this service
                base_cost = random.uniform(50, 200)
                
                # Generate daily costs
                current_date = start_date
                while current_date <= end_date:
                    # Simple random variation
                    daily_cost = base_cost * random.uniform(0.8, 1.2)
                    
                    cloud_cost = CloudCost(
                        provider=provider,
                        service=service,
                        cost=round(daily_cost, 2),
                        date=current_date.strftime("%Y-%m-%d")
                    )
                    cloud_costs.append(cloud_cost)
                    
                    # Move to next day
                    current_date += timedelta(days=1)
        
        # Add all at once - we already checked that no costs exist
        try:
            session.add_all(cloud_costs)
            session.commit()
            print(f"  ✅ Added {len(cloud_costs)} cloud cost records")
        except Exception as e:
            session.rollback()
            print(f"  ❌ Error adding cloud costs: {str(e)}")
    
    # --- 4. Create Recommendations ---
    print("💡 Creating recommendations...")
    
    # Check if we already have recommendations
    existing_recs = session.query(Recommendation).count()
    if existing_recs > 0:
        print(f"  ⚠️ Already have {existing_recs} recommendation records, skipping")
    else:
        # Just create a couple of recommendations
        recommendations = [
            Recommendation(
                provider="AWS",
                service="EC2", 
                suggestion="Use Reserved Instances", 
                command="aws ec2 modify-instance-attribute ...", 
                savings=15.0
            ),
            Recommendation(
                provider="Azure",
                service="VM", 
                suggestion="Use Azure Reserved VM Instances", 
                command="az vm ...", 
                savings=25.0
            )
        ]
        
        try:
            session.add_all(recommendations)
            session.commit()
            print(f"  ✅ Added {len(recommendations)} recommendation records")
        except Exception as e:
            session.rollback()
            print(f"  ❌ Error adding recommendations: {str(e)}")
    
    print("✅ Database seeding completed successfully!")
    print(f"📊 Summary of created data:")
    print(f"  - Users: {session.query(UserModel).count()}")
    print(f"  - Roles: {session.query(RoleModel).count()}")
    print(f"  - Cloud Costs: {session.query(CloudCost).count()}")
    print(f"  - Recommendations: {session.query(Recommendation).count()}")

# Main execution
if __name__ == "__main__":
    seed_database()