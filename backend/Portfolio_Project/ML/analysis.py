import os
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import numpy as np
import yfinance as yf
import pandas as pd
import datetime

# Set yfinance cache dir to avoid "unable to open database file"
os.environ['YFINANCE_CACHE_DIR'] = os.path.join(os.getcwd(), '.yf_cache')
yf.set_tz_cache_location(os.path.join(os.getcwd(), '.yf_cache'))

def get_base64_plot(fig):
    from io import BytesIO
    buf = BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return img_str

def predict_stock_price(symbol, hist_df=None):
    """
    Predicts next day stock price and next 7 days trend using Linear Regression.
    If hist_df is provided, it uses it instead of fetching from yfinance.
    """
    # 1. Fetch historical data if not provided
    if hist_df is None:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="1y")
    else:
        hist = hist_df
    
    if hist.empty:
        return None
    
    # 2. Prepare data for Linear Regression
    # We'll use day indices as our X feature
    df = hist[['Close']].copy()
    df['DayIndex'] = np.arange(len(df))
    
    X = df[['DayIndex']].values
    y = df['Close'].values
    
    # 3. Train Linear Regression Model
    model = LinearRegression()
    model.fit(X, y)
    
    # 4. Predict Next Day Price
    next_day_index = len(df)
    next_day_pred = model.predict([[next_day_index]])[0]
    
    # 5. Predict Next 7 Days (1 Week)
    next_7_indices = np.arange(len(df), len(df) + 7).reshape(-1, 1)
    next_7_preds = model.predict(next_7_indices)
    
    last_date = df.index[-1]
    weekly_predictions = []
    for i, pred in enumerate(next_7_preds):
        pred_date = last_date + datetime.timedelta(days=i+1)
        weekly_predictions.append({
            "date": pred_date.strftime('%Y-%m-%d'),
            "price": round(float(pred), 2)
        })
    
    # 6. Generate Graph (ONLY Next 1 Week Predicted Trend)
    fig = plt.figure(figsize=(10, 5))
    
    pred_dates = [last_date + datetime.timedelta(days=i+1) for i in range(7)]
    plt.plot(pred_dates, next_7_preds, label='Predicted Trend (Next 1 Week)', 
             color='red', linestyle='-', marker='o', markersize=6, linewidth=2)
    
    # Add price labels on each point
    for date, price in zip(pred_dates, next_7_preds):
        plt.annotate(f"₹{price:.2f}", (date, price), textcoords="offset points", xytext=(0,10), ha='center', fontsize=9)
    
    plt.title(f"{symbol} 1-Week Price Prediction")
    plt.xlabel("Date")
    plt.ylabel("Price (USD)")
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # Rotate date labels for better readability
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    prediction_plot = get_base64_plot(fig)
    
    return {
        "next_day_prediction": round(float(next_day_pred), 2),
        "weekly_predictions": weekly_predictions,
        "prediction_plot": prediction_plot
    }

