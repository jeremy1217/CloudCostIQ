from sqlalchemy import Column, Integer, String, JSON, Table, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.db import Base

# Association table for user-role relationship
user_role_association = Table(
    'user_role_association', 
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('role_id', Integer, ForeignKey('roles.id'))
)

class RoleModel(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    permissions = Column(JSON, default=list, nullable=True)
    
    # Relationship with users
    users = relationship("UserModel", secondary=user_role_association, back_populates="roles")
    
    def __repr__(self):
        return f"<Role {self.name}>" 