import os
import base64
import matplotlib
matplotlib.use('Agg') # Force non-interactive backend for server environment
from ML.analysis import run_gold_silver_analysis

def get_gold_silver_analysis():
    # Run the script to generate data and images from the ML app
    data = run_gold_silver_analysis()
    
    if not data:
        return {"error": "Could not fetch analysis data"}
            
    return data
