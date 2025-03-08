from pydantic import BaseModel, EmailStr
from typing import Optional, List


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    roles: List[str] = []

    class Config:
        orm_mode = True


class UserInDB(User):
    hashed_password: str