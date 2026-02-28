import yfinance as yf
import pandas as pd

def fetch_stock_data(symbols):
    """Fetch raw data for multiple symbols using yfinance."""
    data = []
    for symbol in symbols:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = ticker.history(period="1y")
        
        stock_info = {
            "symbol": symbol,
            "name": info.get("longName", symbol),
            "current_price": info.get("currentPrice", 0),
            "market_cap": info.get("marketCap", 0),
            "sector": info.get("sector", "Unknown"),
            "pe_ratio": info.get("trailingPE", 0),
            "52w_high": info.get("fiftyTwoWeekHigh", 0),
            "52w_low": info.get("fiftyTwoWeekLow", 0),
            "history": hist['Close'].tolist() if not hist.empty else []
        }
        data.append(stock_info)
    return pd.DataFrame(data)
