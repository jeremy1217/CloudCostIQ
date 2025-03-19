# Standard library imports
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os

# Generate a key for encryption
def get_encryption_key() -> bytes:
    """Get or generate an encryption key"""
    # In production, this should be stored securely and retrieved from environment variables
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        # Generate a key if none exists
        salt = os.urandom(16)
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(b"default_secret"))
        os.environ['ENCRYPTION_KEY'] = key.decode()
    return key.encode() if isinstance(key, str) else key

def encrypt_data(data: str) -> str:
    """Encrypt data using Fernet"""
    f = Fernet(get_encryption_key())
    return f.encrypt(data.encode()).decode()

def decrypt_data(encrypted_data: str) -> str:
    """Decrypt data using Fernet"""
    f = Fernet(get_encryption_key())
    return f.decrypt(encrypted_data.encode()).decode()