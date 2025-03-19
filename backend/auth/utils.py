# Standard library imports
from datetime import datetime, timedelta
from typing import Optional
import os
import bcrypt
import logging

# Third-party imports
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

# Local imports
from backend.auth.models import TokenData
from backend.database.db import get_db
from backend.models.models import UserModel

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Security settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-stored-securely")  # In production, always use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")  # Update to use the full path

def verify_password(plain_password, hashed_password):
    try:
        logger.debug(f"Verifying password for user")
        logger.debug(f"Plain password: {plain_password}")
        logger.debug(f"Hashed password from DB: {hashed_password}")
        result = bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
        logger.debug(f"Password verification result: {result}")
        return result
    except Exception as e:
        logger.error(f"Password verification error: {e}", exc_info=True)
        return False

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def get_user(db: Session, username: str):
    try:
        logger.debug(f"Attempting to find user with email: {username}")
        # Search by email since we're using email as username
        user = db.query(UserModel).filter(UserModel.email == username).first()
        if user:
            logger.debug(f"Found user: {username}")
            logger.debug(f"User details - ID: {user.id}, Email: {user.email}, Active: {user.is_active}")
        else:
            logger.warning(f"User not found: {username}")
        return user
    except Exception as e:
        logger.error(f"Database error in get_user: {e}", exc_info=True)
        return None

def authenticate_user(db: Session, username: str, password: str):
    try:
        logger.info(f"Starting authentication for user: {username}")
        user = get_user(db, username)
        if not user:
            logger.warning(f"Authentication failed: user {username} not found")
            return False
        if not verify_password(password, user.hashed_password):
            logger.warning(f"Authentication failed: invalid password for user {username}")
            return False
        logger.info(f"Authentication successful for user {username}")
        return user
    except Exception as e:
        logger.error(f"Authentication error: {e}", exc_info=True)
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    try:
        logger.debug("Creating access token")
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
        logger.debug("Access token created successfully")
        return encoded_jwt
    except Exception as e:
        logger.error(f"Error creating access token: {e}", exc_info=True)
        raise

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

async def get_current_active_user(current_user: UserModel = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Role-based access control
def has_role(required_roles: list):
    async def role_checker(current_user: UserModel = Depends(get_current_user)):
        for role in required_roles:
            if role in current_user.role_names:
                return current_user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    return role_checker