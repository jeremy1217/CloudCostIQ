from fastapi import FastAPI
from api.routes import costs, insights, actions, optimizations
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CloudCostIQ")

# Register API routes
app.include_router(costs.router, prefix="/costs", tags=["Costs"])
app.include_router(insights.router, prefix="/insights", tags=["Insights"])
app.include_router(actions.router, prefix="/actions", tags=["Actions"])
app.include_router(optimizations.router, prefix="/optimize", tags=["Optimizations"])  # This handles all optimizations

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
