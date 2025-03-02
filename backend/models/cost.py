from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Index, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class Cost(Base):
    __tablename__ = "costs"
    
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    service = Column(String(100), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    region = Column(String(50), index=True)
    resource_id = Column(String(100), index=True)
    tags = Column(JSON)  # Store tags as JSON
    account_id = Column(String(50), index=True)
    usage_type = Column(String(100))
    usage_quantity = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Create indexes for common queries
    __table_args__ = (
        Index('ix_timestamp_service_account', timestamp, service, account_id),
        Index('ix_tags_timestamp', 'tags', timestamp, postgresql_using='gin'),
    )

# app/models/anomaly.py
class Anomaly(Base):
    __tablename__ = "anomalies"
    
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, nullable=False)
    service = Column(String(100), nullable=False)
    resource_id = Column(String(100))
    description = Column(String(500), nullable=False)
    base_cost = Column(Float, nullable=False)
    anomaly_cost = Column(Float, nullable=False)
    deviation = Column(Float, nullable=False)
    status = Column(String(20), default='open')  # open, investigating, resolved, dismissed
    confidence = Column(String(20))  # low, medium, high
    pattern = Column(String(20))  # spike, sustained, recurring, gradual
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.datetime.utcnow)

# app/models/forecast.py
class Forecast(Base):
    __tablename__ = "forecasts"
    
    id = Column(Integer, primary_key=True)
    target_date = Column(DateTime, nullable=False)
    forecasted_on = Column(DateTime, nullable=False)
    service = Column(String(100))  # Null means all services
    account_id = Column(String(50))  # Null means all accounts
    predicted_amount = Column(Float, nullable=False)
    confidence_lower = Column(Float)
    confidence_upper = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# app/models/tag_policy.py
class TagPolicy(Base):
    __tablename__ = "tag_policies"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    required = Column(Boolean, default=False)
    valid_values = Column(JSON)  # Array of valid values
    apply_to = Column(JSON)  # Array of resource types
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.datetime.utcnow)