from django.db import models
from Staff.models import Staff

class Stocks(models.Model):
    name = models.CharField(max_length=100)
    symbol = models.CharField(max_length=20)
    price = models.FloatField()
    sector = models.CharField(max_length=100, default="Unknown")
    market_cap = models.BigIntegerField(default=0)
    high_price = models.FloatField(default=0)
    low_price = models.FloatField(default=0)
    pe_ratio = models.FloatField(default=0)
    discount_pct = models.FloatField(default=0)
    opportunity_level = models.CharField(max_length=50, default="Low Opportunity")

    def __str__(self):
        return f"{self.name} ({self.symbol})"


class Portfolio(models.Model):
    staff = models.OneToOneField(Staff, on_delete=models.CASCADE, related_name="portfolio", null=True, blank=True)
    portfolio_name = models.CharField(max_length=100)
    stocks = models.ManyToManyField(Stocks, related_name="portfolios")

    def __str__(self):
        if self.staff:
            return f"{self.staff.name}'s Portfolio"
        return self.portfolio_name
