from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth  # Import the auth router

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

@app.get("/")
async def root():
    return {"message": "Welcome to CloudCostIQ API"}