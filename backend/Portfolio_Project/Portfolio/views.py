from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, RetrieveAPIView, ListCreateAPIView
from rest_framework import status, permissions
from .models import Stocks, Portfolio
from .serializers import StockSerializer, PortfolioSerializer
from django.db.models import Q
import yfinance as yf
import os
import datetime
import pandas as pd
from django.utils import timezone
from ML.analysis import compare_stocks, cluster_portfolio_stocks, get_portfolio_pe_analysis
from ML.prediction_models import get_all_predictions

# Custom Sector Mapping from fetch_data.py
INDUSTRY_SECTORS = {

    "Automobile": [
        'TSLA', 'TM', 'F', 'GM', 'RACE',
        'HMC', 'STLA', 'RIVN', 'LCID', 'NIO',
        'LI', 'XPEV', 'MARUTI.NS', 'TATAMOTORS.NS', 'TMCV.NS', 'M&M.NS',
        'HEROMOTOCO.NS', 'EICHERMOT.NS', 'ASHOKLEY.NS', 'BAJAJ-AUTO.NS', 'BHARATFORG.NS',
        'SONACOMS.NS', 'MOTHERSON.NS'
    ],

    "Banking": [
        'JPM', 'BAC', 'GS', 'MS', 'WFC',
        'C', 'USB', 'PNC', 'TFC', 'RY',
        'TD', 'BMO', 'BNS', 'HSBC', 'SAN',
        'UBS', 'DB', 'HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS',
        'AXISBANK.NS', 'KOTAKBANK.NS', 'PNB.NS', 'BANKBARODA.NS', 'CANBK.NS',
        'UNIONBANK.NS', 'IDBI.NS', 'FEDERALBNK.NS'
    ],

    "IT": [
        'AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA',
        'AMZN', 'TSM', 'ASML', 'AVGO', 'ORCL',
        'CSCO', 'CRM', 'ADBE', 'AMD', 'TXN',
        'QCOM', 'INTC', 'IBM', 'SAP', 'TCS.NS',
        'INFY.NS', 'WIPRO.NS', 'HCLTECH.NS', 'TECHM.NS', 'LTIM.NS',
        'MPHASIS.NS', 'COFORGE.NS', 'PERSISTENT.NS', 'LTTS.NS', 'KPITTECH.NS'
    ],

    "Tata": [
        'TCS.NS', 'TATAMOTORS.NS', 'TMCV.NS', 'TATASTEEL.NS', 'TATAPOWER.NS', 'TITAN.NS',
        'TATACONSUM.NS', 'TATACOMM.NS', 'TATAELXSI.NS', 'INDHOTEL.NS', 'TATACHEM.NS',
        'TRENT.NS', 'VOLTAS.NS', 'NELCO.NS', 'RALLIS.NS', 'TTML.NS',
        'TINPLATE.NS'
    ],

    "Adani": [
        'ADANIENT.NS', 'ADANIPORTS.NS', 'ADANIGREEN.NS', 'ADANIPOWER.NS', 'ADANIENSOL.NS',
        'ATGL.NS', 'AWL.NS', 'ACC.NS', 'AMBUJACEM.NS', 'NDTV.NS'
    ],

    "Commodities": [
        'GC=F', 'SI=F'
    ],

    "Crypto": [
        'BTC-USD', 'ETH-USD'
    ]
}

def get_custom_sector(symbol):
    """Returns custom sector based on symbol mapping. If not found, returns None."""
    symbol = symbol.upper()
    for sector, tickers in INDUSTRY_SECTORS.items():
        if symbol in [t.upper() for t in tickers]:
            return sector
    return None

