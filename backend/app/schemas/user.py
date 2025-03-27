from typing import Optional, List, Any  # Add Any to the imports
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    company_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    is_admin: bool = False

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        orm_mode = True

class UserList(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    company_name: Optional[str] = None
    is_active: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

class UserWithCloudAccounts(User):
    cloud_accounts: List[Any] = []  # We'll define the CloudAccount schema separately

    class Config:
        orm_mode = True

class TokenData(BaseModel):
    user_id: Optional[int] = None

class Token(BaseModel):
    access_token: str
    token_type: str