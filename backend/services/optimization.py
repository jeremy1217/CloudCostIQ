from database.db import SessionLocal
from models.cloud_cost import CloudCost

def rightsizing_recommendation():
    """Suggest cost optimizations"""
    db = SessionLocal()
    costs = db.query(CloudCost).all()
    db.close()

    recommendations = []
    for cost in costs:
        if cost.cost > 500:  # Mock rule: If cost > $500, suggest downsizing
            recommendations.append(
                {"service": cost.service, "recommendation": "Consider switching to a reserved instance"}
            )
    
    return recommendations
