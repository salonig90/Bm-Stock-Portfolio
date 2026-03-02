import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Sector() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get(`stocks/${name}/`)
      .then((res) => {
        setStocks(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching sector stocks:", err);
        setLoading(false);
      });
  }, [name]);

  const addToPortfolio = (stockId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add stocks to your portfolio.");
      navigate("/login");
      return;
    }

    API.post("my-portfolio/add-stock/", { stock_id: stockId })
      .then((res) => {
        alert(res.data.message);
      })
      .catch((err) => {
        alert("Failed to add stock. Make sure you are logged in.");
      });
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading stocks...</div>;

  return (
    <div style={{ padding: '40px', background: '#f4f7f6', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <button 
          onClick={() => navigate("/sectors")}
          style={{ marginBottom: '20px', background: '#eee', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
        >
          ← Back to Sectors
        </button>
        
        <h2 style={{ fontSize: '2.5rem', color: '#1a1a1a', marginBottom: '30px', fontWeight: '800' }}>
          Stocks in <span style={{ color: '#00d2ff' }}>{name}</span>
        </h2>

        {stocks.length === 0 ? (
          <div style={{ background: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center' }}>
            <p>No stocks found in this sector. Try populating the database.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '25px'
          }}>
            {stocks.map(stock => (
              <div key={stock.id} style={{
                background: 'white',
                padding: '25px',
                borderRadius: '15px',
                boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                border: '1px solid #eee',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => navigate(`/stock/${stock.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{stock.symbol}</h3>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{stock.name}</p>
                  </div>
                  <div style={{ 
                    padding: '4px 10px', 
                    borderRadius: '10px', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    background: stock.opportunity_level.includes('Strong') ? '#c6f6d5' : stock.opportunity_level.includes('Moderate') ? '#feebc8' : '#fed7d7',
                    color: stock.opportunity_level.includes('Strong') ? '#22543d' : stock.opportunity_level.includes('Moderate') ? '#744210' : '#822727'
                  }}>
                    {stock.opportunity_level}
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>₹{stock.price}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>PE Ratio: {stock.pe_ratio}</div>
                </div>

                <div style={{ 
                  textAlign: 'center', 
                  fontSize: '0.8rem', 
                  color: '#00d2ff', 
                  marginBottom: '15px',
                  fontStyle: 'italic'
                }}>
                  Click card to view detailed history
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    addToPortfolio(stock.id);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#00d2ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Add to Portfolio
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sector;
