from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class ResourceTag(BaseModel):
    key: str
    value: str

class ResourceResponse(BaseModel):
    id: int
    resource_id: str
    provider: str
    account_id: Optional[str] = None
    region: Optional[str] = None
    service: str
    resource_type: str
    name: str
    status: str
    creation_date: Optional[datetime] = None
    last_active: Optional[datetime] = None
    attributes: Optional[Dict] = None
    tags: List[ResourceTag] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 