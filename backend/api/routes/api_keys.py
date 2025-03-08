from datetime import datetime
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from backend.database.db import get_db
from backend.auth.utils import get_current_active_user, get_password_hash, verify_password
from backend.auth.models import User
from backend.models.user import ApiKeyModel
from backend.utils.encryption import encrypt_data, decrypt_data

router = APIRouter(prefix="/api-keys", tags=["api-keys"])

class ApiKeyCreate(BaseModel):
    name: str
    provider: str
    credentials: dict

class ApiKeyResponse(BaseModel):
    id: int
    name: str
    provider: str
    key: str  # Only returned once on creation
    created_at: str
    is_active: bool

    class Config:
        orm_mode = True

class ApiKeyList(BaseModel):
    id: int
    name: str
    provider: str
    created_at: str
    is_active: bool
    last_used: str = None

    class Config:
        orm_mode = True


def get_provider_credentials(api_key_id: int, db: Session) -> Optional[Dict]:
    """
    Get decrypted credentials for a provider API key.
    Returns None if the key doesn't exist or decryption fails.
    """
    api_key = db.query(ApiKeyModel).filter(ApiKeyModel.id == api_key_id).first()
    
    if not api_key or not api_key.encrypted_credentials:
        return None
    
    # Decrypt the credentials
    decrypted_json = decrypt_data(api_key.encrypted_credentials)
    if not decrypted_json:
        return None
        
    try:
        return json.loads(decrypted_json)
    except json.JSONDecodeError:
        return None
    
@router.post("/", response_model=ApiKeyResponse)
async def create_api_key(
    api_key: ApiKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Generate a secure random key
    key = secrets.token_urlsafe(32)
    
    # Encrypt the provider credentails
    if api_key.credentials:
        encrypted_credentials = encrypt_data(json.dumps(api_key.credentials))
                                             )
    # Create a new API key entry
    now = datetime.utcnow().isoformat()
    db_api_key = ApiKeyModel(
        name=api_key.name,
        key_hash=get_password_hash(key),  # Store a hash of the key
        provider=api_key.provider,
        encrypted_credentials=encrypted_credentials,
        user_id=current_user.id,
        created_at=now,
        is_active=True
    )
    
    db.add(db_api_key)
    db.commit()
    db.refresh(db_api_key)
    
    # Return the key once (won't be retrievable later)
    return {
        "id": db_api_key.id,
        "name": db_api_key.name,
        "provider": db_api_key.provider,
        "key": key,  # Plaintext key shown only during creation
        "created_at": db_api_key.created_at,
        "is_active": db_api_key.is_active
    }


@router.get("/", response_model=List[ApiKeyList])
async def list_api_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get API keys for the current user
    api_keys = db.query(ApiKeyModel).filter(ApiKeyModel.user_id == current_user.id).all()
    return api_keys


@router.delete("/{key_id}")
async def delete_api_key(
    key_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get the API key
    api_key = db.query(ApiKeyModel).filter(
        ApiKeyModel.id == key_id,
        ApiKeyModel.user_id == current_user.id
    ).first()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    # Delete the API key
    db.delete(api_key)
    db.commit()
    
    return {"message": "API key deleted successfully"}


# Utility function to validate API keys (for internal use)
def validate_api_key(key: str, provider: str, db: Session):
    api_keys = db.query(ApiKeyModel).filter(
        ApiKeyModel.provider == provider,
        ApiKeyModel.is_active == True
    ).all()
    
    for api_key in api_keys:
        if verify_password(key, api_key.key_hash):
            # Update last_used timestamp
            api_key.last_used = datetime.utcnow().isoformat()
            db.commit()
            return True
    
    return False