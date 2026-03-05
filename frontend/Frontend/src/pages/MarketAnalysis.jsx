import React, { useEffect, useState } from "react";
import API from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from "recharts";

function GoldSilverAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = () => {
    setLoading(true);
    setError(null);
    API.get("gold-silver-analysis/", { timeout: 30000 }) 
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
      <div style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Analyzing Gold & Silver Market...</div>
      <p style={{ color: '#888' }}>Fetching real-time data and calculating regression models.</p>
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
        <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800' }}>
              Gold & Silver <span style={{ color: '#00d2ff' }}>Analysis</span>
            </h1>
            <p style={{ color: '#666', marginTop: '10px' }}>
              Real-time prices and Linear Regression analysis.
            </p>
          </div>
          <button 
            onClick={fetchAnalysis}
            style={{ background: '#f0f2f5', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🔄 Refresh Live Prices
          </button>
        </div>

        {/* Live Prices Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '5px solid gold' }}>
            <div style={{ fontSize: '1rem', color: '#888', fontWeight: 'bold', marginBottom: '10px' }}>LIVE GOLD PRICE (USD)</div>
            <div style={{ fontSize: '3rem', fontWeight: '900', color: '#b8860b' }}>${analysis.live_prices.gold}</div>
          </div>
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '5px solid silver' }}>
            <div style={{ fontSize: '1rem', color: '#888', fontWeight: 'bold', marginBottom: '10px' }}>LIVE SILVER PRICE (USD)</div>
            <div style={{ fontSize: '3rem', fontWeight: '900', color: '#707070' }}>${analysis.live_prices.silver}</div>
          </div>
        </div>

        {/* Plots Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '20px' }}>Combined Performance Comparison (Normalized)</h3>
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analysis.history}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="date" hide={true} />
                  <YAxis 
                    domain={['dataMin - 1', 'dataMax + 1']} 
                    orientation="right" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, ""]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="gold_norm" name="Gold %" stroke="#b8860b" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="silver_norm" name="Silver %" stroke="#707070" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '15px', textAlign: 'center' }}>
              This graph compares the percentage growth of both Gold and Silver starting from Jan 1st, 2025.
            </p>
          </div>

          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '20px' }}>Gold vs Silver Correlation (Regression Plot)</h3>
            <img 
              src={`data:image/png;base64,${analysis.plots.regression}`} 
              alt="Regression Plot" 
              style={{ width: '100%', borderRadius: '10px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginBottom: '20px' }}>Gold Price History (2025)</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysis.history}>
                    <defs>
                      <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#b8860b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#b8860b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="date" hide={true} />
                    <YAxis 
                      domain={['dataMin - 10', 'dataMax + 10']} 
                      orientation="right" 
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, "Gold"]}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Area type="monotone" dataKey="gold" stroke="#b8860b" fillOpacity={1} fill="url(#colorGold)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginBottom: '20px' }}>Silver Price History (2025)</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysis.history}>
                    <defs>
                      <linearGradient id="colorSilver" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#707070" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#707070" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="date" hide={true} />
                    <YAxis 
                      domain={['dataMin - 5', 'dataMax + 5']} 
                      orientation="right" 
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, "Silver"]}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Area type="monotone" dataKey="silver" stroke="#707070" fillOpacity={1} fill="url(#colorSilver)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoldSilverAnalysis;
