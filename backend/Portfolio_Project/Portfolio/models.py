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

    def save(self, *args, **kwargs):
        # 1. Automatically calculate Discount Percentage
        if self.high_price and self.high_price > 0:
            self.discount_pct = round(((self.high_price - self.price) / self.high_price * 100), 2)
        
        # 2. Automatically determine Opportunity Level
        if self.discount_pct > 20:
            self.opportunity_level = "Strong Opportunity"
        elif 10 <= self.discount_pct <= 20:
            self.opportunity_level = "Moderate Opportunity"
        else:
            self.opportunity_level = "Low Opportunity"
            
        super().save(*args, **kwargs)

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
