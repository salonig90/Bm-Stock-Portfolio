import os 
import sys

# Set yfinance cache dir to avoid "unable to open database file"
os.environ['YFINANCE_CACHE_DIR'] = os.path.join(os.getcwd(), '.yf_cache')
import yfinance as yf
yf.set_tz_cache_location(os.path.join(os.getcwd(), '.yf_cache')) # Extra safety for some yf versions
if not os.path.exists(os.environ['YFINANCE_CACHE_DIR']):
    try:
        os.makedirs(os.environ['YFINANCE_CACHE_DIR'])
    except:
        pass

import time
import warnings 
from datetime import datetime, timedelta 

# Suppress warnings 
warnings.filterwarnings('ignore') 

def search_ticker(query):
    """Logic from yahoo_search.py: Simulates a search by returning potential tickers."""
    os.environ['YFINANCE_CACHE_DIR'] = os.path.join(os.getcwd(), '.yf_cache')
    try:
        ticker = yf.Ticker(query)
        info = ticker.info
        if info and 'longName' in info:
            return [{
                "symbol": query.upper(),
                "name": info.get('longName'),
                "sector": info.get('sector')
            }]
    except:
        pass
    return []

def clean_stock_name(name):
    """Logic from clean_data.py: Simple helper to clean stock names."""
    if not name:
        return "Unknown Stock"
    return name.strip()

def calculate_opportunity(high, low, current):
    """Logic from clean_data.py: Returns classification based on discount from high."""
    if not high or not current or high <= 0:
        return "Low Opportunity", 0
        
    discount = ((high - current) / high) * 100
    if discount > 20:
        return "Strong Opportunity", round(discount, 2)
    elif discount > 10:
        return "Moderate Opportunity", round(discount, 2)
    return "Low Opportunity", round(discount, 2)

def get_price_on_date(ticker_obj, target_date_str): 
    """ 
    Fetches the closing price for a ticker on or immediately after the target date. 
    """ 
    target_date = datetime.strptime(target_date_str, '%Y-%m-%d') 
    end_date = (target_date + timedelta(days=10)).strftime('%Y-%m-%d') 
    
    try: 
        hist = ticker_obj.history(start=target_date_str, end=end_date) 
        if not hist.empty: 
            return hist.iloc[0]['Close'] 
    except Exception: 
        pass 
    return None 

