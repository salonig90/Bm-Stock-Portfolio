import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";

function StockDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [history, setHistory] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setHistoryError(null);

    Promise.allSettled([
      API.get(`stocks/detail/${id}/`),
      API.get(`stocks/history/${id}/`)
    ]).then(([detailResult, historyResult]) => {
      if (detailResult.status === "fulfilled") {
        setStock(detailResult.value.data);
      } else {
        console.error("Error fetching stock detail:", detailResult.reason);
        setError("Failed to load stock details.");
      }

      if (historyResult.status === "fulfilled") {
        setHistory(historyResult.value.data.history || []);
        setPrediction(historyResult.value.data.prediction || null);
      } else {
        console.error("Error fetching stock history:", historyResult.reason);
        setHistory([]);
        setPrediction(null);
        setHistoryError("History and prediction are temporarily unavailable.");
      }

      setLoading(false);
    });
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading stock details and charts...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;
  if (!stock) return <div style={{ padding: '40px', textAlign: 'center' }}>Stock not found.</div>;

  const currencySymbol = stock.currency === 'USD' ? '$' : '₹';

  return (
    <div style={{ padding: '40px', background: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ marginBottom: '20px', background: '#eee', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
        >
          ← Back
        </button>

        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '20px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800' }}>
              {stock.symbol} <span style={{ color: '#666', fontSize: '1.2rem', fontWeight: '400' }}>{stock.name}</span>
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#00d2ff', fontWeight: 'bold' }}>{stock.sector} Sector</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1a1a1a' }}>{currencySymbol}{stock.price}</div>
            <div style={{ 
              display: 'inline-block',
              padding: '4px 12px', 
              borderRadius: '15px', 
              fontSize: '0.9rem', 
              fontWeight: 'bold',
              marginTop: '5px',
              background: stock.opportunity_level.includes('Strong') ? '#c6f6d5' : stock.opportunity_level.includes('Moderate') ? '#feebc8' : '#fed7d7',
              color: stock.opportunity_level.includes('Strong') ? '#22543d' : stock.opportunity_level.includes('Moderate') ? '#744210' : '#822727'
            }}>
              {stock.opportunity_level}
            </div>
          </div>
        </div>

        {/* Historical Charts Section */}
        {historyError && (
          <div style={{ marginBottom: '20px', color: '#b7791f', background: '#fffaf0', padding: '12px 15px', borderRadius: '10px', border: '1px solid #feebc8' }}>
            {historyError}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#444' }}>Stock Price (1 Year)</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00d2ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis 
                    dataKey="date" 
                    hide={true}
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${currencySymbol}${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${currencySymbol}${value}`, "Price"]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Area type="monotone" dataKey="price" stroke="#00d2ff" fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#444' }}>PE Ratio Trend</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis 
                    dataKey="date" 
                    hide={true}
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => [value, "PE Ratio"]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Line type="monotone" dataKey="pe" stroke="#ff7300" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Prediction Section */}
        {prediction && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ margin: 0, color: '#444' }}>AI Prediction Models (Tomorrow)</h3>
              {prediction.stock_ud && (
                <div style={{ 
                  background: prediction.stock_ud === 'UP' ? '#e6fffa' : '#fff5f5', 
                  padding: '8px 20px', 
                  borderRadius: '10px',
                  border: `1px solid ${prediction.stock_ud === 'UP' ? '#38a169' : '#e53e3e'}`,
                  color: prediction.stock_ud === 'UP' ? '#234e52' : '#822727',
                  fontWeight: 'bold'
                }}>
                  Trend: {prediction.stock_ud}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
              <div style={{ padding: '20px', background: '#f8faff', borderRadius: '15px', border: '1px solid #e1e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '10px', fontWeight: 'bold' }}>LR1 (Linear)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#2b6cb0' }}>{currencySymbol}{prediction.lr1 || 'N/A'}</div>
                {prediction.lr1_diff && (
                  <div style={{ fontSize: '0.85rem', marginTop: '5px', color: prediction.lr1_diff >= 0 ? '#38a169' : '#e53e3e' }}>
                    {prediction.lr1_diff > 0 ? '+' : ''}{prediction.lr1_diff}% Accuracy
                  </div>
                )}
              </div>
              <div style={{ padding: '20px', background: '#fffaf0', borderRadius: '15px', border: '1px solid #feebc8', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#7b341e', marginBottom: '10px', fontWeight: 'bold' }}>TS1 (Time Series)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#c05621' }}>{currencySymbol}{prediction.ts1 || 'N/A'}</div>
                {prediction.ts1_diff && (
                  <div style={{ fontSize: '0.85rem', marginTop: '5px', color: prediction.ts1_diff >= 0 ? '#38a169' : '#e53e3e' }}>
                    {prediction.ts1_diff > 0 ? '+' : ''}{prediction.ts1_diff}% Accuracy
                  </div>
                )}
              </div>
              <div style={{ padding: '20px', background: '#f0fff4', borderRadius: '15px', border: '1px solid #c6f6d5', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#22543d', marginBottom: '10px', fontWeight: 'bold' }}>RNN1 (Simple)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#2f855a' }}>{currencySymbol}{prediction.rnn1 || 'N/A'}</div>
                {prediction.rnn1_diff && (
                  <div style={{ fontSize: '0.85rem', marginTop: '5px', color: prediction.rnn1_diff >= 0 ? '#38a169' : '#e53e3e' }}>
                    {prediction.rnn1_diff > 0 ? '+' : ''}{prediction.rnn1_diff}% Accuracy
                  </div>
                )}
              </div>
            </div>
            
            {prediction.prediction_plot && (
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ marginBottom: '15px', color: '#718096' }}>Predicted Price Trend (1-Week)</h4>
                <img 
                  src={`data:image/png;base64,${prediction.prediction_plot}`} 
                  alt="Stock Prediction Graph" 
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                />
              </div>
            )}
          </div>
        )}

        <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#444' }}>Key Metrics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>PE Ratio</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stock.pe_ratio}</div>
            </div>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>52W High</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c7a7b' }}>{currencySymbol}{stock.high_price}</div>
            </div>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>52W Low</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#c53030' }}>{currencySymbol}{stock.low_price}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockDetail;
