import sys
import os

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.db.models import User

def list_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        
        if not users:
            print("No users found in the database.")
            return
        
        print(f"Found {len(users)} users:")
        print("-" * 80)
        print(f"{'ID':<5} {'Email':<30} {'Name':<25} {'Admin':<10} {'Active':<10}")
        print("-" * 80)
        
        for user in users:
            print(f"{user.id:<5} {user.email:<30} {user.full_name:<25} {'Yes' if user.is_admin else 'No':<10} {'Yes' if user.is_active else 'No':<10}")
            
    finally:
        db.close()

if __name__ == "__main__":
    list_users()