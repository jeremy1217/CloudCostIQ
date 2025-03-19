from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import bcrypt
from backend.models.user import UserModel
from backend.config import settings
from backend.database.db import Base

# Create database connection
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def reset_database():
    try:
        # Drop all tables
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        
        # Create all tables
        print("Creating all tables...")
        Base.metadata.create_all(bind=engine)
        
        # Create a new session
        db = SessionLocal()
        
        # Create admin user
        print("Creating admin user...")
        admin_user = UserModel(
            email='admin@cloudcostiq.com',
            hashed_password=bcrypt.hashpw('Admin123!'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            is_active=True,
            role_names=['admin'],
            first_name='Admin',
            last_name='User',
            type='admin'
        )
        
        db.add(admin_user)
        db.commit()
        
        print("\nDatabase reset complete!")
        print("\nNew admin user created:")
        print("Email: admin@cloudcostiq.com")
        print("Password: Admin123!")
        
    except Exception as e:
        print(f"Error: {e}")
        if 'db' in locals():
            db.rollback()
    finally:
        if 'db' in locals():
            db.close()

if __name__ == "__main__":
    print("This will reset the entire database. Are you sure? (yes/no)")
    response = input().lower()
    if response == 'yes':
        reset_database()
    else:
        print("Database reset cancelled.") 