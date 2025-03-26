from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    company_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    cloud_accounts = relationship("CloudAccount", back_populates="owner")

class CloudAccount(Base):
    __tablename__ = "cloud_accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    provider = Column(String)  # AWS, Azure, GCP
    credentials = Column(JSON)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    owner = relationship("User", back_populates="cloud_accounts")
    cost_data = relationship("CostData", back_populates="cloud_account")

class CostData(Base):
    __tablename__ = "cost_data"

    id = Column(Integer, primary_key=True, index=True)
    cloud_account_id = Column(Integer, ForeignKey("cloud_accounts.id"))
    date = Column(DateTime)
    service = Column(String)
    resource_id = Column(String)
    tags = Column(JSON)
    cost = Column(Float)
    
    cloud_account = relationship("CloudAccount", back_populates="cost_data")