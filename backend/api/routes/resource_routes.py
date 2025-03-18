# Standard library imports
from datetime import datetime
from typing import List, Optional, Dict, Any

# Third-party imports
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

# Local imports
from backend.database.db import get_db
from backend.models.resource import CloudResource, ResourceTag, resource_tag_association
from backend.schemas.resource import ResourceResponse

router = APIRouter(prefix="/api/resources", tags=["resources"])

# Request and Response Models
class TagBase(BaseModel):
    key: str
    value: Optional[str] = None

class TagResponse(TagBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True

class ResourceCreate(BaseModel):
    resource_id: str
    provider: str
    account_id: Optional[str] = None
    region: Optional[str] = None
    service: str
    resource_type: str
    name: Optional[str] = None
    status: Optional[str] = None
    creation_date: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None
    tags: Optional[List[TagBase]] = None

class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None
    last_active: Optional[datetime] = None

class ResourceResponse(BaseModel):
    id: int
    resource_id: str
    provider: str
    account_id: Optional[str] = None
    region: Optional[str] = None
    service: str
    resource_type: str
    name: Optional[str] = None
    status: Optional[str] = None
    creation_date: Optional[str] = None
    last_active: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None
    tags: List[TagResponse] = []
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ResourceResponse])
async def get_resources(
    provider: Optional[str] = None,
    service: Optional[str] = None,
    resource_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get cloud resources with optional filtering.
    """
    try:
        query = db.query(CloudResource)
        
        # Apply filters
        if provider:
            query = query.filter(CloudResource.provider == provider)
        if service:
            query = query.filter(CloudResource.service == service)
        if resource_type:
            query = query.filter(CloudResource.resource_type == resource_type)
        if status:
            query = query.filter(CloudResource.status == status)
        
        # Get all resources
        resources = query.all()
        
        # Convert to response format
        return [resource.to_dict() for resource in resources]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching cloud resources: {str(e)}"
        )

@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(
    resource_id: int = Path(..., ge=1),
    db: Session = Depends(get_db)
):
    """
    Get a specific resource by ID.
    """
    resource = db.query(CloudResource).filter(CloudResource.id == resource_id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource with ID {resource_id} not found"
        )
    return resource

@router.post("/", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_resource(
    resource: ResourceCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new cloud resource record.
    """
    # Check if resource already exists
    existing = db.query(CloudResource).filter(CloudResource.resource_id == resource.resource_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Resource with ID {resource.resource_id} already exists"
        )
    
    # Create the resource
    db_resource = CloudResource(
        resource_id=resource.resource_id,
        provider=resource.provider,
        account_id=resource.account_id,
        region=resource.region,
        service=resource.service,
        resource_type=resource.resource_type,
        name=resource.name,
        status=resource.status,
        creation_date=datetime.fromisoformat(resource.creation_date) if resource.creation_date else None,
        attributes=resource.attributes
    )
    
    # Add tags if provided
    if resource.tags:
        for tag_data in resource.tags:
            # Check if tag already exists
            tag = db.query(ResourceTag).filter(
                ResourceTag.key == tag_data.key,
                ResourceTag.value == tag_data.value
            ).first()
            
            if not tag:
                # Create new tag
                tag = ResourceTag(key=tag_data.key, value=tag_data.value)
                db.add(tag)
                db.flush()  # Flush to get the id
            
            # Add tag to resource
            db_resource.tags.append(tag)
    
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource

@router.put("/{resource_id}", response_model=ResourceResponse)
async def update_resource(
    resource_id: int = Path(..., ge=1),
    resource_update: ResourceUpdate = ...,
    db: Session = Depends(get_db)
):
    """
    Update an existing cloud resource.
    """
    db_resource = db.query(CloudResource).filter(CloudResource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource with ID {resource_id} not found"
        )
    
    # Update the fields if they are provided
    if resource_update.name is not None:
        db_resource.name = resource_update.name
    if resource_update.status is not None:
        db_resource.status = resource_update.status
    if resource_update.attributes is not None:
        db_resource.attributes = resource_update.attributes
    if resource_update.last_active is not None:
        db_resource.last_active = resource_update.last_active
    
    # Update the updated_at timestamp
    db_resource.updated_at = datetime.now()
    
    db.commit()
    db.refresh(db_resource)
    return db_resource

@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: int = Path(..., ge=1),
    db: Session = Depends(get_db)
):
    """
    Delete a cloud resource.
    """
    db_resource = db.query(CloudResource).filter(CloudResource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource with ID {resource_id} not found"
        )
    
    db.delete(db_resource)
    db.commit()
    return None

# Tag Management Endpoints
@router.get("/tags/", response_model=List[TagResponse])
async def get_tags(
    key: Optional[str] = None,
    value: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get resource tags with optional filtering.
    """
    query = db.query(ResourceTag)
    
    # Apply filters
    if key:
        query = query.filter(ResourceTag.key == key)
    if value:
        query = query.filter(ResourceTag.value == value)
    
    # Apply pagination
    total = query.count()
    tags = query.offset(skip).limit(limit).all()
    
    return tags

@router.post("/tags/", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag: TagBase,
    db: Session = Depends(get_db)
):
    """
    Create a new tag.
    """
    # Check if tag already exists
    existing = db.query(ResourceTag).filter(
        ResourceTag.key == tag.key,
        ResourceTag.value == tag.value
    ).first()
    
    if existing:
        return existing
    
    # Create new tag
    db_tag = ResourceTag(key=tag.key, value=tag.value)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

@router.post("/{resource_id}/tags/", response_model=ResourceResponse)
async def add_tag_to_resource(
    resource_id: int = Path(..., ge=1),
    tag: TagBase = ...,
    db: Session = Depends(get_db)
):
    """
    Add a tag to a resource.
    """
    # Get the resource
    db_resource = db.query(CloudResource).filter(CloudResource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource with ID {resource_id} not found"
        )
    
    # Check if tag already exists
    db_tag = db.query(ResourceTag).filter(
        ResourceTag.key == tag.key,
        ResourceTag.value == tag.value
    ).first()
    
    if not db_tag:
        # Create new tag
        db_tag = ResourceTag(key=tag.key, value=tag.value)
        db.add(db_tag)
        db.flush()
    
    # Check if the resource already has this tag
    if db_tag not in db_resource.tags:
        # Add tag to resource
        db_resource.tags.append(db_tag)
    
    db.commit()
    db.refresh(db_resource)
    return db_resource

@router.delete("/{resource_id}/tags/{tag_id}", response_model=ResourceResponse)
async def remove_tag_from_resource(
    resource_id: int = Path(..., ge=1),
    tag_id: int = Path(..., ge=1),
    db: Session = Depends(get_db)
):
    """
    Remove a tag from a resource.
    """
    # Get the resource
    db_resource = db.query(CloudResource).filter(CloudResource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource with ID {resource_id} not found"
        )
    
    # Get the tag
    db_tag = db.query(ResourceTag).filter(ResourceTag.id == tag_id).first()
    if not db_tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with ID {tag_id} not found"
        )
    
    # Check if the resource has this tag
    if db_tag in db_resource.tags:
        # Remove tag from resource
        db_resource.tags.remove(db_tag)
    
    db.commit()
    db.refresh(db_resource)
    return db_resource