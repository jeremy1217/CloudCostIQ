# Standard library imports
from datetime import datetime
from typing import List, Optional

# Third-party imports
from sqlalchemy.orm import Session

# Local imports
from backend.models.models import ApiKeyModel
from backend.utils.encryption import encrypt_value, decrypt_value

class APIKeyService:
    def __init__(self, db: Session):
        self.db = db

    def create_api_key(
        self,
        name: str,
        key: str,
        provider: str,
        credentials: dict,
        user_id: int
    ) -> ApiKeyModel:
        """Create a new API key"""
        encrypted_creds = encrypt_value(str(credentials))
        now = datetime.utcnow()
        
        api_key = ApiKeyModel(
            name=name,
            key_hash=key,  # Store the key hash
            provider=provider,
            encrypted_credentials=encrypted_creds,
            is_active=True,
            created_at=now,
            last_used=now,
            user_id=user_id
        )
        
        self.db.add(api_key)
        self.db.commit()
        self.db.refresh(api_key)
        return api_key

    def get_api_key(self, key_id: int, user_id: int) -> Optional[ApiKeyModel]:
        """Get an API key by ID for a specific user"""
        return self.db.query(ApiKeyModel).filter(
            ApiKeyModel.id == key_id,
            ApiKeyModel.user_id == user_id
        ).first()

    def get_user_api_keys(self, user_id: int) -> List[ApiKeyModel]:
        """Get all API keys for a user"""
        return self.db.query(ApiKeyModel).filter(
            ApiKeyModel.user_id == user_id
        ).all()

    def update_api_key(
        self,
        key_id: int,
        user_id: int,
        name: Optional[str] = None,
        is_active: Optional[bool] = None,
        credentials: Optional[dict] = None
    ) -> Optional[ApiKeyModel]:
        """Update an API key"""
        api_key = self.get_api_key(key_id, user_id)
        if not api_key:
            return None

        if name is not None:
            api_key.name = name
        if is_active is not None:
            api_key.is_active = is_active
        if credentials is not None:
            api_key.encrypted_credentials = encrypt_value(str(credentials))
        
        api_key.last_used = datetime.utcnow()
        self.db.commit()
        self.db.refresh(api_key)
        return api_key

    def delete_api_key(self, key_id: int, user_id: int) -> bool:
        """Delete an API key"""
        api_key = self.get_api_key(key_id, user_id)
        if not api_key:
            return False

        self.db.delete(api_key)
        self.db.commit()
        return True

    def get_decrypted_credentials(self, api_key: ApiKeyModel) -> Optional[dict]:
        """Get decrypted credentials for an API key"""
        if not api_key.encrypted_credentials:
            return None
        try:
            return eval(decrypt_value(api_key.encrypted_credentials))
        except:
            return None 