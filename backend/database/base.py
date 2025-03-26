from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import MetaData

# Create metadata instance
metadata = MetaData()

# Create Base class
Base = declarative_base(metadata=metadata)

# Import models to ensure they are registered with Base
from backend.models.models import RoleModel, UserModel
from backend.models.cloud_cost import CloudCost 