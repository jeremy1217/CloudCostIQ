# Third-party imports
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Local imports
from backend.ai.optimizer import generate_optimization_suggestions
from backend.database.db import get_db
from backend.models.recommendation import Recommendation

class OptimizationRequest(BaseModel):
    provider: str
    service: str
    
router = APIRouter()

# Mock cost data
mock_cost_data = [
    {"provider": "AWS", "service": "EC2", "cost": 120.50},
    {"provider": "Azure", "service": "VM", "cost": 98.75},
    {"provider": "GCP", "service": "Compute Engine", "cost": 85.20},
]

@router.get("/recommendations")
def get_optimization_recommendations(db: Session = Depends(get_db)):
    ai_recommendations = generate_optimization_suggestions(mock_cost_data)

    for rec in ai_recommendations:
        # Store only new recommendations
        existing = db.query(Recommendation).filter(
            Recommendation.provider == rec["provider"],
            Recommendation.service == rec["service"],
            Recommendation.suggestion == rec["suggestion"]
        ).first()

        if not existing:
            new_rec = Recommendation(
                provider=rec["provider"],
                service=rec["service"],
                suggestion=rec["suggestion"],
                command=rec["command"],
                savings=15.0  # Placeholder savings estimate
            )
            db.add(new_rec)
    
    db.commit()

    # Fetch past recommendations
    past_recommendations = db.query(Recommendation).all()

    return {
        "current_recommendations": ai_recommendations,
        "past_recommendations": [{"provider": r.provider, "service": r.service, "suggestion": r.suggestion, "applied": r.applied} for r in past_recommendations]
    }

@router.post("/apply")
def apply_optimization(request: OptimizationRequest, db: Session = Depends(get_db)):
    recommendation = db.query(Recommendation).filter(
        Recommendation.provider == request.provider,
        Recommendation.service == request.service
    ).first()

    if recommendation:
        # Change this from "Applied" string to True boolean
        recommendation.applied = True
        db.commit()
        return {"message": "Optimization applied successfully"}
    else:
        return {"message": "Optimization not found"}