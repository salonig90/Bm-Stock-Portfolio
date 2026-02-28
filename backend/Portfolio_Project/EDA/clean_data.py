def clean_and_process(df):
    """Handle missing values and calculate ratios/opportunity levels."""
    # Handle missing values
    df['pe_ratio'] = df['pe_ratio'].fillna(0)
    df['52w_high'] = df['52w_high'].fillna(df['current_price'])
    
    # Calculate Discount %
    # Discount = (52w High - Current Price) / 52w High * 100
    df['discount_pct'] = ((df['52w_high'] - df['current_price']) / df['52w_high'] * 100).fillna(0)
    
    # Classification logic
    def classify(discount):
        if discount > 20:
            return "Strong Opportunity"
        elif 10 <= discount <= 20:
            return "Moderate Opportunity"
        else:
            return "Low Opportunity"
            
    df['opportunity_level'] = df['discount_pct'].apply(classify)
    return df
