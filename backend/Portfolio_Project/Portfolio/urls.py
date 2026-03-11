from django.urls import path
from .views import (
    SectorListAPIView, 
    SectorStocksAPIView, 
    UserPortfolioAPIView,
    PortfolioAnalysisAPIView,
    StockSearchAPIView,
    StockDetailAPIView,
    StockHistoryAPIView,
    AddStockToPortfolioAPIView,
    RemoveStockFromPortfolioAPIView,
    StockComparisonAPIView,
    GoldSilverAnalysisAPIView,
    RefreshStocksAPIView,
    MarketNewsAPIView,
    TopGainersAPIView
)

urlpatterns = [
    path("sectors/", SectorListAPIView.as_view(), name="sector-list"),
    path("stocks/search", StockSearchAPIView.as_view(), name="stock-search"),
    path("stocks/search/", StockSearchAPIView.as_view(), name="stock-search-slash"),
    path("stocks/detail/<int:pk>/", StockDetailAPIView.as_view(), name="stock-detail"),
    path("stocks/history/<int:pk>/", StockHistoryAPIView.as_view(), name="stock-history"),
    path("stocks/refresh/", RefreshStocksAPIView.as_view(), name="stocks-refresh"),
    path("stocks/compare/", StockComparisonAPIView.as_view(), name="stock-compare"),
    path("stocks/<str:name>/", SectorStocksAPIView.as_view(), name="sector-stocks"),
    path("gold-silver-analysis/", GoldSilverAnalysisAPIView.as_view(), name="gold-silver-analysis"),
    path("my-portfolio/", UserPortfolioAPIView.as_view(), name="user-portfolio"),
    path("my-portfolio/analysis/", PortfolioAnalysisAPIView.as_view(), name="user-portfolio-analysis"),
    path("my-portfolio/add-stock/", AddStockToPortfolioAPIView.as_view(), name="portfolio-add-stock"),
    path("my-portfolio/remove-stock/", RemoveStockFromPortfolioAPIView.as_view(), name="portfolio-remove-stock"),
    path("market/news/", MarketNewsAPIView.as_view(), name="market-news"),
    path("market/top-gainers/", TopGainersAPIView.as_view(), name="top-gainers"),
]
