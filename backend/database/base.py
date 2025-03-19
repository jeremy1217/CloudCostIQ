from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import MetaData

# Create metadata instance
metadata = MetaData()

# Create Base class
Base = declarative_base(metadata=metadata) 