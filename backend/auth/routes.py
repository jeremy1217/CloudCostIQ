# Standard library imports
from datetime import timedelta

# Third-party imports
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# Local imports
from backend.auth.models import Token, User, UserCreate
from backend.auth.utils import (
    authenticate_user, create_access_token, 
    get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user
)
from backend.database.db import get_db
from backend.models.user import UserModel, RoleModel

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: UserModel = Depends(get_current_user)):
    """Get information about the currently authenticated user."""
    return User(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        roles=[role.name for role in current_user.roles]
    )

@router.post("/register", response_model=User)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Validate password
    if len(user.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    
    if not any(c.isupper() for c in user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter"
        )
    
    if not any(c.islower() for c in user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one lowercase letter"
        )
    
    if not any(c.isdigit() for c in user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one number"
        )
    
    # Check if user already exists
    db_user = db.query(UserModel).filter(
        (UserModel.email == user.email) | (UserModel.username == user.username)
    ).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password,
        is_active=True
    )
    
    # Assign default role (typically 'user')
    default_role = db.query(RoleModel).filter(RoleModel.name == "user").first()
    if not default_role:
        # Create the role if it doesn't exist
        default_role = RoleModel(name="user", description="Regular user")
        db.add(default_role)
        db.flush()
    
    db_user.roles.append(default_role)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Convert to Pydantic model (without password)
    return User(
        id=db_user.id,
        email=db_user.email,
        username=db_user.username,
        full_name=db_user.full_name,
        is_active=db_user.is_active,
        roles=[role.name for role in db_user.roles]
    )