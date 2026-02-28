import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";

function Sectors() {
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    API.get("sectors/")
      .then((res) => {
        setSectors(res.data);
      })
      .catch((error) => {
        console.error("API Error:", error);
      });
  }, []);

  return (
    <div style={{
      padding: '40px',
      background: '#f4f7f6',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.5rem', color: '#1a1a1a', marginBottom: '30px', fontWeight: '800' }}>
          Industry <span style={{ color: '#00d2ff' }}>Sectors</span>
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '25px'
        }}>
          {sectors.map((sector, index) => (
            <Link 
              key={index} 
              to={`/sector/${sector}`}
              style={{
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                border: '1px solid #eee',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '150px',
                cursor: 'pointer'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '10px'
                }}>
                  {sector.includes("IT") ? "💻" : sector.includes("Auto") ? "🚗" : sector.includes("Bank") ? "🏦" : "📈"}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#333' }}>{sector}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sectors;
