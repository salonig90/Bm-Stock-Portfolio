from django.contrib import admin
from .models import Stocks, Portfolio

@admin.register(Stocks)
class StocksAdmin(admin.ModelAdmin):
    list_display = ('symbol', 'name', 'sector', 'price', 'opportunity_level')
    list_filter = ('sector', 'opportunity_level')
    search_fields = ('symbol', 'name')

@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ('portfolio_name', 'staff')
    search_fields = ('portfolio_name', 'staff__username')
