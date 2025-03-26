"""
Script to create the admin user with the specified email.
"""

from sqlalchemy.orm import sessionmaker
from backend.database.db import engine
from backend.models.models import UserModel, RoleModel
from backend.auth.utils import get_password_hash
import logging

logger = logging.getLogger(__name__)

def create_admin():
    """Create admin user with the specified email"""
    try:
        # Create session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Get admin role
        admin_role = db.query(RoleModel).filter(RoleModel.name == "admin").first()
        if not admin_role:
            logger.error("Admin role not found")
            return
        
        # Create admin user
        admin_user = UserModel(
            email="jeremy1217@gmail.com",
            hashed_password=get_password_hash("CloudCostIQ@2024"),
            type="admin",
            role_names=["admin"],
            is_active=True,
            first_name="Jeremy",
            last_name="Hamel"
        )
        
        # Add admin role to user
        admin_user.roles.append(admin_role)
        
        db.add(admin_user)
        db.commit()
        logger.info("Admin user created successfully")
        print("\nAdmin user created successfully!")
        print("Email: jeremy1217@gmail.com")
        print("Password: CloudCostIQ@2024")
        
    except Exception as e:
        logger.error(f"Error creating admin user: {e}")
        if 'db' in locals():
            db.rollback()
    finally:
        if 'db' in locals():
            db.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    create_admin() 