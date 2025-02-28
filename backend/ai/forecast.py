import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta

def predict_future_costs(cost_trend, days_ahead=7):
    """
    Predict future cloud costs based on historical data using Linear Regression.
    :param cost_trend: List of dicts with 'date' and 'cost'.
    :param days_ahead: Number of future days to predict.
    :return: List of predicted costs with dates.
    """
    if len(cost_trend) < 3:
        return [{"date": (datetime.today() + timedelta(days=i)).strftime("%Y-%m-%d"), "predicted_cost": None} for i in range(1, days_ahead + 1)]

    # Convert dates to numerical values
    df = pd.DataFrame(cost_trend)
    df["date"] = pd.to_datetime(df["date"])
    df["days"] = (df["date"] - df["date"].min()).dt.days

    # Train the Linear Regression model
    X = df["days"].values.reshape(-1, 1)
    y = df["cost"].values
    model = LinearRegression()
    model.fit(X, y)

    # Predict costs for the next `days_ahead`
    future_dates = [(df["date"].max() + timedelta(days=i)) for i in range(1, days_ahead + 1)]
    future_days = [(d - df["date"].min()).days for d in future_dates]
    predictions = model.predict(np.array(future_days).reshape(-1, 1))

    # Format results
    future_costs = [{"date": future_dates[i].strftime("%Y-%m-%d"), "predicted_cost": round(predictions[i], 2)} for i in range(days_ahead)]
    
    return future_costs
