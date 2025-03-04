from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON, Index, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.db import Base

class BudgetAlert(Base):
    __tablename__ = "budget_alerts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    provider = Column(String, nullable=True, index=True)  # Can be null for cross-provider budgets
    service = Column(String, nullable=True, index=True)  # Can be null for cross-service budgets
    account_id = Column(String, nullable=True, index=True)  # Can be null for cross-account budgets
    tag_key = Column(String, nullable=True)  # For tag-based budgets
    tag_value = Column(String, nullable=True)  # For tag-based budgets
    time_period = Column(String, nullable=False)  # monthly, quarterly, etc.
    amount = Column(Float, nullable=False)  # Budget amount
    threshold_percentage = Column(Float, nullable=False)  # Threshold to trigger alert
    current_usage = Column(Float, nullable=True)  # Current usage towards budget
    last_evaluated = Column(DateTime, nullable=True)
    status = Column(String, nullable=False, default="active", index=True)  # active, inactive
    email_recipients = Column(JSON, nullable=True)  # List of email addresses
    webhook_url = Column(String, nullable=True)  # Webhook URL for notifications
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "provider": self.provider,
            "service": self.service,
            "account_id": self.account_id,
            "tag_key": self.tag_key,
            "tag_value": self.tag_value,
            "time_period": self.time_period,
            "amount": self.amount,
            "threshold_percentage": self.threshold_percentage,
            "current_usage": self.current_usage,
            "last_evaluated": self.last_evaluated.isoformat() if self.last_evaluated else None,
            "status": self.status,
            "email_recipients": self.email_recipients,
            "webhook_url": self.webhook_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class AlertHistory(Base):
    __tablename__ = "alert_history"

    id = Column(Integer, primary_key=True, index=True)
    budget_id = Column(Integer, ForeignKey("budget_alerts.id"), nullable=True, index=True)
    anomaly_id = Column(Integer, ForeignKey("cost_anomalies.id"), nullable=True, index=True)
    alert_type = Column(String, nullable=False, index=True)  # budget, anomaly, etc.
    severity = Column(String, nullable=False, index=True)  # high, medium, low
    message = Column(Text, nullable=False)
    data = Column(JSON, nullable=True)  # Additional alert data
    acknowledged = Column(Boolean, default=False, index=True)
    acknowledged_at = Column(DateTime, nullable=True)
    acknowledged_by = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    
    # Relationships
    budget = relationship("BudgetAlert", backref="alerts")
    anomaly = relationship("CostAnomaly", backref="alerts")
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "budget_id": self.budget_id,
            "anomaly_id": self.anomaly_id,
            "alert_type": self.alert_type,
            "severity": self.severity,
            "message": self.message,
            "data": self.data,
            "acknowledged": self.acknowledged,
            "acknowledged_at": self.acknowledged_at.isoformat() if self.acknowledged_at else None,
            "acknowledged_by": self.acknowledged_by,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }