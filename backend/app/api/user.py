from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_current_user
from app.core.security import get_password_hash
from app.db.database import get_db
from app.db.models import User
from app.schemas.user import UserCreate, UserUpdate, UserList, User as UserSchema, UserWithCloudAccounts
from app.core.security import verify_password, get_password_hash

router = APIRouter()


@router.get("/", response_model=List[UserList])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve users. Only admins can access this endpoint.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.post("/", response_model=UserSchema)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """
    Create new user. Only admins can access this endpoint.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    user_data = user_in.dict(exclude={"password"})
    user_data["hashed_password"] = get_password_hash(user_in.password)
    db_user = User(**user_data)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/{user_id}", response_model=UserWithCloudAccounts)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """
    Get a specific user by id. Only admins can access this endpoint.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user

@router.put("/{user_id}", response_model=UserSchema)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """
    Update a user. Only admins can access this endpoint.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    update_data = user_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", response_model=UserSchema)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """
    Delete a user. Only admins can access this endpoint.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Don't allow admins to delete themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own admin account",
        )
    
    db.delete(user)
    db.commit()
    return user

@router.get("/me/", response_model=UserSchema)
def read_user_me(current_user: User = Depends(get_current_user)):
    """
    Get current user information.
    """
    return current_user

@router.put("/me/", response_model=UserSchema)
def update_user_me(
    user_update: UserUpdate,
    current_password: Optional[str] = None,
    new_password: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update own user information.
    """
    # Password change requested
    if new_password is not None:
        if not current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required to set a new password",
            )
        
        if not verify_password(current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password",
            )
        
        current_user.hashed_password = get_password_hash(new_password)
    
    # Update other user data
    update_data = user_update.dict(exclude_unset=True, exclude={"password"})
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user