from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.dependencies import get_db
from app.services import forecast_service
from app.models.schemas import ForecastResponse, ForecastSettingsUpdate

router = APIRouter()

@router.get("/forecasting/cost", response_model=ForecastResponse)
async def get_forecast(
    service: Optional[str] = None,
    time_range: Optional[str] = "month",
    confidence_level: Optional[str] = "medium",
    db: Session = Depends(get_db)
):
    try:
        forecast = forecast_service.generate_forecast(db, service, time_range, confidence_level)
        return forecast
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/forecasting/settings")
async def update_settings(
    settings: ForecastSettingsUpdate,
    db: Session = Depends(get_db)
):
    try:
        forecast_service.update_settings(db, settings.algorithm_type, settings.parameters)
        return {"message": "Forecast settings updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Similar implementations for other route files...