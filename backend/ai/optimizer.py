import random
import numpy as np
from sklearn.cluster import KMeans

# AI-based cost optimization suggestions
def generate_optimization_suggestions(cost_data):
    # Extract features for clustering
    costs = np.array([entry.get("cost", 0) for entry in cost_data]).reshape(-1, 1)
    
    # Skip ML if not enough data
    if len(costs) < 3:
        return basic_recommendations(cost_data)
    
    # Use KMeans to identify cost groups
    kmeans = KMeans(n_clusters=min(3, len(costs)))
    kmeans.fit(costs)
    
    # Get cluster centers (average cost for each cluster)
    centers = kmeans.cluster_centers_.flatten()
    
    # Map each cost entry to its cluster
    labels = kmeans.labels_
    
    recommendations = []
    for i, entry in enumerate(cost_data):
        # High-cost cluster gets stronger recommendations
        provider = entry.get("provider")
        service = entry.get("service")
        cost = entry.get("cost")
        
        cluster = labels[i]
        # If in the highest cost cluster
        if centers[cluster] == max(centers):
            # Generate a stronger recommendation
            rec = generate_recommendation(provider, service, "high")
        # If in the middle cost cluster
        elif centers[cluster] == sorted(centers)[len(centers)//2]:
            rec = generate_recommendation(provider, service, "medium")
        # If in the lowest cost cluster
        else:
            rec = generate_recommendation(provider, service, "low")
            
        recommendations.append(rec)
    
    return recommendations

def generate_recommendation(provider, service, cost_level):
    # Similar to your existing code but with cost_level as a factor
    if cost_level == "high":
        if provider == "AWS" and service == "EC2":
            return {
                "provider": "AWS",
                "service": "EC2",
                "suggestion": "Use Reserved Instances to save costs.",
                "command": "aws ec2 modify-instance-attribute --instance-id i-1234567890abcdef0 --instance-type reserved"
            }
        # Add more cases
    elif cost_level == "medium":
        # Medium-level recommendations
        pass
    else:
        # Low-level recommendations
        return {
            "provider": provider,
            "service": service,
            "suggestion": "Your costs are optimal. No major actions needed.",
            "command": "N/A"
        }
    
def basic_recommendations(cost_data)::
    recommendations = []

    for entry in cost_data:
        provider = entry.get("provider")
        service = entry.get("service")
        cost = entry.get("cost")

        if cost > 100:  # Example threshold for high cost
            if provider == "AWS" and service == "EC2":
                recommendations.append({
                    "provider": "AWS",
                    "service": "EC2",
                    "suggestion": "Use Reserved Instances to save costs.",
                    "command": "aws ec2 modify-instance-attribute --instance-id i-1234567890abcdef0 --instance-type reserved"
                })
            elif provider == "Azure" and service == "VM":
                recommendations.append({
                    "provider": "Azure",
                    "service": "VM",
                    "suggestion": "Use Azure Hybrid Benefit for licensing savings.",
                    "command": "az vm update --resource-group myResourceGroup --name myVM --set licenseType=Windows_Server_Hybrid_Benefit"
                })
            elif provider == "GCP" and service == "Compute Engine":
                recommendations.append({
                    "provider": "GCP",
                    "service": "Compute Engine",
                    "suggestion": "Enable sustained use discounts.",
                    "command": "gcloud compute instances update --zone=us-central1-a --instance=my-instance --set-min-cpu-platform=Intel Haswell"
                })
        else:
            recommendations.append({
                "provider": provider,
                "service": service,
                "suggestion": "Your costs are optimal. No major actions needed.",
                "command": "N/A"
            })

    return recommendations
