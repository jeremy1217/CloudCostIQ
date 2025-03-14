from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from backend.auth.models import User
from backend.auth.utils import get_current_active_user, has_role
from backend.database.models import User as DBUser, Role, CloudConnection
from sqlalchemy.orm import Session
from backend.database.db import get_db

router = APIRouter()

# Pydantic models for request/response
class UserCreate(BaseModel):
    email: str
    name: str
    is_admin: bool = False

class UserUpdate(BaseModel):
    name: Optional[str] = None
    is_admin: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    roles: List[str]

    class Config:
        from_attributes = True

# User management endpoints
@router.get("/users", response_model=List[UserResponse])
async def get_users(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all users"""
    users = db.query(DBUser).all()
    return users

@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new user"""
    # Check if user already exists
    existing_user = db.query(DBUser).filter(DBUser.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    # Get or create admin role
    admin_role = db.query(Role).filter(Role.name == "admin").first()
    if not admin_role:
        admin_role = Role(name="admin", description="Administrator role")
        db.add(admin_role)
        db.commit()

    # Create new user
    new_user = DBUser(
        email=user_data.email,
        name=user_data.name,
        roles=[admin_role] if user_data.is_admin else []
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a user"""
    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user_data.name is not None:
        user.name = user_data.name
    
    if user_data.is_admin is not None:
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if user_data.is_admin:
            if admin_role not in user.roles:
                user.roles.append(admin_role)
        else:
            if admin_role in user.roles:
                user.roles.remove(admin_role)

    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a user"""
    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent deleting the current user
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

# Cloud connection endpoints
@router.get("/cloud-connections")
async def get_cloud_connections(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all cloud connections"""
    connections = db.query(CloudConnection).filter(CloudConnection.user_id == current_user.id).all()
    return connections

@router.post("/cloud-connections")
async def create_cloud_connection(
    connection_data: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new cloud connection"""
    new_connection = CloudConnection(
        user_id=current_user.id,
        **connection_data
    )
    db.add(new_connection)
    db.commit()
    db.refresh(new_connection)
    return new_connection

@router.put("/cloud-connections/{connection_id}")
async def update_cloud_connection(
    connection_id: int,
    connection_data: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a cloud connection"""
    connection = db.query(CloudConnection).filter(
        CloudConnection.id == connection_id,
        CloudConnection.user_id == current_user.id
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cloud connection not found"
        )

    for key, value in connection_data.items():
        setattr(connection, key, value)

    db.commit()
    db.refresh(connection)
    return connection

@router.delete("/cloud-connections/{connection_id}")
async def delete_cloud_connection(
    connection_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a cloud connection"""
    connection = db.query(CloudConnection).filter(
        CloudConnection.id == connection_id,
        CloudConnection.user_id == current_user.id
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cloud connection not found"
        )

    db.delete(connection)
    db.commit()
    return {"message": "Cloud connection deleted successfully"} 