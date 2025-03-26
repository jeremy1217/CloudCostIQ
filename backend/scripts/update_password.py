from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import bcrypt
from backend.models.models import UserModel
from backend.config import settings

# Create database connection
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def update_password():
    db = SessionLocal()
    try:
        # Get the user
        user = db.query(UserModel).filter(UserModel.email == 'jeremy1217@gmail.com').first()
        if not user:
            print("User not found")
            return

        # Generate new password hash
        password = 'CloudCostIQ123!'
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        
        # Update the password
        user.hashed_password = hashed_password
        db.commit()
        print("Password updated successfully")
        print(f"New password: {password}")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_password() 