"""
Database initialization script to populate mock data for development.
"""

# Standard library imports
from pathlib import Path
import os
import sys

# Local imports
from backend.database.db import SessionLocal, Base, engine
from backend.models.cloud_cost import CloudCost
from backend.models.recommendation import Recommendation
from backend.services.mock_data import populate_db_with_mock_data

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

def init_db():
    """Initialize the database with mock data"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    print("Populating database with mock data...")
    db = SessionLocal()
    
    try:
        # Check if database is already populated
        cost_count = db.query(CloudCost).count()
        
        if cost_count > 0:
            print(f"Database already contains {cost_count} cost records.")
            user_input = input("Do you want to clear and repopulate? (y/n): ")
            
            if user_input.lower() != 'y':
                print("Aborted. Database left unchanged.")
                return
            
            # Clear existing data
            print("Clearing existing data...")
            db.query(Recommendation).delete()
            db.query(CloudCost).delete()
            db.commit()
        
        # Populate with mock data
        models = {
            "CloudCost": CloudCost,
            "Recommendation": Recommendation
        }
        
        populate_db_with_mock_data(db, days=90, models=models)
        
        # Verify population
        cost_count = db.query(CloudCost).count()
        rec_count = db.query(Recommendation).count()
        
        print(f"Successfully populated database with {cost_count} cost records and {rec_count} recommendations.")
        
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()