def compare_stocks(symbol1, symbol2):
    """
    Compares two stocks using Correlation and Logistic Regression.
    Logistic Regression predicts the probability of Stock A outperforming Stock B.
    """
    # 1. Fetch data for both stocks
    s1 = yf.Ticker(symbol1)
    s2 = yf.Ticker(symbol2)
    
    hist1 = s1.history(period="1y")
    hist2 = s2.history(period="1y")
    
    if hist1.empty or hist2.empty:
        return None
        
    # Align data
    df = pd.DataFrame({
        symbol1: hist1['Close'],
        symbol2: hist2['Close']
    }).dropna()
    
    # 2. Correlation
    correlation = df[symbol1].corr(df[symbol2])
    
    # 3. Logistic Regression Preparation
    # Features: Daily returns of both stocks for the last 5 days
    # Target: 1 if symbol1 return > symbol2 return, else 0
    df_returns = df.pct_change().dropna()
    
    # Create target (Did symbol1 outperform symbol2?)
    df_returns['Target'] = (df_returns[symbol1] > df_returns[symbol2]).astype(int)
    
    # Create features (lagged returns)
    for i in range(1, 6):
        df_returns[f'{symbol1}_lag_{i}'] = df_returns[symbol1].shift(i)
        df_returns[f'{symbol2}_lag_{i}'] = df_returns[symbol2].shift(i)
    
    df_lr = df_returns.dropna()
    
    features = [f'{symbol1}_lag_{i}' for i in range(1, 6)] + [f'{symbol2}_lag_{i}' for i in range(1, 6)]
    X = df_lr[features].values
    y = df_lr['Target'].values
    
    # 4. Train Logistic Regression
    try:
        model = LogisticRegression()
        model.fit(X, y)
        
        # Predict for the next day using the most recent data
        latest_features = df_returns[features].iloc[-1].values.reshape(1, -1)
        outperform_prob = model.predict_proba(latest_features)[0][1]
        recommendation = f"Based on Logistic Regression, {symbol1} has a {outperform_prob*100:.1f}% probability of outperforming {symbol2} tomorrow."
    except Exception as e:
        print(f"LR Error: {e}")
        outperform_prob = 0.5
        recommendation = "Could not calculate prediction."
    
    # 5. Additional Metrics
    # Volatility (Standard Deviation of returns)
    vol1 = df_returns[symbol1].std() * np.sqrt(252) # Annualized
    vol2 = df_returns[symbol2].std() * np.sqrt(252)
    
    # 6. Comparison Plot
    fig, ax = plt.subplots(figsize=(12, 6))
    
    # Normalize prices to start at 100 for comparison
    ax.plot(df.index, (df[symbol1] / df[symbol1].iloc[0]) * 100, label=f"{symbol1} (Normalized)", color='blue')
    ax.plot(df.index, (df[symbol2] / df[symbol2].iloc[0]) * 100, label=f"{symbol2} (Normalized)", color='green')
    
    ax.set_title(f"{symbol1} vs {symbol2} Performance Comparison (1 Year)")
    ax.set_xlabel("Date")
    ax.set_ylabel("Normalized Price (Base 100)")
    ax.legend()
    ax.grid(True, alpha=0.3)
    
    comparison_plot = get_base64_plot(fig)
    
    # 7. Get Basic Info for both stocks
    info1 = s1.info
    info2 = s2.info
    
    stock_details = {
        symbol1: {
            "name": info1.get('longName') or info1.get('shortName') or symbol1,
            "price": round(float(info1.get('currentPrice') or info1.get('regularMarketPrice') or 0), 2),
            "sector": info1.get('sector') or "N/A",
            "market_cap": info1.get('marketCap') or 0,
            "currency": info1.get('currency', 'INR' if symbol1.endswith('.NS') or symbol1.endswith('.BO') else 'USD')
        },
        symbol2: {
            "name": info2.get('longName') or info2.get('shortName') or symbol2,
            "price": round(float(info2.get('currentPrice') or info2.get('regularMarketPrice') or 0), 2),
            "sector": info2.get('sector') or "N/A",
            "market_cap": info2.get('marketCap') or 0,
            "currency": info2.get('currency', 'INR' if symbol2.endswith('.NS') or symbol2.endswith('.BO') else 'USD')
        }
    }
    
    return {
        "symbols": [symbol1, symbol2],
        "correlation": round(float(correlation), 4),
        "outperform_probability": round(float(outperform_prob) * 100, 2), # In percentage
        "recommendation": recommendation,
        "volatility": {
            symbol1: round(float(vol1) * 100, 2),
            symbol2: round(float(vol2) * 100, 2)
        },
        "comparison_plot": comparison_plot,
        "stock_details": stock_details
    }

