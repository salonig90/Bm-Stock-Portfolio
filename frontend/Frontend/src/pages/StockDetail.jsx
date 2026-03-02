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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    // Fetch basic stock info and history
    Promise.all([
      API.get(`stocks/detail/${id}/`),
      API.get(`stocks/history/${id}/`)
    ])
      .then(([detailRes, historyRes]) => {
        setStock(detailRes.data);
        setHistory(historyRes.data.history);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching stock detail:", err);
        setError("Failed to load stock data.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading stock details and charts...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;
  if (!stock) return <div style={{ padding: '40px', textAlign: 'center' }}>Stock not found.</div>;

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
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1a1a1a' }}>₹{stock.price}</div>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
          {/* Price Chart */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#444' }}>Price History (1 Year)</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00d2ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['auto', 'auto']} orientation="right" tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`₹${value}`, 'Price']}
                  />
                  <Area type="monotone" dataKey="price" stroke="#00d2ff" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PE Ratio Chart */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#444' }}>PE Ratio Trend</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['auto', 'auto']} orientation="right" tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [value, 'PE Ratio']}
                  />
                  <Line type="monotone" dataKey="pe" stroke="#ff7300" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#444' }}>Trading Volume</h3>
          <div style={{ width: '100%', height: '150px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" hide />
                <YAxis orientation="right" tick={{fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [value.toLocaleString(), 'Volume']}
                />
                <Bar dataKey="volume" fill="#cbd5e0" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#444' }}>Key Metrics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>PE Ratio</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stock.pe_ratio}</div>
            </div>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>Market Cap</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹{(stock.market_cap / 10000000).toFixed(2)} Cr</div>
            </div>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>52W High</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c7a7b' }}>₹{stock.high_price}</div>
            </div>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>52W Low</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#c53030' }}>₹{stock.low_price}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockDetail;
