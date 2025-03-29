# app/services/enhanced_recommendations.py
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract
import json

from app.db.models import CostData, CloudAccount

class EnhancedRecommendations:
    """Enhanced service for generating cloud cost optimization recommendations."""
    
    def __init__(self, db: Session):
        self.db = db

    def get_all_recommendations(self, account_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Get all recommendation types in a single call with enhanced algorithms.
        """
        # Get recommendations in parallel
        idle_resources = self.get_idle_resources(account_id)
        rightsizing = self.get_right_sizing_recommendations(account_id)
        reserved_instances = self.get_reserved_instance_recommendations(account_id)
        storage_optimizations = self.get_storage_optimization_recommendations(account_id)
        network_optimizations = self.get_network_optimization_recommendations(account_id)
        
        # Calculate total potential savings
        total_savings = sum(r['estimated_savings'] for r in idle_resources)
        total_savings += sum(r['estimated_savings'] for r in rightsizing)
        total_savings += sum(r['estimated_savings_1yr'] for r in reserved_instances)
        total_savings += sum(r['estimated_savings'] for r in storage_optimizations)
        total_savings += sum(r['estimated_savings'] for r in network_optimizations)
        
        # Categorize and prioritize recommendations
        all_recommendations = []
        
        # Add all recommendations to a single list with priority
        for rec in idle_resources:
            all_recommendations.append({
                'category': 'idle_resources',
                'recommendation': rec,
                'priority': self._calculate_priority(rec['estimated_savings'], 'high')
            })
            
        for rec in rightsizing:
            all_recommendations.append({
                'category': 'rightsizing',
                'recommendation': rec,
                'priority': self._calculate_priority(rec['estimated_savings'], 'medium')
            })
            
        for rec in reserved_instances:
            # Convert annual savings to monthly for priority calculation
            monthly_savings = rec['estimated_savings_1yr'] / 12
            all_recommendations.append({
                'category': 'reserved_instances',
                'recommendation': rec,
                'priority': self._calculate_priority(monthly_savings, 'medium')
            })
            
        for rec in storage_optimizations:
            all_recommendations.append({
                'category': 'storage',
                'recommendation': rec,
                'priority': self._calculate_priority(rec['estimated_savings'], 'medium')
            })
            
        for rec in network_optimizations:
            all_recommendations.append({
                'category': 'network',
                'recommendation': rec,
                'priority': self._calculate_priority(rec['estimated_savings'], 'low')
            })
        
        # Sort recommendations by priority (highest first)
        sorted_recommendations = sorted(all_recommendations, key=lambda x: x['priority'], reverse=True)
        
        # Extract top recommendations by category
        top_recommendations = sorted_recommendations[:10]
        
        return {
            'idle_resources': idle_resources,
            'rightsizing_recommendations': rightsizing,
            'reserved_instance_recommendations': reserved_instances,
            'storage_optimization_recommendations': storage_optimizations,
            'network_optimization_recommendations': network_optimizations,
            'top_recommendations': top_recommendations,
            'total_estimated_savings': total_savings
        }

    def _calculate_priority(self, monthly_savings: float, base_impact: str) -> float:
        """
        Calculate recommendation priority based on savings and impact.
        Returns a score from 0-100.
        """
        # Base impact scores
        impact_scores = {
            'critical': 90,
            'high': 70, 
            'medium': 50,
            'low': 30
        }
        
        base_score = impact_scores.get(base_impact, 50)
        
        # Adjust based on savings amount
        if monthly_savings < 10:
            return base_score * 0.8
        elif monthly_savings < 50:
            return base_score * 0.9
        elif monthly_savings < 100:
            return base_score
        elif monthly_savings < 500:
            return min(base_score * 1.2, 95)
        else:
            return min(base_score * 1.5, 99)

    def get_idle_resources(self, account_id: Optional[int] = None, days: int = 30) -> List[Dict[str, Any]]:
        """
        Identify potentially idle resources using enhanced detection methods.
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        idle_resources = []
        
        # Define thresholds for different resource types
        cpu_threshold = 5.0  # 5% average CPU utilization
        conn_threshold = 3.0  # 3 connections on average
        iops_threshold = 10.0  # 10 IOPS on average
        
        # For the example, we'll simulate usage metrics in the cost data tags
        # In a real implementation, you would use cloud provider metrics APIs
        
        # Get resource costs and metadata
        query = self.db.query(
            CostData.resource_id,
            CostData.service,
            func.avg(CostData.cost).label('avg_cost'),
            func.count(CostData.id).label('days_present'),
            func.json_agg(CostData.tags).label('all_tags')
        ).filter(CostData.date >= cutoff_date)
        
        if account_id:
            query = query.filter(CostData.cloud_account_id == account_id)
            
        # Group by resource and service
        resources = query.group_by(CostData.resource_id, CostData.service).all()
        
        for resource in resources:
            # Skip resources that were not present for most of the time period
            if resource.days_present < days * 0.8:
                continue
            
            # Extract simulated usage metrics from tags
            metrics = self._extract_usage_metrics(resource.all_tags)
            
            # Apply different detection rules based on service type
            if resource.service in ('EC2', 'Compute Engine', 'Virtual Machines'):
                if metrics.get('avg_cpu', 100) < cpu_threshold:
                    idle_resources.append({
                        'resource_id': resource.resource_id,
                        'service': resource.service,
                        'avg_daily_cost': resource.avg_cost,
                        'recommendation': f"Consider stopping or terminating this instance due to low CPU utilization ({metrics.get('avg_cpu', 0):.1f}%)",
                        'estimated_savings': resource.avg_cost * 30,
                        'confidence': 'high' if metrics.get('avg_cpu', 100) < 2.0 else 'medium',
                        'metrics': {
                            'avg_cpu': metrics.get('avg_cpu', None),
                            'max_cpu': metrics.get('max_cpu', None),
                            'days_idle': metrics.get('days_idle', None)
                        }
                    })
                    
            elif resource.service in ('RDS', 'Cloud SQL', 'SQL Database'):
                if metrics.get('avg_connections', 100) < conn_threshold:
                    idle_resources.append({
                        'resource_id': resource.resource_id,
                        'service': resource.service,
                        'avg_daily_cost': resource.avg_cost,
                        'recommendation': f"Consider downsizing or switching to serverless due to low connection count ({metrics.get('avg_connections', 0):.1f} avg connections)",
                        'estimated_savings': resource.avg_cost * 30 * 0.5,  # Assuming 50% savings
                        'confidence': 'medium',
                        'metrics': {
                            'avg_connections': metrics.get('avg_connections', None),
                            'max_connections': metrics.get('max_connections', None),
                            'days_idle': metrics.get('days_idle', None)
                        }
                    })
                    
            elif resource.service in ('EBS', 'Persistent Disk', 'Managed Disks'):
                if metrics.get('avg_iops', 100) < iops_threshold:
                    idle_resources.append({
                        'resource_id': resource.resource_id,
                        'service': resource.service,
                        'avg_daily_cost': resource.avg_cost,
                        'recommendation': f"Consider creating a snapshot and removing this volume due to low IOPS ({metrics.get('avg_iops', 0):.1f} avg IOPS)",
                        'estimated_savings': resource.avg_cost * 30,
                        'confidence': 'high' if metrics.get('avg_iops', 100) < 1.0 else 'medium',
                        'metrics': {
                            'avg_iops': metrics.get('avg_iops', None),
                            'max_iops': metrics.get('max_iops', None),
                            'percent_used': metrics.get('percent_used', None)
                        }
                    })
                    
            # Additional services could be added here
        
        return idle_resources

    def _extract_usage_metrics(self, tags_json_array) -> Dict[str, float]:
        """
        Extract simulated usage metrics from tags.
        In a real implementation, this would come from cloud provider metrics APIs.
        """
        metrics = {}
        
        # Process all tags for the resource
        if not tags_json_array:
            return metrics
            
        try:
            # Simulate extracting metrics from tags
            # This is just for demonstration - real metrics would come from the cloud provider
            for tags in tags_json_array:
                if not tags:
                    continue
                
                # Look for metrics in tags
                for key, value in tags.items():
                    if key == 'avg_cpu':
                        metrics['avg_cpu'] = float(value)
                    elif key == 'max_cpu':
                        metrics['max_cpu'] = float(value)
                    elif key == 'avg_connections':
                        metrics['avg_connections'] = float(value)
                    elif key == 'max_connections':
                        metrics['max_connections'] = float(value)
                    elif key == 'avg_iops':
                        metrics['avg_iops'] = float(value)
                    elif key == 'max_iops':
                        metrics['max_iops'] = float(value)
                    elif key == 'days_idle':
                        metrics['days_idle'] = float(value)
                    elif key == 'percent_used':
                        metrics['percent_used'] = float(value)
                        
            # For demonstration, generate random metrics if none were found
            if not metrics:
                import random
                service_type = random.choice(['compute', 'database', 'storage'])
                
                if service_type == 'compute':
                    avg_cpu = random.uniform(1, 15)
                    metrics['avg_cpu'] = avg_cpu
                    metrics['max_cpu'] = avg_cpu * random.uniform(1.5, 3.0)
                    metrics['days_idle'] = random.randint(0, 10)
                    
                elif service_type == 'database':
                    avg_conn = random.uniform(0.5, 8)
                    metrics['avg_connections'] = avg_conn
                    metrics['max_connections'] = avg_conn * random.uniform(2, 5)
                    metrics['days_idle'] = random.randint(0, 7)
                    
                elif service_type == 'storage':
                    metrics['avg_iops'] = random.uniform(0.1, 20)
                    metrics['percent_used'] = random.uniform(5, 40)
                    
        except Exception as e:
            # Log error and return empty metrics
            pass
        
        return metrics

    def get_right_sizing_recommendations(self, account_id: Optional[int] = None, days: int = 30) -> List[Dict[str, Any]]:
        """
        Generate recommendations for right-sizing resources based on usage patterns.
        Enhanced version that includes memory utilization and instance type-specific recommendations.
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        recommendations = []
        
        # Define CPU utilization thresholds for different rightsizing actions
        cpu_thresholds = {
            'downsize': 30.0,  # If max CPU is below 30%, recommend downsizing
            'upgrade': 80.0    # If max CPU is above 80%, recommend upgrading
        }
        
        # Define instance types and their relative size/cost for major cloud providers
        instance_families = {
            'AWS': {
                'EC2': [
                    {'type': 't3.micro', 'vcpu': 2, 'mem': 1, 'relative_cost': 0.5},
                    {'type': 't3.small', 'vcpu': 2, 'mem': 2, 'relative_cost': 1.0},
                    {'type': 't3.medium', 'vcpu': 2, 'mem': 4, 'relative_cost': 2.0},
                    {'type': 't3.large', 'vcpu': 2, 'mem': 8, 'relative_cost': 4.0},
                    {'type': 't3.xlarge', 'vcpu': 4, 'mem': 16, 'relative_cost': 8.0},
                    {'type': 't3.2xlarge', 'vcpu': 8, 'mem': 32, 'relative_cost': 16.0},
                ],
                'RDS': [
                    {'type': 'db.t3.micro', 'relative_cost': 0.5},
                    {'type': 'db.t3.small', 'relative_cost': 1.0},
                    {'type': 'db.t3.medium', 'relative_cost': 2.0},
                    {'type': 'db.t3.large', 'relative_cost': 4.0},
                    {'type': 'db.t3.xlarge', 'relative_cost': 8.0},
                ]
            },
            'Azure': {
                'Virtual Machines': [
                    {'type': 'B2s', 'vcpu': 2, 'mem': 4, 'relative_cost': 1.0},
                    {'type': 'B2ms', 'vcpu': 2, 'mem': 8, 'relative_cost': 2.0},
                    {'type': 'B4ms', 'vcpu': 4, 'mem': 16, 'relative_cost': 4.0},
                    {'type': 'B8ms', 'vcpu': 8, 'mem': 32, 'relative_cost': 8.0},
                ],
                'SQL Database': [
                    {'type': 'Basic', 'relative_cost': 0.5},
                    {'type': 'Standard S0', 'relative_cost': 1.0},
                    {'type': 'Standard S1', 'relative_cost': 2.0},
                    {'type': 'Standard S2', 'relative_cost': 4.0},
                ]
            },
            'GCP': {
                'Compute Engine': [
                    {'type': 'e2-micro', 'vcpu': 2, 'mem': 1, 'relative_cost': 0.5},
                    {'type': 'e2-small', 'vcpu': 2, 'mem': 2, 'relative_cost': 1.0},
                    {'type': 'e2-medium', 'vcpu': 2, 'mem': 4, 'relative_cost': 2.0},
                    {'type': 'e2-standard-2', 'vcpu': 2, 'mem': 8, 'relative_cost': 4.0},
                    {'type': 'e2-standard-4', 'vcpu': 4, 'mem': 16, 'relative_cost': 8.0},
                ],
                'Cloud SQL': [
                    {'type': 'db-f1-micro', 'relative_cost': 0.5},
                    {'type': 'db-g1-small', 'relative_cost': 1.0},
                    {'type': 'db-custom-1-3840', 'relative_cost': 2.0},
                    {'type': 'db-custom-2-7680', 'relative_cost': 4.0},
                ]
            }
        }
        
        # Get resource details with simulated utilization metrics
        query = self.db.query(
            CostData.resource_id,
            CostData.service,
            CloudAccount.provider,
            func.avg(CostData.cost).label('avg_cost'),
            func.json_agg(CostData.tags).label('all_tags')
        ).join(
            CloudAccount,
            CostData.cloud_account_id == CloudAccount.id
        ).filter(
            CostData.date >= cutoff_date
        )
        
        if account_id:
            query = query.filter(CostData.cloud_account_id == account_id)
            
        # Group by resource, service, and provider
        resources = query.group_by(
            CostData.resource_id,
            CostData.service,
            CloudAccount.provider
        ).all()
        
        for resource in resources:
            # Extract resource metadata and metrics
            metadata = self._extract_resource_metadata(resource.all_tags)
            metrics = self._extract_usage_metrics(resource.all_tags)
            
            # Skip resources with insufficient data
            if not metadata or 'instance_type' not in metadata:
                continue
                
            # Get resource utilization metrics
            cpu_util = metrics.get('max_cpu', 50)  # Default to 50% if not available
            mem_util = metrics.get('max_memory', 50)  # Default to 50% if not available
            
            # Find the current instance type in our family listing
            instance_type = metadata.get('instance_type')
            provider = resource.provider or 'AWS'  # Default to AWS if not specified
            service = resource.service
            
            # Skip if no matching provider or service
            if provider not in instance_families or service not in instance_families[provider]:
                continue
                
            # Find current instance in the family
            instance_family = instance_families[provider][service]
            current_instance = next((i for i in instance_family if i['type'] == instance_type), None)
            
            if not current_instance:
                continue
                
            # Make rightsizing recommendations based on CPU and memory utilization
            if cpu_util < cpu_thresholds['downsize'] and mem_util < 50:
                # Find a smaller instance type
                smaller_instances = [
                    i for i in instance_family 
                    if i['relative_cost'] < current_instance['relative_cost']
                ]
                
                if smaller_instances:
                    # Get the largest of the smaller instances
                    target_instance = max(smaller_instances, key=lambda x: x['relative_cost'])
                    
                    # Calculate savings
                    savings_ratio = 1 - (target_instance['relative_cost'] / current_instance['relative_cost'])
                    estimated_savings = resource.avg_cost * 30 * savings_ratio
                    
                    recommendations.append({
                        'resource_id': resource.resource_id,
                        'service': service,
                        'current_type': instance_type,
                        'current_cost': resource.avg_cost,
                        'recommended_type': target_instance['type'],
                        'recommendation': f"Downsize {service} instance from {instance_type} to {target_instance['type']} based on low utilization",
                        'estimated_savings': estimated_savings,
                        'confidence': 'high' if cpu_util < 20 and mem_util < 30 else 'medium',
                        'metrics': {
                            'cpu_utilization': cpu_util,
                            'memory_utilization': mem_util
                        }
                    })
            
            elif cpu_util > cpu_thresholds['upgrade'] or mem_util > 85:
                # Instance might be overutilized, recommend upgrading
                larger_instances = [
                    i for i in instance_family 
                    if i['relative_cost'] > current_instance['relative_cost']
                ]
                
                if larger_instances:
                    # Get the smallest of the larger instances
                    target_instance = min(larger_instances, key=lambda x: x['relative_cost'])
                    
                    # For upgrading, we show the cost increase but still mark it as a recommendation
                    # for improved performance
                    cost_increase_ratio = (target_instance['relative_cost'] / current_instance['relative_cost']) - 1
                    estimated_cost_increase = resource.avg_cost * 30 * cost_increase_ratio
                    
                    recommendations.append({
                        'resource_id': resource.resource_id,
                        'service': service,
                        'current_type': instance_type,
                        'current_cost': resource.avg_cost,
                        'recommended_type': target_instance['type'],
                        'recommendation': f"Consider upgrading {service} instance from {instance_type} to {target_instance['type']} to avoid performance issues",
                        'estimated_savings': -estimated_cost_increase,  # Negative savings (i.e., a cost)
                        'confidence': 'medium',
                        'metrics': {
                            'cpu_utilization': cpu_util,
                            'memory_utilization': mem_util
                        },
                        'recommendation_type': 'performance_improvement'  # Mark as performance improvement
                    })
        
        # Only return cost-saving recommendations unless requested otherwise
        return [r for r in recommendations if r.get('recommendation_type') != 'performance_improvement']

    def _extract_resource_metadata(self, tags_json_array) -> Dict[str, str]:
        """
        Extract resource metadata from tags.
        """
        metadata = {}
        
        if not tags_json_array:
            return metadata
            
        try:
            # Process all tags for the resource to extract metadata
            for tags in tags_json_array:
                if not tags:
                    continue
                
                # Look for relevant metadata in tags
                for key, value in tags.items():
                    if key == 'instance_type':
                        metadata['instance_type'] = str(value)
                    elif key == 'instance_id':
                        metadata['instance_id'] = str(value)
                    elif key == 'region':
                        metadata['region'] = str(value)
                    elif key == 'availability_zone':
                        metadata['availability_zone'] = str(value)
                    elif key == 'storage_type':
                        metadata['storage_type'] = str(value)
                    elif key == 'volume_type':
                        metadata['volume_type'] = str(value)
            
            # For demonstration, generate random instance type if none was found
            if not metadata:
                import random
                providers = ['AWS', 'Azure', 'GCP']
                provider = random.choice(providers)
                
                if provider == 'AWS':
                    instance_types = ['t3.micro', 't3.small', 't3.medium', 't3.large', 't3.xlarge']
                    metadata['instance_type'] = random.choice(instance_types)
                    metadata['region'] = random.choice(['us-east-1', 'us-west-2', 'eu-west-1'])
                    
                elif provider == 'Azure':
                    instance_types = ['B1s', 'B2s', 'B2ms', 'B4ms', 'B8ms']
                    metadata['instance_type'] = random.choice(instance_types)
                    metadata['region'] = random.choice(['eastus', 'westus2', 'westeurope'])
                    
                elif provider == 'GCP':
                    instance_types = ['e2-micro', 'e2-small', 'e2-medium', 'e2-standard-2', 'e2-standard-4']
                    metadata['instance_type'] = random.choice(instance_types)
                    metadata['region'] = random.choice(['us-central1', 'us-west1', 'europe-west1'])
                    
        except Exception as e:
            # Log error and return empty metadata
            pass
            
        return metadata

    def get_reserved_instance_recommendations(self, account_id: Optional[int] = None, days: int = 90) -> List[Dict[str, Any]]:
        """
        Generate enhanced recommendations for Reserved Instance/Commitment purchases.
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        recommendations = []
        
        # Minimum run days required to recommend reserved instances (70% of analyzed period)
        min_days_running = days * 0.7
        
        # Minimum daily cost to consider for reservations
        min_daily_cost = 1.0  # $1/day
        
        # Get resource costs by day to analyze usage consistency
        query = self.db.query(
            CostData.resource_id,
            CostData.service,
            CloudAccount.provider,
            func.date_trunc('day', CostData.date).label('day'),
            func.sum(CostData.cost).label('daily_cost'),
            func.json_agg(CostData.tags).label('day_tags')
        ).join(
            CloudAccount,
            CostData.cloud_account_id == CloudAccount.id
        ).filter(
            CostData.date >= cutoff_date,
            CostData.service.in_(['EC2', 'Compute Engine', 'Virtual Machines', 'RDS', 'SQL Database', 'Cloud SQL'])
        )
        
        if account_id:
            query = query.filter(CostData.cloud_account_id == account_id)
            
        # Group by resource, day, service, and provider
        daily_costs = query.group_by(
            CostData.resource_id,
            func.date_trunc('day', CostData.date),
            CostData.service,
            CloudAccount.provider
        ).all()
        
        # Organize costs by resource
        resource_costs = {}
        for cost in daily_costs:
            key = (cost.resource_id, cost.service, cost.provider)
            if key not in resource_costs:
                resource_costs[key] = []
            resource_costs[key].append({
                'day': cost.day,
                'cost': cost.daily_cost,
                'tags': cost.day_tags
            })
        
        # Analyze each resource's usage pattern
        for (resource_id, service, provider), daily_data in resource_costs.items():
            # Skip resources that haven't been running consistently
            if len(daily_data) < min_days_running:
                continue
                
            # Calculate average daily cost
            avg_daily_cost = sum(day['cost'] for day in daily_data) / len(daily_data)
            
            # Skip resources with very low costs
            if avg_daily_cost < min_daily_cost:
                continue
                
            # Extract instance type from metadata
            metadata = self._extract_resource_metadata(daily_data[0]['tags'])
            instance_type = metadata.get('instance_type', 'unknown')
                
            # Calculate monthly on-demand cost
            monthly_on_demand = avg_daily_cost * 30
            
            # Set savings percentages based on provider and commitment term
            # These are approximate - actual savings would depend on specific instance types
            if provider == 'AWS':
                ri_1yr_savings_pct = 0.40  # 40% savings with 1-year RI
                ri_3yr_savings_pct = 0.60  # 60% savings with 3-year RI
                commitment_type = 'Reserved Instance'
            elif provider == 'Azure':
                ri_1yr_savings_pct = 0.35  # 35% savings with 1-year reservation
                ri_3yr_savings_pct = 0.55  # 55% savings with 3-year reservation
                commitment_type = 'Reserved Instance'
            elif provider == 'GCP':
                ri_1yr_savings_pct = 0.38  # 38% savings with 1-year commitment
                ri_3yr_savings_pct = 0.58  # 58% savings with 3-year commitment
                commitment_type = 'Committed Use Discount'
            else:
                ri_1yr_savings_pct = 0.35
                ri_3yr_savings_pct = 0.55
                commitment_type = 'Long-term Commitment'
                
            # Calculate estimated savings
            ri_1yr_savings = monthly_on_demand * ri_1yr_savings_pct * 12  # Annual savings
            ri_3yr_savings = monthly_on_demand * ri_3yr_savings_pct * 36  # 3-year savings
            
            # Determine confidence based on usage consistency
            # Calculate coefficient of variation (CV) to measure consistency
            costs = [day['cost'] for day in daily_data]
            cv = np.std(costs) / np.mean(costs) if np.mean(costs) > 0 else 0
            
            if cv < 0.1:  # Very consistent usage
                confidence = 'high'
            elif cv < 0.25:  # Moderately consistent
                confidence = 'medium'
            else:  # Variable usage
                confidence = 'low'
                
            # Add recommendation
            recommendations.append({
                'resource_id': resource_id,
                'service': service,
                'provider': provider,
                'instance_type': instance_type,
                'current_monthly_cost': monthly_on_demand,
                'recommendation': f"Purchase {commitment_type} for {instance_type} to save on consistent usage",
                'estimated_savings_1yr': ri_1yr_savings,
                'estimated_savings_3yr': ri_3yr_savings,
                'confidence': confidence,
                'metrics': {
                    'days_running': len(daily_data),
                    'usage_consistency': 100 - (cv * 100)  # Convert to percentage
                }
            })
            
        # Sort by estimated 1-year savings
        return sorted(recommendations, key=lambda x: x['estimated_savings_1yr'], reverse=True)

    def get_storage_optimization_recommendations(self, account_id: Optional[int] = None, days: int = 30) -> List[Dict[str, Any]]:
        """
        Generate recommendations for optimizing storage costs.
        This includes:
        1. Moving infrequently accessed data to cheaper storage tiers
        2. Deleting old snapshots
        3. Optimizing storage class selection
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        recommendations = []
        
        # Get storage-related resources
        query = self.db.query(
            CostData.resource_id,
            CostData.service,
            CloudAccount.provider,
            func.avg(CostData.cost).label('avg_cost'),
            func.json_agg(CostData.tags).label('all_tags')
        ).join(
            CloudAccount,
            CostData.cloud_account_id == CloudAccount.id
        ).filter(
            CostData.date >= cutoff_date,
            CostData.service.in_(['S3', 'Blob Storage', 'Cloud Storage', 'EBS', 'Persistent Disk', 'Managed Disks'])
        )
        
        if account_id:
            query = query.filter(CostData.cloud_account_id == account_id)
            
        # Group by resource, service, and provider
        storage_resources = query.group_by(
            CostData.resource_id, 
            CostData.service,
            CloudAccount.provider
        ).all()
        
        for resource in storage_resources:
            # Extract storage metadata and metrics
            metadata = self._extract_resource_metadata(resource.all_tags)
            metrics = self._extract_usage_metrics(resource.all_tags)
            
            # Analyze object storage (S3, Blob Storage, Cloud Storage)
            if resource.service in ('S3', 'Blob Storage', 'Cloud Storage'):
                # Check for infrequent access patterns
                access_frequency = metrics.get('access_frequency', 10)  # Accesses per month
                
                if access_frequency < 5:  # Very infrequently accessed
                    current_tier = metadata.get('storage_class', 'Standard')
                    
                    # Recommend appropriate storage tier based on provider
                    if resource.provider == 'AWS' and current_tier == 'Standard':
                        recommended_tier = 'Glacier'
                        savings_pct = 0.85  # Approx. 85% savings
                        
                    elif resource.provider == 'Azure' and current_tier == 'Hot':
                        recommended_tier = 'Archive'
                        savings_pct = 0.80  # Approx. 80% savings
                        
                    elif resource.provider == 'GCP' and current_tier == 'Standard':
                        recommended_tier = 'Coldline'
                        savings_pct = 0.75  # Approx. 75% savings
                        
                    else:
                        recommended_tier = 'Archive tier'
                        savings_pct = 0.75
                        
                    estimated_savings = resource.avg_cost * 30 * savings_pct
                    
                    recommendations.append({
                        'resource_id': resource.resource_id,
                        'service': resource.service,
                        'storage_class': current_tier,
                        'avg_daily_cost': resource.avg_cost,
                        'recommendation': f"Move infrequently accessed data from {current_tier} to {recommended_tier} storage tier",
                        'estimated_savings': estimated_savings,
                        'confidence': 'high' if access_frequency < 2 else 'medium',
                        'metrics': {
                            'access_frequency': access_frequency,
                            'size_gb': metrics.get('size_gb', None)
                        }
                    })
                    
            # Analyze block storage (EBS, Persistent Disk, Managed Disks)
            elif resource.service in ('EBS', 'Persistent Disk', 'Managed Disks'):
                # Check for underutilized storage
                percent_used = metrics.get('percent_used', 75)  # Default to 75% used
                
                if percent_used < 30:  # Significantly underutilized
                    volume_size = metrics.get('size_gb', 100)  # Default to 100GB
                    
                    # Calculate potential savings from downsizing
                    reduction_pct = 0.5  # Reduce by 50%
                    estimated_savings = resource.avg_cost * 30 * reduction_pct
                    
                    recommendations.append({
                        'resource_id': resource.resource_id,
                        'service': resource.service,
                        'volume_type': metadata.get('volume_type', 'Standard'),
                        'avg_daily_cost': resource.avg_cost,
                        'recommendation': f"Reduce disk size or consider using elastic storage - current utilization is only {percent_used}%",
                        'estimated_savings': estimated_savings,
                        'confidence': 'medium',
                        'metrics': {
                            'current_size_gb': volume_size,
                            'percent_used': percent_used
                        }
                    })
        
        return recommendations

    def get_network_optimization_recommendations(self, account_id: Optional[int] = None, days: int = 30) -> List[Dict[str, Any]]:
        """
        Generate recommendations for optimizing network costs.
        This includes:
        1. Using CDN for frequently accessed content
        2. Analyzing cross-region data transfer
        3. Identifying expensive network flows
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        recommendations = []
        
        # Get network-related resources
        query = self.db.query(
            CostData.resource_id,
            CostData.service,
            CloudAccount.provider,
            func.avg(CostData.cost).label('avg_cost'),
            func.json_agg(CostData.tags).label('all_tags')
        ).join(
            CloudAccount,
            CostData.cloud_account_id == CloudAccount.id
        ).filter(
            CostData.date >= cutoff_date,
            CostData.service.in_(['Data Transfer', 'VPC Network', 'Virtual Network', 'CloudFront', 'CDN', 'Load Balancer'])
        )
        
        if account_id:
            query = query.filter(CostData.cloud_account_id == account_id)
            
        # Group by resource, service, and provider
        network_resources = query.group_by(
            CostData.resource_id, 
            CostData.service,
            CloudAccount.provider
        ).all()
        
        for resource in network_resources:
            # Extract network metadata and metrics
            metadata = self._extract_resource_metadata(resource.all_tags)
            metrics = self._extract_usage_metrics(resource.all_tags)
            
            # Analyze data transfer costs
            if resource.service == 'Data Transfer':
                # Check for high cross-region transfer
                transfer_gb = metrics.get('transfer_gb', 100)
                cross_region_pct = metrics.get('cross_region_pct', 20)
                
                if cross_region_pct > 50 and transfer_gb > 100:
                    # High cross-region transfer
                    estimated_savings = resource.avg_cost * 30 * 0.4  # Approx. 40% savings
                    
                    recommendations.append({
                        'resource_id': resource.resource_id,
                        'service': resource.service,
                        'avg_daily_cost': resource.avg_cost,
                        'recommendation': f"Consider deploying resources in the same region to reduce cross-region data transfer costs",
                        'estimated_savings': estimated_savings,
                        'confidence': 'medium',
                        'metrics': {
                            'transfer_gb': transfer_gb,
                            'cross_region_pct': cross_region_pct
                        }
                    })
                    
            # Analyze CDN usage potential
            elif resource.service in ('Load Balancer'):
                # Check for high outbound traffic that could benefit from CDN
                outbound_gb = metrics.get('outbound_gb', 50)
                cache_potential = metrics.get('cache_potential', 60)  # % of traffic that could be cached
                
                if outbound_gb > 500 and cache_potential > 50:
                    # High outbound traffic with caching potential
                    estimated_savings = resource.avg_cost * 30 * 0.3  # Approx. 30% savings
                    
                    recommendations.append({
                        'resource_id': resource.resource_id,
                        'service': resource.service,
                        'avg_daily_cost': resource.avg_cost,
                        'recommendation': f"Consider using a CDN for serving static content to reduce data transfer costs",
                        'estimated_savings': estimated_savings,
                        'confidence': 'medium',
                        'metrics': {
                            'outbound_gb': outbound_gb,
                            'cache_potential': cache_potential
                        }
                    })
        
        return recommendations