from cryptography.fernet import Fernet
from typing import Optional
import base64
import os
from pathlib import Path

# Load or generate encryption key
def get_encryption_key() -> bytes:
    """Get or generate the encryption key."""
    key_file = Path("encryption.key")
    
    if key_file.exists():
        with open(key_file, "rb") as f:
            return f.read()
    else:
        # Generate a new key
        key = Fernet.generate_key()
        
        # Save the key to a file
        with open(key_file, "wb") as f:
            f.write(key)
        
        return key

# Initialize Fernet cipher
FERNET_KEY = get_encryption_key()
cipher_suite = Fernet(FERNET_KEY)

def encrypt_data(data: str) -> str:
    """Encrypt a string and return the encrypted data as a string."""
    if not data:
        return None
        
    encoded_data = data.encode()
    encrypted_data = cipher_suite.encrypt(encoded_data)
    return base64.b64encode(encrypted_data).decode('utf-8')

def decrypt_data(encrypted_data: str) -> Optional[str]:
    """Decrypt an encrypted string and return the original data."""
    if not encrypted_data:
        return None
        
    try:
        decoded_data = base64.b64decode(encrypted_data.encode('utf-8'))
        decrypted_data = cipher_suite.decrypt(decoded_data)
        return decrypted_data.decode('utf-8')
    except Exception as e:
        print(f"Decryption error: {e}")
        return None