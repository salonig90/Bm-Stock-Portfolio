from django.urls import path
from .views import (
    SectorListAPIView, 
    SectorStocksAPIView, 
    UserPortfolioAPIView,
    StockSearchAPIView,
    StockDetailAPIView,
    StockHistoryAPIView,
    AddStockToPortfolioAPIView,
    GoldSilverAnalysisAPIView,
    RefreshStocksAPIView
)

urlpatterns = [
    path("sectors/", SectorListAPIView.as_view(), name="sector-list"),
    path("stocks/<str:name>/", SectorStocksAPIView.as_view(), name="sector-stocks"),
    path("stocks/search", StockSearchAPIView.as_view(), name="stock-search"),
    path("stocks/detail/<int:pk>/", StockDetailAPIView.as_view(), name="stock-detail"),
    path("stocks/history/<int:pk>/", StockHistoryAPIView.as_view(), name="stock-history"),
    path("stocks/refresh/", RefreshStocksAPIView.as_view(), name="stocks-refresh"),
    path("gold-silver-analysis/", GoldSilverAnalysisAPIView.as_view(), name="gold-silver-analysis"),
    path("my-portfolio/", UserPortfolioAPIView.as_view(), name="user-portfolio"),
    path("my-portfolio/add-stock/", AddStockToPortfolioAPIView.as_view(), name="portfolio-add-stock"),
]
