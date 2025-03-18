from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os
from typing import Optional

class DatabaseEncryption:
    def __init__(self, key: Optional[str] = None):
        self.key = key or os.getenv('ENCRYPTION_KEY')
        if not self.key:
            raise ValueError("Encryption key not found in environment variables")
        
        # Convert the key to bytes and create a Fernet instance
        key_bytes = base64.urlsafe_b64encode(self.key.encode()[:32])
        self.fernet = Fernet(key_bytes)

    def encrypt(self, data: str) -> str:
        """Encrypt a string using Fernet symmetric encryption."""
        if not data:
            return data
        return self.fernet.encrypt(data.encode()).decode()

    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt a string using Fernet symmetric encryption."""
        if not encrypted_data:
            return encrypted_data
        return self.fernet.decrypt(encrypted_data.encode()).decode()

    @staticmethod
    def generate_key() -> str:
        """Generate a new encryption key."""
        return Fernet.generate_key().decode()

def hash_password(password: str, salt: Optional[bytes] = None) -> tuple[str, bytes]:
    """Hash a password using PBKDF2 with SHA256."""
    if salt is None:
        salt = os.urandom(16)
    
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    
    key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
    return key.decode(), salt

def verify_password(password: str, hashed_password: str, salt: bytes) -> bool:
    """Verify a password against its hash."""
    key, _ = hash_password(password, salt)
    return key == hashed_password

# Create a global encryption instance
db_encryption = DatabaseEncryption() 