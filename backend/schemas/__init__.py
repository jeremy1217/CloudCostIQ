from pydantic import ConfigDict

# Base configuration for all Pydantic models
BaseConfig = ConfigDict(from_attributes=True)

# Import models after BaseConfig is defined
from .user import UserBase, UserCreate, UserUpdate, UserResponse, UserInDB
from .resource import ResourceTag, ResourceResponse

__all__ = [
    'BaseConfig',
    'UserBase', 'UserCreate', 'UserUpdate', 'UserResponse', 'UserInDB',
    'ResourceTag', 'ResourceResponse'
] 