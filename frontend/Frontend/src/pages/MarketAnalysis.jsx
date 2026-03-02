import React, { useEffect, useState } from "react";
import API from "../services/api";

function MarketAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = () => {
    setLoading(true);
    setError(null);
    API.get("gold-silver-analysis/", { timeout: 30000 }) // Increase timeout to 30s
      .then((res) => {
        setAnalysis(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching analysis:", err);
        const errorMsg = err.response?.data?.error || err.message || "Unknown error";
        setError(`Failed to fetch Gold & Silver analysis: ${errorMsg}. Please try again.`);
        setLoading(false);
      });
  };

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Analyzing Market Data...</div>
      <p style={{ color: '#888' }}>This involves real-time fetching and regression calculation.</p>
    </div>
  );

  if (error) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#c53030' }}>
      <h2>Analysis Error</h2>
      <p>{error}</p>
      <button 
        onClick={fetchAnalysis}
        style={{ marginTop: '20px', background: '#00d2ff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
      >
        Retry
      </button>
    </div>
  );

  return (
    <div style={{ padding: '40px', background: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800' }}>
            Gold & Silver <span style={{ color: '#00d2ff' }}>Market Analysis</span>
          </h1>
          <p style={{ color: '#666', marginTop: '10px' }}>
            Advanced Linear Regression analysis of precious metals for 2025.
          </p>
        </div>

        {/* Stats Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '5px' }}>Correlation</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00d2ff' }}>{analysis.stats.correlation.toFixed(4)}</div>
          </div>
          <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '5px' }}>R-Squared</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff7300' }}>{analysis.stats.r_squared.toFixed(4)}</div>
          </div>
          <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '5px' }}>Regression Equation</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{analysis.stats.equation}</div>
          </div>
        </div>

        {/* Plots Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '20px' }}>Linear Regression Plot</h3>
            <img 
              src={`data:image/png;base64,${analysis.plots.gold_silver_regression}`} 
              alt="Regression Plot" 
              style={{ width: '100%', borderRadius: '10px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginBottom: '20px' }}>Gold Price Trend</h3>
              <img 
                src={`data:image/png;base64,${analysis.plots.gold_price}`} 
                alt="Gold Price" 
                style={{ width: '100%', borderRadius: '10px' }}
              />
            </div>
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginBottom: '20px' }}>Silver Price Trend</h3>
              <img 
                src={`data:image/png;base64,${analysis.plots.silver_price}`} 
                alt="Silver Price" 
                style={{ width: '100%', borderRadius: '10px' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketAnalysis;
