from rest_framework import serializers
from .models import Stocks, Portfolio

class StockSerializer(serializers.ModelSerializer):
    prediction = serializers.JSONField(source='prediction_data', read_only=True)
    
    class Meta:
        model = Stocks
        fields = '__all__'


class PortfolioSerializer(serializers.ModelSerializer):
    stocks = StockSerializer(many=True, read_only=True)

    class Meta:
        model = Portfolio
        fields = '__all__'