import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useLocation } from "react-router-dom";
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
import ChatBot from "./components/ChatBot";

function Navbar({ username, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/sectors") return location.pathname.startsWith("/sector");
    return location.pathname.startsWith(path);
  };

  const linkStyle = (path) => ({
    color: isActive(path) ? '#00d2ff' : '#94a3b8',
    textDecoration: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    padding: '8px 0',
    fontWeight: isActive(path) ? '800' : '600',
    textShadow: isActive(path) ? '0 0 20px rgba(0, 210, 255, 0.4)' : 'none',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center'
  });

  const activeUnderline = {
    position: 'absolute',
    bottom: '-4px',
    left: '0',
    width: '100%',
    height: '3px',
    background: 'linear-gradient(90deg, #00d2ff, #3a7bd5)',
    borderRadius: '10px',
    boxShadow: '0 0 15px rgba(0, 210, 255, 0.6)',
    animation: 'slideIn 0.3s ease-out'
  };

  const navStyles = `
    @keyframes slideIn {
      from { width: 0; opacity: 0; }
      to { width: 100%; opacity: 1; }
    }
  `;

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
      padding: '10px 40px',
      background: 'rgba(10, 10, 12, 0.95)',
      color: 'white',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(20px)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
    }}>
      <style>{navStyles}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <Link to="/" style={{
          fontSize: '1.4rem',
          fontWeight: '900',
          color: 'white',
          textDecoration: 'none',
          letterSpacing: '-0.02em'
        }}>
          Stock<span style={{ color: '#00d2ff' }}>Whiz</span>
        </Link>

        {/* Search Bar */}
        <div ref={searchRef} style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'relative' }}>
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              style={{
                padding: '10px 18px',
                paddingRight: '45px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                width: '280px',
                background: 'rgba(255,255,255,0.03)',
                color: 'white',
                outline: 'none',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
              className="search-input"
            />
            <button
              type="submit"
              disabled={isSearching}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1rem'
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
              background: '#111827',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              marginTop: '10px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              zIndex: 2000
            }}>
              {suggestions.length > 0 ? (
                suggestions.map((stock) => (
                  <div
                    key={stock.id}
                    onClick={() => selectSuggestion(stock)}
                    style={{
                      padding: '12px 18px',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      transition: 'background 0.2s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div style={{ fontWeight: '700', color: 'white' }}>{stock.symbol}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{stock.name}</div>
                    </div>
                    <div style={{ color: '#00d2ff', fontSize: '0.8rem' }}>View Details →</div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '15px', color: '#94a3b8', textAlign: 'center', fontSize: '0.9rem' }}>
                  No matching stocks found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          style={{
            background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
            color: 'white',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '700',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(0, 210, 255, 0.2)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {isRefreshing ? "..." : "🔄 Refresh"}
        </button>

        <div style={{ display: 'flex', gap: '25px', fontSize: '0.9rem', fontWeight: '600' }}>
          <Link to="/" style={linkStyle("/")} onMouseOver={(e) => !isActive("/") && (e.target.style.color = 'white')} onMouseOut={(e) => !isActive("/") && (e.target.style.color = '#94a3b8')}>
            Home
            {isActive("/") && <div style={activeUnderline}></div>}
          </Link>
          <Link to="/sectors" style={linkStyle("/sectors")} onMouseOver={(e) => !isActive("/sectors") && (e.target.style.color = 'white')} onMouseOut={(e) => !isActive("/sectors") && (e.target.style.color = '#94a3b8')}>
            Sectors
            {isActive("/sectors") && <div style={activeUnderline}></div>}
          </Link>
          <Link to="/compare" style={linkStyle("/compare")} onMouseOver={(e) => !isActive("/compare") && (e.target.style.color = 'white')} onMouseOut={(e) => !isActive("/compare") && (e.target.style.color = '#94a3b8')}>
            Compare Stocks
            {isActive("/compare") && <div style={activeUnderline}></div>}
          </Link>
          <Link to="/gold-silver" style={linkStyle("/gold-silver")} onMouseOver={(e) => !isActive("/gold-silver") && (e.target.style.color = 'white')} onMouseOut={(e) => !isActive("/gold-silver") && (e.target.style.color = '#94a3b8')}>
            Gold Silver Analysis
            {isActive("/gold-silver") && <div style={activeUnderline}></div>}
          </Link>
          <Link to="/portfolio" style={linkStyle("/portfolio")} onMouseOver={(e) => !isActive("/portfolio") && (e.target.style.color = 'white')} onMouseOut={(e) => !isActive("/portfolio") && (e.target.style.color = '#94a3b8')}>
            My Portfolio
            {isActive("/portfolio") && <div style={activeUnderline}></div>}
          </Link>
        </div>

        {/* Creative Unified Auth Button */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          {username ? (
            <div className="auth-pill" style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              padding: '6px',
              borderRadius: '50px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              gap: '12px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }} onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(0, 210, 255, 0.3)';
            }} onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '900',
                fontSize: '0.9rem',
                boxShadow: '0 0 15px rgba(0, 210, 255, 0.4)'
              }}>
                {username.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', marginRight: '8px' }}>
                <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: '800', lineHeight: 1 }}>{username}</span>
                <span style={{ color: '#00d2ff', fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>Member</span>
              </div>
              <button 
                onClick={onLogout}
                style={{
                  background: 'rgba(248, 113, 113, 0.15)',
                  border: 'none',
                  color: '#f87171',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '1.2rem',
                  boxShadow: '0 4px 10px rgba(248, 113, 113, 0.1)'
                }}
                title="Logout"
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f87171';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateX(3px)';
                  e.currentTarget.style.boxShadow = '0 6px 15px rgba(248, 113, 113, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(248, 113, 113, 0.15)';
                  e.currentTarget.style.color = '#f87171';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(248, 113, 113, 0.1)';
                }}
              >
                <span style={{ transform: 'rotate(-45deg)', display: 'inline-block', marginTop: '-2px' }}>➦</span>
              </button>
            </div>
          ) : (
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <div className="auth-pill" style={{
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                padding: '10px 24px',
                borderRadius: '50px',
                gap: '12px',
                boxShadow: '0 8px 20px rgba(0, 210, 255, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }} onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 210, 255, 0.5)';
              }} onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 210, 255, 0.3)';
              }}>
                <span style={{ color: 'white', fontWeight: '900', fontSize: '0.9rem', letterSpacing: '0.02em' }}>GET STARTED</span>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1rem'
                }}>
                  →
                </div>
              </div>
            </Link>
          )}
        </div>
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
      <ChatBot />
    </BrowserRouter>
  );
}

export default App;
