from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, RetrieveAPIView, ListCreateAPIView
from rest_framework import status, permissions
from .models import Stocks, Portfolio
from .serializers import StockSerializer, PortfolioSerializer
from django.db.models import Q
import yfinance as yf
import os
from ML.analysis import predict_stock_price, compare_stocks, cluster_portfolio_stocks

def fetch_realtime_stock(symbol):
    """Helper to fetch and save/update stock data from yfinance/yahooquery on the fly."""
    import yfinance as yf
    from yahooquery import Ticker
    import pandas as pd
    import os

    try:
        os.environ['YFINANCE_CACHE_DIR'] = os.path.join(os.getcwd(), '.yf_cache')
        yf.set_tz_cache_location(os.path.join(os.getcwd(), '.yf_cache'))
        
        # 1. Try yfinance first
        t_yf = yf.Ticker(symbol)
        info = t_yf.info
        
        name = None
        price = 0
        high = 0
        low = 0
        pe = 0
        market_cap = 0
        sector = "Unknown"

        if info and (info.get('currentPrice') or info.get('regularMarketPrice')):
            name = info.get('longName') or info.get('shortName') or symbol
            price = info.get('currentPrice') or info.get('regularMarketPrice')
            high = info.get('fiftyTwoWeekHigh') or price
            low = info.get('fiftyTwoWeekLow') or price
            pe = info.get('trailingPE') or info.get('forwardPE') or 0
            market_cap = info.get('marketCap') or 0
            sector = info.get('sector') or "Unknown"
        else:
            # 2. Fallback to yahooquery
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
            sector = getattr(t_yq.summary_profile.get(symbol, {}), 'sector', "Unknown")

        if not name:
            return None

        stock, created = Stocks.objects.update_or_create(
            symbol=symbol,
            defaults={
                "name": name,
                "sector": sector,
                "price": round(float(price), 2),
                "market_cap": market_cap,
                "high_price": round(float(high), 2),
                "low_price": round(float(low), 2),
                "pe_ratio": round(float(pe), 2)
            }
        )
        return stock
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return None

class SectorListAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        sectors = list(Stocks.objects.exclude(sector="Unknown").values_list("sector", flat=True).distinct())
        # If no sectors found, return all distinct sectors including Unknown
        if not sectors:
            sectors = list(Stocks.objects.values_list("sector", flat=True).distinct())
        return Response(sectors)


class SectorStocksAPIView(ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = StockSerializer

    def get_queryset(self):
        sector = self.kwargs.get("name")
        return Stocks.objects.filter(sector=sector)


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
        # Always refresh data from yfinance on detail view
        obj = super().get_object()
        refreshed_obj = fetch_realtime_stock(obj.symbol)
        return refreshed_obj if refreshed_obj else obj


class StockHistoryAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            stock = Stocks.objects.get(pk=pk)
            import yfinance as yf
            import pandas as pd
            import os
            from datetime import datetime, timedelta

            # Set yfinance cache dir to avoid "unable to open database file"
            os.environ['YFINANCE_CACHE_DIR'] = os.path.join(os.getcwd(), '.yf_cache')
            yf.set_tz_cache_location(os.path.join(os.getcwd(), '.yf_cache'))

            ticker = yf.Ticker(stock.symbol)
            # Fetch last 1 year of daily data
            hist = ticker.history(period="1y")
            
            if hist.empty:
                return Response({"error": "No historical data found"}, status=status.HTTP_404_NOT_FOUND)

            # Prepare data for charts
            history_data = []
            import random # For simulating PE movement if not available
            
            # Base PE for simulation
            base_pe = stock.pe_ratio if stock.pe_ratio > 0 else 15
            
            for date, row in hist.iterrows():
                # Simulate a slight PE variation based on price movement
                # In a real app, you'd calculate this from historical EPS if available
                simulated_pe = round(base_pe * (row['Close'] / hist.iloc[0]['Close']), 2)
                
                history_data.append({
                    "date": date.strftime('%Y-%m-%d'),
                    "price": round(row['Close'], 2),
                    "pe": simulated_pe,
                    "volume": int(row['Volume'])
                })

            # Get Prediction
            prediction_data = predict_stock_price(stock.symbol)

            return Response({
                "symbol": stock.symbol,
                "name": stock.name,
                "history": history_data,
                "prediction": prediction_data
            })
        except Stocks.DoesNotExist:
            return Response({"error": "Stock not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserPortfolioAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            # request.user is our Staff object from StaffTokenAuthentication
            portfolio, created = Portfolio.objects.get_or_create(
                staff=request.user,
                defaults={"portfolio_name": f"{request.user.name}'s Portfolio"}
            )
            
            # 1. Fetch stocks and clustering data
            all_stocks = list(portfolio.stocks.all())
            clustering_result = cluster_portfolio_stocks(all_stocks)
            
            # 2. Build stock dictionaries with prediction
            stocks_data = []
            for stock in all_stocks:
                stock_dict = StockSerializer(stock).data
                # Add prediction
                try:
                    prediction = predict_stock_price(stock.symbol)
                    stock_dict['prediction'] = prediction
                except:
                    stock_dict['prediction'] = None
                stocks_data.append(stock_dict)
            
            portfolio_data = PortfolioSerializer(portfolio).data
            portfolio_data['stocks'] = stocks_data
            
            # Add clustering results
            if isinstance(clustering_result, dict):
                portfolio_data['clusters'] = clustering_result.get('groups', [])
                portfolio_data['cluster_plot'] = clustering_result.get('plot', None)
            else:
                portfolio_data['clusters'] = []
                portfolio_data['cluster_plot'] = None
            
            return Response(portfolio_data)
        except Exception as e:
            print(f"Portfolio Error: {e}")
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
        stock_id = request.data.get("stock_id")
        if not stock_id:
            return Response({"error": "Stock ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            stock = Stocks.objects.get(pk=stock_id)
            stock.portfolio = None
            stock.save()
            return Response({"message": f"Removed {stock.name} from portfolio"})
        except Stocks.DoesNotExist:
            return Response({"error": "Stock not found"}, status=status.HTTP_404_NOT_FOUND)

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
                return Response({"error": "Could not fetch data for comparison"}, status=status.HTTP_404_NOT_FOUND)
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
