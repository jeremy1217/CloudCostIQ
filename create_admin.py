from sqlalchemy import text
from backend.database.db import engine

def create_admin_direct():
    """Create admin role and user directly with SQL"""
    with engine.connect() as conn:
        # Create admin role
        conn.execute(text("""
        INSERT INTO roles (name, description, permissions) 
        VALUES ('admin', 'Administrator with full access', ARRAY['read', 'write', 'delete', 'admin'])
        ON CONFLICT (name) DO NOTHING
        """))
        
        # Create admin user with bcrypt hashed password
        # This is a sample bcrypt hash for 'adminpassword' - you should generate a fresh one
        hashed_pw = '$2b$12$CoDzwPE3vFZkUn7Es1hxVOOxm4vcDjBMdW5VkHyeA2Hx8BRiQQYkq'
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