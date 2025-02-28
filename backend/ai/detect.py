import joblib
import pandas as pd

# Load trained model
anomaly_model = joblib.load("backend/ai/anomaly_model.pkl")

def detect_anomaly(cost):
    """Detect if the given cost is an anomaly"""
    prediction = anomaly_model.predict(pd.DataFrame([{"cost": cost}]))
    return "Anomaly" if prediction[0] == -1 else "Normal"
