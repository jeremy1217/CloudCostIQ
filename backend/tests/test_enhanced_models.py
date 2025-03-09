# Third-party imports
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Local imports
from backend.api.routes import anomaly_routes, forecast_routes, resource_routes  # Import our new routes
from backend.api.routes import costs, insights, actions, optimizations, forecasting, anomalies, attribution
from backend.api.routes.ai_routes import router as ai_router
from backend.config import settings

app = FastAPI(title="CloudCostIQ")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": f"An error occurred: {str(exc)}"}
    )

# Register API routes
app.include_router(costs.router, prefix="/costs", tags=["Costs"])
app.include_router(insights.router, prefix="/insights", tags=["Insights"])
app.include_router(optimizations.router, prefix="/optimize", tags=["Optimizations"])  # This handles all optimizations
app.include_router(forecasting.router, prefix="/api", tags=["forecasting"])
app.include_router(anomalies.router, prefix="/api", tags=["anomalies"])
app.include_router(attribution.router, prefix="/api", tags=["attribution"])
app.include_router(ai_router, prefix="/ai", tags=["AI Capabilities"])

# Register our new enhanced model routes
app.include_router(anomaly_routes.router, prefix="/api/v2", tags=["Enhanced Anomalies"])
app.include_router(forecast_routes.router, prefix="/api/v2", tags=["Enhanced Forecasts"])
app.include_router(resource_routes.router, prefix="/api/v2", tags=["Resources"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow frontend to access API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to CloudCostIQ"}

if __name__ == "__main__":
    
    uvicorn.run(app, host=settings.API_HOST, port=settings.API_PORT, debug=settings.API_DEBUG)