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
    gold = yf.download("GC=F", start=start_date, end=today) 
    silver = yf.download("SI=F", start=start_date, end=today) 
    
    # Check if data is empty
    if gold.empty or silver.empty:
        print("Error: Could not fetch data for Gold or Silver.")
        return
        
    data = pd.concat([gold['Close'], silver['Close']], axis=1) 
    data.columns = ["Gold_Close", "Silver_Close"] 
    data = data.dropna() 

    # 1. Gold Price Plot
    plt.figure(figsize=(12, 6)) 
    plt.plot(data["Gold_Close"], color='gold', linewidth=2) 
    plt.grid(True, alpha=0.3) 
    plt.title("Gold Price Trend (2025)", fontsize=14) 
    plt.xlabel("Date") 
    plt.ylabel("USD") 
    plt.savefig('gold_price.png')
    print("Saved gold_price.png")
    plt.close()

    # 2. Silver Price Plot
    plt.figure(figsize=(12, 6)) 
    plt.plot(data["Silver_Close"], color='silver', linewidth=2) 
    plt.grid(True, alpha=0.3) 
    plt.title("Silver Price Trend (2025)", fontsize=14) 
    plt.xlabel("Date") 
    plt.ylabel("USD") 
    plt.savefig('silver_price.png')
    print("Saved silver_price.png")
    plt.close()

    # 3. Statistics
    corr = data["Gold_Close"].corr(data["Silver_Close"]) 
    print(f"\nThe correlation is: {corr:.4f}") 
    
    slope, intercept, r_value, p_value, std_err = stats.linregress(data["Gold_Close"], data["Silver_Close"]) 
    
    equation = f"Silver = {slope:.4f} * Gold + {intercept:.4f}"
    r_squared = r_value**2
    
    print(equation) 
    print(f"R-squared: {r_squared:.4f}") 
    
    # 4. Regression Plot
    plt.figure(figsize=(10, 6)) 
    sns.regplot(x="Gold_Close", y="Silver_Close", data=data, 
                line_kws={"color": "pink", "label": f"R² = {r_squared:.4f}"},
                scatter_kws={"alpha": 0.5}) 
    plt.title("Gold vs Silver: Linear Regression", fontsize=14)
    plt.xlabel("Gold Price (USD)") 
    plt.ylabel("Silver Price (USD)") 
    plt.legend()
    plt.grid(True, alpha=0.3) 
    plt.savefig('gold_silver_regression.png')
    print("Saved gold_silver_regression.png")
    plt.close()
    
    return {
        "correlation": float(corr),
        "slope": float(slope),
        "intercept": float(intercept),
        "r_squared": float(r_squared),
        "equation": equation
    }

if __name__ == "__main__": 
    run_analysis()
