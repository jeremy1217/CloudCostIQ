# Standard library imports
from datetime import datetime, timedelta
from typing import Optional
import os
import bcrypt

# Third-party imports
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

# Local imports
from backend.auth.models import TokenData, User
from backend.database.db import get_db
from backend.models.user import UserModel

# Security settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-stored-securely")  # In production, always use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")  # Update to use the full path

def verify_password(plain_password, hashed_password):
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception as e:
        print(f"Password verification error: {e}")  # Add logging for debugging
        return False

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def get_user(db: Session, username: str):
    try:
        # Search by email since we're using email as username
        user = db.query(UserModel).filter(UserModel.email == username).first()
        if user:
            print(f"Found user: {username}")  # Add logging for debugging
        else:
            print(f"User not found: {username}")  # Add logging for debugging
        return user
    except Exception as e:
        print(f"Database error in get_user: {e}")  # Add logging for debugging
        return None

def authenticate_user(db: Session, username: str, password: str):
    try:
        user = get_user(db, username)
        if not user:
            print(f"Authentication failed: user {username} not found")  # Add logging for debugging
            return False
        if not verify_password(password, user.hashed_password):
            print(f"Authentication failed: invalid password for user {username}")  # Add logging for debugging
            return False
        print(f"Authentication successful for user {username}")  # Add logging for debugging
        return user
    except Exception as e:
        print(f"Authentication error: {e}")  # Add logging for debugging
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # Add roles to the token data
    if "user" in to_encode:
        to_encode["roles"] = to_encode["user"].role_names
        del to_encode["user"]  # Remove user object as it's not JSON serializable
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Role-based access control
def has_role(required_roles: list):
    async def role_checker(current_user: User = Depends(get_current_user)):
        for role in required_roles:
            if role in current_user.roles:
                return current_user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    return role_checker