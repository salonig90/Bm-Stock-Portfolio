import { useEffect, useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";

function PortfolioDetail() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState("");
  const [stocksInSector, setStocksInSector] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [viewMode, setViewMode] = useState("clustering"); // 'clustering' or 'pe'
  const [removingStockId, setRemovingStockId] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortfolio();
    API.get("sectors/").then((res) => setSectors(res.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPortfolioAnalysis = () => {
    setLoadingAnalysis(true);
    API.get("my-portfolio/analysis/")
      .then((res) => {
        setPortfolio((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            clusters: res.data?.clusters || [],
            cluster_plot: res.data?.cluster_plot || null,
            pe_plot: res.data?.pe_plot || null,
          };
        });
      })
      .catch((err) => {
        console.error("Error fetching portfolio analysis:", err);
      })
      .finally(() => {
        setLoadingAnalysis(false);
      });
  };

  const fetchPortfolio = () => {
    setError(null);
    API.get("my-portfolio/")
      .then((res) => {
        setPortfolio(res.data);
        fetchPortfolioAnalysis();
      })
      .catch((err) => {
        console.error("Error fetching portfolio:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          navigate("/login", { replace: true });
        } else {
          setError(err.response?.data?.error || "Failed to load portfolio. Please check your connection or server logs.");
        }
      });
  };

  if (error) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2 style={{ color: '#c53030' }}>Oops! Something went wrong</h2>
      <p>{error}</p>
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={fetchPortfolio}
          style={{ background: '#00d2ff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
        >
          Try Again
        </button>
        <button 
          onClick={() => navigate("/login")}
          style={{ background: '#eee', color: '#333', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
        >
          Re-login
        </button>
      </div>
    </div>
  );

  const handleSectorChange = (e) => {
    const sector = e.target.value;
    setSelectedSector(sector);
    if (sector) {
      API.get(`stocks/${sector}/`).then((res) => setStocksInSector(res.data));
    } else {
      setStocksInSector([]);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 1) {
      API.get(`stocks/search?q=${term}`).then((res) => setSearchResults(res.data));
    } else {
      setSearchResults([]);
    }
  };

  const addStock = (stockId) => {
    API.post("my-portfolio/add-stock/", { stock_id: stockId })
      .then(() => {
        fetchPortfolio();
        setSearchTerm("");
        setSearchResults([]);
      })
      .catch(() => console.error("Failed to add stock"));
  };

  const removeStock = async (stockId) => {
    setRemovingStockId(stockId);
    try {
      await API.post("my-portfolio/remove-stock/", { stock_id: stockId });
      fetchPortfolio();
    } catch (err) {
      console.error("Failed to remove stock:", err?.response?.data || err);
      window.alert(err?.response?.data?.error || "Failed to remove stock from portfolio.");
    } finally {
      setRemovingStockId(null);
    }
  };

  if (!portfolio) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <p>Loading your portfolio...</p>
      <p style={{ fontSize: '0.8rem', color: '#888' }}>If this takes too long, please check if you are logged in.</p>
      <button 
        onClick={() => navigate("/login")}
        style={{ background: '#00d2ff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
      >
        Go to Login
      </button>
    </div>
  );

  return (
    <div style={{ padding: '40px', background: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header / Add Stock Section (Replacing Admin Portfolio Box) */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '2rem', color: '#1a1a1a' }}>{portfolio.portfolio_name}</h2>
              <p style={{ color: '#666', margin: 0 }}>Add new stocks to your portfolio below.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', width: '60%' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Search by Name/Symbol..." 
                  value={searchTerm}
                  onChange={handleSearch}
                  style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                />
                {searchResults.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, marginTop: '5px', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', background: '#fff' }}>
                    {searchResults.map(stock => (
                      <div 
                        key={stock.id} 
                        onClick={() => addStock(stock.id)}
                        style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{stock.symbol}</div>
                          <div style={{ fontSize: '0.8rem', color: '#888' }}>{stock.name}</div>
                        </div>
                        <button style={{ background: '#00d2ff', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '5px', fontSize: '0.8rem' }}>Add</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ width: '250px' }}>
                <select 
                  value={selectedSector} 
                  onChange={handleSectorChange}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                >
                  <option value="">Filter by Sector...</option>
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {stocksInSector.length > 0 && (
                  <div style={{ position: 'absolute', width: '250px', zIndex: 10, marginTop: '5px', maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', background: '#fff' }}>
                    {stocksInSector.map(stock => (
                      <div key={stock.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid #eee' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{stock.symbol}</span>
                        <button 
                          onClick={() => addStock(stock.id)}
                          style={{ background: '#00d2ff', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '5px', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Analysis Section */}
        {portfolio.stocks.length > 0 && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>Portfolio AI Analysis</h3>
              <div style={{ display: 'flex', background: '#f0f2f5', padding: '5px', borderRadius: '10px' }}>
                <button 
                  onClick={() => setViewMode("clustering")}
                  style={{ 
                    padding: '8px 20px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    background: viewMode === "clustering" ? "#00d2ff" : "transparent",
                    color: viewMode === "clustering" ? "white" : "#666",
                    transition: 'all 0.3s'
                  }}
                >
                  K-Means Clustering
                </button>
                <button 
                  onClick={() => setViewMode("pe")}
                  style={{ 
                    padding: '8px 20px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    background: viewMode === "pe" ? "#00d2ff" : "transparent",
                    color: viewMode === "pe" ? "white" : "#666",
                    transition: 'all 0.3s'
                  }}
                >
                  PE Ratio Analysis
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              {loadingAnalysis ? (
                <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="spinner" style={{ 
                    border: '4px solid rgba(0, 210, 255, 0.1)', 
                    borderTop: '4px solid #00d2ff', 
                    borderRadius: '50%', 
                    width: '40px', 
                    height: '40px', 
                    animation: 'spin 1s linear infinite' 
                  }}></div>
                  <p style={{ marginTop: '20px', color: '#64748b', fontWeight: '600' }}>AI is analyzing your portfolio dynamics...</p>
                  <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                  `}</style>
                </div>
              ) : viewMode === "clustering" ? (
                <div>
                  {portfolio.cluster_plot ? (
                    <>
                      <img 
                        src={`data:image/png;base64,${portfolio.cluster_plot}`} 
                        alt="K-Means Clustering" 
                        style={{ maxWidth: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <div style={{ marginTop: '25px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'left' }}>
                        {portfolio.clusters.map((cluster, idx) => (
                          <div key={idx} style={{ padding: '20px', background: '#f8faff', borderRadius: '12px', border: '1px solid #e1e8f0' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#2c5282' }}>{cluster.label}</h4>
                            <p style={{ fontSize: '0.85rem', color: '#4a5568', marginBottom: '15px' }}>{cluster.info}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {cluster.stocks.map(s => (
                                <span key={s.symbol} style={{ padding: '3px 8px', background: 'white', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #cbd5e0' }}>{s.symbol}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p style={{ color: '#64748b', padding: '40px' }}>Not enough data for clustering. Add at least 2 stocks.</p>
                  )}
                </div>
              ) : (
                <div>
                  {portfolio.pe_plot ? (
                    <img 
                      src={`data:image/png;base64,${portfolio.pe_plot}`} 
                      alt="PE Ratio Analysis" 
                      style={{ maxWidth: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  ) : (
                    <p style={{ color: '#64748b', padding: '40px' }}>PE data not available for your stocks.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stock Data List */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>Portfolio Holdings</h3>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f0f0f0', color: '#888', fontSize: '0.8rem' }}>
                  <th style={{ padding: '15px 5px' }}>STOCK</th>
                  <th style={{ padding: '15px 5px' }}>PRICE</th>
                  <th style={{ padding: '15px 5px' }}>PE RATIO</th>
                  <th style={{ padding: '15px 5px' }}>DISCOUNT</th>
                  <th style={{ padding: '15px 5px' }}>OPPORTUNITY</th>
                  <th style={{ padding: '15px 5px' }}>LR1</th>
                  <th style={{ padding: '15px 5px' }}>LR1_pred%</th>
                  <th style={{ padding: '15px 5px' }}>TS1</th>
                  <th style={{ padding: '15px 5px' }}>TS1_pred%</th>
                  <th style={{ padding: '15px 5px' }}>RNN1</th>
                  <th style={{ padding: '15px 5px' }}>RNN1_pred%</th>
                  <th style={{ padding: '15px 5px' }}>STOCK_UD</th>
                  <th style={{ padding: '15px 5px' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.stocks.map((stock) => {
                  const currencySymbol = stock.currency === "USD" ? "$" : "INR ";
                  const pred = stock.prediction || {};
                  
                  return (
                    <tr key={stock.id} style={{ borderBottom: '1px solid #f0f0f0', fontSize: '0.9rem' }}>
                      <td style={{ padding: '15px 5px' }}>
                        <div style={{ fontWeight: 'bold' }}>{stock.symbol}</div>
                        <div style={{ fontSize: '0.7rem', color: '#888' }}>{stock.name}</div>
                      </td>
                      <td style={{ padding: '15px 5px', fontWeight: 'bold' }}>{currencySymbol}{stock.price}</td>
                      <td style={{ padding: '15px 5px' }}>{stock.pe_ratio}</td>
                      
                      <td style={{ padding: '15px 5px', color: '#888' }}>
                        {stock.discount_pct}%
                      </td>
                      <td style={{ padding: '15px 5px' }}>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          padding: '4px 8px', 
                          borderRadius: '15px',
                          fontWeight: 'bold',
                          background: stock.opportunity_level === "Strong" ? "#e6fffa" : stock.opportunity_level === "Moderate" ? "#fffaf0" : "#fff5f5",
                          color: stock.opportunity_level === "Strong" ? "#2c7a7b" : stock.opportunity_level === "Moderate" ? "#b7791f" : "#c53030"
                        }}>
                          {stock.opportunity_level}
                        </span>
                      </td>

                      {/* LR1 Columns */}
                      <td style={{ padding: '15px 5px', fontWeight: '500' }}>
                        {pred.lr1 ? `${currencySymbol}${pred.lr1}` : 'N/A'}
                      </td>
                      <td style={{ padding: '15px 5px', color: pred.lr1_diff >= 0 ? '#38a169' : '#e53e3e', fontWeight: 'bold' }}>
                        {pred.lr1_diff !== undefined && pred.lr1_diff !== null ? `${pred.lr1_diff > 0 ? '+' : ''}${pred.lr1_diff}%` : 'N/A'}
                      </td>

                      {/* TS1 Columns */}
                      <td style={{ padding: '15px 5px', fontWeight: '500' }}>
                        {pred.ts1 ? `${currencySymbol}${pred.ts1}` : 'N/A'}
                      </td>
                      <td style={{ padding: '15px 5px', color: pred.ts1_diff >= 0 ? '#38a169' : '#e53e3e', fontWeight: 'bold' }}>
                        {pred.ts1_diff !== undefined && pred.ts1_diff !== null ? `${pred.ts1_diff > 0 ? '+' : ''}${pred.ts1_diff}%` : 'N/A'}
                      </td>

                      {/* RNN1 Columns */}
                      <td style={{ padding: '15px 5px', fontWeight: '500' }}>
                        {pred.rnn1 ? `${currencySymbol}${pred.rnn1}` : 'N/A'}
                      </td>
                      <td style={{ padding: '15px 5px', color: pred.rnn1_diff >= 0 ? '#38a169' : '#e53e3e', fontWeight: 'bold' }}>
                        {pred.rnn1_diff !== undefined && pred.rnn1_diff !== null ? `${pred.rnn1_diff > 0 ? '+' : ''}${pred.rnn1_diff}%` : 'N/A'}
                      </td>

                      {/* stock_UD Column */}
                      <td style={{ padding: '15px 5px' }}>
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          background: pred.stock_ud === 'UP' ? '#c6f6d5' : pred.stock_ud === 'DOWN' ? '#fed7d7' : '#f0f2f5',
                          color: pred.stock_ud === 'UP' ? '#22543d' : pred.stock_ud === 'DOWN' ? '#822727' : '#666'
                        }}>
                          {pred.stock_ud || 'N/A'}
                        </span>
                      </td>

                      <td style={{ padding: '15px 5px' }}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button 
                            onClick={() => navigate(`/stock/${stock.id}`)}
                            style={{ background: '#00d2ff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            Graph
                          </button>
                          <button 
                            onClick={() => removeStock(stock.id)}
                            disabled={removingStockId === stock.id}
                            style={{ background: 'transparent', color: '#e53e3e', border: '1px solid #e53e3e', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            {removingStockId === stock.id ? "Deleting..." : "Del"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {portfolio.stocks.length === 0 && (
                  <tr>
                    <td colSpan="13" style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
                      Your portfolio is empty. Start by adding stocks above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PortfolioDetail;