def fetch_realtime_stock(symbol, force_refresh=False):
    """Helper to fetch and save/update stock data from yfinance/yahooquery on the fly."""
    from yahooquery import Ticker
    import pandas as pd

    try:
        # 1. Check if stock already exists
        existing_stock = Stocks.objects.filter(symbol=symbol).first()
        
        # 2. Determine sector.
        # For existing DB stocks, keep previous sector if symbol is not in current mapping.
        sector = get_custom_sector(symbol)
        if not sector and existing_stock:
            sector = existing_stock.sector
        if not sector:
            print(f"Skipping {symbol}: Not in defined sectors and no existing DB sector.")
            return None

        if existing_stock and not force_refresh:
            # If data is less than 1 day old, it's "fresh enough" for fast loading
            if existing_stock.last_updated and (timezone.now() - existing_stock.last_updated).total_seconds() < 86400:
                return existing_stock

        os.environ['YFINANCE_CACHE_DIR'] = os.path.join(os.getcwd(), '.yf_cache')
        yf.set_tz_cache_location(os.path.join(os.getcwd(), '.yf_cache'))
        
        # 3. Fetch from yfinance
        t_yf = yf.Ticker(symbol)
        info = t_yf.info
        
        name = None
        price = 0
        high = 0
        low = 0
        pe = 0
        market_cap = 0
        currency = "INR" if symbol.endswith(".NS") or symbol.endswith(".BO") else "USD"

        if info and (info.get('currentPrice') or info.get('regularMarketPrice')):
            name = info.get('longName') or info.get('shortName') or symbol
            price = info.get('currentPrice') or info.get('regularMarketPrice')
            high = info.get('fiftyTwoWeekHigh') or price
            low = info.get('fiftyTwoWeekLow') or price
            pe = info.get('trailingPE') or info.get('forwardPE') or 0
            market_cap = info.get('marketCap') or 0
            currency = info.get('currency', currency)
        else:
            # 4. Fallback to yahooquery
            t_yq = Ticker(symbol)
            details = t_yq.summary_detail.get(symbol, {})
            price_data = t_yq.price.get(symbol, {})
            
            if not details or not isinstance(details, dict) or not (details.get('previousClose') or price_data.get('regularMarketPrice')):
                return None
            
            name = price_data.get('shortName') or symbol
            price = details.get('previousClose') or price_data.get('regularMarketPrice')
            high = details.get('fiftyTwoWeekHigh') or (price * 1.1)
            low = details.get('fiftyTwoWeekLow') or (price * 0.9)
            pe = details.get('trailingPE') or details.get('forwardPE') or 0
            market_cap = details.get('marketCap') or 0
            currency = price_data.get('currency', currency)

        if not name:
            return None

        # 5. Fetch Historical Data & Predictions
        history_data = existing_stock.historical_data if existing_stock else None
        old_prediction = existing_stock.prediction_data if existing_stock else None
        new_prediction_res = old_prediction # Default to old data

        # Always fetch history if we need new predictions
        try:
            hist = t_yf.history(period="1y")
            if not hist.empty:
                history_data = []
                for date, row in hist.iterrows():
                    history_data.append({
                        "date": date.strftime('%Y-%m-%d'),
                        "price": round(row['Close'], 2),
                        "volume": int(row['Volume'])
                    })
                
                # Calculate real-time accuracy by comparing the last stored prediction with current live price.
                new_prediction_res = get_all_predictions(symbol, hist)
                
                if old_prediction and isinstance(new_prediction_res, dict):
                    # Calculation: ((Last Prediction - Current Actual) / Last Prediction) * 100
                    def calc_acc(pred, actual):
                        if pred in (None, 0):
                            return None
                        return round(((pred - actual) / pred) * 100, 2)

                    current_actual = round(float(price), 2)
                    new_prediction_res['lr1_diff'] = calc_acc(old_prediction.get('lr1'), current_actual)
                    new_prediction_res['ts1_diff'] = calc_acc(old_prediction.get('ts1'), current_actual)
                    new_prediction_res['rnn1_diff'] = calc_acc(old_prediction.get('rnn1'), current_actual)
                
        except Exception as e:
            print(f"Historical/Prediction error for {symbol}: {e}")

        # 6. Save to DB

        # 6. Save to DB
        stock, created = Stocks.objects.update_or_create(
            symbol=symbol,
            defaults={
                "name": name,
                "sector": sector,
                "price": round(float(price), 2),
                "market_cap": market_cap,
                "high_price": round(float(high), 2),
                "low_price": round(float(low), 2),
                "pe_ratio": round(float(pe), 2),
                "historical_data": history_data,
                "prediction_data": new_prediction_res,
                "currency": currency
            }
        )
        return stock
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return None

class SectorListAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        # Strictly return ONLY the 6 sectors defined in fetch_data.py logic
        return Response(list(INDUSTRY_SECTORS.keys()))


class SectorStocksAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, name):
        try:
            # 1. Get tickers for this sector from our predefined mapping
            tickers = INDUSTRY_SECTORS.get(name, [])
            if not tickers:
                return Response([])
            
            # 2. Fetch what we have in DB for these tickers
            stocks = Stocks.objects.filter(symbol__in=tickers, sector=name)
            
            # 3. If DB has fewer stocks than expected, return what we have.
            # (Background fetch logic removed to improve performance)
            serializer = StockSerializer(stocks, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Sector Error: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StockSearchAPIView(ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = StockSerializer

    def get_queryset(self):
        query = self.request.query_params.get("q", "").strip()
        sector = self.request.query_params.get("sector", "").strip()
        
        if not query:
            return Stocks.objects.none()
            
        # 1. Handle the autofilled format "Name (SYMBOL)"
        # If query matches "Some Name (SYMBOL)", extract the SYMBOL part
        import re
        match = re.search(r'\((.*?)\)$', query)
        if match:
            extracted_symbol = match.group(1).upper()
            exact_match = Stocks.objects.filter(symbol=extracted_symbol)
            if exact_match.exists():
                return exact_match

        # 2. Base filter with starts-with matching (Case-insensitive)
        queryset = Stocks.objects.filter(
            Q(symbol__istartswith=query) | Q(name__istartswith=query)
        )
        
        # 3. Filter by sector if provided
        if sector and sector != "All":
            queryset = queryset.filter(sector=sector)
            
        # 4. Limit to 10 suggestions and return
        return queryset.order_by('symbol')[:10]


class StockDetailAPIView(RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Stocks.objects.all()
    serializer_class = StockSerializer

    def get_object(self):
        # Always prioritize cached DB data for speed. 
        # Data is only refreshed from yfinance when user clicks Refresh in My Portfolio.
        obj = super().get_object()
        return obj


class StockHistoryAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            stock = Stocks.objects.get(pk=pk)
            time_range = request.query_params.get('range', '1W')
            
            # Mapping range to yfinance period and interval
            # 1h: hourly points
            # 1D: daily points
            # 1W: weekly points
            range_map = {
                '1h': {'period': '7d', 'interval': '1h'},
                '1D': {'period': '6mo', 'interval': '1d'},
                '1W': {'period': '2y', 'interval': '1wk'},
            }
            
            config = range_map.get(time_range, range_map['1W'])
            
            # Fetch fresh data for specific range if requested, otherwise use cache for daily
            if time_range in ['1h', '1D', '1W']:
                t_yf = yf.Ticker(stock.symbol)
                hist = t_yf.history(period=config['period'], interval=config['interval'])
                
                if not hist.empty:
                    history_data = []
                    for date, row in hist.iterrows():
                        history_data.append({
                            "date": date.isoformat(),
                            "price": round(row['Close'], 2),
                            "volume": int(row['Volume'])
                        })
                    
                    # Train models on last 1 year daily data, but keep displayed history
                    # based on selected chart range (1h / 1D / 1W).
                    model_input = None
                    if stock.historical_data:
                        model_input = pd.DataFrame(stock.historical_data)
                        if 'price' in model_input.columns:
                            model_input['Close'] = model_input['price']
                        if 'date' in model_input.columns:
                            model_input['date'] = pd.to_datetime(model_input['date'], errors='coerce')
                            model_input = model_input.dropna(subset=['date']).set_index('date').sort_index()

                    if model_input is None or model_input.empty or 'Close' not in model_input.columns:
                        training_hist = t_yf.history(period='1y', interval='1d')
                        model_input = training_hist if not training_hist.empty else hist
                    prediction_data = get_all_predictions(stock.symbol, model_input, time_range)
                    
                    # Add simulated PE to history
                    base_pe = stock.pe_ratio if stock.pe_ratio > 0 else 15
                    first_price = history_data[0]['price'] if history_data else 1
                    for item in history_data:
                        if 'pe' not in item:
                            item['pe'] = round(base_pe * (item['price'] / first_price), 2)

                    return Response({
                        "symbol": stock.symbol,
                        "name": stock.name,
                        "history": history_data,
                        "prediction": prediction_data
                    })

            # Default to 1-year daily data (cached or refreshed)
            if stock.historical_data:
                history_data = stock.historical_data
                prediction_data = stock.prediction_data
                
                # If historical data exists but prediction doesn't, regenerate it
                if not prediction_data:
                    # We need a DataFrame for get_all_predictions
                    # Since we have historical_data as JSON list, convert it
                    df = pd.DataFrame(history_data)
                    df['Close'] = df['price'] # Ensure 'Close' column exists
                    prediction_data = get_all_predictions(stock.symbol, df)
                    stock.prediction_data = prediction_data
                    stock.save()

                # Add simulated PE to history if not present
                base_pe = stock.pe_ratio if stock.pe_ratio > 0 else 15
                first_price = history_data[0]['price'] if history_data else 1
                for item in history_data:
                    if 'pe' not in item:
                        item['pe'] = round(base_pe * (item['price'] / first_price), 2)

                return Response({
                    "symbol": stock.symbol,
                    "name": stock.name,
                    "history": history_data,
                    "prediction": prediction_data
                })

            # If no cached data, fetch it
            refreshed_stock = fetch_realtime_stock(stock.symbol, force_refresh=True)
            if refreshed_stock:
                return Response({
                    "symbol": refreshed_stock.symbol,
                    "name": refreshed_stock.name,
                    "history": refreshed_stock.historical_data,
                    "prediction": refreshed_stock.prediction_data
                })
            
            return Response({"error": "Could not fetch data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Stocks.DoesNotExist:
            return Response({"error": "Stock not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserPortfolioAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            # 1. Get portfolio
            portfolio, created = Portfolio.objects.get_or_create(
                staff=request.user,
                defaults={"portfolio_name": f"{request.user.name}'s Portfolio"}
            )
            
            # 2. Fetch stocks directly from DB (no real-time yfinance fetch here for speed)
            all_stocks = list(portfolio.stocks.all())
            
            # 3. Build stock data list
            stocks_data = []
            for stock in all_stocks:
                stock_dict = StockSerializer(stock).data
                # Use cached prediction if available
                stock_dict['prediction'] = stock.prediction_data
                stocks_data.append(stock_dict)
            
            # 4. Build fast response (analysis is loaded separately)
            portfolio_data = PortfolioSerializer(portfolio).data
            portfolio_data['stocks'] = stocks_data
            portfolio_data['clusters'] = []
            portfolio_data['cluster_plot'] = None
            portfolio_data['pe_plot'] = None
            
            return Response(portfolio_data)
        except Exception as e:
            print(f"Portfolio Error: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PortfolioAnalysisAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            portfolio, _ = Portfolio.objects.get_or_create(
                staff=request.user,
                defaults={"portfolio_name": f"{request.user.name}'s Portfolio"}
            )
            all_stocks = list(portfolio.stocks.all())

            clustering_result = None
            pe_plot = None
            if all_stocks:
                clustering_result = cluster_portfolio_stocks(all_stocks)
                pe_plot = get_portfolio_pe_analysis(all_stocks)

            analysis_data = {
                "clusters": [],
                "cluster_plot": None,
                "pe_plot": pe_plot
            }
            if isinstance(clustering_result, dict):
                analysis_data["clusters"] = clustering_result.get("clusters", [])
                analysis_data["cluster_plot"] = clustering_result.get("plot", None)

            return Response(analysis_data)
        except Exception as e:
            print(f"Portfolio Analysis Error: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RefreshStocksAPIView(APIView):
    """View to trigger a manual refresh of all stocks currently present in the database."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            stocks_to_refresh = Stocks.objects.all().order_by("symbol")

            if not stocks_to_refresh.exists():
                return Response({"message": "No stocks available in database to refresh."}, status=status.HTTP_200_OK)

            results = []
            failed = []
            for stock in stocks_to_refresh:
                # Force refresh from yfinance and store in DB
                updated_stock = fetch_realtime_stock(stock.symbol, force_refresh=True)
                if updated_stock:
                    results.append(stock.symbol)
                else:
                    failed.append(stock.symbol)
            
            return Response({
                "message": (
                    f"Refresh complete: refreshed {len(results)} of {stocks_to_refresh.count()} "
                    "stocks present in database."
                ),
                "total_requested": stocks_to_refresh.count(),
                "refreshed_count": len(results),
                "failed_count": len(failed),
                "refreshed_stocks": results,
                "failed_stocks": failed
            })
        except Exception as e:
            print(f"Refresh Error: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AddStockToPortfolioAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        portfolio, created = Portfolio.objects.get_or_create(
            staff=request.user,
            defaults={"portfolio_name": f"{request.user.name}'s Portfolio"}
        )
        stock_id = request.data.get("stock_id")
        if not stock_id:
            return Response({"error": "Stock ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            stock = Stocks.objects.get(pk=stock_id)
            stock.portfolio = portfolio
            stock.save()
            return Response({
                "message": f"Added {stock.name} to portfolio",
                "stock": StockSerializer(stock).data
            })
        except Stocks.DoesNotExist:
            return Response({"error": "Stock not found"}, status=status.HTTP_404_NOT_FOUND)

class RemoveStockFromPortfolioAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        stock_id = request.data.get("stock_id") or request.data.get("id")
        if not stock_id:
            return Response({"error": "Stock ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            portfolio, _ = Portfolio.objects.get_or_create(
                staff=request.user,
                defaults={"portfolio_name": f"{request.user.name}'s Portfolio"}
            )
            stock = Stocks.objects.get(pk=stock_id, portfolio=portfolio)
            stock.portfolio = None
            stock.save()
            return Response({"message": f"Removed {stock.name} from portfolio"})
        except Stocks.DoesNotExist:
            return Response({"error": "Stock not found in your portfolio"}, status=status.HTTP_404_NOT_FOUND)

class StockComparisonAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        symbol1 = request.query_params.get("s1")
        symbol2 = request.query_params.get("s2")
        
        if not symbol1 or not symbol2:
            return Response({"error": "Two stock symbols (s1, s2) are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            comparison_data = compare_stocks(symbol1, symbol2)
            if not comparison_data:
                return Response(
                    {"error": "Could not compare these symbols due to insufficient overlapping historical data."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(comparison_data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GoldSilverAnalysisAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from .utils import get_gold_silver_analysis
        try:
            analysis = get_gold_silver_analysis()
            return Response(analysis)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
