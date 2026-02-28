import matplotlib.pyplot as plt
import io
import base64
import json

def generate_opportunity_chart(df):
    """Generate a simple opportunity plot and return as JSON/base64."""
    plt.figure(figsize=(10, 6))
    plt.bar(df['symbol'], df['discount_pct'], color=['green' if x > 20 else 'orange' if x >= 10 else 'red' for x in df['discount_pct']])
    plt.axhline(y=20, color='r', linestyle='--', label='Strong Opportunity (20%)')
    plt.axhline(y=10, color='b', linestyle='--', label='Moderate Opportunity (10%)')
    plt.title('Stock Opportunity Level by Discount %')
    plt.ylabel('Discount % from 52w High')
    plt.legend()
    
    # Save to buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    
    return json.dumps({"image": img_str, "data": df.to_dict(orient='records')})
