from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import bcrypt
from backend.models.user import UserModel
from backend.config import settings

# Create database connection
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_test_user():
    db = SessionLocal()
    try:
        # Check if test user already exists
        existing_user = db.query(UserModel).filter(UserModel.email == 'test@example.com').first()
        if existing_user:
            print("Test user already exists")
            return

        # Create new test user
        test_user = UserModel(
            email='test@example.com',
            hashed_password=bcrypt.hashpw('Test123!'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            is_active=True,
            role_names=['admin'],
            first_name='Test',
            last_name='User'
        )
        
        db.add(test_user)
        db.commit()
        print("Test user created successfully")
        print("Email: test@example.com")
        print("Password: Test123!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user() 