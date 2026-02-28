from rest_framework import serializers
from .models import Stocks, Portfolio

class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stocks
        fields = '__all__'


class PortfolioSerializer(serializers.ModelSerializer):
    stocks = StockSerializer(many=True, read_only=True)

    class Meta:
        model = Portfolio
        fields = '__all__'