def get_financial_data(ticker_symbol): 
    """
    Tries to get stock data from yfinance first, then yahooquery.
    """
    import yfinance as yf
    from yahooquery import Ticker
    import pandas as pd

    try: 
        t_yf = yf.Ticker(ticker_symbol) 
        info = t_yf.info
        
        # Basic check if data exists
        if not info or not (info.get('currentPrice') or info.get('regularMarketPrice')):
            # Fallback to yahooquery
            t_yq = Ticker(ticker_symbol)
            details = t_yq.summary_detail.get(ticker_symbol, {})
            price_data = t_yq.price.get(ticker_symbol, {})
            
            if not details or not isinstance(details, dict) or not (details.get('previousClose') or price_data.get('regularMarketPrice')):
                return None, None
            
            # Extract from yahooquery
            name = price_data.get('shortName') or ticker_symbol
            price = details.get('previousClose') or price_data.get('regularMarketPrice')
            high_52w = details.get('fiftyTwoWeekHigh') or (price * 1.1)
            low_52w = details.get('fiftyTwoWeekLow') or (price * 0.9)
            pe_val = details.get('trailingPE') or details.get('forwardPE')
            market_cap = details.get('marketCap') or 0
        else:
            # Extract from yfinance
            name = info.get('longName') or info.get('shortName') or ticker_symbol
            price = info.get('currentPrice') or info.get('regularMarketPrice')
            high_52w = info.get('fiftyTwoWeekHigh') or (price * 1.1)
            low_52w = info.get('fiftyTwoWeekLow') or (price * 0.9)
            pe_val = info.get('trailingPE') or info.get('forwardPE')
            market_cap = info.get('marketCap') or 0

        # Fetch Historical Prices for table
        price_jan_2025 = get_price_on_date(t_yf, '2025-01-01') 
        price_jan_2026 = get_price_on_date(t_yf, '2026-01-01') 
        price_feb_27_2026 = get_price_on_date(t_yf, '2026-02-27')   

        # Fetch Growth logic from yahooquery if possible
        growth_val = None
        growth_str = "?"
        try:
            t_yq = Ticker(ticker_symbol)
            df = t_yq.income_statement(frequency='q', trailing=False) 
            if isinstance(df, pd.DataFrame) and not df.empty: 
                if 'periodType' in df.columns: 
                    df = df[df['periodType'] != 'TTM'] 
                rev_col = next((c for c in ['TotalRevenue', 'totalRevenue'] if c in df.columns), None) 
                if rev_col and 'asOfDate' in df.columns: 
                    rev_series = df.set_index('asOfDate')[rev_col].dropna() 
                    rev_series.index = pd.to_datetime(rev_series.index) 
                    rev_series = rev_series.sort_index(ascending=False) 
                    if len(rev_series) >= 2: 
                        current_date = rev_series.index[0] 
                        current_rev = rev_series.iloc[0] 
                        for j in range(1, len(rev_series)): 
                            prev_date = rev_series.index[j] 
                            if 300 <= (current_date - prev_date).days <= 430: 
                                prev_rev = rev_series.iloc[j] 
                                if prev_rev and prev_rev != 0: 
                                    growth = (current_rev / prev_rev - 1) * 100 
                                    growth_val = float(growth) 
                                    growth_str = f"{growth:.1f}%" 
                                    break 
        except:
            pass

        pe_str = f"{pe_val:.2f}" if pe_val else "?"
        def fmt_p(p): return f"${p:.2f}" if p else "?" 
        def fmt_pct(cur, prev): 
            if cur and prev and prev != 0: 
                diff = (cur / prev - 1) * 100 
                return f"{diff:+.1f}%" 
            return "?" 

        row = [ 
            ticker_symbol, 
            pe_str, 
            growth_str, 
            fmt_p(price_jan_2025), 
            fmt_p(price_jan_2026), 
            fmt_pct(price_jan_2026, price_jan_2025), 
            fmt_p(price_feb_27_2026), 
            fmt_pct(price_feb_27_2026, price_jan_2026) 
        ] 
        
        meta = { 
            'Ticker': ticker_symbol, 
            'PE': float(pe_val) if pe_val else None, 
            'Growth': growth_val,
            'Name': name,
            'Price': float(price),
            'High52w': float(high_52w),
            'Low52w': float(low_52w),
            'MarketCap': market_cap
        } 
        
        return row, meta 
        
    except Exception as e: 
        print(f"Error fetching {ticker_symbol}: {e}")
        return None, None


