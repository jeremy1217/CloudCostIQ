import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import logging
from typing import List, Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)

class EnhancedOptimizer:
    """
    Advanced cloud cost optimization engine with tailored recommendations
    and projected savings calculations.
    """
    
    # Optimization categories
    OPTIMIZATION_CATEGORIES = [
        "instance_rightsizing",
        "reserved_instances",
        "storage_optimization",
        "networking_cost",
        "idle_resources",
        "data_transfer",
        "licensing_optimization",
        "serverless_migration",
        "auto_scaling",
        "spot_instances"
    ]
    
    # Provider-specific optimization details
    PROVIDER_OPTIMIZATIONS = {
        "AWS": {
            "instance_rightsizing": {
                "title": "EC2 Instance Rightsizing",
                "description": "Optimize EC2 instance types based on actual resource utilization patterns",
                "command_template": "aws ec2 modify-instance-attribute --instance-id {resource_id} --instance-type {recommended_type}",
                "savings_range": (0.20, 0.40),  # 20-40% savings range
                "services": ["EC2"],
                "resource_types": ["instance"]
            },
            "reserved_instances": {
                "title": "Reserved Instance Opportunities",
                "description": "Purchase Reserved Instances for consistent workloads to save over on-demand pricing",
                "command_template": "aws ec2 purchase-reserved-instances-offering --instance-count {count} --reserved-instances-offering-id {offering_id}",
                "savings_range": (0.30, 0.60),  # 30-60% savings range
                "services": ["EC2", "RDS", "ElastiCache", "Redshift"],
                "resource_types": ["instance", "database"]
            },
            "storage_optimization": {
                "title": "S3 Storage Class Optimization",
                "description": "Move infrequently accessed data to lower-cost storage tiers",
                "command_template": "aws s3 cp s3://{bucket}/{key} s3://{bucket}/{key} --storage-class {recommended_class}",
                "savings_range": (0.50, 0.70),  # 50-70% savings range
                "services": ["S3", "EBS"],
                "resource_types": ["bucket", "volume"]
            },
            "idle_resources": {
                "title": "Cleanup Idle Resources",
                "description": "Identify and remove unused resources to eliminate unnecessary costs",
                "command_template": "aws ec2 terminate-instances --instance-ids {resource_id}",
                "savings_range": (0.80, 1.00),  # 80-100% savings range (potentially full resource cost)
                "services": ["EC2", "EBS", "RDS", "ELB", "NAT Gateway"],
                "resource_types": ["instance", "volume", "database", "load_balancer", "gateway"]
            }
        },
        "Azure": {
            "instance_rightsizing": {
                "title": "VM Size Optimization",
                "description": "Resize Azure VMs based on actual resource utilization patterns",
                "command_template": "az vm resize --resource-group {resource_group} --name {name} --size {recommended_size}",
                "savings_range": (0.20, 0.40),
                "services": ["VM"],
                "resource_types": ["virtualMachine"]
            },
            "reserved_instances": {
                "title": "Azure Reserved VM Instances",
                "description": "Purchase Azure Reserved VM Instances for consistent workloads",
                "command_template": "az vm reserved-instances purchase --resource-group {resource_group} --name {name} --sku {sku}",
                "savings_range": (0.30, 0.60),
                "services": ["VM", "SQL Database"],
                "resource_types": ["virtualMachine", "database"]
            },
            "storage_optimization": {
                "title": "Storage Tier Optimization",
                "description": "Move infrequently accessed data to lower-cost storage tiers",
                "command_template": "az storage blob copy start --account-name {account_name} --destination-blob {blob} --destination-container {container} --source-uri {source_uri} --tier {recommended_tier}",
                "savings_range": (0.40, 0.70),
                "services": ["Storage"],
                "resource_types": ["storageAccount", "blob"]
            },
            "hybrid_benefit": {
                "title": "Azure Hybrid Benefit",
                "description": "Use existing Windows Server and SQL Server licenses on Azure",
                "command_template": "az vm update --resource-group {resource_group} --name {name} --license-type {license_type}",
                "savings_range": (0.40, 0.60),
                "services": ["VM", "SQL Database"],
                "resource_types": ["virtualMachine", "database"]
            }
        },
        "GCP": {
            "instance_rightsizing": {
                "title": "Compute Engine Rightsizing",
                "description": "Resize Compute Engine instances based on actual resource utilization",
                "command_template": "gcloud compute instances set-machine-type {instance} --machine-type {recommended_type} --zone {zone}",
                "savings_range": (0.20, 0.40),
                "services": ["Compute Engine"],
                "resource_types": ["instance"]
            },
            "committed_use": {
                "title": "Committed Use Discounts",
                "description": "Purchase committed use contracts for consistent workloads",
                "command_template": "gcloud compute commitments create {name} --region {region} --plan {plan} --type {type}",
                "savings_range": (0.30, 0.60),
                "services": ["Compute Engine", "Cloud SQL"],
                "resource_types": ["instance", "database"]
            },
            "storage_optimization": {
                "title": "Cloud Storage Class Optimization",
                "description": "Move infrequently accessed data to lower-cost storage classes",
                "command_template": "gsutil rewrite -s {recommended_class} gs://{bucket}/{object}",
                "savings_range": (0.40, 0.70),
                "services": ["Cloud Storage"],
                "resource_types": ["bucket"]
            },
            "preemptible_vms": {
                "title": "Preemptible VMs for Batch Jobs",
                "description": "Use preemptible VMs for fault-tolerant workloads",
                "command_template": "gcloud compute instances create {name} --preemptible --machine-type {type} --zone {zone}",
                "savings_range": (0.60, 0.80),
                "services": ["Compute Engine"],
                "resource_types": ["instance"]
            }
        }
    }
    
    def __init__(self, utilization_threshold=0.3):
        """Initialize the optimizer with configuration parameters."""
        self.utilization_threshold = utilization_threshold
        
    def generate_optimization_suggestions(self, 
                                         cost_data: List[Dict[str, Any]],
                                         utilization_data: Optional[List[Dict[str, Any]]] = None,
                                         targeted_services: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Generate cost optimization recommendations based on cost and utilization data.
        
        Args:
            cost_data: List of dicts with provider, service, cost, etc.
            utilization_data: Optional list of resource utilization metrics
            targeted_services: Optional list of services to focus on
            
        Returns:
            dict: Optimization results including recommendations and metadata
        """
        if not cost_data:
            return {
                "recommendations": [],
                "potential_savings": 0,
                "coverage": 0,
                "timestamp": datetime.now().isoformat()
            }
        
        # Convert to dataframe
        df_costs = pd.DataFrame(cost_data)
        
        # Process utilization data if available
        df_utilization = None
        if utilization_data:
            df_utilization = pd.DataFrame(utilization_data)
        
        # Filter by targeted services if specified
        if targeted_services:
            df_costs = df_costs[df_costs['service'].isin(targeted_services)]
            
        # Generate recommendations
        recommendations = []
        
        # Group by provider to apply provider-specific optimizations
        for provider, provider_df in df_costs.groupby('provider'):
            # Skip if provider not supported
            if provider not in self.PROVIDER_OPTIMIZATIONS:
                continue
                
            provider_recommendations = self._generate_provider_recommendations(
                provider, provider_df, df_utilization)
                
            recommendations.extend(provider_recommendations)
            
        # Calculate total potential savings
        total_cost = df_costs['cost'].sum()
        total_savings = sum(rec.get('estimated_savings', 0) for rec in recommendations)
        coverage = total_savings / total_cost if total_cost > 0 else 0
            
        return {
            "recommendations": recommendations,
            "potential_savings": round(total_savings, 2),
            "potential_savings_percentage": round(coverage * 100, 2),
            "total_analyzed_cost": round(total_cost, 2),
            "provider_breakdown": self._get_provider_breakdown(recommendations),
            "highest_impact_category": self._get_highest_impact_category(recommendations),
            "recommendation_count": len(recommendations),
            "timestamp": datetime.now().isoformat()
        }
        
    def _generate_provider_recommendations(self, 
                                          provider: str, 
                                          df: pd.DataFrame,
                                          utilization_df: Optional[pd.DataFrame]) -> List[Dict[str, Any]]:
        """Generate optimization recommendations for a specific provider."""
        recommendations = []
        provider_optimizations = self.PROVIDER_OPTIMIZATIONS.get(provider, {})
        
        # Process each optimization category for this provider
        for category, optimization in provider_optimizations.items():
            # Skip if no relevant services in the data
            relevant_services = set(optimization['services']).intersection(set(df['service']))
            if not relevant_services:
                continue
                
            # Filter data for relevant services
            category_df = df[df['service'].isin(optimization['services'])]
            
            # Generate recommendations for this category
            category_recommendations = self._generate_category_recommendations(
                provider, category, optimization, category_df, utilization_df)
                
            recommendations.extend(category_recommendations)
            
        return recommendations
    
    def _recommend_instance_type(self, provider: str, current_type: str, cpu_utilization: float, memory_utilization: float) -> str:
        """Recommend a new instance type based on utilization metrics."""
        if not current_type or current_type == "unknown":
            return None
            
        # Simple instance type logic - in a real implementation, this would be much more sophisticated
        # with detailed knowledge of instance type hierarchies for each cloud provider
        
        # If both CPU and memory utilization are very low, recommend downsizing
        if cpu_utilization < 0.2 and memory_utilization < 0.3:
            # AWS EC2 instance types
            if provider == "AWS" and current_type.startswith("t"):
                # T-series instances (general purpose)
                if current_type.endswith("2xlarge"):
                    return current_type.replace("2xlarge", "xlarge")
                elif current_type.endswith("xlarge"):
                    return current_type.replace("xlarge", "large")
                elif current_type.endswith("large"):
                    return current_type.replace("large", "medium")
                elif current_type.endswith("medium"):
                    return current_type.replace("medium", "small")
                else:
                    return current_type  # Can't downsize further
            
            elif provider == "AWS" and current_type.startswith("m"):
                # M-series instances (general purpose)
                if current_type.endswith("2xlarge"):
                    return current_type.replace("2xlarge", "xlarge")
                elif current_type.endswith("4xlarge"):
                    return current_type.replace("4xlarge", "2xlarge")
                elif current_type.endswith("12xlarge"):
                    return current_type.replace("12xlarge", "4xlarge")
                elif current_type.endswith("24xlarge"):
                    return current_type.replace("24xlarge", "12xlarge")
                elif current_type.endswith("xlarge"):
                    return current_type.replace("xlarge", "large")
                else:
                    return current_type  # Can't downsize further
            
            elif provider == "AWS" and current_type.startswith("c"):
                # C-series instances (compute optimized)
                if current_type.endswith("2xlarge"):
                    return current_type.replace("2xlarge", "xlarge")
                elif current_type.endswith("4xlarge"):
                    return current_type.replace("4xlarge", "2xlarge")
                elif current_type.endswith("9xlarge"):
                    return current_type.replace("9xlarge", "4xlarge")
                elif current_type.endswith("18xlarge"):
                    return current_type.replace("18xlarge", "9xlarge")
                elif current_type.endswith("xlarge"):
                    return current_type.replace("xlarge", "large")
                else:
                    return current_type  # Can't downsize further
                
            # Azure VM sizes
            elif provider == "Azure" and current_type.startswith("Standard_D"):
                # D-series VMs (general purpose)
                if current_type.endswith("_v4"):
                    size_part = current_type.split("_v4")[0]
                    if size_part.endswith("s"):
                        size_part = size_part[:-1]  # Remove the 's' if present
                        
                    if "16" in size_part:
                        return size_part.replace("16", "8") + "s_v4"
                    elif "8" in size_part:
                        return size_part.replace("8", "4") + "s_v4"
                    elif "4" in size_part:
                        return size_part.replace("4", "2") + "s_v4"
                    elif "2" in size_part:
                        return size_part.replace("2", "") + "s_v4"
                    else:
                        return current_type  # Can't downsize further
                else:
                    return current_type
                    
            # GCP machine types
            elif provider == "GCP" and current_type.startswith("n1-standard-"):
                # N1 standard machines
                size = current_type.split("n1-standard-")[1]
                try:
                    size_num = int(size)
                    if size_num > 1:
                        return f"n1-standard-{size_num // 2}"
                    else:
                        return current_type  # Can't downsize further
                except ValueError:
                    return current_type
                    
            elif provider == "GCP" and current_type.startswith("n2-standard-"):
                # N2 standard machines
                size = current_type.split("n2-standard-")[1]
                try:
                    size_num = int(size)
                    if size_num > 1:
                        return f"n2-standard-{size_num // 2}"
                    else:
                        return current_type  # Can't downsize further
                except ValueError:
                    return current_type
                    
            elif provider == "GCP" and current_type.startswith("e2-standard-"):
                # E2 standard machines
                size = current_type.split("e2-standard-")[1]
                try:
                    size_num = int(size)
                    if size_num > 1:
                        return f"e2-standard-{size_num // 2}"
                    else:
                        return current_type  # Can't downsize further
                except ValueError:
                    return current_type
        
        # If we can't determine a specific recommendation, return the current type
        return current_type
    
    def _downsize_instance_type(self, provider: str, current_type: str) -> str:
        """Suggest a downsized instance type based on the current type."""
        # This is a simplified version of _recommend_instance_type without utilization data
        return self._recommend_instance_type(provider, current_type, 0.1, 0.1)
        
    def _get_provider_breakdown(self, recommendations: List[Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
        """Calculate savings breakdown by provider."""
        result = {}
        
        for rec in recommendations:
            provider = rec.get('provider', 'Unknown')
            savings = rec.get('estimated_savings', 0)
            
            if provider not in result:
                result[provider] = {"count": 0, "savings": 0}
                
            result[provider]["count"] += 1
            result[provider]["savings"] += savings
            
        # Round savings values
        for provider in result:
            result[provider]["savings"] = round(result[provider]["savings"], 2)
            
        return result
        
    def _get_highest_impact_category(self, recommendations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Identify the optimization category with highest potential savings."""
        category_savings = {}
        
        for rec in recommendations:
            category = rec.get('category', 'unknown')
            savings = rec.get('estimated_savings', 0)
            
            if category not in category_savings:
                category_savings[category] = {"count": 0, "savings": 0}
                
            category_savings[category]["count"] += 1
            category_savings[category]["savings"] += savings
            
        # Find highest impact category
        highest_impact = {"category": None, "savings": 0, "count": 0}
        for category, data in category_savings.items():
            if data["savings"] > highest_impact["savings"]:
                highest_impact["category"] = category
                highest_impact["savings"] = data["savings"]
                highest_impact["count"] = data["count"]
                
        # Round savings value
        highest_impact["savings"] = round(highest_impact["savings"], 2)
        
        return highest_impact

# Main function to use in API endpoints
def generate_optimization_suggestions(cost_data, utilization_data=None, targeted_services=None):
    """
    Generate cost optimization recommendations based on cloud cost data.
    
    Args:
        cost_data (list of dicts): [{'provider': 'AWS', 'service': 'EC2', 'cost': 120.5, ...}]
        utilization_data (list of dicts, optional): Resource utilization metrics
        targeted_services (list, optional): Specific services to focus on
        
    Returns:
        dict: Optimization results including recommendations and metadata
    """
    optimizer = EnhancedOptimizer()
    return optimizer.generate_optimization_suggestions(cost_data, utilization_data, targeted_services)
        
    def _generate_licensing_recommendations(self,
                                          provider: str,
                                          optimization: Dict[str, Any],
                                          df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Generate recommendations for licensing optimization."""
        recommendations = []
        
        # Focus on resources that would benefit from licensing changes
        if provider == "Azure" and 'os_type' in df.columns:
            # Find Windows VMs that could benefit from Hybrid Benefit
            windows_vms = df[
                (df['service'] == "VM") & 
                (df['os_type'] == "Windows")
            ]
            
            for _, row in windows_vms.iterrows():
                resource_id = row.get('resource_id', 'unknown')
                resource_cost = row['cost']
                
                # Azure Hybrid Benefit typically saves ~40% on Windows licensing
                savings_factor = 0.4
                estimated_savings = resource_cost * savings_factor
                
                command = f"az vm update --resource-group YOUR_RESOURCE_GROUP --name {resource_id} --license-type Windows_Server"
                
                recommendation = {
                    "id": f"hybrid-benefit-{resource_id}",
                    "provider": provider,
                    "service": "VM",
                    "category": "hybrid_benefit",
                    "title": "Azure Hybrid Benefit for Windows",
                    "description": f"Apply Azure Hybrid Benefit to Windows VM {resource_id} to use existing Windows Server licenses.",
                    "resource_id": resource_id,
                    "current_cost": round(resource_cost, 2),
                    "estimated_savings": round(estimated_savings, 2),
                    "savings_percentage": round(savings_factor * 100, 2),
                    "implementation_effort": "low",
                    "command": command,
                    "applied": False,
                    "prerequisites": "Requires existing on-premises Windows Server licenses with Software Assurance."
                }
                
                recommendations.append(recommendation)
                
        elif provider == "AWS" and 'license_included' in df.columns:
            # Find AWS resources with included licenses that could be "bring your own license"
            license_resources = df[
                df['license_included'] == True
            ]
            
            for _, row in license_resources.iterrows():
                resource_id = row.get('resource_id', 'unknown')
                resource_cost = row['cost']
                
                # License optimization usually saves ~30% on relevant costs
                savings_factor = 0.3
                estimated_savings = resource_cost * savings_factor
                
                service = row.get('service', 'Unknown')
                if service == "EC2":
                    command = f"aws ec2 modify-instance-attribute --instance-id {resource_id} --license-specifications ..."
                elif service == "RDS":
                    command = f"aws rds modify-db-instance --db-instance-identifier {resource_id} --license-model bring-your-own-license"
                else:
                    command = "See AWS documentation for BYOL conversion for this service."
                
                recommendation = {
                    "id": f"byol-{resource_id}",
                    "provider": provider,
                    "service": service,
                    "category": "licensing_optimization",
                    "title": "Use BYOL (Bring Your Own License)",
                    "description": f"Convert {service} instance {resource_id} from license-included to BYOL model.",
                    "resource_id": resource_id,
                    "current_cost": round(resource_cost, 2),
                    "estimated_savings": round(estimated_savings, 2),
                    "savings_percentage": round(savings_factor * 100, 2),
                    "implementation_effort": "medium",
                    "command": command,
                    "applied": False,
                    "prerequisites": "Requires existing licenses and possibly migration to new instances."
                }
                
                recommendations.append(recommendation)
        
        return recommendations
        
    def _generate_spot_instance_recommendations(self,
                                               provider: str,
                                               optimization: Dict[str, Any],
                                               df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Generate recommendations for using spot/preemptible instances."""
        recommendations = []
        
        # This would require workload analysis to determine suitable workloads
        # For this example, we'll use a simplistic approach
        
        compute_services = ["EC2", "VM", "Compute Engine"]
        compute_df = df[df['service'].isin(compute_services)]
        
        if 'workload_type' in compute_df.columns:
            # Find batch processing or fault-tolerant workloads
            suitable_workloads = compute_df[
                compute_df['workload_type'].isin(['batch', 'stateless', 'fault-tolerant'])
            ]
            
            for _, row in suitable_workloads.iterrows():
                resource_id = row.get('resource_id', 'unknown')
                resource_cost = row['cost']
                
                # Spot/preemptible instances typically save 60-90%
                savings_factor = 0.7
                estimated_savings = resource_cost * savings_factor
                
                if provider == "AWS":
                    title = "Use EC2 Spot Instances"
                    description = f"Consider using Spot Instances for {row.get('workload_type')} workload currently running on {resource_id}."
                    command = f"aws ec2 request-spot-instances --instance-count 1 --type persistent --launch-specification file://spec.json"
                elif provider == "Azure":
                    title = "Use Azure Spot VMs"
                    description = f"Consider migrating {row.get('workload_type')} workload from {resource_id} to Azure Spot VMs."
                    command = f"az vm create --resource-group YOUR_RESOURCE_GROUP --name {resource_id}-spot --priority Spot --eviction-policy Deallocate"
                elif provider == "GCP":
                    title = "Use Preemptible VMs"
                    description = f"Consider using Preemptible VMs for {row.get('workload_type')} workload currently running on {resource_id}."
                    command = f"gcloud compute instances create {resource_id}-preemptible --preemptible"
                else:
                    continue
                
                recommendation = {
                    "id": f"spot-{resource_id}",
                    "provider": provider,
                    "service": row.get('service', 'Unknown'),
                    "category": "spot_instances",
                    "title": title,
                    "description": description,
                    "resource_id": resource_id,
                    "current_cost": round(resource_cost, 2),
                    "estimated_savings": round(estimated_savings, 2),
                    "savings_percentage": round(savings_factor * 100, 2),
                    "implementation_effort": "high",
                    "command": command,
                    "applied": False,
                    "risk": "medium",
                    "additional_info": "Requires application changes to handle instance interruptions gracefully."
                }
                
                recommendations.append(recommendation)
        else:
            # Without workload type, make more conservative recommendations
            # Find top 3 compute instances by cost
            if len(compute_df) > 0:
                top_compute = compute_df.sort_values('cost', ascending=False).head(3)
                
                for _, row in top_compute.iterrows():
                    resource_id = row.get('resource_id', 'unknown')
                    resource_cost = row['cost']
                    
                    # More conservative savings estimate
                    savings_factor = 0.5
                    estimated_savings = resource_cost * savings_factor
                    
                    if provider == "AWS":
                        title = "Evaluate EC2 Spot Instances"
                        description = "Evaluate if workload is suitable for Spot Instances to save up to 90% on compute costs."
                        command = f"aws ec2 describe-spot-price-history --instance-types {row.get('instance_type', 'unknown')}"
                    elif provider == "Azure":
                        title = "Evaluate Azure Spot VMs"
                        description = "Evaluate if workload is suitable for Azure Spot VMs to save up to 90% on VM costs."
                        command = "az vm list-skus --location YOUR_LOCATION --resource-type virtualMachines --all"
                    elif provider == "GCP":
                        title = "Evaluate Preemptible VMs"
                        description = "Evaluate if workload is suitable for Preemptible VMs to save up to 80% on compute costs."
                        command = "gcloud compute machine-types list"
                    else:
                        continue
                    
                    recommendation = {
                        "id": f"spot-eval-{resource_id}",
                        "provider": provider,
                        "service": row.get('service', 'Unknown'),
                        "category": "spot_instances",
                        "title": title,
                        "description": description,
                        "resource_id": resource_id,
                        "current_cost": round(resource_cost, 2),
                        "estimated_savings": round(estimated_savings, 2),
                        "savings_percentage": round(savings_factor * 100, 2),
                        "implementation_effort": "high",
                        "command": command,
                        "applied": False,
                        "confidence": "low",
                        "additional_info": "Further workload analysis needed to determine suitability for spot/preemptible instances."
                    }
                    
                    recommendations.append(recommendation)
        
        return recommendations
    
    def _generate_storage_recommendations(self,
                                        provider: str,
                                        optimization: Dict[str, Any],
                                        df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Generate storage optimization recommendations."""
        recommendations = []
        
        # Focus on storage resources
        storage_services = optimization.get('services', [])
        storage_df = df[df['service'].isin(storage_services)]
        
        if storage_df.empty:
            return recommendations
            
        # Group by bucket/storage account to get total cost
        if 'resource_id' in storage_df.columns:
            storage_costs = storage_df.groupby('resource_id').agg({
                'cost': 'sum',
                'service': 'first'
            }).reset_index()
            
            # Sort by cost descending
            storage_costs = storage_costs.sort_values('cost', ascending=False)
            
            # Focus on top expensive storage resources
            top_storage = storage_costs.head(10)
            
            for _, row in top_storage.iterrows():
                # Calculate savings
                storage_cost = row['cost']
                savings_range = optimization.get('savings_range', (0.4, 0.7))
                savings_factor = (savings_range[0] + savings_range[1]) / 2
                estimated_savings = storage_cost * savings_factor
                
                # Determine recommended storage class based on provider
                current_class = "Standard"
                if provider == "AWS":
                    recommended_class = "STANDARD_IA"  # Infrequent Access
                elif provider == "Azure":
                    recommended_class = "Cool"
                elif provider == "GCP":
                    recommended_class = "NEARLINE"
                else:
                    recommended_class = "Lower-tier storage"
                
                # Create command if possible
                command = ""
                resource_id = row.get('resource_id', 'unknown')
                
                if provider == "AWS":
                    command = f"aws s3 ls s3://{resource_id} --recursive | grep -v STANDARD_IA | awk '{{print $4}}' | xargs -I {{}} aws s3 cp s3://{resource_id}/{{}} s3://{resource_id}/{{}} --storage-class STANDARD_IA"
                elif provider == "Azure":
                    command = f"az storage blob service-properties update --account-name {resource_id} --tier Cool"
                elif provider == "GCP":
                    command = f"gsutil rewrite -s nearline gs://{resource_id}/**"
                
                recommendation = {
                    "id": f"storage-{resource_id}",
                    "provider": provider,
                    "service": row.get('service', 'Unknown'),
                    "category": "storage_optimization",
                    "title": optimization['title'],
                    "description": f"Move infrequently accessed data in {resource_id} to {recommended_class} storage class to reduce costs.",
                    "resource_id": resource_id,
                    "current_storage_class": current_class,
                    "recommended_storage_class": recommended_class,
                    "current_cost": round(storage_cost, 2),
                    "estimated_savings": round(estimated_savings, 2),
                    "savings_percentage": round(savings_factor * 100, 2),
                    "implementation_effort": "medium",
                    "command": command,
                    "applied": False,
                    "additional_info": "Analyze data access patterns before implementation to ensure data is truly infrequently accessed."
                }
                
                recommendations.append(recommendation)
        
        return recommendations
    
    def _generate_idle_resource_recommendations(self,
                                              provider: str,
                                              optimization: Dict[str, Any],
                                              df: pd.DataFrame,
                                              utilization_df: Optional[pd.DataFrame]) -> List[Dict[str, Any]]:
        """Generate recommendations for idle or unused resources."""
        recommendations = []
        
        # Need utilization data for effective idle resource detection
        if utilization_df is None:
            return recommendations
            
        # Join cost and utilization data
        if 'resource_id' in df.columns and 'resource_id' in utilization_df.columns:
            merged_df = pd.merge(df, utilization_df, on='resource_id', how='inner')
        else:
            return recommendations
            
        # Check for idle resources based on utilization
        # Define thresholds for "idle" based on resource type
        if 'cpu_utilization' in merged_df.columns:
            # Find compute resources with very low CPU utilization
            idle_compute = merged_df[
                merged_df['cpu_utilization'] < 0.05  # Less than 5% CPU usage
            ]
            
            for _, row in idle_compute.iterrows():
                resource_id = row.get('resource_id', 'unknown')
                resource_cost = row['cost']
                
                # For idle resources, potential savings is nearly the full cost
                savings_factor = 0.95  # 95% savings by removing idle resources
                estimated_savings = resource_cost * savings_factor
                
                # Create command if possible
                command = ""
                
                if provider == "AWS":
                    if row.get('service') == "EC2":
                        command = f"aws ec2 stop-instances --instance-ids {resource_id}"
                    elif row.get('service') == "RDS":
                        command = f"aws rds stop-db-instance --db-instance-identifier {resource_id}"
                elif provider == "Azure":
                    if row.get('service') == "VM":
                        command = f"az vm deallocate --resource-group YOUR_RESOURCE_GROUP --name {resource_id}"
                elif provider == "GCP":
                    if row.get('service') == "Compute Engine":
                        command = f"gcloud compute instances stop {resource_id} --zone YOUR_ZONE"
                
                recommendation = {
                    "id": f"idle-{resource_id}",
                    "provider": provider,
                    "service": row.get('service', 'Unknown'),
                    "category": "idle_resources",
                    "title": "Idle Resource Cleanup",
                    "description": f"Resource {resource_id} is idle with less than 5% CPU utilization. Consider stopping or terminating.",
                    "resource_id": resource_id,
                    "current_cost": round(resource_cost, 2),
                    "estimated_savings": round(estimated_savings, 2),
                    "savings_percentage": round(savings_factor * 100, 2),
                    "implementation_effort": "low",
                    "utilization_metrics": {
                        "cpu": round(row.get('cpu_utilization', 0) * 100, 2),
                        "memory": round(row.get('memory_utilization', 0) * 100, 2) if 'memory_utilization' in row else None
                    },
                    "command": command,
                    "applied": False,
                    "risk": "low" if row.get('cpu_utilization', 0) < 0.01 else "medium"
                }
                
                recommendations.append(recommendation)
                
        # Check for unattached storage resources (e.g., EBS volumes)
        if 'attached' in merged_df.columns:
            unattached_storage = merged_df[
                merged_df['attached'] == False
            ]
            
            for _, row in unattached_storage.iterrows():
                resource_id = row.get('resource_id', 'unknown')
                resource_cost = row['cost']
                
                # Full savings for unattached storage
                savings_factor = 1.0
                estimated_savings = resource_cost
                
                # Create command if possible
                command = ""
                
                if provider == "AWS":
                    if row.get('service') == "EBS":
                        command = f"aws ec2 delete-volume --volume-id {resource_id}"
                elif provider == "Azure":
                    if row.get('service') == "Storage":
                        command = f"az disk delete --resource-group YOUR_RESOURCE_GROUP --name {resource_id} --yes"
                elif provider == "GCP":
                    if row.get('service') == "Compute Engine":
                        command = f"gcloud compute disks delete {resource_id} --zone YOUR_ZONE"
                
                recommendation = {
                    "id": f"unattached-{resource_id}",
                    "provider": provider,
                    "service": row.get('service', 'Unknown'),
                    "category": "idle_resources",
                    "title": "Unattached Storage Cleanup",
                    "description": f"Storage volume {resource_id} is not attached to any instance. Consider deleting if not needed.",
                    "resource_id": resource_id,
                    "current_cost": round(resource_cost, 2),
                    "estimated_savings": round(estimated_savings, 2),
                    "savings_percentage": 100,
                    "implementation_effort": "low",
                    "command": command,
                    "applied": False,
                    "risk": "medium",
                    "additional_info": "Take a snapshot before deletion if the data might be valuable."
                }
                
                recommendations.append(recommendation)
        
        return recommendations
        
    def _generate_category_recommendations(self,
                                          provider: str,
                                          category: str,
                                          optimization: Dict[str, Any],
                                          df: pd.DataFrame,
                                          utilization_df: Optional[pd.DataFrame]) -> List[Dict[str, Any]]:
        """Generate recommendations for a specific optimization category."""
        recommendations = []
        
        # Handle different optimization categories
        if category == "instance_rightsizing":
            recommendations = self._generate_rightsizing_recommendations(
                provider, optimization, df, utilization_df)
                
        elif category == "reserved_instances" or category == "committed_use":
            recommendations = self._generate_reservation_recommendations(
                provider, optimization, df)
                
        elif category == "storage_optimization":
            recommendations = self._generate_storage_recommendations(
                provider, optimization, df)
                
        elif category == "idle_resources":
            recommendations = self._generate_idle_resource_recommendations(
                provider, optimization, df, utilization_df)
                
        elif category == "hybrid_benefit":
            recommendations = self._generate_licensing_recommendations(
                provider, optimization, df)
                
        elif category == "preemptible_vms" or category == "spot_instances":
            recommendations = self._generate_spot_instance_recommendations(
                provider, optimization, df)
        
        return recommendations
    
    def _generate_rightsizing_recommendations(self,
                                            provider: str,
                                            optimization: Dict[str, Any],
                                            df: pd.DataFrame,
                                            utilization_df: Optional[pd.DataFrame]) -> List[Dict[str, Any]]:
        """Generate instance rightsizing recommendations."""
        recommendations = []
        
        # Need utilization data for effective rightsizing
        if utilization_df is None:
            # If no utilization data, use cost-based heuristics
            return self._generate_cost_based_rightsizing(provider, optimization, df)
            
        # Join cost and utilization data
        # This assumes utilization_df has 'resource_id' that can be joined with df
        if 'resource_id' in df.columns and 'resource_id' in utilization_df.columns:
            merged_df = pd.merge(df, utilization_df, on='resource_id', how='inner')
        else:
            # Can't join, use cost-based approach
            return self._generate_cost_based_rightsizing(provider, optimization, df)
            
        # Check for underutilized instances (CPU and memory)
        underutilized = merged_df[
            (merged_df['cpu_utilization'] < self.utilization_threshold) &
            (merged_df['memory_utilization'] < self.utilization_threshold)
        ]
        
        # Generate recommendations for underutilized instances
        for _, row in underutilized.iterrows():
            # Determine recommended instance type based on utilization
            current_type = row.get('instance_type', 'unknown')
            recommended_type = self._recommend_instance_type(
                provider, current_type, row.get('cpu_utilization', 0), row.get('memory_utilization', 0))
                
            if recommended_type and recommended_type != current_type:
                # Calculate savings
                current_cost = row['cost']
                # Get the midpoint of the savings range for this optimization
                savings_range = optimization.get('savings_range', (0.2, 0.4))
                savings_factor = (savings_range[0] + savings_range[1]) / 2
                estimated_savings = current_cost * savings_factor
                
                # Create recommendation
                command = optimization['command_template'].format(
                    resource_id=row.get('resource_id', 'RESOURCE_ID'),
                    recommended_type=recommended_type
                )
                
                recommendation = {
                    "id": f"rightsize-{row.get('resource_id', 'unknown')}",
                    "provider": provider,
                    "service": row.get('service', 'Unknown'),
                    "category": "instance_rightsizing",
                    "title": optimization['title'],
                    "description": optimization['description'],
                    "current_resource_type": current_type,
                    "recommended_resource_type": recommended_type,
                    "resource_id": row.get('resource_id', 'unknown'),
                    "current_cost": round(current_cost, 2),
                    "estimated_savings": round(estimated_savings, 2),
                    "savings_percentage": round(savings_factor * 100, 2),
                    "utilization_metrics": {
                        "cpu": round(row.get('cpu_utilization', 0) * 100, 2),
                        "memory": round(row.get('memory_utilization', 0) * 100, 2)
                    },
                    "implementation_effort": "medium",
                    "command": command,
                    "applied": False
                }
                
                recommendations.append(recommendation)
                
        return recommendations
        
    def _generate_cost_based_rightsizing(self,
                                         provider: str,
                                         optimization: Dict[str, Any],
                                         df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Generate rightsizing recommendations based on cost patterns when utilization data is unavailable."""
        recommendations = []
        
        # Group by instance type to find expensive instance types
        if 'instance_type' in df.columns:
            instance_costs = df.groupby('instance_type')['cost'].sum().reset_index()
            # Sort by cost descending
            instance_costs = instance_costs.sort_values('cost', ascending=False)
            
            # Focus on top 20% most expensive instance types
            top_instances = instance_costs.head(max(1, int(len(instance_costs) * 0.2)))
            
            for _, row in top_instances.iterrows():
                instance_type = row['instance_type']
                cost = row['cost']
                
                # Get all resources of this type
                instances = df[df['instance_type'] == instance_type]
                
                # Choose a reasonable percentage of instances to recommend for rightsizing
                # In a real implementation, you would use more sophisticated logic here
                rightsizing_candidates = instances.sample(
                    frac=0.3,  # Recommend rightsizing for 30% of instances
                    random_state=42
                )
                
                # Generate recommendations for these candidates
                for _, instance in rightsizing_candidates.iterrows():
                    # Use instance type patterns to recommend a smaller size
                    recommended_type = self._downsize_instance_type(provider, instance_type)
                    
                    if recommended_type and recommended_type != instance_type:
                        # Calculate savings
                        instance_cost = instance['cost']
                        savings_range = optimization.get('savings_range', (0.2, 0.3))
                        savings_factor = (savings_range[0] + savings_range[1]) / 2
                        estimated_savings = instance_cost * savings_factor
                        
                        # Create recommendation
                        command = optimization['command_template'].format(
                            resource_id=instance.get('resource_id', 'RESOURCE_ID'),
                            recommended_type=recommended_type
                        )
                        
                        recommendation = {
                            "id": f"rightsize-{instance.get('resource_id', 'unknown')}",
                            "provider": provider,
                            "service": instance.get('service', 'Unknown'),
                            "category": "instance_rightsizing",
                            "title": optimization['title'],
                            "description": f"Consider rightsizing {instance_type} instance to {recommended_type}. No utilization data available, recommendation based on cost patterns.",
                            "current_resource_type": instance_type,
                            "recommended_resource_type": recommended_type,
                            "resource_id": instance.get('resource_id', 'unknown'),
                            "current_cost": round(instance_cost, 2),
                            "estimated_savings": round(estimated_savings, 2),
                            "savings_percentage": round(savings_factor * 100, 2),
                            "implementation_effort": "medium",
                            "command": command,
                            "applied": False,
                            "confidence": "low"  # Lower confidence without utilization data
                        }
                        
                        recommendations.append(recommendation)
        
        return recommendations
        
    def _generate_reservation_recommendations(self,
                                             provider: str,
                                             optimization: Dict[str, Any],
                                             df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Generate recommendations for reserved instances or committed use discounts."""
        recommendations = []
        
        # Focus on instances that are consistently used (if we have time information)
        if 'date' in df.columns:
            # Convert dates to datetime
            df['date'] = pd.to_datetime(df['date'])
            
            # Group by resource_id and count distinct dates
            resource_usage = df.groupby('resource_id')['date'].nunique().reset_index()
            
            # Calculate maximum possible dates in the dataset
            date_range = (df['date'].max() - df['date'].min()).days + 1
            
            # Find resources used more than 80% of the time
            consistent_resources = resource_usage[resource_usage['date'] >= 0.8 * date_range]
            
            # Join back to get the full data for these resources
            candidates = df[df['resource_id'].isin(consistent_resources['resource_id'])]
            
            # Group by resource_id to get total cost
            candidate_costs = candidates.groupby('resource_id').agg({
                'cost': 'mean',
                'service': 'first',
                'instance_type': 'first' if 'instance_type' in df.columns else None
            }).reset_index()
            
            for _, row in candidate_costs.iterrows():
                # Calculate savings
                resource_cost = row['cost']
                savings_range = optimization.get('savings_range', (0.3, 0.6))
                savings_factor = (savings_range[0] + savings_range[1]) / 2
                estimated_savings = resource_cost * savings_factor
                
                # Create recommendation
                recommendation = {
                    "id": f"reservation-{row.get('resource_id', 'unknown')}",
                    "provider": provider,
                    "service": row.get('service', 'Unknown'),
                    "category": "reserved_instances" if provider in ["AWS", "Azure"] else "committed_use",
                    "title": optimization['title'],
                    "description": f"Purchase {provider} reservation for consistently used resources to save over on-demand pricing.",
                    "resource_id": row.get('resource_id', 'unknown'),
                    "current_cost": round(resource_cost, 2),
                    "estimated_savings": round(estimated_savings, 2),
                    "savings_percentage": round(savings_factor * 100, 2),
                    "implementation_effort": "low",
                    "commitment_term": "1 year",  # Default to 1-year term
                    "applied": False
                }
                
                # Add instance type if available
                if 'instance_type' in row and pd.notna(row['instance_type']):
                    recommendation["resource_type"] = row['instance_type']
                    
                    # Generate command if possible
                    if provider == "AWS":
                        recommendation["command"] = f"aws ec2 describe-reserved-instances-offerings --instance-type {row['instance_type']} --product-description 'Linux/UNIX' --offering-type 'All Upfront'"
                    elif provider == "Azure":
                        recommendation["command"] = f"az vm reserved-instances purchase --resource-group YOUR_RESOURCE_GROUP --name {row['resource_id']} --sku {row['instance_type']}"
                    elif provider == "GCP":
                        recommendation["command"] = f"gcloud compute commitments create {row['resource_id']} --region YOUR_REGION --plan 12-month --type {row['instance_type']}"
                    
                recommendations.append(recommendation)
        else:
            # Without dates, use a simpler approach with just the top resources by cost
            top_resources = df.sort_values('cost', ascending=False).head(5)
            
            for _, row in top_resources.iterrows():
                # Calculate savings
                resource_cost = row['cost']
                savings_range = optimization.get('savings_range', (0.3, 0.6))
                savings_factor = (savings_range[0] + savings_range[1]) / 2
                estimated_savings = resource_cost * savings_factor
                
                recommendation = {
                    "id": f"reservation-{row.get('resource_id', 'unknown')}",
                    "provider": provider,
                    "service": row.get('service', 'Unknown'),
                    "category": "reserved_instances" if provider in ["AWS", "Azure"] else "committed_use",
                    "title": optimization['title'],
                    "description": f"Consider reservation for high-cost resources to save over on-demand pricing. Verify consistent usage before purchasing.",
                    "resource_id": row.get('resource_id', 'unknown'),
                    "current_cost": round(resource_cost, 2),
                    "estimated_savings": round(estimated_savings, 2),
                    "savings_percentage": round(savings_factor * 100, 2),
                    "implementation_effort": "low",
                    "commitment_term": "1 year",
                    "applied": False,
                    "confidence": "medium"
                }
                
                # Add instance type if available
                if 'instance_type' in row and pd.notna(row['instance_type']):
                    recommendation["resource_type"] = row['instance_type']
                    
                recommendations.append(recommendation)
        
        return recommendations