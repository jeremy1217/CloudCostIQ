# Standard library imports
from typing import List, Dict, Any, Optional
import datetime
import json
import random
import uuid

# No third-party imports needed for this module

# No local imports needed for this module

def generate_provider_service_map():
    """Return a mapping of cloud providers to their services"""
    return {
        "AWS": [
            "EC2", "S3", "RDS", "Lambda", "DynamoDB", 
            "ECS", "EKS", "CloudFront", "SQS", "SNS"
        ],
        "Azure": [
            "VM", "Storage", "SQL Database", "Functions", "Cosmos DB",
            "Container Instances", "Kubernetes Service", "CDN", "Queue Storage", "Event Grid"
        ],
        "GCP": [
            "Compute Engine", "Cloud Storage", "Cloud SQL", "Cloud Functions", "Bigtable",
            "Cloud Run", "GKE", "Cloud CDN", "Pub/Sub", "Firestore"
        ]
    }

def generate_mock_costs(
    days: int = 30, 
    providers: List[str] = None, 
    include_anomalies: bool = True,
    date_format: str = "%Y-%m-%d"
) -> List[Dict[str, Any]]:
    """
    Generate consistent mock cost data
    
    Args:
        days: Number of days of historical data to generate
        providers: List of cloud providers to include (defaults to all)
        include_anomalies: Whether to include anomalies in the data
        date_format: Format for date strings
        
    Returns:
        List of cost data dictionaries
    """
    if providers is None:
        providers = ["AWS", "Azure", "GCP"]
        
    today = datetime.date.today()
    mock_data = []
    
    # Get services for each provider
    provider_services = generate_provider_service_map()
    
    # Random seed for reproducibility
    random.seed(42)
    
    # Base costs for each service (to ensure consistency)
    base_costs = {}
    for provider in providers:
        services = provider_services.get(provider, [])
        for service in services:
            # Generate a consistent base cost for each service
            base_costs[f"{provider}:{service}"] = random.uniform(50, 500)
    
    # Generate daily cost data
    for i in range(days):
        date = today - datetime.timedelta(days=i)
        date_str = date.strftime(date_format)
        
        for provider in providers:
            services = provider_services.get(provider, [])
            
            for service in services:
                # Get base cost for this service
                base_cost = base_costs[f"{provider}:{service}"]
                
                # Add some random daily variation (±15%)
                variation = random.uniform(-0.15, 0.15)
                
                # Calculate final cost
                cost = base_cost * (1 + variation)
                
                # Add occasional anomalies (3x-5x normal cost) at random
                if include_anomalies and random.random() < 0.01:  # 1% chance of anomaly
                    cost = cost * random.uniform(3, 5)
                
                mock_data.append({
                    "provider": provider,
                    "service": service,
                    "cost": round(cost, 2),
                    "date": date_str,
                    "resource_id": f"{service.lower()}-{str(uuid.uuid4())[:8]}"
                })
    
    return mock_data

def generate_mock_recommendations(count: int = 5) -> List[Dict[str, Any]]:
    """
    Generate mock cost optimization recommendations
    
    Args:
        count: Number of recommendations to generate
        
    Returns:
        List of recommendation dictionaries
    """
    provider_services = generate_provider_service_map()
    
    # Recommendation templates
    recommendation_templates = [
        {
            "suggestion": "Use Reserved Instances for {service}",
            "command": "aws ec2 modify-instance-attribute --instance-id {resource_id} --instance-type reserved",
            "savings_percent": lambda: random.uniform(20, 40)
        },
        {
            "suggestion": "Rightsize {service} resources",
            "command": "aws ec2 modify-instance-attribute --instance-id {resource_id} --instance-type t3.medium",
            "savings_percent": lambda: random.uniform(15, 30)
        },
        {
            "suggestion": "Delete unused {service} resources",
            "command": "aws ec2 terminate-instances --instance-ids {resource_id}",
            "savings_percent": lambda: random.uniform(10, 100)
        },
        {
            "suggestion": "Optimize storage for {service}",
            "command": "aws s3 lifecycle --bucket {resource_id} --lifecycle-configuration file://lifecycle.json",
            "savings_percent": lambda: random.uniform(5, 25)
        }
    ]
    
    recommendations = []
    
    for i in range(count):
        # Select random provider and service
        provider = random.choice(list(provider_services.keys()))
        service = random.choice(provider_services[provider])
        
        # Select random recommendation template
        template = random.choice(recommendation_templates)
        
        # Generate resource ID
        resource_id = f"{service.lower()}-{str(uuid.uuid4())[:8]}"
        
        # Calculate mock cost and savings
        base_cost = random.uniform(100, 1000)
        savings_percent = template["savings_percent"]()
        savings = round(base_cost * (savings_percent / 100), 2)
        
        recommendations.append({
            "provider": provider,
            "service": service,
            "suggestion": template["suggestion"].format(service=service),
            "command": template["command"].format(resource_id=resource_id),
            "savings": savings,
            "applied": False
        })
    
    return recommendations

def populate_db_with_mock_data(db_session, days: int = 30, models=None):
    """
    Populate database with mock data for testing
    
    Args:
        db_session: SQLAlchemy database session
        days: Number of days of historical data to generate
        models: Dictionary of model classes to use
    """
    if models is None:
        # Default import if not provided
        from backend.models.cloud_cost import CloudCost
        from backend.models.recommendation import Recommendation
        models = {
            "CloudCost": CloudCost,
            "Recommendation": Recommendation
        }
    
    # Generate mock cost data
    mock_costs = generate_mock_costs(days=days)
    
    # Add to database
    for cost_data in mock_costs:
        # Create a copy of the data with extra_data instead of metadata
        extra_data = {
            "resource_id": cost_data.get("resource_id", "unknown"),
            "region": random.choice(["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"]),
            "account": f"account-{random.randint(1000, 9999)}"
        }
        
        cloud_cost = models["CloudCost"](
            provider=cost_data["provider"],
            service=cost_data["service"],
            cost=cost_data["cost"],
            date=cost_data["date"],
            extra_data=json.dumps(extra_data),  # Use extra_data instead of metadata
            resource_id=cost_data.get("resource_id")
        )
        db_session.add(cloud_cost)
    
    # Generate mock recommendations
    mock_recommendations = generate_mock_recommendations(count=10)
    
    # Add to database
    for rec_data in mock_recommendations:
        recommendation = models["Recommendation"](
            provider=rec_data["provider"],
            service=rec_data["service"],
            suggestion=rec_data["suggestion"],
            command=rec_data["command"],
            savings=rec_data["savings"],
            applied=rec_data["applied"]
        )
        db_session.add(recommendation)
    
    # Commit changes
    db_session.commit()