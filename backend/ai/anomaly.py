# Standard library imports
from datetime import datetime, timedelta

# Third-party imports
from scipy.stats import zscore
import numpy as np

# Mock rules for root cause analysis
CAUSE_RULES = {
    "EC2": "Possible cause: Increase in running instances or workload spikes.",
    "S3": "Possible cause: High data transfer or increased storage consumption.",
    "RDS": "Possible cause: Unexpected database queries or connection spikes.",
    "Compute Engine": "Possible cause: Autoscaling triggered additional VMs.",
    "Blob Storage": "Possible cause: Large file uploads or backup processes.",
}

def detect_anomalies(cost_data):
    """
    Detects anomalies in cloud costs and provides possible root causes.
    Args:
        cost_data (list of dicts): [{'date': '2025-02-20', 'cost': 120.5, 'service': 'EC2'}]
    Returns:
        list: Anomalies with root cause insights
    """
    # Convert cost data into numpy array
    costs = np.array([entry["cost"] for entry in cost_data])
    
    if len(costs) < 5:  # Ensure enough data points
        return []

    # Compute z-scores to detect outliers
    z_scores = np.abs(zscore(costs))
    
    anomalies = []
    for i, score in enumerate(z_scores):
        if score > 2:  # Threshold for anomaly detection
            service = cost_data[i]["service"]
            cause = CAUSE_RULES.get(service, "Unknown cause. Check recent service changes.")

            anomalies.append({
                "date": cost_data[i]["date"],
                "service": service,
                "cost": cost_data[i]["cost"],
                "anomaly_score": round(score, 2),
                "root_cause": cause
            })

    return anomalies
