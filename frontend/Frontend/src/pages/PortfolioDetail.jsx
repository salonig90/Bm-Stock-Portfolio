import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useParams, Link, useNavigate } from "react-router-dom";

function PortfolioDetail() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState("");
  const [stocksInSector, setStocksInSector] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortfolio();
    API.get("sectors/").then((res) => setSectors(res.data));
  }, []);

  const fetchPortfolio = () => {
    setError(null);
    API.get("my-portfolio/")
      .then((res) => {
        setPortfolio(res.data);
      })
      .catch((err) => {
        console.error("Error fetching portfolio:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/login");
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
      .then((res) => {
        fetchPortfolio();
        setSearchTerm("");
        setSearchResults([]);
      })
      .catch((err) => console.error("Failed to add stock"));
  };

  const removeStock = (stockId) => {
    API.post("my-portfolio/remove-stock/", { stock_id: stockId })
      .then((res) => {
        fetchPortfolio();
      })
      .catch((err) => console.error("Failed to remove stock"));
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

        {/* Stock Data List */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 25px 0', fontSize: '1.5rem', color: '#333' }}>Portfolio Holdings</h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f0f0f0', color: '#888', fontSize: '0.9rem' }}>
                  <th style={{ padding: '15px 10px' }}>STOCK</th>
                  <th style={{ padding: '15px 10px' }}>PRICE</th>
                  <th style={{ padding: '15px 10px' }}>NEXT DAY PRED.</th>
                  <th style={{ padding: '15px 10px' }}>SECTOR</th>
                  <th style={{ padding: '15px 10px' }}>PE RATIO</th>
                  <th style={{ padding: '15px 10px' }}>52W HIGH/LOW</th>
                  <th style={{ padding: '15px 10px' }}>OPPORTUNITY</th>
                  <th style={{ padding: '15px 10px' }}>GRAPHS</th>
                  <th style={{ padding: '15px 10px' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.stocks.map((stock) => (
                  <tr key={stock.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '20px 10px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{stock.symbol}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>{stock.name}</div>
                    </td>
                    <td style={{ padding: '20px 10px', fontWeight: 'bold' }}>₹{stock.price}</td>
                    <td style={{ padding: '20px 10px' }}>
                      {stock.prediction ? (
                        <div style={{ color: '#0050b3', fontWeight: 'bold' }}>₹{stock.prediction.next_day_prediction}</div>
                      ) : (
                        <span style={{ color: '#ccc' }}>N/A</span>
                      )}
                    </td>
                    <td style={{ padding: '20px 10px' }}>
                      <span style={{ padding: '4px 10px', background: '#f0f2f5', borderRadius: '6px', fontSize: '0.85rem' }}>{stock.sector}</span>
                    </td>
                    <td style={{ padding: '20px 10px' }}>{stock.pe_ratio}</td>
                    <td style={{ padding: '20px 10px' }}>
                      <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: '#2c7a7b' }}>H: ₹{stock.high_price}</span><br/>
                        <span style={{ color: '#c53030' }}>L: ₹{stock.low_price}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 10px' }}>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        padding: '6px 12px', 
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        background: stock.opportunity_level === "Strong Opportunity" ? "#e6fffa" : stock.opportunity_level === "Moderate Opportunity" ? "#fffaf0" : "#fff5f5",
                        color: stock.opportunity_level === "Strong Opportunity" ? "#2c7a7b" : stock.opportunity_level === "Moderate Opportunity" ? "#b7791f" : "#c53030"
                      }}>
                        {stock.opportunity_level}
                      </span>
                    </td>
                    <td style={{ padding: '20px 10px' }}>
                      <button 
                        onClick={() => navigate(`/stock/${stock.id}`)}
                        style={{ background: '#00d2ff', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        View Graph
                      </button>
                    </td>
                    <td style={{ padding: '20px 10px' }}>
                      <button 
                        onClick={() => removeStock(stock.id)}
                        style={{ background: 'transparent', color: '#e53e3e', border: '1px solid #e53e3e', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {portfolio.stocks.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
                      Your portfolio is empty. Start by adding stocks above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Portfolio Clusters Section */}
        {portfolio.clusters && portfolio.clusters.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
              <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#333' }}>Portfolio Analysis: Smart Clusters</h3>
              <span style={{ 
                background: '#00d2ff', 
                color: 'white', 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>K-Means Logic</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              {/* Cluster Graph */}
              {portfolio.cluster_plot && (
                <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                  <h4 style={{ margin: '0 0 20px 0', fontSize: '1.3rem' }}>Cluster Visualization</h4>
                  <img 
                    src={`data:image/png;base64,${portfolio.cluster_plot}`} 
                    alt="Portfolio Clusters Graph" 
                    style={{ width: '100%', borderRadius: '12px' }}
                  />
                  <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '15px', textAlign: 'center' }}>
                    Graph shows clusters based on Price and Volatility.
                  </p>
                </div>
              )}

              {/* Cluster Descriptions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {portfolio.clusters.map((cluster) => (
                  <div key={cluster.id} style={{ 
                    background: 'white', 
                    padding: '20px', 
                    borderRadius: '15px', 
                    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                    borderLeft: `6px solid ${cluster.id === 0 ? '#00d2ff' : cluster.id === 1 ? '#ff4d4f' : '#52c41a'}`
                  }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{cluster.label}</h4>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#888' }}>{cluster.info}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {cluster.stocks.map((s, idx) => (
                        <span key={idx} style={{ 
                          fontSize: '0.75rem', 
                          padding: '3px 8px', 
                          background: '#f0f2f5', 
                          borderRadius: '5px', 
                          fontWeight: 'bold' 
                        }}>
                          {s.symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PortfolioDetail;
