# Standard library imports
from datetime import datetime, timedelta
import json
import logging

# Third-party imports
from celery import Celery
from celery.schedules import crontab
from sqlalchemy.orm import Session

# Local imports
from backend.database.db import SessionLocal
from backend.models.cloud_cost import CloudCost
from backend.models.user import ApiKeyModel
from backend.services.cloud_providers.aws_service import AWSService
from backend.utils.encryption import decrypt_data

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Celery
celery_app = Celery('cloudcostiq', broker='redis://localhost:6379/0')

# Schedule configuration
celery_app.conf.beat_schedule = {
    'import-costs-daily': {
        'task': 'tasks.import_all_cloud_costs',
        'schedule': crontab(hour=1, minute=0)  # Run at 1:00 AM daily
    }
}

@celery_app.task
def import_all_cloud_costs():
    """Import costs from all cloud providers for all users"""
    logger.info("Starting cloud cost import task")
    
    # Create DB session
    db = SessionLocal()
    
    try:
        # Get all active API keys
        api_keys = db.query(ApiKeyModel).filter(ApiKeyModel.is_active == True).all()
        
        for api_key in api_keys:
            # Import costs for this API key
            import_costs_for_key(api_key.id, db)
            
        logger.info(f"Completed import for {len(api_keys)} API keys")
    except Exception as e:
        logger.error(f"Error in import_all_cloud_costs: {e}")
    finally:
        db.close()

def import_costs_for_key(api_key_id: int, db: Session):
    """Import costs for a specific API key"""
    api_key = db.query(ApiKeyModel).filter(ApiKeyModel.id == api_key_id).first()
    
    if not api_key:
        logger.error(f"API key with ID {api_key_id} not found")
        return
        
    # Set last used timestamp
    api_key.last_used = datetime.utcnow().isoformat()
    db.commit()
    
    # Skip if no credentials
    if not api_key.encrypted_credentials:
        logger.warning(f"API key {api_key_id} has no credentials")
        return
        
    # Decrypt credentials
    decrypted_json = decrypt_data(api_key.encrypted_credentials)
    if not decrypted_json:
        logger.error(f"Failed to decrypt credentials for API key {api_key_id}")
        return
        
    try:
        credentials = json.loads(decrypted_json)
    except json.JSONDecodeError:
        logger.error(f"Invalid JSON credentials for API key {api_key_id}")
        return
        
    # Import costs based on provider
    costs = []
    
    if api_key.provider == "AWS":
        costs = import_aws_costs(credentials)
    elif api_key.provider == "Azure":
        # Implement for Azure
        pass
    elif api_key.provider == "GCP":
        # Implement for GCP
        pass
    else:
        logger.warning(f"Unsupported provider: {api_key.provider}")
        return
        
    # Save costs to database
    for cost_data in costs:
        cloud_cost = CloudCost(
            provider=cost_data['provider'],
            service=cost_data['service'],
            cost=cost_data['cost'],
            date=cost_data['date'],
            user_id=api_key.user_id  # Associate with the user
        )
        db.add(cloud_cost)
    
    db.commit()
    logger.info(f"Imported {len(costs)} cost entries for API key {api_key_id}")

def import_aws_costs(credentials):
    """Import costs from AWS Cost Explorer"""
    try:
        # Initialize AWS service
        aws_service = AWSService(credentials)
        
        # Set date range for the last 7 days
        end_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        start_date = end_date - timedelta(days=7)
        
        # Get cost data
        return aws_service.get_cost_data(start_date, end_date)
    except Exception as e:
        logger.error(f"Error importing AWS costs: {e}")
        return []