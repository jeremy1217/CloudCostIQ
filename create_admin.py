"""
Direct PostgreSQL admin user creation script.
This script bypasses Alembic migrations and directly creates the admin user in PostgreSQL.
"""

import os
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).resolve().parent
sys.path.insert(0, str(project_root))

from sqlalchemy import text
from backend.database.db import engine
from backend.models.user import UserModel, RoleModel, user_role_association
from backend.auth.utils import get_password_hash

def create_admin_direct():
    """Create admin user directly in PostgreSQL"""
    print("Creating admin user...")
    
    # Create database engine
    conn = engine.connect()
    
    try:
        # Insert admin role
        conn.execute(text("""
            INSERT INTO roles (name, description, permissions) 
            VALUES ('admin', 'Administrator with full access', '["read", "write", "delete", "admin"]'::json)
            ON CONFLICT (name) DO UPDATE SET 
                description = EXCLUDED.description,
                permissions = EXCLUDED.permissions
        """))
        
        # Insert admin user with a secure password
        hashed_password = get_password_hash("CloudCostIQ@2024")
        conn.execute(text("""
            INSERT INTO users (email, hashed_password, is_active, type, role_names) 
            VALUES ('jeremy1217@gmail.com', :password, true, 'staff', '["admin"]'::json)
            ON CONFLICT (email) DO UPDATE SET 
                hashed_password = EXCLUDED.hashed_password,
                is_active = EXCLUDED.is_active,
                type = EXCLUDED.type,
                role_names = EXCLUDED.role_names
        """), {"password": hashed_password})
        
        # Get user and role IDs
        result = conn.execute(text("""
            SELECT u.id as user_id, r.id as role_id 
            FROM users u, roles r 
            WHERE u.email = 'jeremy1217@gmail.com' AND r.name = 'admin'
        """))
        user_id, role_id = result.fetchone()
        
        # Link admin user to admin role
        conn.execute(text("""
            INSERT INTO user_role_association (user_id, role_id) 
            VALUES (:user_id, :role_id)
            ON CONFLICT DO NOTHING
        """), {"user_id": user_id, "role_id": role_id})
        
        conn.commit()
        print("Admin user created successfully!")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    create_admin_direct()