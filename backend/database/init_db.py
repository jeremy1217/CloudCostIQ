import sys
from pathlib import Path

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

from config import settings
from .db import engine, SessionLocal, Base
from .models import Role  # Import Role after Base is configured

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create a new session
    db = SessionLocal()
    
    try:
        # Check if admin role exists
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if not admin_role:
            # Create admin role
            admin_role = Role(
                name="admin",
                description="Administrator role with full access"
            )
            db.add(admin_role)
            db.commit()
            print("Created admin role")
        else:
            print("Admin role already exists")
            
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 