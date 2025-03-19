"""
Direct PostgreSQL admin user creation script.
This script bypasses Alembic migrations and directly creates the admin user in PostgreSQL.
"""

import os
import sys
from pathlib import Path
from datetime import datetime

# Add project root to Python path
project_root = Path(__file__).resolve().parent
sys.path.insert(0, str(project_root))

from sqlalchemy import text
from backend.database.db import engine
from backend.models.models import UserModel, RoleModel, user_role_association
from backend.auth.utils import get_password_hash

def create_admin_direct():
    """Create admin user directly in PostgreSQL"""
    print("Creating admin user...")
    
    # Create database engine
    conn = engine.connect()
    
    try:
        # Insert admin role
        conn.execute(text("""
            INSERT INTO roles (name, description) 
            VALUES ('admin', 'Administrator with full access')
            ON CONFLICT (name) DO UPDATE 
            SET description = EXCLUDED.description
        """))
        
        # Insert admin user with a secure password
        now = datetime.utcnow().isoformat()
        hashed_password = get_password_hash("CloudCostIQ@2024")
        conn.execute(text("""
            INSERT INTO users (email, username, full_name, hashed_password, is_active, created_at, updated_at) 
            VALUES (:email, :username, :full_name, :password, :is_active, :now, :now)
            ON CONFLICT (email) DO UPDATE 
            SET username = EXCLUDED.username,
                full_name = EXCLUDED.full_name,
                hashed_password = EXCLUDED.hashed_password,
                is_active = EXCLUDED.is_active,
                updated_at = EXCLUDED.updated_at
        """), {
            "email": "jeremy1217@gmail.com",
            "username": "jeremy1217",  # Set username to match email prefix
            "full_name": "Jeremy Hamel",
            "password": hashed_password,
            "is_active": True,
            "now": now
        })
        
        # Get user and role IDs
        result = conn.execute(text("""
            SELECT u.id as user_id, r.id as role_id 
            FROM users u, roles r 
            WHERE u.email = :email AND r.name = :role_name
        """), {
            "email": "jeremy1217@gmail.com",
            "role_name": "admin"
        })
        user_id, role_id = result.fetchone()
        
        # Link admin user to admin role
        conn.execute(text("""
            INSERT INTO user_role_association (user_id, role_id) 
            VALUES (:user_id, :role_id)
            ON CONFLICT (user_id, role_id) DO NOTHING
        """), {
            "user_id": user_id,
            "role_id": role_id
        })
        
        conn.commit()
        print("Admin user created successfully!")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    create_admin_direct()