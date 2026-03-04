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
        setPrediction(historyRes.data.prediction);
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

        {/* Prediction Section */}
        {prediction && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#444' }}>AI Price Prediction (Next 1 Week)</h3>
              <div style={{ 
                background: '#e6f7ff', 
                padding: '10px 20px', 
                borderRadius: '12px',
                border: '1px solid #91d5ff'
              }}>
                <span style={{ fontSize: '0.9rem', color: '#0050b3' }}>Next Day Predicted: </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0050b3' }}>₹{prediction.next_day_prediction}</span>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <img 
                src={`data:image/png;base64,${prediction.prediction_plot}`} 
                alt="Stock Prediction Graph" 
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
              />
            </div>
            
            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
              {prediction.weekly_predictions.map((p, index) => (
                <div key={index} style={{ 
                  padding: '10px', 
                  background: '#f0f2f5', 
                  borderRadius: '8px', 
                  textAlign: 'center',
                  border: '1px solid #d9d9d9'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>{new Date(p.date).toLocaleDateString('en-IN', { weekday: 'short' })}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>₹{p.price}</div>
                </div>
              ))}
            </div>
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
