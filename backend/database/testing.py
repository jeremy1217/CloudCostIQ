import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from typing import Generator
import os
from contextlib import contextmanager

from .db import Base, get_db
from .models import User, Role, ApiKey, CloudConnection

class TestDatabase:
    def __init__(self):
        # Use PostgreSQL test database
        self.engine = create_engine(
            'postgresql://postgres:postgres@localhost:5432/cloudcostiq_test',
            poolclass=StaticPool
        )
        self.TestingSessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine
        )

    def setup(self):
        """Create all tables in the test database."""
        Base.metadata.create_all(bind=self.engine)

    def teardown(self):
        """Drop all tables from the test database."""
        Base.metadata.drop_all(bind=self.engine)

    @contextmanager
    def get_test_db(self):
        """Get a test database session."""
        db = self.TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    def create_test_user(self, email: str = "test@example.com", password: str = "testpass") -> User:
        """Create a test user with default values."""
        with self.get_test_db() as db:
            user = User(
                email=email,
                username=email.split('@')[0],
                hashed_password=password,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            return user

    def create_test_role(self, name: str = "test_role") -> Role:
        """Create a test role."""
        with self.get_test_db() as db:
            role = Role(name=name, description="Test role")
            db.add(role)
            db.commit()
            db.refresh(role)
            return role

@pytest.fixture(scope="session")
def test_db():
    """Fixture to provide a test database instance."""
    db = TestDatabase()
    db.setup()
    yield db
    db.teardown()

@pytest.fixture
def db_session(test_db):
    """Fixture to provide a database session for each test."""
    with test_db.get_test_db() as session:
        yield session
        session.rollback()

@pytest.fixture
def test_user(test_db):
    """Fixture to provide a test user."""
    return test_db.create_test_user()

@pytest.fixture
def test_role(test_db):
    """Fixture to provide a test role."""
    return test_db.create_test_role()

def override_get_db():
    """Override the get_db dependency for testing."""
    try:
        db = TestDatabase().TestingSessionLocal()
        yield db
    finally:
        db.close()

class DatabaseTestMixin:
    """Mixin class for database tests."""
    
    @pytest.fixture(autouse=True)
    def setup_db(self, test_db, db_session):
        self.db = test_db
        self.session = db_session
        yield
        self.session.rollback()

    def create_test_data(self):
        """Create test data for the test case."""
        pass

    def cleanup_test_data(self):
        """Clean up test data after the test case."""
        pass 