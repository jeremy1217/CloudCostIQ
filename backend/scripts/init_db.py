from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database.db import Base
from backend.models.user import UserModel
from backend.models.plan import PlanModel
from backend.models.subscription import SubscriptionModel
from backend.config import settings
import logging
from datetime import datetime, timedelta, UTC
from backend.models.role import RoleModel
import os
from backend.auth.utils import get_password_hash  # Import the password hashing function

logger = logging.getLogger(__name__)

DEFAULT_PLANS = [
    {
        "name": "standard",
        "description": "Standard plan with basic features",
        "price": 49.99,
        "features": {
            "basic_analytics": "full",
            "cost_attribution": "readonly",
            "export_formats": ["csv"],
            "report_generation": "basic"
        },
        "limits": {
            "data_retention_days": 30,
            "cloud_accounts_limit": 3,
            "api_rate_limit": 1000
        }
    },
    {
        "name": "professional",
        "description": "Professional plan with advanced features",
        "price": 199.99,
        "features": {
            "basic_analytics": "full",
            "cost_attribution": "full",
            "advanced_analytics": "basic",
            "export_formats": ["csv", "excel", "pdf"],
            "report_generation": "advanced",
            "team_management": "basic"
        },
        "limits": {
            "data_retention_days": 90,
            "cloud_accounts_limit": 10,
            "api_rate_limit": 10000
        }
    },
    {
        "name": "enterprise",
        "description": "Enterprise plan with all features",
        "price": 999.99,
        "features": {
            "basic_analytics": "full",
            "cost_attribution": "full",
            "advanced_analytics": "full",
            "ai_insights": "full",
            "export_formats": ["csv", "excel", "pdf", "custom"],
            "report_generation": "full",
            "team_management": "full",
            "custom_integrations": "full"
        },
        "limits": {
            "data_retention_days": -1,  # Unlimited
            "cloud_accounts_limit": -1,  # Unlimited
            "api_rate_limit": -1        # Unlimited
        }
    }
]

def init_database():
    """Initialize the database and create tables"""
    try:
        # Create engine
        engine = create_engine(settings.DATABASE_URL)
        
        # Drop all existing tables first
        Base.metadata.drop_all(bind=engine)
        logger.info("Dropped all existing tables")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Created all tables")
        
        # Create session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Create default roles
        default_roles = [
            {
                "name": "admin",
                "description": "Full system access",
                "permissions": ["*"]  # Wildcard for all permissions
            },
            {
                "name": "staff",
                "description": "Staff member with elevated access",
                "permissions": ["view_users", "manage_users", "view_analytics"]
            },
            {
                "name": "user",
                "description": "Standard user",
                "permissions": ["view_own_data", "manage_own_account"]
            }
        ]
        
        for role_data in default_roles:
            role_exists = db.query(RoleModel).filter(RoleModel.name == role_data["name"]).first()
            if not role_exists:
                role = RoleModel(**role_data)
                db.add(role)
                logger.info(f"Created role: {role_data['name']}")
        
        db.commit()
        logger.info("Committed roles to database")
        
        # Create default plans
        for plan_data in DEFAULT_PLANS:
            plan_exists = db.query(PlanModel).filter(PlanModel.name == plan_data["name"]).first()
            if not plan_exists:
                plan = PlanModel(**plan_data)
                db.add(plan)
                logger.info(f"Created plan: {plan_data['name']}")
        
        db.commit()
        logger.info("Committed plans to database")
        
        # Check if we need to create a default admin user
        admin_exists = db.query(UserModel).filter(UserModel.email == "admin@cloudcostiq.com").first()
        logger.info(f"Checking for existing admin user: {'Found' if admin_exists else 'Not found'}")
        
        if not admin_exists:
            # Create default admin user with properly hashed password
            hashed_password = get_password_hash("admin123")
            admin_user = UserModel(
                email="admin@cloudcostiq.com",
                type="staff",
                role_names=["admin"],  # Set initial role names
                is_active=True,
                hashed_password=hashed_password
            )
            db.add(admin_user)
            logger.info("Added admin user to session")
            db.commit()
            logger.info("Committed admin user to database")
            
            # Verify admin user was created
            created_admin = db.query(UserModel).filter(UserModel.email == "admin@cloudcostiq.com").first()
            if created_admin:
                logger.info(f"Verified admin user creation - ID: {created_admin.id}")
            else:
                logger.error("Failed to create admin user!")
            
            # Add admin role to user
            admin_role = db.query(RoleModel).filter(RoleModel.name == "admin").first()
            if admin_role:
                admin_user.add_role(admin_role)
                logger.info("Added admin role to user")
            else:
                logger.error("Admin role not found!")
            
            # Add enterprise subscription for admin
            enterprise_plan = db.query(PlanModel).filter(PlanModel.name == "enterprise").first()
            if enterprise_plan:
                admin_subscription = SubscriptionModel(
                    user_id=admin_user.id,
                    plan_id=enterprise_plan.id,
                    status="active",
                    current_period_start=datetime.now(UTC),
                    current_period_end=datetime.now(UTC) + timedelta(days=365)
                )
                db.add(admin_subscription)
                logger.info("Added enterprise subscription to admin user")
            else:
                logger.error("Enterprise plan not found!")
            
            db.commit()
            logger.info("Committed all admin user relations to database")
            
            # Final verification
            final_admin = db.query(UserModel).filter(UserModel.email == "admin@cloudcostiq.com").first()
            if final_admin:
                logger.info(f"Final verification - Admin user exists with roles: {final_admin.role_names}")
                logger.info(f"Admin user password hash: {final_admin.hashed_password[:20]}...")  # Log part of the hash for verification
            else:
                logger.error("Final verification failed - Admin user not found!")
        
        logger.info("Database initialized successfully")
        
        # List all users in database for verification
        all_users = db.query(UserModel).all()
        logger.info(f"Total users in database: {len(all_users)}")
        for user in all_users:
            logger.info(f"User: {user.email} (ID: {user.id})")
        
        return True
        
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        return False

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_database() 