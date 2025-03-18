"""
Initialize the database and create the admin user.
"""

from sqlalchemy import text
from backend.database.db import engine, Base
from backend.auth.utils import get_password_hash

def init_admin():
    """Initialize the database and create the admin user"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    print("Creating admin user...")
    with engine.connect() as conn:
        # Create admin role
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            permissions TEXT
        )
        """))
        
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            hashed_password TEXT NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            type TEXT DEFAULT 'customer',
            role_names TEXT
        )
        """))
        
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS user_role_association (
            user_id INTEGER,
            role_id INTEGER,
            PRIMARY KEY (user_id, role_id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (role_id) REFERENCES roles (id)
        )
        """))
        
        # Create admin role
        conn.execute(text("""
        INSERT INTO roles (name, description, permissions) 
        VALUES ('admin', 'Administrator with full access', 'read,write,delete,admin')
        ON CONFLICT (name) DO NOTHING
        """))
        
        # Create admin user with properly hashed password
        hashed_pw = get_password_hash('adminpassword')
        conn.execute(text("""
        INSERT INTO users (username, email, full_name, hashed_password, is_active, type, role_names) 
        VALUES ('admin', 'admin@cloudcostiq.com', 'Admin User', :hashed_pw, true, 'staff', '["admin"]')
        ON CONFLICT (username) DO NOTHING
        """), {"hashed_pw": hashed_pw})
        
        # Link admin user to admin role
        conn.execute(text("""
        INSERT INTO user_role_association (user_id, role_id)
        SELECT u.id, r.id 
        FROM users u, roles r 
        WHERE u.username = 'admin' AND r.name = 'admin'
        ON CONFLICT DO NOTHING
        """))
        
        conn.commit()
        print("Admin user created successfully.")

if __name__ == "__main__":
    init_admin() 