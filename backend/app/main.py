# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, users, cost_analysis, cost_analysis_extended

app = FastAPI(title="CloudCostIQ API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(cost_analysis.router, prefix="/api/costs", tags=["costs"])
app.include_router(cost_analysis_extended.router, prefix="/api/costs", tags=["cost analysis"])

@app.get("/")
async def root():
    return {"message": "Welcome to CloudCostIQ API"}