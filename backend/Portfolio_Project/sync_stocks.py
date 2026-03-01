import os
import django
import json

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Portfolio_Project.settings')
django.setup()

from Portfolio.models import Stocks

def sync_stocks():
    print("--- StockWhiz: Syncing Database with JSON ---")
    
    # Load JSON data
    json_path = 'stocks_data.json'
    if not os.path.exists(json_path):
        print(f"ERROR: {json_path} not found!")
        return

    with open(json_path, 'r') as f:
        stocks_list = json.load(f)

    for stock_data in stocks_list:
        symbol = stock_data['symbol']
        price = stock_data['price']
        high_52w = stock_data['high_52w']
        
        # Calculate discount and opportunity level automatically
        discount_pct = round(((high_52w - price) / high_52w * 100), 2)
        
        opportunity = "Low Opportunity"
        if discount_pct > 20:
            opportunity = "Strong Opportunity"
        elif 10 <= discount_pct <= 20:
            opportunity = "Moderate Opportunity"

        # Update or Create in DB
        Stocks.objects.update_or_create(
            symbol=symbol,
            defaults={
                "name": stock_data['name'],
                "sector": stock_data['sector'],
                "price": price,
                "market_cap": stock_data['market_cap'],
                "high_price": high_52w,
                "low_price": stock_data['low_low_52w' if 'low_low_52w' in stock_data else 'low_52w'],
                "pe_ratio": stock_data['pe_ratio'],
                "discount_pct": discount_pct,
                "opportunity_level": opportunity
            }
        )
        print(f"Synced: {symbol} ({opportunity})")

    print("\nSUCCESS: Your stock database is now perfectly matched with stocks_data.json!")

if __name__ == "__main__":
    sync_stocks()
