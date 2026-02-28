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
        alert(res.data.message);
        fetchPortfolio();
        setSearchTerm("");
        setSearchResults([]);
      })
      .catch((err) => alert("Failed to add stock"));
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
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: '#1a1a1a' }}>{portfolio.portfolio_name}</h2>
          <p style={{ color: '#666', margin: 0 }}>Manage your custom investment group.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          {/* Add Stock Controls */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '15px', height: 'fit-content', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem' }}>Add New Stock</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: '#555' }}>Search by Name/Symbol</label>
              <input 
                type="text" 
                placeholder="e.g. TCS" 
                value={searchTerm}
                onChange={handleSearch}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              {searchResults.length > 0 && (
                <div style={{ marginTop: '10px', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                  {searchResults.map(stock => (
                    <div 
                      key={stock.id} 
                      onClick={() => addStock(stock.id)}
                      style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', background: '#fff' }}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{stock.symbol}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>{stock.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: '#555' }}>Or Filter by Sector</label>
              <select 
                value={selectedSector} 
                onChange={handleSectorChange}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                <option value="">Select a sector...</option>
                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {stocksInSector.length > 0 && (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {stocksInSector.map(stock => (
                  <div key={stock.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontSize: '0.9rem' }}>{stock.symbol}</span>
                    <button 
                      onClick={() => addStock(stock.id)}
                      style={{ background: '#00d2ff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Stocks Table */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem' }}>Current Holdings</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f0f0f0' }}>
                  <th style={{ padding: '12px 10px' }}>Stock</th>
                  <th style={{ padding: '12px 10px' }}>Price</th>
                  <th style={{ padding: '12px 10px' }}>Sector</th>
                  <th style={{ padding: '12px 10px' }}>Opportunity</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.stocks.map((stock) => (
                  <tr key={stock.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ fontWeight: 'bold' }}>{stock.symbol}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{stock.name}</div>
                    </td>
                    <td style={{ padding: '12px 10px' }}>₹{stock.price}</td>
                    <td style={{ padding: '12px 10px', fontSize: '0.85rem' }}>{stock.sector}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '4px 8px', 
                        borderRadius: '12px',
                        background: stock.opportunity_level === "Strong Opportunity" ? "#e6fffa" : "#fff5f5",
                        color: stock.opportunity_level === "Strong Opportunity" ? "#2c7a7b" : "#c53030"
                      }}>
                        {stock.opportunity_level}
                      </span>
                    </td>
                  </tr>
                ))}
                {portfolio.stocks.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Your portfolio is currently empty.</td>
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
