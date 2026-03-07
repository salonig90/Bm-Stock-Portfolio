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
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await API.post("stocks/refresh/");
      alert(response.data.message || "Market data refreshed successfully!");
      // If we're on the portfolio page, we might want to reload it
      if (window.location.pathname === "/portfolio") {
        window.location.reload();
      }
    } catch (err) {
      console.error("Refresh error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Error refreshing market data.";
      alert(errorMsg);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await API.get(`stocks/search?q=${searchQuery}`);
        setSuggestions(response.data || []);
      } catch (err) {
        console.error("Suggestion error:", err);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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

      const response = await API.get(`stocks/search?q=${actualQuery}`);
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

        {/* Search Bar */}
        <div ref={searchRef} style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'relative' }}>
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
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          style={{
            background: isRefreshing ? '#4a5568' : '#00d2ff',
            color: 'white',
            border: 'none',
            padding: '8px 18px',
            borderRadius: '20px',
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
        >
          {isRefreshing ? "Updating..." : "🔄 Refresh"}
        </button>
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
  const getInitialUsername = () => {
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") {
      localStorage.removeItem("username");
      return null;
    }
    return localStorage.getItem("username");
  };

  const [username, setUsername] = useState(getInitialUsername);
  const isLoggedIn = !!localStorage.getItem("token");

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
          element={isLoggedIn ? <PortfolioDetail /> : <Navigate to="/login" />}
        />

        <Route path="/compare" element={<StockCompare />} />
        <Route path="/stock/:id" element={<StockDetail />} />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={!isLoggedIn ? <Login onLogin={handleLogin} /> : <Navigate to="/portfolio" />}
        />
        <Route
          path="/signup"
          element={!isLoggedIn ? <Signup /> : <Navigate to="/portfolio" />}
        />

        <Route path="*" element={<div style={{ padding: '100px', textAlign: 'center' }}>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