# ✅ Grouped Industry Sectors (30 stocks each)
INDUSTRY_SECTORS = {
    "Automobile": [
        'TSLA', 'TM', 'F', 'GM', 'RACE', 'MARUTI.NS', 'TATAMOTORS.NS', 'M&M.NS', 'HEROMOTOCO.NS', 'EICHERMOT.NS',
        'HMC', 'VOW3.DE', 'BMW.DE', 'MBG.DE', 'STLA', 'RIVN', 'LCID', 'NIO', 'LI', 'XPEV',
        'ASHOKLEY.NS', 'TVSMOTOR.NS', 'BAJAJ-AUTO.NS', 'BHARATFORG.NS', 'SONACOMS.NS', 'MOTHERSON.NS', 'HYMTF', 'NSANY', 'SUBARY', 'ADR.F'
    ],
    "Banking": [
        'JPM', 'BAC', 'GS', 'MS', 'HSBC', 'HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS', 'AXISBANK.NS', 'KOTAKBANK.NS',
        'WFC', 'C', 'USB', 'PNC', 'TFC', 'RY', 'TD', 'BMO', 'BNS', 'SAN',
        'BBVA', 'UBS', 'DB', 'BNP.PA', 'PNB.NS', 'BANKBARODA.NS', 'CANBK.NS', 'UNIONBANK.NS', 'IDBI.NS', 'FEDERALBNK.NS'
    ],
    "IT": [
        'AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'TCS.NS', 'INFY.NS', 'WIPRO.NS', 'HCLTECH.NS', 'TECHM.NS',
        'AMZN', 'TSM', 'ASML', 'AVGO', 'ORCL', 'CSCO', 'CRM', 'ADBE', 'AMD', 'TXN',
        'QCOM', 'INTC', 'IBM', 'SAP', 'LTIM.NS', 'MPHASIS.NS', 'COFORGE.NS', 'PERSISTENT.NS', 'LTTS.NS', 'KPITTECH.NS'
    ],
    "Tata": [
        'TCS.NS', 'TATAMOTORS.NS', 'TATASTEEL.NS', 'TATAPOWER.NS', 'TITAN.NS', 'TATACONSUM.NS', 'TATACOMM.NS', 'TATAELXSI.NS', 'TATAINVEST.NS', 'TATAMTRDVR.NS',
        'INDHOTEL.NS', 'TATACHEM.NS', 'TRENT.NS', 'VOLTAS.NS', 'NELCO.NS', 'RALLIS.NS', 'TTML.NS', 'TINPLATE.NS', 'TRF.NS',
        'TAYO.NS', 'BBL.NS', 'AUTOAXLES.NS', 'BANCOINDIA.NS', 'BOMDYEING.NS', 'ARTEMISMS.NS', 'TATAPIGMENTS.NS', 'TATAPOINT.NS', 'TATACOFFEE.NS', 'TATASTEELBSL.NS'
    ],
    "Adani": [
        'ADANIENT.NS', 'ADANIPORTS.NS', 'ADANIGREEN.NS', 'ADANIPOWER.NS', 'ADANIENSOL.NS', 'ATGL.NS', 'AWL.NS', 'ACC.NS', 'AMBUJACEM.NS', 'NDTV.NS',
        'ADANIWILMAR.NS', 'ADANIENERGY.NS', 'ADANITRANS.NS', 'ADANIGREEN.NS', 'ADANIPOWER.NS', 'ADANIENT.NS', 'ADANIPORTS.NS', 'ADANIENSOL.NS', 'ATGL.NS', 'AWL.NS',
        'ACC.NS', 'AMBUJACEM.NS', 'NDTV.NS', 'ADANIWILMAR.NS', 'ADANIENERGY.NS', 'ADANITRANS.NS', 'ADANIGREEN.NS', 'ADANIPOWER.NS', 'ADANIENT.NS', 'ADANIPORTS.NS'
    ],
    "Commodities": [
        'GC=F', 'SI=F'
    ]
}

def main(): 
    # Add project root to sys.path
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if project_root not in sys.path:
        sys.path.append(project_root)

    # Setup Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Portfolio_Project.settings')
    import django
    django.setup()

    from Portfolio.models import Stocks
    from tabulate import tabulate

    industry_sectors = INDUSTRY_SECTORS
    plot_data = [] 
    table_data = []

    print("Cleaning old stocks...")
    Stocks.objects.all().delete()

    for sector, tickers in industry_sectors.items():
        print(f"\n--- Processing {sector} Sector ---")
        for t in tickers: 
            print(f"Processing {t}...", end=" ", flush=True) 
            row, meta = get_financial_data(t) 
            
            if meta:
                meta['Sector'] = sector
                plot_data.append(meta) 
                table_data.append(row)
                
                # Sync to Database
                Stocks.objects.update_or_create(
                    symbol=t,
                    defaults={
                        "name": clean_stock_name(meta['Name']),
                        "sector": sector, # Use our custom sector name from INDUSTRY_SECTORS
                        "price": round(meta['Price'], 2),
                        "market_cap": meta['MarketCap'],
                        "high_price": round(meta['High52w'], 2),
                        "low_price": round(meta['Low52w'], 2),
                        "pe_ratio": round(meta['PE'], 2) if meta['PE'] else 0
                    }
                )
                print("Done.") 
            else:
                print("FAILED (Skipping)")
            
            time.sleep(0.5)
    
    headers = [ 
        "Ticker", "PE (TTM)", "Rev Growth", "Jan 1 2025", 
        "Jan 1 2026", "25-26 %", "Feb 27 2026", "YTD %" 
    ] 
    
    print("\n" + "="*110) 
    print("FINANCIAL & STOCK PERFORMANCE SUMMARY (CONSOLIDATED)".center(110)) 
    print("="*110) 
    if table_data:
        print(tabulate(table_data, headers=headers, tablefmt="grid")) 
    else:
        print("No data fetched.")
    print("="*110) 
    
    print("\nSUCCESS: Database updated with stocks from fetch_data.py!")
    # create_opportunity_graph(plot_data) # Logic removed as per request

if __name__ == "__main__": 
    main() 