def cluster_portfolio_stocks(stocks_list):
    """
    Groups portfolio stocks into clusters using K-Means with parameters from fetch_data logic.
    Features: Price, PE Ratio, Growth, and Annual Volatility.
    """
    if not stocks_list or len(stocks_list) < 3:
        return None

    data = []
    symbols = []
    
    for stock in stocks_list:
        try:
            # 1. Basic properties from model
            symbol = stock.symbol if hasattr(stock, 'symbol') else stock.get('symbol')
            price = float(stock.price if hasattr(stock, 'price') else stock.get('price') or 0)
            pe_ratio = float(stock.pe_ratio if hasattr(stock, 'pe_ratio') else stock.get('pe_ratio') or 0)
            
            if not symbol:
                continue

            # 2. Fetch additional parameters inspired by fetch_data.py
            ticker = yf.Ticker(symbol)
            
            # Growth logic (simplified from fetch_data.py)
            # We'll use 1-year price growth as a proxy for financial growth if not available
            hist = ticker.history(period="1y")
            if hist.empty:
                continue
                
            volatility = hist['Close'].pct_change().std() * np.sqrt(252)
            
            # Annual growth proxy
            start_price = hist['Close'].iloc[0]
            end_price = hist['Close'].iloc[-1]
            growth = ((end_price / start_price) - 1) * 100 if start_price != 0 else 0
            
            # Combine all parameters
            data.append([
                price,
                pe_ratio,
                growth,
                volatility
            ])
            symbols.append(symbol)
        except Exception as e:
            print(f"Clustering parameter fetch error for {symbol}: {e}")
            continue

    if len(data) < 2:
        return None

    # Standardize features
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(data)

    # Determine number of clusters
    n_clusters = min(3, len(data))
    
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(scaled_data)

    # --- Generate Cluster Plot ---
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # We'll plot Growth vs Volatility as they are often the most descriptive pairs for risk/reward
    colors = ['#00d2ff', '#ff4d4f', '#52c41a']
    for i in range(n_clusters):
        # Index 2 is Growth, Index 3 is Volatility in our 'data' array
        # But we must use scaled_data for consistent plotting
        points = scaled_data[clusters == i]
        ax.scatter(points[:, 2], points[:, 3], s=120, c=colors[i], label=f'Cluster {i+1}', alpha=0.8, edgecolors='white')
        
        # Add labels for each stock point
        for j, symbol in enumerate(symbols):
            if clusters[j] == i:
                ax.annotate(symbol, (scaled_data[j, 2], scaled_data[j, 3]), xytext=(5, 5), textcoords='offset points', fontsize=10, fontweight='bold')

    # Plot centroids
    centroids = kmeans.cluster_centers_
    ax.scatter(centroids[:, 2], centroids[:, 3], s=400, c='black', marker='*', label='Group Centers')

    ax.set_title("Portfolio Clustering Analysis (Growth vs Volatility)", fontsize=16, fontweight='bold', pad=20)
    ax.set_xlabel("Standardized Annual Growth", fontsize=12)
    ax.set_ylabel("Standardized Risk (Volatility)", fontsize=12)
    ax.legend(frameon=True, shadow=True)
    ax.grid(True, linestyle='--', alpha=0.5)
    
    # Add background styling
    ax.set_facecolor('#fdfdfd')
    fig.patch.set_facecolor('#ffffff')
    
    cluster_plot = get_base64_plot(fig)
    plt.close(fig)

    # Map results
    cluster_groups = {}
    descriptions = {
        0: {"label": "Balanced / Core", "info": "Stocks with moderate growth and controlled risk levels."},
        1: {"label": "High Growth / High Risk", "info": "Aggressive stocks showing strong upward trends but high price swings."},
        2: {"label": "Value / Defensive", "info": "Stable stocks with lower volatility, often undervalued by the market."}
    }

    for i in range(len(symbols)):
        c_id = int(clusters[i])
        if c_id not in cluster_groups:
            cluster_groups[c_id] = {
                "id": c_id,
                "label": descriptions.get(c_id, {}).get("label", f"Group {c_id+1}"),
                "info": descriptions.get(c_id, {}).get("info", ""),
                "stocks": []
            }
        
        s_obj = next((s for s in stocks_list if (s.symbol if hasattr(s, 'symbol') else s.get('symbol')) == symbols[i]), None)
        name = s_obj.name if s_obj and hasattr(s_obj, 'name') else (s_obj.get('name') if s_obj else symbols[i])
        price = s_obj.price if s_obj and hasattr(s_obj, 'price') else (s_obj.get('price') if s_obj else 0)
        
        cluster_groups[c_id]["stocks"].append({
            "symbol": symbols[i],
            "name": name,
            "price": float(price or 0)
        })
    
    return {
        "groups": list(cluster_groups.values()),
        "plot": cluster_plot
    }

