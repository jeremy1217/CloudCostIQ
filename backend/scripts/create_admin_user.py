from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.models.user import UserModel
from backend.models.role import RoleModel
from backend.auth.utils import get_password_hash
import argparse
import logging
import sys

logger = logging.getLogger(__name__)

def create_admin_user(db: Session, email: str, password: str, full_name: str = None):
    """Create a new admin user"""
    try:
        # Check if user already exists
        existing_user = db.query(UserModel).filter(UserModel.email == email).first()
        if existing_user:
            logger.error(f"User with email {email} already exists")
            return False

        # Split full name into first and last name
        first_name = None
        last_name = None
        if full_name:
            parts = full_name.split()
            if len(parts) > 0:
                first_name = parts[0]
                if len(parts) > 1:
                    last_name = ' '.join(parts[1:])

        # Create new user
        hashed_password = get_password_hash(password)
        user = UserModel(
            email=email,
            first_name=first_name or email.split('@')[0],
            last_name=last_name,
            hashed_password=hashed_password,
            is_active=True,
            type='staff'  # Set as staff user
        )

        # Get or create admin role
        admin_role = db.query(RoleModel).filter(RoleModel.name == 'admin').first()
        if not admin_role:
            admin_role = RoleModel(name='admin', description='Administrator role')
            db.add(admin_role)
            db.flush()

        # Add admin role to user
        user.roles.append(admin_role)

        # Save to database
        db.add(user)
        db.commit()

        logger.info(f"Successfully created admin user: {email}")
        return True

    except Exception as e:
        logger.error(f"Error creating admin user: {str(e)}")
        db.rollback()
        return False

def main():
    parser = argparse.ArgumentParser(description='Create a new admin user')
    parser.add_argument('email', help='Email address for the admin user')
    parser.add_argument('password', help='Password for the admin user')
    parser.add_argument('--full-name', help='Full name of the admin user (optional)')
    args = parser.parse_args()

    # Set up logging
    logging.basicConfig(level=logging.INFO)

    # Get database session
    db = next(get_db())

    try:
        if create_admin_user(db, args.email, args.password, args.full_name):
            logger.info("Admin user created successfully")
            sys.exit(0)
        else:
            logger.error("Failed to create admin user")
            sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main() 