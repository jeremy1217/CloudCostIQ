from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, users  # Import the users router

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

@app.get("/")
async def root():
    return {"message": "Welcome to CloudCostIQ API"}