import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from database.db import SessionLocal
from models.cloud_cost import CloudCost

def load_data():
    """Load cloud cost data from database"""
    db = SessionLocal()
    costs = db.query(CloudCost).all()
    db.close()

    data = pd.DataFrame([{
        "provider": cost.provider,
        "service": cost.service,
        "cost": cost.cost,
        "date": cost.date
    } for cost in costs])

    return data

def preprocess_data(data):
    """Convert categorical features and prepare time-series dataset"""
    data["date"] = pd.to_datetime(data["date"])
    data["day"] = data["date"].dt.day
    data["month"] = data["date"].dt.month
    data["year"] = data["date"].dt.year

    # Convert categorical values to numerical
    data = pd.get_dummies(data, columns=["provider", "service"])

    return data

def train_model():
    """Train a cost forecasting model"""
    data = load_data()
    data = preprocess_data(data)

    X = data.drop(columns=["cost", "date"])
    y = data["cost"]

    model = RandomForestRegressor(n_estimators=100)
    model.fit(X, y)

    # Save model
    joblib.dump(model, "backend/ai/cost_forecast.pkl")
    print("✅ Cost forecasting model trained and saved.")

if __name__ == "__main__":
    train_model()
