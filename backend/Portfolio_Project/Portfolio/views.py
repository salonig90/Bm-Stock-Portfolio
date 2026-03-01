from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, RetrieveAPIView, ListCreateAPIView
from rest_framework import status, permissions
from .models import Stocks, Portfolio
from .serializers import StockSerializer, PortfolioSerializer
from django.db.models import Q


class SectorListAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        sectors = list(Stocks.objects.exclude(sector="Unknown").values_list("sector", flat=True).distinct())
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
        query = self.request.query_params.get("q", "")
        if query:
            return Stocks.objects.filter(
                Q(name__icontains=query) | Q(symbol__icontains=query)
            )
        return Stocks.objects.none()


class StockDetailAPIView(RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Stocks.objects.all()
    serializer_class = StockSerializer


class UserPortfolioAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            # request.user is our Staff object from StaffTokenAuthentication
            portfolio, created = Portfolio.objects.get_or_create(
                staff=request.user,
                defaults={"portfolio_name": f"{request.user.name}'s Portfolio"}
            )
            serializer = PortfolioSerializer(portfolio)
            return Response(serializer.data)
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
            portfolio.stocks.add(stock)
            return Response({"message": f"Added {stock.name} to portfolio"})
        except Stocks.DoesNotExist:
            return Response({"error": "Stock not found"}, status=status.HTTP_404_NOT_FOUND)
