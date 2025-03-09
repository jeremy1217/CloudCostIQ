# Standard library imports
from datetime import datetime, timedelta
import os

# Third-party imports
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import pytest

# Local imports
from backend.database.db import Base
from backend.models.cloud_cost import CloudCost
from backend.models.recommendation import Recommendation
from backend.services.mock_data import generate_mock_costs, generate_mock_recommendations

# Test database URL
TEST_DATABASE_URL = "sqlite:///./test.db"

def get_test_db():
    """Create a test database and session"""
    engine = create_engine(
        TEST_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create a session
    db = TestingSessionLocal()
    
    try:
        yield db
    finally:
        db.close()
        # Drop all tables after tests
        Base.metadata.drop_all(bind=engine)

def seed_test_db(db: Session):
    """Seed the test database with mock data"""
    # Generate mock costs
    mock_costs = generate_mock_costs(days=30)
    
    # Add to database
    for cost_data in mock_costs:
        cloud_cost = CloudCost(
            provider=cost_data["provider"],
            service=cost_data["service"],
            cost=cost_data["cost"],
            date=cost_data["date"]
        )
        db.add(cloud_cost)
    
    # Generate mock recommendations
    mock_recommendations = generate_mock_recommendations(count=5)
    
    # Add to database
    for rec_data in mock_recommendations:
        recommendation = Recommendation(
            provider=rec_data["provider"],
            service=rec_data["service"],
            suggestion=rec_data["suggestion"],
            command=rec_data["command"],
            savings=rec_data["savings"],
            applied=rec_data["applied"]
        )
        db.add(recommendation)
    
    # Commit changes
    db.commit()

# Pytest fixture for database testing
@pytest.fixture
def test_db():
    """Pytest fixture for database testing"""
    engine = create_engine(
        TEST_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create a session
    db = TestingSessionLocal()
    
    try:
        yield db
    finally:
        db.close()
        # Drop all tables after tests
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def seeded_test_db(test_db):
    """Pytest fixture for a seeded test database"""
    seed_test_db(test_db)
    return test_db