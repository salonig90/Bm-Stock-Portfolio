import numpy as np
import pandas as pd
import datetime
from sklearn.linear_model import LinearRegression, LogisticRegression
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.preprocessing import MinMaxScaler
import warnings

# Suppress warnings from statsmodels
warnings.filterwarnings("ignore")

def predict_lr(df):
    """Linear Regression for next day price."""
    try:
        df = df.copy()
        df['Day'] = np.arange(len(df))
        X = df[['Day']].values
        y = df['Close'].values
        model = LinearRegression()
        model.fit(X, y)
        next_day = np.array([[len(df)]])
        return float(model.predict(next_day)[0])
    except:
        return None

def predict_ts(df):
    """Time Series (Exponential Smoothing) for next day price."""
    try:
        model = ExponentialSmoothing(df['Close'], trend='add', seasonal=None)
        fit = model.fit()
        return float(fit.forecast(1).iloc[0])
    except:
        return None

def predict_rnn_simple(df):
    """
    Simulated RNN logic using weighted moving averages and momentum.
    In a production environment, this would use TensorFlow/Keras.
    """
    try:
        # Simple RNN-like weighted logic
        prices = df['Close'].values
        ema_short = df['Close'].ewm(span=5).mean().iloc[-1]
        ema_long = df['Close'].ewm(span=20).mean().iloc[-1]
        momentum = ema_short / ema_long
        return float(prices[-1] * momentum)
    except:
        return None

def predict_high_low_logistic(df):
    """
    Logistic Regression to predict if next day will be 'High' or 'Low' 
    compared to current price.
    """
    try:
        df = df.copy()
        df['Target'] = (df['Close'].shift(-1) > df['Close']).astype(int)
        df['Returns'] = df['Close'].pct_change()
        df['Vol'] = df['Close'].rolling(window=5).std()
        df = df.dropna()
        
        if len(df) < 10: return "N/A"
        
        features = ['Returns', 'Vol']
        X = df[features].values
        y = df['Target'].values
        
        model = LogisticRegression()
        model.fit(X, y)
        
        latest_features = df[features].iloc[-1].values.reshape(1, -1)
        prob = model.predict_proba(latest_features)[0][1]
        
        return "UP" if prob > 0.5 else "DOWN"
    except:
        return "N/A"

def get_all_predictions(symbol, hist_df):
    """Main entry point to get all predictions for tomorrow."""
    if hist_df is None or hist_df.empty or len(hist_df) < 5:
        return None
    
    # 1. Get predictions FOR tomorrow (using data up to today)
    lr1_next = predict_lr(hist_df)
    ts1_next = predict_ts(hist_df)
    rnn1_next = predict_rnn_simple(hist_df)
    stock_ud = predict_high_low_logistic(hist_df)

    # Return only the predictions for tomorrow. 
    # Accuracy (% diff) will be calculated in views.py by comparing this to tomorrow's price.
    return {
        "lr1": round(lr1_next, 2) if lr1_next else None,
        "ts1": round(ts1_next, 2) if ts1_next else None,
        "rnn1": round(rnn1_next, 2) if rnn1_next else None,
        "stock_ud": stock_ud,
        "prediction_date": datetime.date.today().strftime('%Y-%m-%d')
    }
