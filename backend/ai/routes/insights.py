from fastapi import APIRouter
from ai.inference import predict_cost
from ai.detect import detect_anomaly

router = APIRouter()

@router.post("/predict")
async def get_cost_prediction(data: dict):
    """Predict future cloud costs"""
    prediction = predict_cost(data)
    return {"predicted_cost": prediction}

@router.post("/anomaly")
async def check_anomaly(data: dict):
    """Check if a given cost value is an anomaly"""
    status = detect_anomaly(data["cost"])
    return {"status": status}