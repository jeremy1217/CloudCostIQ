import sys
import os

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.db.models import User
from app.core.security import get_password_hash

def create_admin_user(email, password, full_name):
    db = SessionLocal()
    try:
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"User {email} already exists.")
            if not user.is_admin:
                user.is_admin = True
                db.add(user)
                db.commit()
                print(f"User {email} is now an admin.")
            else:
                print(f"User {email} is already an admin.")
            return
        
        # Create new admin user
        db_user = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            is_active=True,
            is_admin=True
        )
        db.add(db_user)
        db.commit()
        print(f"Admin user {email} created successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python create_admin.py <email> <password> <full_name>")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    full_name = sys.argv[3]
    
    create_admin_user(email, password, full_name)