def get_portfolio_pe_analysis(stocks_list):
    """
    Generates a bar chart comparing PE Ratios of stocks in the portfolio.
    """
    symbols = []
    pe_ratios = []
    
    for stock in stocks_list:
        symbol = stock.symbol if hasattr(stock, 'symbol') else stock.get('symbol')
        pe = stock.pe_ratio if hasattr(stock, 'pe_ratio') else stock.get('pe_ratio')
        
        if pe and pe > 0:
            symbols.append(symbol)
            pe_ratios.append(float(pe))
    
    if not symbols:
        return None
        
    # Generate Bar Plot
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Sort by PE Ratio for better visualization
    sorted_indices = np.argsort(pe_ratios)
    symbols = [symbols[i] for i in sorted_indices]
    pe_ratios = [pe_ratios[i] for i in sorted_indices]
    
    # Use different colors for different PE ranges
    colors = []
    for pe in pe_ratios:
        if pe < 15: colors.append('#52c41a') # Undervalued
        elif pe < 30: colors.append('#00d2ff') # Fair
        else: colors.append('#ff4d4f') # Overvalued
        
    bars = ax.bar(symbols, pe_ratios, color=colors, alpha=0.8, edgecolor='white', linewidth=1.5)
    
    # Add values on top of bars
    for bar in bars:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2, yval + 0.5, f"{yval:.1f}", ha='center', va='bottom', fontsize=10, fontweight='bold')

    ax.set_title("Portfolio PE Ratio Analysis", fontsize=16, fontweight='bold', pad=20)
    ax.set_xlabel("Stock Symbol", fontsize=12)
    ax.set_ylabel("PE Ratio", fontsize=12)
    ax.grid(axis='y', linestyle='--', alpha=0.5)
    
    # Rotate labels
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    pe_plot = get_base64_plot(fig)
    plt.close(fig)
    
    return pe_plot

