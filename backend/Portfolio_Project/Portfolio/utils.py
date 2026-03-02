import os
import base64
import matplotlib
matplotlib.use('Agg') # Force non-interactive backend for server environment
from EDA.gold_silver_analysis import run_analysis

def get_gold_silver_analysis():
    # Run the script to generate data and images
    data = run_analysis()
    
    # Define image paths (located in the backend root as per the script)
    images = ['gold_price.png', 'silver_price.png', 'gold_silver_regression.png']
    encoded_images = {}
    
    for img_path in images:
        if os.path.exists(img_path):
            with open(img_path, "rb") as image_file:
                # Encode the image to base64 to send it over JSON
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                encoded_images[img_path.split('.')[0]] = encoded_string
        else:
            encoded_images[img_path.split('.')[0]] = None
            
    return {
        "stats": data,
        "plots": encoded_images
    }
