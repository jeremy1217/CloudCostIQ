from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from datetime import datetime, timedelta
import random
from database.db import SessionLocal, CostInsight
from ai.anomaly import detect_anomalies
from ai.forecast import predict_future_costs

router = APIRouter()

mock_costs = [
    {"date": "2025-02-20", "cost": 120.50, "service": "EC2"},
    {"date": "2025-02-21", "cost": 98.75, "service": "VM"},
    {"date": "2025-02-22", "cost": 85.20, "service": "Compute Engine"},
    {"date": "2025-02-23", "cost": 500.00, "service": "RDS"},  # Anomaly
    {"date": "2025-02-24", "cost": 92.10, "service": "S3"},
]

# Mock Cost Data (replace this with actual DB retrieval later)
mock_cost_trends = [
    {"date": "2025-02-10", "cost": 100.5, "service": "EC2"},
    {"date": "2025-02-11", "cost": 98.2, "service": "EC2"},
    {"date": "2025-02-12", "cost": 150.7, "service": "EC2"},  # Anomaly
    {"date": "2025-02-13", "cost": 99.9, "service": "EC2"},
    {"date": "2025-02-14", "cost": 97.3, "service": "EC2"},
    {"date": "2025-02-15", "cost": 180.4, "service": "S3"},  # Anomaly
    {"date": "2025-02-16", "cost": 101.2, "service": "S3"},
]

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def generate_mock_costs():
    today = datetime.today()
    cost_trend = [
        {"date": (today - timedelta(days=i)).strftime("%Y-%m-%d"), "cost": round(random.uniform(50, 200), 2)}
        for i in range(7)
    ]
    return cost_trend

@router.get("/mock-insights")
def get_mock_insights():
    try:
        anomalies = detect_anomalies(mock_cost_trends)
    except Exception as e:
        print(f"Error in anomaly detection: {e}")
        anomalies = []  # Ensure anomalies is always defined

    return {
        "cost_trends": mock_cost_trends,
        "anomalies": anomalies
    }
    # Detect anomalies
    anomaly_indices = detect_anomalies(costs)
    anomalies = [
        {"date": cost_trend[i]["date"], "service": "EC2", "anomaly": "Cost spike detected"}
        for i in anomaly_indices
    ]

    # Store insights in the database
    for entry in cost_trend:
        db.add(CostInsight(provider="AWS", service="EC2", cost=entry["cost"], date=datetime.strptime(entry["date"], "%Y-%m-%d")))
    db.commit()

    # Predict future costs
    future_costs = predict_future_costs(cost_trend)

    return {
        "cost_trends": cost_trend,
        "anomalies": anomalies,
        "recommendations": [
            {"service": "EC2", "suggestion": "Consider reserved instances to reduce costs"},
            {"service": "Storage", "suggestion": "Archive infrequent data to lower-cost tiers"}
        ],
        "predicted_costs": future_costs
    }

@router.get("/anomalies")
def get_anomalies(db: Session = Depends(get_db)):
    """Detect and return cost anomalies"""
    return detect_anomalies(db)

@router.get("/cost-breakdown", response_model=None)
def get_cost_breakdown(db: Session = Depends(get_db)): 
    # Explicitly declare SQL query as text
    cost_data = db.execute(text("SELECT provider, service, cost FROM cost_insights")).fetchall()
    
    # Format data properly
    breakdown = [{"provider": row[0], "service": row[1], "cost": row[2]} for row in cost_data]

    return {"cost_breakdown": breakdown}