def run_gold_silver_analysis():
    start_date = "2025-01-01"
    today = datetime.date.today()
    
    # 1. Fetch live prices (latest 1 day, 1 minute interval for maximum accuracy)
    gold_ticker = yf.Ticker("GC=F")
    silver_ticker = yf.Ticker("SI=F")
    
    try:
        # Try to get real-time price from fast interval
        g_live_df = gold_ticker.history(period="1d", interval="1m")
        s_live_df = silver_ticker.history(period="1d", interval="1m")
        
        gold_live = g_live_df['Close'].iloc[-1] if not g_live_df.empty else 0
        silver_live = s_live_df['Close'].iloc[-1] if not s_live_df.empty else 0
        
        # Fallback to info if live fetch failed
        if gold_live == 0:
            gold_live = gold_ticker.info.get('currentPrice') or gold_ticker.info.get('regularMarketPrice') or 0
        if silver_live == 0:
            silver_live = silver_ticker.info.get('currentPrice') or silver_ticker.info.get('regularMarketPrice') or 0
    except Exception as e:
        print(f"Live price fetch error: {e}")
        gold_live = 0
        silver_live = 0

    # 2. Fetch historical data for trends and correlation
    gold_hist = gold_ticker.history(start=start_date, end=today)
    silver_hist = silver_ticker.history(start=start_date, end=today)
    
    if gold_hist.empty or silver_hist.empty:
        return None
        
    data = pd.DataFrame({
        "Gold": gold_hist['Close'],
        "Silver": silver_hist['Close']
    }).dropna()

    # Format history for frontend interactive charts
    history_list = []
    # Sort index to ensure date order
    data = data.sort_index()
    
    first_gold = data["Gold"].iloc[0]
    first_silver = data["Silver"].iloc[0]
    
    for date, row in data.iterrows():
        history_list.append({
            "date": date.strftime('%Y-%m-%d'),
            "gold": round(float(row['Gold']), 2),
            "silver": round(float(row['Silver']), 2),
            "gold_norm": round(float((row['Gold'] / first_gold) * 100), 2),
            "silver_norm": round(float((row['Silver'] / first_silver) * 100), 2)
        })

    # Regression Stats
    slope, intercept, r_value, p_value, std_err = stats.linregress(data["Gold"], data["Silver"])
    corr = data["Gold"].corr(data["Silver"])
    equation = f"Silver = {slope:.4f} * Gold + {intercept:.4f}"
    r_squared = r_value**2

    # 3. Generate Plots
    # Gold Trend
    fig1, ax1 = plt.subplots(figsize=(10, 5))
    ax1.plot(data.index, data["Gold"], color='gold', linewidth=2)
    ax1.set_title("Gold Price Trend (2025)")
    ax1.grid(True, alpha=0.3)
    gold_plot = get_base64_plot(fig1)

    # Silver Trend
    fig2, ax2 = plt.subplots(figsize=(10, 5))
    ax2.plot(data.index, data["Silver"], color='silver', linewidth=2)
    ax2.set_title("Silver Price Trend (2025)")
    ax2.grid(True, alpha=0.3)
    silver_plot = get_base64_plot(fig2)

    # Correlation Plot
    fig3, ax3 = plt.subplots(figsize=(10, 6))
    sns.regplot(x="Gold", y="Silver", data=data, ax=ax3,
                line_kws={"color": "pink", "label": f"R² = {r_squared:.4f}"},
                scatter_kws={"alpha": 0.5})
    ax3.set_title("Gold vs Silver: Linear Regression Correlation")
    ax3.legend()
    ax3.grid(True, alpha=0.3)
    regression_plot = get_base64_plot(fig3)

    # 4. Combined Comparison Plot (Normalized to show relative performance)
    fig4, ax4 = plt.subplots(figsize=(12, 6))
    # Normalize data: (Price / First Price) * 100
    gold_norm = (data["Gold"] / data["Gold"].iloc[0]) * 100
    silver_norm = (data["Silver"] / data["Silver"].iloc[0]) * 100
    
    ax4.plot(data.index, gold_norm, color='gold', label='Gold (Normalized)', linewidth=2)
    ax4.plot(data.index, silver_norm, color='silver', label='Silver (Normalized)', linewidth=2)
    
    ax4.set_title("Gold vs Silver: Relative Performance Comparison (2025)", fontsize=14)
    ax4.set_xlabel("Date")
    ax4.set_ylabel("Normalized Price (Base 100)")
    ax4.legend()
    ax4.grid(True, alpha=0.3)
    comparison_plot = get_base64_plot(fig4)

    return {
        "live_prices": {
            "gold": round(float(gold_live), 2),
            "silver": round(float(silver_live), 2)
        },
        "stats": {
            "correlation": float(corr),
            "slope": float(slope),
            "intercept": float(intercept),
            "r_squared": float(r_squared),
            "equation": equation
        },
        "history": history_list,
        "plots": {
            "gold_price": gold_plot,
            "silver_price": silver_plot,
            "regression": regression_plot,
            "comparison": comparison_plot
        }
    }
