import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

# Load trained model
try:
    anomaly_model = joblib.load("backend/ai/anomaly_model.pkl")
except (FileNotFoundError, OSError):
    print("Warning: anomaly_model.pkl not found. Creating default model.")
    # Create a simple default model
    anomaly_model = IsolationForest(contamination=0.1)
    # Fit with some dummy data
    dummy_data = pd.DataFrame({"cost": np.random.normal(100, 20, 100)})
    anomaly_model.fit(dummy_data)
    # Save the model for future use
    os.makedirs(os.path.dirname("backend/ai/anomaly_model.pkl"), exist_ok=True)
    joblib.dump(anomaly_model, "backend/ai/anomaly_model.pkl")

def detect_anomaly(cost):
    """Detect if the given cost is an anomaly"""
    prediction = anomaly_model.predict(pd.DataFrame([{"cost": cost}]))
    return "Anomaly" if prediction[0] == -1 else "Normal"
