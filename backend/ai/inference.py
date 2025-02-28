import joblib
import pandas as pd

# Load trained model
model = joblib.load("backend/ai/cost_forecast.pkl")

def predict_cost(future_data):
    """Predict future cloud costs based on input data"""
    future_df = pd.DataFrame([future_data])
    prediction = model.predict(future_df)
    return prediction[0]
