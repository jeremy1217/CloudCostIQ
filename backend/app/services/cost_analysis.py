# app/services/cost_analysis.py
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
import numpy as np
from scipy import stats

from app.db.models import CostData, CloudAccount

class CostAnalysisService:
    """Service for analyzing cost data and generating recommendations."""
    
    def __init__(self, db: Session):
        self.db = db

    def get_daily_costs(self, account_id: Optional[int] = None, days: int = 30) -> List[Dict[str, Any]]:
        """Get daily costs for the specified period."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        query = self.db.query(
            func.date_trunc('day', CostData.date).label('day'),
            func.sum(CostData.cost).label('total_cost')
        ).filter(CostData.date >= cutoff_date)
        
        if account_id:
            query = query.filter(CostData.cloud_account_id == account_id)
            
        return query.group_by('day').order_by('day').all()

    def get_costs_by_service(self, account_id: Optional[int] = None, days: int = 30) -> List[Dict[str, Any]]:
        """Get costs grouped by service for the specified period."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        query = self.db.query(
            CostData.service,
            func.sum(CostData.cost).label('total_cost')
        ).filter(CostData.date >= cutoff_date)
        
        if account_id:
            query = query.filter(CostData.cloud_account_id == account_id)
            
        return query.group_by(CostData.service).order_by(desc('total_cost')).all()

    def detect_anomalies(self, account_id: Optional[int] = None, days: int = 30, 
                         sensitivity: float = 2.0) -> List[Dict[str, Any]]:
        """
        Detect cost anomalies using Z-score method.
        
        Parameters:
        - account_id: Optional cloud account ID to filter by
        - days: Number of days to analyze
        - sensitivity: Z-score threshold (default 2.0, lower = more sensitive)
        
        Returns list of anomalies with service, date, cost, and z-score
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Get daily costs by service
        query = self.db.query(
            CostData.date,
            CostData.service,
            CostData.resource_id,
            CostData.cost
        ).filter(CostData.date >= cutoff_date)
        
        if account_id:
            query = query.filter(CostData.cloud_account_id == account_id)
            
        costs = query.order_by(CostData.service, CostData.date).all()
        
        # Group by service
        service_costs = {}
        for cost in costs:
            service = cost.service
            if service not in service_costs:
                service_costs[service] = []
            service_costs[service].append({
                'date': cost.date,
                'resource_id': cost.resource_id,
                'cost': cost.cost
            })
        
        # Detect anomalies for each service
        anomalies = []
        for service, service_data in service_costs.items():
            # Need enough data points for statistical significance
            if len(service_data) < 5:
                continue
                
            costs_array = np.array([item['cost'] for item in service_data])
            mean = np.mean(costs_array)
            std = np.std(costs_array)
            
            if std == 0:  # Skip if all values are the same
                continue
                
            for item in service_data:
                z_score = (item['cost'] - mean) / std
                if abs(z_score) > sensitivity:
                    anomalies.append({
                        'service': service,
                        'date': item['date'],
                        'resource_id': item['resource_id'],
                        'cost': item['cost'],
                        'z_score': z_score,
                        'avg_cost': mean,
                        'percent_difference': ((item['cost'] - mean) / mean) * 100
                    })
        
        # Sort anomalies by absolute z-score (most anomalous first)
        return sorted(anomalies, key=lambda x: abs(x['z_score']), reverse=True)

    def get_idle_resources(self, account_id: Optional[int] = None, days: int = 30) -> List[Dict[str, Any]]:
        """
        Identify potentially idle resources based on cost and usage patterns.
        This is a simple example - in real life, you would use cloud provider metrics API 
        to get detailed usage data.
        """
        # This would integrate with cloud provider APIs to get usage metrics
        # For now, we'll simulate by identifying resources with consistent low costs
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        query = self.db.query(
            CostData.resource_id,
            CostData.service,
            func.avg(CostData.cost).label('avg_cost'),
            func.count(CostData.id).label('days_present')
        ).filter(CostData.date >= cutoff_date)
        
        if account_id:
            query = query.filter(CostData.cloud_account_id == account_id)
            
        # Group by resource and filter for resources present most days but with low costs
        resources = query.group_by(CostData.resource_id, CostData.service).all()
        
        idle_resources = []
        for resource in resources:
            # Criteria for potentially idle resources:
            # 1. Present for most of the time period (at least 80%)
            # 2. Consistently low cost (specific thresholds would depend on the service)
            if resource.days_present > days * 0.8:
                # Different idle detection logic based on service type
                if resource.service == 'EC2' and resource.avg_cost < 2.0:
                    idle_resources.append({
                        'resource_id': resource.resource_id,
                        'service': resource.service,
                        'avg_daily_cost': resource.avg_cost,
                        'recommendation': 'Consider stopping or terminating this instance',
                        'estimated_savings': resource.avg_cost * 30  # Monthly savings
                    })
                elif resource.service == 'EBS' and resource.avg_cost < 0.5:
                    idle_resources.append({
                        'resource_id': resource.resource_id,
                        'service': resource.service,
                        'avg_daily_cost': resource.avg_cost,
                        'recommendation': 'Consider deleting this volume or creating a snapshot',
                        'estimated_savings': resource.avg_cost * 30
                    })
                elif resource.service == 'RDS' and resource.avg_cost < 5.0:
                    idle_resources.append({
                        'resource_id': resource.resource_id,
                        'service': resource.service,
                        'avg_daily_cost': resource.avg_cost,
                        'recommendation': 'Consider downgrading instance or switching to serverless',
                        'estimated_savings': resource.avg_cost * 30 * 0.5  # Assuming 50% savings
                    })
        
        return idle_resources

    def get_right_sizing_recommendations(self, account_id: Optional[int] = None, days: int = 30) -> List[Dict[str, Any]]:
        """
        Generate recommendations for right-sizing resources.
        In real implementation, this would analyze CloudWatch metrics for CPU, memory, etc.
        """
        # Simplified implementation - would actually integrate with cloud metrics APIs
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        query = self.db.query(
            CostData.resource_id,
            CostData.service,
            func.avg(CostData.cost).label('avg_cost')
        ).filter(
            CostData.date >= cutoff_date,
            CostData.service.in_(['EC2', 'RDS'])  # Services that can be resized
        )
        
        if account_id:
            query = query.filter(CostData.cloud_account_id == account_id)
            
        resources = query.group_by(CostData.resource_id, CostData.service).all()
        
        recommendations = []
        for resource in resources:
            # In real life, would check utilization metrics here
            # For this example, we'll randomly recommend downsizing for some expensive resources
            if resource.service == 'EC2' and resource.avg_cost > 10.0:
                # Simulate low CPU utilization for some instances
                if hash(resource.resource_id) % 3 == 0:  # Pseudo-random selection
                    recommendations.append({
                        'resource_id': resource.resource_id,
                        'service': resource.service,
                        'current_cost': resource.avg_cost,
                        'recommendation': 'Downsize this instance based on low CPU utilization',
                        'estimated_savings': resource.avg_cost * 30 * 0.4  # Assuming 40% savings
                    })
            elif resource.service == 'RDS' and resource.avg_cost > 20.0:
                # Simulate low database connection count for some instances
                if hash(resource.resource_id) % 4 == 0:
                    recommendations.append({
                        'resource_id': resource.resource_id,
                        'service': resource.service,
                        'current_cost': resource.avg_cost,
                        'recommendation': 'Downsize this database based on low connection count',
                        'estimated_savings': resource.avg_cost * 30 * 0.3  # Assuming 30% savings
                    })
        
        return recommendations

    def get_reserved_instance_recommendations(self, account_id: Optional[int] = None, days: int = 90) -> List[Dict[str, Any]]:
        """
        Recommend Reserved Instance purchases based on consistent usage.
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        query = self.db.query(
            CostData.resource_id,
            CostData.service,
            func.count(CostData.id).label('days_running'),
            func.avg(CostData.cost).label('avg_cost')
        ).filter(
            CostData.date >= cutoff_date,
            CostData.service == 'EC2'  # Focus on EC2 for RI recommendations
        )
        
        if account_id:
            query = query.filter(CostData.cloud_account_id == account_id)
            
        resources = query.group_by(CostData.resource_id, CostData.service).all()
        
        recommendations = []
        for resource in resources:
            # Recommend RIs for instances running at least 80% of the time
            if resource.days_running > days * 0.8 and resource.avg_cost > 5.0:
                ri_savings_1yr = resource.avg_cost * 365 * 0.4  # Assuming 40% savings with 1-year RI
                ri_savings_3yr = resource.avg_cost * 365 * 3 * 0.6  # Assuming 60% savings with 3-year RI
                
                recommendations.append({
                    'resource_id': resource.resource_id,
                    'service': resource.service,
                    'current_monthly_cost': resource.avg_cost * 30,
                    'recommendation': 'Purchase Reserved Instance for consistent usage',
                    'estimated_savings_1yr': ri_savings_1yr,
                    'estimated_savings_3yr': ri_savings_3yr
                })
        
        return recommendations

    def get_all_recommendations(self, account_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Get all recommendation types in a single call.
        """
        anomalies = self.detect_anomalies(account_id)
        idle_resources = self.get_idle_resources(account_id)
        rightsizing = self.get_right_sizing_recommendations(account_id)
        reserved_instances = self.get_reserved_instance_recommendations(account_id)
        
        # Calculate total potential savings
        total_savings = sum(r['estimated_savings'] for r in idle_resources)
        total_savings += sum(r['estimated_savings'] for r in rightsizing)
        total_savings += sum(r['estimated_savings_1yr'] for r in reserved_instances)
        
        return {
            'anomalies': anomalies[:10],  # Top 10 anomalies
            'idle_resources': idle_resources,
            'rightsizing_recommendations': rightsizing,
            'reserved_instance_recommendations': reserved_instances,
            'total_estimated_savings': total_savings
        }
def get_cost_breakdown(self, 
                      start_date: datetime, 
                      end_date: datetime,
                      account_id: Optional[int] = None,
                      service: Optional[str] = None,
                      tag: Optional[str] = None,
                      group_by: str = "service") -> List[Dict[str, Any]]:
    """
    Get cost breakdown by the specified grouping.
    Used for pie charts and similar visualizations.
    """
    base_query = self.db.query(CostData).filter(
        CostData.date >= start_date,
        CostData.date < end_date
    )
    
    # Apply common filters
    if account_id:
        base_query = base_query.filter(CostData.cloud_account_id == account_id)
        
    if service:
        base_query = base_query.filter(CostData.service == service)
        
    if tag:
        # Parse tag filter (format: "key:value")
        try:
            key, value = tag.split(':', 1)
            # Filter by tag
            base_query = base_query.filter(
                func.json_extract_path_text(CostData.tags, key) == value
            )
        except ValueError:
            # Invalid tag format, ignore filter
            pass
    
    if group_by == "service":
        # Group by service
        query = self.db.query(
            CostData.service.label('group'),
            func.sum(CostData.cost).label('total_cost')
        ).filter(
            CostData.id.in_([c.id for c in base_query])
        ).group_by(CostData.service).order_by(desc('total_cost'))
        
        return query.all()
    
    elif group_by == "account":
        # Group by cloud account
        query = self.db.query(
            CloudAccount.name.label('group'),
            func.sum(CostData.cost).label('total_cost')
        ).join(
            CloudAccount, 
            CostData.cloud_account_id == CloudAccount.id
        ).filter(
            CostData.id.in_([c.id for c in base_query])
        ).group_by(CloudAccount.name).order_by(desc('total_cost'))
        
        return query.all()
    
    elif group_by == "region":
        # Group by region tag
        # This assumes you have a region tag in your tags JSON
        results = []
        cost_data = base_query.all()
        
        region_costs = {}
        for cost in cost_data:
            region = "Unknown"
            if cost.tags and isinstance(cost.tags, dict):
                region = cost.tags.get('region', cost.tags.get('aws:region', 'Unknown'))
            
            if region not in region_costs:
                region_costs[region] = 0
            region_costs[region] += cost.cost
        
        for region, total_cost in sorted(region_costs.items(), key=lambda x: x[1], reverse=True):
            results.append(type('obj', (object,), {
                'group': region,
                'total_cost': total_cost
            }))
        
        return results
    
    elif group_by == "tag":
        # Group by tag key (first tag key found)
        results = []
        cost_data = base_query.all()
        
        tag_costs = {}
        for cost in cost_data:
            if not cost.tags or not isinstance(cost.tags, dict) or not cost.tags:
                tag = "No Tags"
            else:
                # Get first tag key
                tag = next(iter(cost.tags.keys()), "Unknown")
            
            if tag not in tag_costs:
                tag_costs[tag] = 0
            tag_costs[tag] += cost.cost
        
        for tag, total_cost in sorted(tag_costs.items(), key=lambda x: x[1], reverse=True):
            results.append(type('obj', (object,), {
                'group': tag,
                'total_cost': total_cost
            }))
        
        return results
        
    # Default fallback
    return []