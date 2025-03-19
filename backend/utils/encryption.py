# Standard library imports
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os

def get_encryption_key():
    """Get or generate encryption key."""
    key_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'encryption.key')
    
    if os.path.exists(key_path):
        with open(key_path, 'rb') as key_file:
            return key_file.read()
    else:
        # Generate a new key
        key = Fernet.generate_key()
        # Ensure directory exists
        os.makedirs(os.path.dirname(key_path), exist_ok=True)
        # Save the key
        with open(key_path, 'wb') as key_file:
            key_file.write(key)
        return key

def encrypt_value(value: str) -> str:
    """Encrypt a string value."""
    if not value:
        return value
    
    f = Fernet(get_encryption_key())
    return f.encrypt(value.encode()).decode()

def decrypt_value(encrypted_value: str) -> str:
    """Decrypt an encrypted string value."""
    if not encrypted_value:
        return encrypted_value
    
    f = Fernet(get_encryption_key())
    return f.decrypt(encrypted_value.encode()).decode()