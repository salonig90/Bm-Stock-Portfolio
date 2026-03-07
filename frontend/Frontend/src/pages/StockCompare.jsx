import React, { useState, useEffect } from "react";
import API from "../services/api";

const StockCompare = () => {
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);

  const fetchSuggestions = async (query, setSuggestions) => {
    if (!query || query.length < 1) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await API.get("stocks/search", {
        params: { q: query }
      });
      setSuggestions(res.data || []);
    } catch (err) {
      setSuggestions([]);
      console.error("Suggestion fetch error:", err);
    }
  };

  const handleCompare = async () => {
    if (!s1 || !s2) {
      setError("Please select two stocks to compare.");
      return;
    }
    setLoading(true);
    setComparison(null);
    setError(null);
    try {
      const res = await API.get("stocks/compare/", {
        params: { s1, s2 }
      });
      setComparison(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Error comparing stocks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh', background: '#f8f9fa' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#1a1a1a', fontWeight: '800' }}>Stock Comparison Tool</h1>
      
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        justifyContent: 'center', 
        marginBottom: '40px',
        alignItems: 'flex-end',
        background: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#444' }}>Stock 1 (Symbol)</label>
          <input 
            type="text" 
            placeholder="e.g. AAPL" 
            value={s1}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              setS1(val);
              fetchSuggestions(val, setSuggestions1);
            }}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
          />
          {suggestions1.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: 'white', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto' }}>
              {suggestions1.map(stock => (
                <div key={stock.id} onClick={() => { setS1(stock.symbol); setSuggestions1([]); }} style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#333' }}>
                  <div style={{ fontWeight: 'bold' }}>{stock.name} ({stock.symbol})</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ fontSize: '1.5rem', fontWeight: '900', paddingBottom: '10px', color: '#00d2ff' }}>VS</div>

        <div style={{ flex: 1, position: 'relative' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#444' }}>Stock 2 (Symbol)</label>
          <input 
            type="text" 
            placeholder="e.g. TSLA" 
            value={s2}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              setS2(val);
              fetchSuggestions(val, setSuggestions2);
            }}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
          />
          {suggestions2.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: 'white', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto' }}>
              {suggestions2.map(stock => (
                <div key={stock.id} onClick={() => { setS2(stock.symbol); setSuggestions2([]); }} style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#333' }}>
                  <div style={{ fontWeight: 'bold' }}>{stock.name} ({stock.symbol})</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={handleCompare}
          disabled={loading}
          style={{ 
            background: '#00d2ff', 
            color: 'white', 
            border: 'none', 
            padding: '12px 35px', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            height: '48px',
            transition: 'all 0.3s ease'
          }}
        >
          {loading ? "Analyzing..." : "Compare"}
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '1.2rem' }}>Running ML Regression & Correlation analysis...</div>}
      
      {error && (
        <div style={{ color: '#c53030', textAlign: 'center', marginBottom: '30px', padding: '15px', background: '#fff5f5', borderRadius: '10px', border: '1px solid #fed7d7' }}>
          {error}
        </div>
      )}

      {comparison && comparison.stock_details && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Info Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {comparison.symbols.map(sym => (
              <div key={sym} style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderTop: '5px solid #00d2ff' }}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '2rem', fontWeight: '800' }}>{sym}</h2>
                <div style={{ fontSize: '1.1rem', color: '#666', marginBottom: '20px' }}>{comparison.stock_details[sym].name}</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                      {comparison.stock_details[sym].currency === 'USD' ? '$' : '₹'}{comparison.stock_details[sym].price}
                    </div>
                  </div>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sector</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{comparison.stock_details[sym].sector}</div>
                  </div>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Market Cap</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                      {comparison.stock_details[sym].currency === 'USD' ? '$' : '₹'}{(comparison.stock_details[sym].market_cap / 10000000).toFixed(2)} Cr
                    </div>
                  </div>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Volatility</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: comparison.volatility[sym] > 30 ? '#e53e3e' : '#38a169' }}>
                      {comparison.volatility[sym]}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ML Insights */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div style={{ background: 'white', padding: '35px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <h3 style={{ marginBottom: '25px', color: '#333', fontSize: '1.5rem', fontWeight: '700' }}>Machine Learning Insights</h3>
              
              <div style={{ marginBottom: '30px' }}>
                <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '5px' }}>Correlation Coefficient</div>
                <div style={{ fontSize: '3rem', fontWeight: '900', color: '#1a1a1a' }}>{comparison.correlation}</div>
                <div style={{ 
                  display: 'inline-block', 
                  padding: '6px 15px', 
                  borderRadius: '25px', 
                  fontSize: '0.9rem', 
                  fontWeight: 'bold',
                  background: comparison.correlation > 0.7 ? '#e6fffa' : '#f7fafc',
                  color: comparison.correlation > 0.7 ? '#2c7a7b' : '#4a5568',
                  marginTop: '10px'
                }}>
                  {comparison.correlation > 0.7 ? "Strong positive relationship" : 
                   comparison.correlation > 0.3 ? "Moderate positive relationship" : 
                   comparison.correlation > -0.3 ? "Weak relationship" : "Negative relationship"}
                </div>
              </div>

              <div style={{ padding: '25px', background: '#ebf8ff', borderRadius: '15px', borderLeft: '6px solid #00d2ff' }}>
                <div style={{ color: '#2b6cb0', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Logistic Regression Result</div>
                <div style={{ fontSize: '1.4rem', margin: '15px 0', fontWeight: 'bold', color: '#1a202c' }}>{comparison.recommendation}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, background: '#bee3f8', height: '12px', borderRadius: '6px' }}>
                    <div style={{ background: '#00d2ff', height: '100%', borderRadius: '6px', width: `${comparison.outperform_probability}%`, transition: 'width 1s ease-in-out' }}></div>
                  </div>
                  <span style={{ fontWeight: '900', color: '#2b6cb0', fontSize: '1.1rem' }}>{comparison.outperform_probability}%</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#4a5568', marginTop: '10px', fontStyle: 'italic' }}>
                  Probability of {comparison.symbols[0]} outperforming {comparison.symbols[1]} based on last 5 days returns.
                </p>
              </div>
            </div>

            <div style={{ background: 'white', padding: '35px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <h3 style={{ marginBottom: '25px', color: '#333', fontSize: '1.5rem', fontWeight: '700' }}>Normalized Performance (1Y)</h3>
              <img 
                src={`data:image/png;base64,${comparison.comparison_plot}`} 
                alt="Stock Performance Comparison Chart" 
                style={{ width: '100%', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
              />
              <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '15px', textAlign: 'center' }}>
                Prices are normalized to 100 at the start of the period for relative growth comparison.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockCompare;
