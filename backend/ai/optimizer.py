import random

# AI-based cost optimization suggestions
def generate_optimization_suggestions(cost_data):
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
