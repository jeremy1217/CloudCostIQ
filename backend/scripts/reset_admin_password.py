# scripts/reset_admin_password.py
import sys
import os

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import User
from app.core.security import get_password_hash

def reset_admin_password(email, new_password):
    db = SessionLocal()
    try:
        # Find the admin user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User {email} not found.")
            return
        
        # Update password
        user.hashed_password = get_password_hash(new_password)
        db.add(user)
        db.commit()
        print(f"Password for user {email} has been reset.")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python reset_admin_password.py <email> <new_password>")
        sys.exit(1)
    
    email = sys.argv[1]
    new_password = sys.argv[2]
    
    reset_admin_password(email, new_password)