from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.models.user import UserModel
from backend.models.role import RoleModel
import argparse
import logging
import sys

logger = logging.getLogger(__name__)

def setup_admin_user(db: Session, email: str):
    """Set up or verify admin user access"""
    try:
        # Find user by email
        user = db.query(UserModel).filter(UserModel.email == email).first()
        
        if not user:
            logger.error(f"No user found with email: {email}")
            return False
            
        # Update user type and roles
        user.type = 'staff'  # Ensure user is not marked as customer
        
        # Get or create admin role
        admin_role = db.query(RoleModel).filter(RoleModel.name == 'admin').first()
        if not admin_role:
            admin_role = RoleModel(name='admin', description='Administrator role')
            db.add(admin_role)
            db.flush()
        
        # Add admin role if not present
        if admin_role not in user.roles:
            user.roles.append(admin_role)
            
        # Ensure user has an active account
        user.is_active = True
        
        # Save changes
        db.commit()
        
        logger.info(f"Successfully set up admin access for user: {email}")
        logger.info(f"User type: {user.type}")
        logger.info(f"User roles: {[role.name for role in user.roles]}")
        
        return True
        
    except Exception as e:
        logger.error(f"Error setting up admin user: {str(e)}")
        db.rollback()
        return False

def verify_admin_access(db: Session, email: str):
    """Verify that the user has proper admin access"""
    try:
        user = db.query(UserModel).filter(UserModel.email == email).first()
        
        if not user:
            logger.error(f"No user found with email: {email}")
            return False
            
        # Check all required conditions
        has_admin_role = any(role.name == 'admin' for role in user.roles)
        is_staff = user.type == 'staff'
        is_active = user.is_active
        
        logger.info(f"Admin access verification for user: {email}")
        logger.info(f"Has admin role: {has_admin_role}")
        logger.info(f"Is staff: {is_staff}")
        logger.info(f"Is active: {is_active}")
        
        return has_admin_role and is_staff and is_active
        
    except Exception as e:
        logger.error(f"Error verifying admin access: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Set up admin user access')
    parser.add_argument('email', help='Email address of the user to grant admin access')
    parser.add_argument('--verify-only', action='store_true', help='Only verify access without making changes')
    args = parser.parse_args()
    
    # Set up logging
    logging.basicConfig(level=logging.INFO)
    
    # Get database session
    db = next(get_db())
    
    try:
        if args.verify_only:
            if verify_admin_access(db, args.email):
                logger.info("User has proper admin access")
                sys.exit(0)
            else:
                logger.error("User does not have proper admin access")
                sys.exit(1)
        else:
            if setup_admin_user(db, args.email):
                if verify_admin_access(db, args.email):
                    logger.info("Admin access successfully set up and verified")
                    sys.exit(0)
                else:
                    logger.error("Admin setup completed but verification failed")
                    sys.exit(1)
            else:
                logger.error("Failed to set up admin access")
                sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main() 