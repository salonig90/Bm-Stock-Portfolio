import os
import yfinance as yf 
import pandas as pd 
import matplotlib
matplotlib.use('Agg') # Set non-interactive backend before importing plt
import matplotlib.pyplot as plt 
from sklearn.linear_model import LinearRegression 
import numpy as np 
import seaborn as sns 
from scipy import stats 
import datetime 

# Set yfinance cache dir to avoid "unable to open database file"
os.environ['YFINANCE_CACHE_DIR'] = os.path.join(os.getcwd(), '.yf_cache')
yf.set_tz_cache_location(os.path.join(os.getcwd(), '.yf_cache'))

def run_analysis():
    start_date = "2025-01-01" 
    today = datetime.date.today() 
    
    print(f"Fetching data from {start_date} to {today}...")
    gold_ticker = yf.Ticker("GC=F")
    silver_ticker = yf.Ticker("SI=F")
    
    gold_hist = gold_ticker.history(start=start_date, end=today) 
    silver_hist = silver_ticker.history(start=start_date, end=today) 
    
    # Live prices
    gold_live = gold_ticker.info.get('currentPrice') or gold_ticker.info.get('regularMarketPrice') or (gold_hist['Close'].iloc[-1] if not gold_hist.empty else 0)
    silver_live = silver_ticker.info.get('currentPrice') or silver_ticker.info.get('regularMarketPrice') or (silver_hist['Close'].iloc[-1] if not silver_hist.empty else 0)

    # Check if data is empty
    if gold_hist.empty or silver_hist.empty:
        print("Error: Could not fetch data for Gold or Silver.")
        return
        
    data = pd.DataFrame({
        "Gold": gold_hist['Close'],
        "Silver": silver_hist['Close']
    }).dropna()

    # 1. Gold Price Plot
    fig1, ax1 = plt.subplots(figsize=(12, 6))
    ax1.plot(data.index, data["Gold"], color='gold', linewidth=2) 
    ax1.grid(True, alpha=0.3) 
    ax1.set_title("Gold Price Trend (2025)", fontsize=14) 
    ax1.set_xlabel("Date") 
    ax1.set_ylabel("USD") 
    gold_price_plot = get_base64_plot(fig1)

    # 2. Silver Price Plot
    fig2, ax2 = plt.subplots(figsize=(12, 6))
    ax2.plot(data.index, data["Silver"], color='silver', linewidth=2) 
    ax2.grid(True, alpha=0.3) 
    ax2.set_title("Silver Price Trend (2025)", fontsize=14) 
    ax2.set_xlabel("Date") 
    ax2.set_ylabel("USD") 
    silver_price_plot = get_base64_plot(fig2)

    # 3. Statistics
    corr = data["Gold"].corr(data["Silver"]) 
    slope, intercept, r_value, p_value, std_err = stats.linregress(data["Gold"], data["Silver"]) 
    
    equation = f"Silver = {slope:.4f} * Gold + {intercept:.4f}"
    r_squared = r_value**2
    
    # 4. Regression Plot
    fig3, ax3 = plt.subplots(figsize=(10, 6))
    sns.regplot(x="Gold", y="Silver", data=data, ax=ax3,
                line_kws={"color": "pink", "label": f"R² = {r_squared:.4f}"},
                scatter_kws={"alpha": 0.5}) 
    ax3.set_title("Gold vs Silver: Linear Regression", fontsize=14)
    ax3.set_xlabel("Gold Price (USD)") 
    ax3.set_ylabel("Silver Price (USD)") 
    ax3.legend()
    ax3.grid(True, alpha=0.3) 
    regression_plot = get_base64_plot(fig3)
    
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
        "plots": {
            "gold_price": gold_price_plot,
            "silver_price": silver_price_plot,
            "regression": regression_plot
        }
    }

def get_base64_plot(fig):
    import base64
    from io import BytesIO
    buf = BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return img_str

if __name__ == "__main__": 
    run_analysis()
