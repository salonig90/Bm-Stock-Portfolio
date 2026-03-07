import React, { useEffect, useRef, useState } from "react";
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
  const [forecastHistory, setForecastHistory] = useState([]); // Separate state for forecasting history
  const [selectedModel, setSelectedSector] = useState("lr"); // Model toggle: lr, ts, rnn, arima
  const [timeRange, setTimeRange] = useState("1W"); // 1h, 1D, 1W
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);
  const [historyError, setHistoryError] = useState(null);
  const hasLoadedInitialRange = useRef(false);

  useEffect(() => {
    hasLoadedInitialRange.current = false;
    setLoading(true);
    setError(null);
    setHistoryError(null);

    // Fetch initial detail and full history (1Y)
    Promise.allSettled([
      API.get(`stocks/detail/${id}/`),
      API.get(`stocks/history/${id}/`)
    ]).then(([detailResult, historyResult]) => {
      if (detailResult.status === "fulfilled") {
        setStock(detailResult.value.data);
      } else {
        setError("Failed to load stock details.");
      }

      if (historyResult.status === "fulfilled") {
        setHistory(historyResult.value.data.history || []);
        // Also set initial forecast history and prediction from the same data
        setForecastHistory(historyResult.value.data.history || []);
        setPrediction(historyResult.value.data.prediction || null);
      } else {
        setHistoryError("History and prediction are temporarily unavailable.");
      }
      setLoading(false);
    });
  }, [id]);

  // Separate effect for timeRange changes to update forecast chart only
  useEffect(() => {
    if (!id || loading) return;
    if (!hasLoadedInitialRange.current) {
      hasLoadedInitialRange.current = true;
      return;
    }

    API.get(`stocks/history/${id}/?range=${timeRange}`)
      .then((res) => {
        setForecastHistory(res.data.history || []);
        setPrediction(res.data.prediction || null);
      })
      .catch((err) => {
        console.error("Error fetching range-specific history:", err);
      });
  }, [id, timeRange]);

  const handleAddToPortfolio = async () => {
    setIsAdding(true);
    try {
      await API.post("my-portfolio/add-stock/", { stock_id: stock.id });
      alert(`${stock.symbol} added to your portfolio!`);
    } catch (err) {
      console.error("Add error:", err);
      alert(err.response?.data?.error || "Error adding stock.");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading stock details and charts...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;
  if (!stock) return <div style={{ padding: '40px', textAlign: 'center' }}>Stock not found.</div>;

  const currencySymbol = stock.currency === 'USD' ? '$' : '₹';

  // Format forecast data for the selected model
  const forecastData = prediction?.forecasts?.[selectedModel] || [];
  // For forecasting, show more historical context (e.g., last 50 points)
  const activeHistory = forecastHistory.length > 0 ? forecastHistory.slice(-50) : history.slice(-50);
  const forecastHorizonLabel = timeRange === "1h" ? "7-Hour" : timeRange === "1D" ? "7-Day" : "7-Week";

  // Format data for Recharts to show actual and predicted lines separately
  const combinedData = [
    ...activeHistory.map(item => ({
      ...item,
      actual: item.price
    })),
    ...(activeHistory.length > 0 ? [{
      ...activeHistory[activeHistory.length - 1],
      predicted: activeHistory[activeHistory.length - 1].price
    }] : []),
    ...forecastData.map(item => ({
      ...item,
      predicted: item.price
    }))
  ];

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
            <div style={{ marginTop: '15px' }}>
              <button 
                onClick={handleAddToPortfolio}
                disabled={isAdding}
                style={{ 
                  background: '#00d2ff', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '10px', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 10px rgba(0,210,255,0.3)'
                }}
              >
                {isAdding ? "Adding..." : "+ Add to Portfolio"}
              </button>
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
            <h3 style={{ margin: '0 0 20px 0', color: '#444' }}>PE Ratio Trend (1 Year)</h3>
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
              <div>
                <h3 style={{ margin: 0, color: '#444' }}>Multi-Model AI Forecasting</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#888' }}>
                  Recent History vs {selectedModel.toUpperCase()} {forecastHorizonLabel} Forecast
                </p>
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '5px', background: '#f0f2f5', padding: '5px', borderRadius: '12px' }}>
                  {['1h', '1D', '1W'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setTimeRange(r)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        background: timeRange === r ? '#4a5568' : 'transparent',
                        color: timeRange === r ? 'white' : '#666',
                        transition: 'all 0.3s'
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: '10px', background: '#f0f2f5', padding: '5px', borderRadius: '12px' }}>
                  {['lr', 'ts', 'rnn', 'arima'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedSector(m)}
                      style={{
                        padding: '8px 15px',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        background: selectedModel === m ? '#00d2ff' : 'transparent',
                        color: selectedModel === m ? 'white' : '#666',
                        transition: 'all 0.3s'
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ height: '400px', width: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }} 
                    axisLine={false} 
                    tickLine={false}
                    interval="preserveStartEnd"
                    minTickGap={30}
                    tickFormatter={(val) => {
                      if (!val) return "";
                      const d = new Date(val);
                      if (timeRange === '1h') {
                        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      }
                      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    orientation="right" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12 }} 
                    tickFormatter={(val) => `${currencySymbol}${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                    formatter={(value, name, entry) => [
                      `${currencySymbol}${value}`,
                      name === 'actual' ? 'Actual Price' : `${selectedModel.toUpperCase()} Prediction`
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    name="actual"
                    stroke="#00d2ff" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    name="predicted"
                    stroke="#ff4d4f" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: 10, right: 20, fontSize: '0.75rem', color: '#888', fontStyle: 'italic' }}>
                Blue: Recent History | Red (Dashed): {forecastHorizonLabel} Forecast
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '30px', marginBottom: '20px' }}>
              {[
                { label: 'LR1 (Linear)', key: 'lr1', color: '#2b6cb0', bg: '#f8faff' },
                { label: 'TS1 (Time Series)', key: 'ts1', color: '#c05621', bg: '#fffaf0' },
                { label: 'RNN1 (Simple)', key: 'rnn1', color: '#2f855a', bg: '#f0fff4' },
                { label: 'ARIMA', key: 'arima1', color: '#805ad5', bg: '#faf5ff' }
              ].map((item) => (
                <div key={item.key} style={{ padding: '15px', background: item.bg, borderRadius: '15px', textAlign: 'center', border: `1px solid ${item.color}22` }}>
                  <div style={{ fontSize: '0.7rem', color: '#718096', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>{item.label}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '900', color: item.color }}>{currencySymbol}{prediction[item.key] || 'N/A'}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '15px', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#666', fontSize: '0.9rem', textTransform: 'uppercase' }}>Model Verdict ({selectedModel.toUpperCase()})</h4>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginTop: '5px' }}>
                    Next Prediction: {currencySymbol}{prediction[`${selectedModel}1`] || prediction[selectedModel]}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>Predicted for</div>
                  <div style={{ fontWeight: 'bold', color: '#444' }}>{new Date(prediction.prediction_date).toLocaleDateString()}</div>
                </div>
              </div>
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
