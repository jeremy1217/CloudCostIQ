from sqlalchemy import text
from backend.database.db import engine
from backend.auth.utils import get_password_hash

def create_admin_direct():
    """Create admin role and user directly with SQL"""
    with engine.connect() as conn:
        # Create admin role
        conn.execute(text("""
        INSERT INTO roles (name, description, permissions) 
        VALUES ('admin', 'Administrator with full access', ARRAY['read', 'write', 'delete', 'admin'])
        ON CONFLICT (name) DO NOTHING
        """))
        
        # Create admin user with properly hashed password
        hashed_pw = get_password_hash('adminpassword')
        conn.execute(text("""
        INSERT INTO users (username, email, full_name, hashed_password, is_active) 
        VALUES ('admin', 'admin@example.com', 'Admin User', :hashed_pw, true)
        ON CONFLICT (username) DO NOTHING
        """), {"hashed_pw": hashed_pw})
        
        # Link admin user to admin role
        conn.execute(text("""
        INSERT INTO user_role_association (user_id, role_id)
        SELECT u.id, r.id 
        FROM users u, roles r 
        WHERE u.username = 'admin' AND r.name = 'admin'
        """))
        
        conn.commit()