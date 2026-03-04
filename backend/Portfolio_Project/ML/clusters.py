import os
import sys
import django
import pandas as pd
import json

# Set up Django environment
def setup_django():
    # Get the project root directory (Portfolio_Project folder)
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if project_root not in sys.path:
        sys.path.append(project_root)
    
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Portfolio_Project.settings')
    django.setup()

def fetch_portfolio_stocks(portfolio_id):
    setup_django()
    from Portfolio.models import Portfolio, Stocks
    
    try:
        portfolio = Portfolio.objects.get(id=portfolio_id)
        # Fetch all stocks associated with this portfolio via ForeignKey
        stocks_qs = Stocks.objects.filter(portfolio=portfolio)
        
        if not stocks_qs.exists():
            print(f"No stocks found for Portfolio ID: {portfolio_id}")
            return
        
        # Convert queryset to list of dictionaries
        stocks_data = list(stocks_qs.values(
            'id', 'name', 'symbol', 'price', 'sector', 
            'market_cap', 'high_price', 'low_price', 
            'pe_ratio', 'discount_pct', 'opportunity_level'
        ))
        
        # 1. Store into DataFrame
        df = pd.DataFrame(stocks_data)
        
        # 2. Save into CSV
        csv_filename = f"portfolio_{portfolio_id}_stocks.csv"
        df.to_csv(csv_filename, index=False)
        print(f"Successfully saved {len(df)} stocks to {csv_filename}")
        
        # 3. Print stocks data in JSON format in the terminal
        print("\nStocks Data (JSON):")
        print(json.dumps(stocks_data, indent=4))
        
    except Portfolio.DoesNotExist:
        print(f"Error: Portfolio with ID {portfolio_id} does not exist.")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    # If run as a script, ask for ID or use a default
    import sys
    if len(sys.argv) > 1:
        p_id = sys.argv[1]
        fetch_portfolio_stocks(p_id)
    else:
        print("Usage: python clusters.py <portfolio_id>")
