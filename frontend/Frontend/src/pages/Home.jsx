import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API from '../services/api';

const Home = () => {
  const [currentStockIdx, setCurrentStockIdx] = useState(0);
  const [currentNewsIdx, setCurrentNewsIdx] = useState(0);
  const [news, setNews] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [loading, setLoading] = useState(true);

  const featuredStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: '192.42', change: '+2.45%', icon: '' },
    { symbol: 'TSLA', name: 'Tesla Motors', price: '175.34', change: '+1.12%', icon: '⚡️' },
    { symbol: 'MSFT', name: 'Microsoft', price: '415.50', change: '+0.85%', icon: '❖' },
    { symbol: 'GOOGL', name: 'Alphabet', price: '142.10', change: '-0.32%', icon: 'G' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, gainersRes] = await Promise.all([
          API.get('market/news/'),
          API.get('market/top-gainers/')
        ]);
        setNews(newsRes.data);
        setTopGainers(gainersRes.data);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const timer = setInterval(() => {
      setCurrentStockIdx((prev) => (prev + 1) % featuredStocks.length);
    }, 3000);

    const newsTimer = setInterval(() => {
      setNews((prevNews) => {
        if (prevNews.length > 0) {
          setCurrentNewsIdx((prevIdx) => (prevIdx + 1) % prevNews.length);
        }
        return prevNews;
      });
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(newsTimer);
    };
  }, []);

  const stock = featuredStocks[currentStockIdx];
  const currentNews = news.length > 0 ? news[currentNewsIdx] : null;

  return (
    <div style={{
      fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
      color: '#1a202c',
      backgroundColor: '#f7fafc',
      overflowX: 'hidden',
      width: '100%'
    }}>
      {/* Market Ticker at the Top */}
      <div style={{ 
        background: '#0f172a', 
        borderBottom: '1px solid rgba(0, 210, 255, 0.1)', 
        padding: '10px 0', 
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        boxShadow: 'inset 0 0 20px rgba(0, 210, 255, 0.05)',
        width: '100%'
      }}>
        <div className="ticker-content" style={{ display: 'inline-block', animation: 'ticker 40s linear infinite' }}>
          {[
            { n: 'NIFTY 50', p: '22,452.10', c: '+0.85%' },
            { n: 'SENSEX', p: '73,912.45', c: '+0.72%' },
            { n: 'NASDAQ', p: '16,274.94', c: '+1.12%' },
            { n: 'BTC/USD', p: '67,412.00', c: '-0.45%' },
            { n: 'GOLD', p: '2,342.10', c: '+0.15%' },
            { n: 'RELIANCE', p: '2,982.00', c: '+2.10%' },
            { n: 'TCS', p: '3,842.45', c: '-0.25%' },
          ].map((item, i) => (
            <span key={i} style={{ margin: '0 40px', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.05em' }}>
              <span style={{ color: '#64748b', marginRight: '8px' }}>{item.n}</span>
              <span style={{ color: '#f8fafc', marginRight: '8px' }}>{item.p}</span>
              <span style={{ 
                color: item.c.includes('+') ? '#4ade80' : '#f87171',
                fontWeight: '700'
              }}>{item.c}</span>
            </span>
          ))}
          {/* Duplicated for seamless loop */}
          {[
            { n: 'NIFTY 50', p: '22,452.10', c: '+0.85%' },
            { n: 'SENSEX', p: '73,912.45', c: '+0.72%' },
            { n: 'NASDAQ', p: '16,274.94', c: '+1.12%' },
            { n: 'BTC/USD', p: '67,412.00', c: '-0.45%' },
            { n: 'GOLD', p: '2,342.10', c: '+0.15%' },
            { n: 'RELIANCE', p: '2,982.00', c: '+2.10%' },
            { n: 'TCS', p: '3,842.45', c: '-0.25%' },
          ].map((item, i) => (
            <span key={`dup-${i}`} style={{ margin: '0 40px', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.05em' }}>
              <span style={{ color: '#64748b', marginRight: '8px' }}>{item.n}</span>
              <span style={{ color: '#f8fafc', marginRight: '8px' }}>{item.p}</span>
              <span style={{ 
                color: item.c.includes('+') ? '#4ade80' : '#f87171',
                fontWeight: '700'
              }}>{item.c}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section style={{
        minHeight: '90vh',
        background: '#0a0a0c',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        padding: '60px 40px',
        overflow: 'hidden'
      }}>
        {/* Animated Background Gradients */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(0, 210, 255, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
          animation: 'pulse 10s infinite alternate'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '600px', 
          height: '600px',
          background: 'radial-gradient(circle, rgba(58, 123, 213, 0.1) 0%, transparent 70%)',
          filter: 'blur(100px)',
          zIndex: 0,
          animation: 'pulse 15s infinite alternate-reverse'
        }}></div>

        {/* 3D Grid Background Effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          perspective: '1000px',
          zIndex: 0,
          overflow: 'hidden',
          opacity: 0.2
        }}>
          <div style={{
            position: 'absolute',
            width: '200%',
            height: '200%',
            top: '-50%',
            left: '-50%',
            background: 'linear-gradient(rgba(0, 210, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 210, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            transform: 'rotateX(60deg) translateZ(0)',
            animation: 'gridMove 20s linear infinite'
          }}></div>
        </div>

        <div style={{
          maxWidth: '1400px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '60px',
          alignItems: 'center',
          zIndex: 1
        }}>
          {/* Left Content */}
          <div className="hero-content" style={{ animation: 'fadeInLeft 1s ease-out', textAlign: 'left' }}>
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 4vw, 4rem)', 
              fontWeight: '900', 
              lineHeight: 1.1, 
              marginBottom: '25px',
              letterSpacing: '-0.04em'
            }}>
              Precision Data. <br/>
              <span style={{ 
                background: 'linear-gradient(90deg, #00d2ff, #3a7bd5, #00d2ff)', 
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                animation: 'gradientFlow 5s linear infinite'
              }}>
                Fearless Investing.
              </span>
            </h1>
            
            <p style={{ 
              fontSize: '1.2rem', 
              color: '#94a3b8', 
              lineHeight: 1.7, 
              marginBottom: '45px', 
              maxWidth: '550px' 
            }}>
              Join the elite circle of investors using institutional-grade data and AI to navigate global markets with confidence.
            </p>
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <Link to="/sectors" className="primary-btn" style={{
                padding: '20px 40px',
                background: '#00d2ff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '16px',
                fontSize: '1.1rem',
                fontWeight: '800',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 30px rgba(0, 210, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                Start Exploring <span>→</span>
              </Link>
              <Link to="/signup" className="secondary-btn" style={{
                padding: '20px 40px',
                background: 'rgba(255,255,255,0.03)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '16px',
                fontSize: '1.1rem',
                fontWeight: '800',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease'
              }}>
                Watch Demo
              </Link>
            </div>
          </div>

          {/* Right Visual Area - Creative Layout */}
          <div className="hero-visual" style={{ 
            position: 'relative', 
            animation: 'fadeInRight 1s ease-out', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px',
            justifyContent: 'center',
            maxWidth: '550px',
            margin: '0 auto',
            width: '100%'
          }}>
            {/* Top Row: Stock & Gainers */}
            <div className="hero-cards-row" style={{ display: 'flex', gap: '20px', width: '100%' }}>
              {/* Card 1: Dynamic Stock Rotation */}
              <div className="floating-card" style={{
                flex: 1,
                padding: '25px',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(25px)',
                borderRadius: '32px',
                border: '1px solid rgba(255,255,255,0.1)',
                zIndex: 3,
                animation: 'float 6s ease-in-out infinite',
                boxSizing: 'border-box'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <div style={{ width: '45px', height: '45px', background: '#fff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '1.3rem' }}>
                    {stock.icon}
                  </div>
                  <div style={{ color: stock.change.includes('+') ? '#4ade80' : '#f87171', fontWeight: '900', fontSize: '1.1rem' }}>
                    {stock.change}
                  </div>
                </div>
                <div style={{ fontSize: '0.95rem', color: '#94a3b8', fontWeight: '700' }}>{stock.symbol}</div>
                <div style={{ fontSize: '2rem', fontWeight: '900', margin: '8px 0', letterSpacing: '-0.02em' }}>${stock.price}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>{stock.name}</div>
              </div>

              {/* Card 2: Top Gainers */}
              <div className="floating-card" style={{
                flex: 1,
                padding: '25px',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(25px)',
                borderRadius: '32px',
                border: '1px solid rgba(74, 222, 128, 0.2)',
                zIndex: 4,
                animation: 'float 6s ease-in-out infinite',
                boxSizing: 'border-box'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: '800', letterSpacing: '0.1em' }}>TOP GAINERS</div>
                  <div style={{ width: '10px', height: '10px', background: '#4ade80', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {topGainers.length > 0 ? topGainers.slice(0, 3).map((gainer, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'white' }}>{gainer.symbol}</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#4ade80' }}>+{gainer.change_pct}%</span>
                    </div>
                  )) : [1,2,3].map(i => (
                    <div key={i} style={{ height: '22px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', animation: 'pulse 2s infinite' }}></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row: Latest News (Spans Full Width) */}
            <div className="floating-card" style={{
              width: '100%',
              padding: '25px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(25px)',
              borderRadius: '32px',
              border: '1px solid rgba(0, 210, 255, 0.2)',
              zIndex: 2,
              animation: 'float 6s ease-in-out infinite',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{ fontSize: '0.85rem', color: '#00d2ff', fontWeight: '800', letterSpacing: '0.15em' }}>MARKET INSIGHT</div>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(0,210,255,0.3), transparent)' }}></div>
              </div>
              
              {currentNews ? (
                <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                  <h4 style={{ 
                    fontSize: '1.1rem', 
                    color: '#f8fafc', 
                    lineHeight: '1.5', 
                    fontWeight: '800', 
                    marginBottom: '15px',
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    letterSpacing: '-0.01em'
                  }}>
                    {currentNews.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      color: '#00d2ff', 
                      fontWeight: '900', 
                      textTransform: 'uppercase', 
                      background: 'rgba(0, 210, 255, 0.15)',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      letterSpacing: '0.05em'
                    }}>
                      {currentNews.publisher}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                      {new Date(currentNews.provider_publish_time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', animation: 'pulse 2s infinite' }}></div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          opacity: 0.3
        }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.2em' }}>SCROLL</span>
          <div style={{ width: '18px', height: '30px', border: '2px solid white', borderRadius: '20px', position: 'relative' }}>
            <div style={{ width: '3px', height: '6px', background: 'white', position: 'absolute', left: '50%', top: '5px', transform: 'translateX(-50%)', borderRadius: '2px', animation: 'mouseScroll 2s infinite' }}></div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '20px' }}>Why Choose <span style={{ color: '#00d2ff' }}>StockWhiz?</span></h2>
          <p style={{ fontSize: '1.2rem', color: '#718096', maxWidth: '700px', margin: '0 auto' }}>
            We combine institutional-grade data with an intuitive interface to help you make better investment decisions.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '40px' 
        }}>
          {[
            {
              title: "Sector Analysis",
              desc: "Deep dive into specific industries. Compare performance across IT, Banking, Auto, and more.",
              img: "https://images.pexels.com/photos/6770610/pexels-photo-6770610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
              icon: "📊"
            },
            {
              title: "Opportunity Tracking",
              desc: "Our algorithm automatically flags 'Strong Buy' opportunities when stocks trade at deep discounts.",
              img: "https://images.pexels.com/photos/6771107/pexels-photo-6771107.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
              icon: "🎯"
            },
            {
              title: "Personalized Portfolio",
              desc: "Manage your own curated list of stocks. Track real-time prices and performance metrics.",
              img: "https://images.pexels.com/photos/6771574/pexels-photo-6771574.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
              icon: "💼"
            }
          ].map((feature, idx) => (
            <div key={idx} style={{
              background: 'white',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              transition: 'transform 0.3s ease',
              border: '1px solid #edf2f7'
            }}>
              <div style={{ height: '200px', overflow: 'hidden' }}>
                <img src={feature.img} alt={feature.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '30px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '15px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>{feature.title}</h3>
                <p style={{ color: '#4a5568', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Market Insight Section (Alternating Content) */}
      <section style={{ backgroundColor: '#edf2f7', padding: '100px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 500px' }}>
            <img 
              src="https://images.pexels.com/photos/5900165/pexels-photo-5900165.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
              alt="Financial Analytics" 
              style={{ width: '100%', borderRadius: '30px', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)' }}
            />
          </div>
          <div style={{ flex: '1 1 400px' }}>
            <span style={{ color: '#00d2ff', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Data Driven</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginTop: '10px', marginBottom: '25px', lineHeight: 1.2 }}>
              Master the Markets with Professional Analytics
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#4a5568', lineHeight: 1.8, marginBottom: '30px' }}>
              StockWhiz doesn't just show prices. We analyze the 52-week high, PE ratios, and market caps to calculate the precise "Opportunity Level" for every stock. Whether you are a value investor or a growth seeker, our platform adapts to your needs.
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {['Real-time Price Tracking', 'Sector Performance Heatmaps', 'Custom Opportunity Algorithms'].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', fontWeight: '600' }}>
                  <span style={{ color: '#00d2ff', marginRight: '10px', fontSize: '1.2rem' }}>✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Elite Market Leaders Section */}
      <section style={{ padding: '100px 20px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a' }}>Elite <span style={{ color: '#00d2ff' }}>Market Leaders</span></h2>
              <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '10px' }}>Top performing stocks across global indices.</p>
            </div>
            <Link to="/sectors" style={{ padding: '12px 25px', borderRadius: '12px', background: '#f1f5f9', color: '#0f172a', textDecoration: 'none', fontWeight: '700', transition: 'all 0.3s ease' }}>View All Markets</Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ textAlign: 'left', padding: '20px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Company</th>
                  <th style={{ textAlign: 'right', padding: '20px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Price</th>
                  <th style={{ textAlign: 'right', padding: '20px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>24h Change</th>
                  <th style={{ textAlign: 'right', padding: '20px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Market Cap</th>
                  <th style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'NVIDIA Corp', sym: 'NVDA', price: '875.28', change: '+4.21%', cap: '2.19T', icon: '🟢' },
                  { name: 'Microsoft', sym: 'MSFT', price: '415.50', change: '+0.85%', cap: '3.09T', icon: '🔵' },
                  { name: 'Apple Inc', sym: 'AAPL', price: '192.42', change: '+2.45%', cap: '2.97T', icon: '🍎' },
                  { name: 'Tesla Inc', sym: 'TSLA', price: '175.34', change: '-1.12%', cap: '558B', icon: '⚡' },
                  { name: 'Reliance Ind', sym: 'RELIANCE', price: '2,982.00', change: '+2.10%', cap: '20.1T', icon: '💎' }
                ].map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.3s ease' }} className="table-row-hover">
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                        <div>
                          <div style={{ fontWeight: '800', color: '#0f172a' }}>{s.sym}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>${s.price}</td>
                    <td style={{ padding: '20px', textAlign: 'right', fontWeight: '800', color: s.change.includes('+') ? '#4ade80' : '#f87171' }}>{s.change}</td>
                    <td style={{ padding: '20px', textAlign: 'right', color: '#64748b', fontWeight: '600' }}>{s.cap}</td>
                    <td style={{ padding: '20px', textAlign: 'center' }}>
                      <Link to={`/stock/${s.sym}`} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(0, 210, 255, 0.1)', color: '#00d2ff', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem' }}>Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How It Works - Step by Step */}
      <section style={{ padding: '100px 20px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a' }}>Master the Market in <span style={{ color: '#00d2ff' }}>3 Steps</span></h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px' }}>
            {[
              { step: '01', title: 'Connect & Track', desc: 'Create your personalized portfolio and track real-time price movements across global sectors.' },
              { step: '02', title: 'AI Analysis', desc: 'Use our K-Means clustering and PE ratio tools to understand risk and identify value opportunities.' },
              { step: '03', title: 'Execute with Confidence', desc: 'Make data-driven decisions backed by institutional-grade intelligence and real-time news.' }
            ].map((item, i) => (
              <div key={i} style={{ position: 'relative', padding: '40px', background: 'white', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{ position: 'absolute', top: '-20px', left: '40px', fontSize: '4rem', fontWeight: '900', color: 'rgba(0, 210, 255, 0.1)', zIndex: 0 }}>{item.step}</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '15px' }}>{item.title}</h3>
                  <p style={{ color: '#64748b', lineHeight: '1.7', fontSize: '1.05rem' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section style={{ 
        padding: '120px 20px', 
        textAlign: 'center',
        background: 'url("https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="cta-box" style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: '80px 40px', 
          background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.9) 0%, rgba(58, 123, 213, 0.9) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '40px',
          color: 'white',
          boxShadow: '0 20px 40px rgba(0, 210, 255, 0.3)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '20px' }}>Ready to Invest Smarter?</h2>
          <p style={{ fontSize: '1.3rem', marginBottom: '40px', opacity: 0.9 }}>
            Join thousands of users who are already using StockWhiz to dominate the market.
          </p>
          <Link to="/signup" style={{
            display: 'inline-block',
            padding: '20px 60px',
            background: 'white',
            color: '#3a7bd5',
            textDecoration: 'none',
            borderRadius: '50px',
            fontSize: '1.3rem',
            fontWeight: '900',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease'
          }}>
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 20px', borderTop: '1px solid #edf2f7', textAlign: 'center', color: '#718096' }}>
        <p style={{ fontWeight: '700', fontSize: '1.2rem', marginBottom: '10px', color: '#1a202c' }}>
          Stock<span style={{ color: '#00d2ff' }}>Whiz</span>
        </p>
        <p>© 2026 StockWhiz Intelligence. All rights reserved.</p>
        <div style={{ marginTop: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <a href="#" style={{ color: '#718096', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#718096', textDecoration: 'none' }}>Terms of Service</a>
          <a href="#" style={{ color: '#718096', textDecoration: 'none' }}>Contact Us</a>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          from { transform: scale(1); opacity: 0.15; }
          to { transform: scale(1.2); opacity: 0.25; }
        }
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes gridMove {
          0% { transform: rotateX(60deg) translateY(0); }
          100% { transform: rotateX(60deg) translateY(60px); }
        }
        @keyframes pulseScale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
        .dash-line {
          stroke-dasharray: 10;
          stroke-dashoffset: 100;
          animation: dash 20s linear infinite;
        }
        .primary-btn:hover {
          transform: translateY(-5px) scale(1.05) !important;
          box-shadow: 0 20px 40px rgba(0, 210, 255, 0.5) !important;
        }
        .secondary-btn:hover {
          background: rgba(255,255,255,0.1) !important;
          transform: translateY(-5px) !important;
          border-color: #00d2ff !important;
        }
        .floating-card:hover {
          transform: scale(1.05) !important;
          z-index: 10 !important;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5) !important;
          border-color: rgba(0, 210, 255, 0.4) !important;
          transition: all 0.4s ease !important;
        }
        .gainer-item:hover, .news-item:hover, .stock-pick:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 210, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 210, 255, 0.4);
        }
      `}} />
    </div>
  );
};

export default Home;
