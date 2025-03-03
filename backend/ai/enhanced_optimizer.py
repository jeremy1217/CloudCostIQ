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
    
    # Keep existing optimization categories and provider-specific options
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
    
    # Provider-specific optimization details would remain the same
    # PROVIDER_OPTIMIZATIONS = {...}
    
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
            return self._create_empty_result()
        
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
            
        # Calculate total potential savings and metadata
        return self._create_result_with_metadata(recommendations, df_costs)
    
    def _create_empty_result(self) -> Dict[str, Any]:
        """Create empty result when no cost data is available."""
        return {
            "recommendations": [],
            "potential_savings": 0,
            "coverage": 0,
            "timestamp": datetime.now().isoformat()
        }
    
    def _create_result_with_metadata(self, recommendations: List[Dict[str, Any]], 
                                   df_costs: pd.DataFrame) -> Dict[str, Any]:
        """Create result with metadata based on recommendations."""
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
    
    # REFACTORED METHOD: Create a single method to handle recommendation creation
    def _create_recommendation(self, 
                             provider: str, 
                             service: str, 
                             category: str, 
                             title: str, 
                             description: str,
                             resource_id: str, 
                             current_cost: float,
                             estimated_savings: float, 
                             savings_factor: float,
                             implementation_effort: str = "medium",
                             command: str = "", 
                             additional_info: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Create a standardized recommendation dictionary.
        Centralizes the recommendation structure to avoid duplication.
        """
        # Generate a unique ID for the recommendation
        rec_id = f"{category}-{resource_id}"
        
        # Create the base recommendation dictionary
        recommendation = {
            "id": rec_id,
            "provider": provider,
            "service": service,
            "category": category,
            "title": title,
            "description": description,
            "resource_id": resource_id,
            "current_cost": round(current_cost, 2),
            "estimated_savings": round(estimated_savings, 2),
            "savings_percentage": round(savings_factor * 100, 2),
            "implementation_effort": implementation_effort,
            "command": command,
            "applied": False
        }
        
        # Add any additional info if provided
        if additional_info:
            recommendation.update(additional_info)
            
        return recommendation
    
    # REFACTORED METHOD: Calculate savings based on optimization type
    def _calculate_savings(self, 
                          cost: float, 
                          optimization: Dict[str, Any], 
                          custom_factor: Optional[float] = None) -> Tuple[float, float]:
        """
        Calculate estimated savings for a given cost and optimization.
        
        Args:
            cost: Current cost
            optimization: Optimization details with savings_range
            custom_factor: Optional custom savings factor to override savings_range
            
        Returns:
            Tuple of (estimated_savings, savings_factor)
        """
        if custom_factor is not None:
            savings_factor = custom_factor
        else:
            # Get the savings range and use the midpoint
            savings_range = optimization.get('savings_range', (0.2, 0.4))
            savings_factor = (savings_range[0] + savings_range[1]) / 2
            
        estimated_savings = cost * savings_factor
        return estimated_savings, savings_factor
    
    # REFACTORED METHOD: Create a generic method for resource recommendations
    def _create_resource_recommendation(self,
                                       provider: str,
                                       service: str,
                                       category: str,
                                       resource_data: Dict[str, Any],
                                       optimization: Dict[str, Any],
                                       custom_savings_factor: Optional[float] = None,
                                       additional_fields: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generic method to create resource-based recommendations.
        
        Args:
            provider: Cloud provider (AWS, Azure, GCP)
            service: Service name (EC2, S3, etc.)
            category: Optimization category
            resource_data: Dictionary with resource details
            optimization: Optimization details
            custom_savings_factor: Optional override for savings calculation
            additional_fields: Optional additional fields for the recommendation
            
        Returns:
            Dict with recommendation details
        """
        resource_id = resource_data.get('resource_id', 'unknown')
        resource_cost = resource_data.get('cost', 0)
        
        # Calculate potential savings
        estimated_savings, savings_factor = self._calculate_savings(
            resource_cost, optimization, custom_savings_factor)
            
        # Format command if available
        command = ""
        if 'command_template' in optimization:
            command = optimization['command_template'].format(
                resource_id=resource_id,
                **{k: v for k, v in resource_data.items() if k != 'resource_id'})
        
        # Merge any additional fields
        fields = {}
        if additional_fields:
            fields.update(additional_fields)
            
        # Create the recommendation
        return self._create_recommendation(
            provider=provider,
            service=service,
            category=category,
            title=optimization['title'],
            description=optimization['description'],
            resource_id=resource_id,
            current_cost=resource_cost,
            estimated_savings=estimated_savings,
            savings_factor=savings_factor,
            command=command,
            additional_info=fields
        )
    
    # REFACTORED METHOD: Generate recommendations for any category
    def _generate_category_recommendations(self,
                                          provider: str,
                                          category: str,
                                          optimization: Dict[str, Any],
                                          df: pd.DataFrame,
                                          utilization_df: Optional[pd.DataFrame]) -> List[Dict[str, Any]]:
        """
        Generic method to generate recommendations for any category.
        
        Args:
            provider: Cloud provider
            category: Optimization category
            optimization: Optimization details
            df: DataFrame with cost data
            utilization_df: Optional DataFrame with utilization data
            
        Returns:
            List of recommendations
        """
        # Use specific methods based on category for detailed processing
        if category == "instance_rightsizing":
            return self._generate_rightsizing_recommendations(
                provider, optimization, df, utilization_df)
                
        elif category in ["reserved_instances", "committed_use"]:
            return self._generate_reservation_recommendations(
                provider, optimization, df)
                
        elif category == "storage_optimization":
            return self._generate_storage_recommendations(
                provider, optimization, df)
                
        elif category == "idle_resources":
            return self._generate_idle_resource_recommendations(
                provider, optimization, df, utilization_df)
                
        elif category in ["hybrid_benefit", "licensing_optimization"]:
            return self._generate_licensing_recommendations(
                provider, optimization, df)
                
        elif category in ["preemptible_vms", "spot_instances"]:
            return self._generate_spot_instance_recommendations(
                provider, optimization, df)
                
        # Generic fallback for other categories
        return self._generate_generic_recommendations(
            provider, category, optimization, df)
    
    # New generic method for categories without specialized logic
    def _generate_generic_recommendations(self,
                                         provider: str,
                                         category: str,
                                         optimization: Dict[str, Any],
                                         df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Generate generic recommendations for categories without specialized logic."""
        recommendations = []
        
        # Take up to 5 resources with highest cost
        resources = df.sort_values('cost', ascending=False).head(5)
        
        for _, resource in resources.iterrows():
            # Create recommendation using shared method
            rec = self._create_resource_recommendation(
                provider=provider,
                service=resource.get('service', 'Unknown'),
                category=category,
                resource_data=resource.to_dict(),
                optimization=optimization
            )
            recommendations.append(rec)
        
        return recommendations
    
    # Rest of the specialized methods would remain, but be refactored to use the shared methods
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
                # Use shared method to create recommendation
                additional_fields = {
                    "current_resource_type": current_type,
                    "recommended_resource_type": recommended_type,
                    "utilization_metrics": {
                        "cpu": round(row.get('cpu_utilization', 0) * 100, 2),
                        "memory": round(row.get('memory_utilization', 0) * 100, 2)
                    }
                }
                
                rec = self._create_resource_recommendation(
                    provider=provider,
                    service=row.get('service', 'Unknown'),
                    category="instance_rightsizing",
                    resource_data=row.to_dict(),
                    optimization=optimization,
                    additional_fields=additional_fields
                )
                recommendations.append(rec)
                
        return recommendations
    
    # The remaining specialized methods would be refactored similarly
    # to leverage the shared helper methods
    
    # Keep existing helper methods for specialized logic
    def _recommend_instance_type(self, provider: str, current_type: str, 
                               cpu_utilization: float, memory_utilization: float) -> str:
        # Keep existing logic
        pass
    
    def _get_provider_breakdown(self, recommendations: List[Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
        # Keep existing logic 
        pass
        
    def _get_highest_impact_category(self, recommendations: List[Dict[str, Any]]) -> Dict[str, Any]:
        # Keep existing logic
        pass


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