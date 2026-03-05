import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Home from "./pages/Home";
import Sectors from "./pages/Sectors";
import Sector from "./pages/Sector";
import StockDetail from "./pages/StockDetail";
import StockCompare from "./pages/StockCompare";
import GoldSilverAnalysis from "./pages/MarketAnalysis";
import PortfolioDetail from "./pages/PortfolioDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import API from "./services/api";

function Navbar({ username, onLogout }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [sectors, setSectors] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    API.get("sectors/")
      .then((res) => setSectors(res.data))
      .catch((err) => console.error("Error fetching sectors:", err));
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await API.get(`stocks/search?q=${searchQuery}&sector=${selectedSector}`);
        setSuggestions(response.data || []);
      } catch (err) {
        console.error("Suggestion error:", err);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedSector]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // 1. Try to extract symbol if it's in the Name (SYMBOL) format
      let actualQuery = searchQuery;
      const match = searchQuery.match(/\((.*?)\)$/);
      if (match) {
        actualQuery = match[1];
      }

      const response = await API.get(`stocks/search?q=${actualQuery}&sector=${selectedSector}`);
      if (response.data && response.data.length > 0) {
        navigate(`/stock/${response.data[0].id}`);
        setShowSuggestions(false);
        setSearchQuery("");
      } else {
        alert("No stocks found.");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Error searching for stock.");
    } finally {
      setIsSearching(false);
    }
  };

  const selectSuggestion = (stock) => {
    setSearchQuery(`${stock.name} (${stock.symbol})`);
    setShowSuggestions(false);
    // Navigate immediately to fetch data
    navigate(`/stock/${stock.id}`); 
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" style={{ 
          fontSize: '1.5rem', 
          fontWeight: '800', 
          color: 'white', 
          textDecoration: 'none' 
        }}>
          Stock<span style={{ color: '#00d2ff' }}>Whiz</span>
        </Link>
        
        {/* Sector and Search Bar */}
        <div ref={searchRef} style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'relative' }}>
          <select 
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '20px',
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="All" style={{ color: 'black' }}>All Sectors</option>
            {sectors.map((s, idx) => (
              <option key={idx} value={s} style={{ color: 'black' }}>{s}</option>
            ))}
          </select>

          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search ticker or name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              style={{
                padding: '8px 15px',
                paddingRight: '40px',
                borderRadius: '20px',
                border: 'none',
                width: '250px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
            />
            <button 
              type="submit" 
              disabled={isSearching}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#00d2ff',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              {isSearching ? "..." : "🔍"}
            </button>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && searchQuery.trim() && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              borderRadius: '8px',
              marginTop: '5px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              zIndex: 2000
            }}>
              {suggestions.length > 0 ? (
                suggestions.map((stock) => (
                  <div
                    key={stock.id}
                    onClick={() => selectSuggestion(stock)}
                    style={{
                      padding: '12px 15px',
                      color: '#333',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f7fafc'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <div style={{ fontWeight: '600' }}>
                      {stock.name} ({stock.symbol})
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '12px 15px', color: '#718096', textAlign: 'center' }}>
                  No stocks found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
        <Link to="/sectors" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Sectors</Link>
        <Link to="/compare" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Compare Stocks</Link>
        <Link to="/gold-silver" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Gold Silver Analysis</Link>
        <Link to="/portfolio" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>My Portfolio</Link>
        
        {username ? (
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ color: '#00d2ff', fontWeight: 'bold' }}>Hi, {username}</span>
            <button 
              onClick={onLogout}
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
  const [username, setUsername] = useState(localStorage.getItem("username"));

  const handleLogin = (name) => {
    setUsername(name);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername(null);
  };

  return (
    <BrowserRouter>
      <Navbar username={username} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sectors" element={<Sectors />} />
        <Route path="/sector/:name" element={<Sector />} />
        <Route path="/gold-silver" element={<GoldSilverAnalysis />} />
        
        {/* Protected Routes */}
        <Route 
          path="/portfolio" 
          element={username ? <PortfolioDetail /> : <Navigate to="/login" />} 
        />
        
        <Route path="/compare" element={<StockCompare />} />
        <Route path="/stock/:id" element={<StockDetail />} />
        
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={!username ? <Login onLogin={handleLogin} /> : <Navigate to="/portfolio" />} 
        />
        <Route 
          path="/signup" 
          element={!username ? <Signup /> : <Navigate to="/portfolio" />} 
        />
        
        <Route path="*" element={<div style={{ padding: '100px', textAlign: 'center' }}>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;