import sys
from pathlib import Path

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

from .db import engine, SessionLocal
from .base import Base
from backend.models.models import RoleModel, UserModel
from backend.auth.utils import get_password_hash

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create a new session
    db = SessionLocal()
    
    try:
        # Check if admin role exists
        admin_role = db.query(RoleModel).filter(RoleModel.name == "admin").first()
        if not admin_role:
            # Create admin role
            admin_role = RoleModel(
                name="admin",
                description="Administrator role with full access"
            )
            db.add(admin_role)
            db.commit()
            print("Created admin role")
        else:
            print("Admin role already exists")
            
        # Check if test user exists
        test_user = db.query(UserModel).filter(UserModel.email == "admin@example.com").first()
        if not test_user:
            # Create test user
            test_user = UserModel(
                email="admin@example.com",
                username="admin",
                hashed_password=get_password_hash("test123"),
                is_active=True,
                roles=[admin_role]
            )
            db.add(test_user)
            db.commit()
            print("Created test user")
        else:
            print("Test user already exists")
            
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 