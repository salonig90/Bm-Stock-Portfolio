import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Sectors from "./pages/Sectors";
import Sector from "./pages/Sector";
import StockDetail from "./pages/StockDetail";
import MarketAnalysis from "./pages/MarketAnalysis";
import PortfolioDetail from "./pages/PortfolioDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '15px 40px', 
      background: '#0f2027', 
      color: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <Link to="/" style={{ 
        fontSize: '1.5rem', 
        fontWeight: '800', 
        color: 'white', 
        textDecoration: 'none' 
      }}>
        Stock<span style={{ color: '#00d2ff' }}>Whiz</span>
      </Link>
      <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
        <Link to="/sectors" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Sectors</Link>
        <Link to="/analysis" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Market Analysis</Link>
        <Link to="/portfolio" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>My Portfolio</Link>
        
        {username ? (
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ color: '#00d2ff', fontWeight: 'bold' }}>Hi, {username}</span>
            <button 
              onClick={handleLogout}
              style={{ 
                background: 'transparent', 
                color: 'white', 
                border: '1px solid #00d2ff', 
                padding: '5px 15px', 
                borderRadius: '20px', 
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" style={{ 
            background: '#00d2ff', 
            color: 'white', 
            padding: '8px 20px', 
            borderRadius: '20px', 
            textDecoration: 'none', 
            fontWeight: 'bold' 
          }}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sectors" element={<Sectors />} />
        <Route path="/sector/:name" element={<Sector />} />
        <Route path="/stock/:id" element={<StockDetail />} />
        <Route path="/analysis" element={<MarketAnalysis />} />
        <Route path="/portfolio" element={<PortfolioDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;