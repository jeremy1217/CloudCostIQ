from backend.api.routes import costs, insights, actions, optimizations, forecasting, anomalies, attribution
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.config import settings
import uvicorn


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
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
