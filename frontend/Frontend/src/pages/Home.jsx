import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{
      fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
      color: '#1a202c',
      backgroundColor: '#f7fafc',
      overflowX: 'hidden'
    }}>
      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'white',
        padding: '0 20px'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          opacity: 0.35,
          zIndex: 0
        }}></div>

        <div style={{
          maxWidth: '1000px',
          zIndex: 1,
          padding: '60px 20px',
          borderRadius: '30px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', marginBottom: '20px', fontWeight: '900', letterSpacing: '-0.05em', lineHeight: 1 }}>
            Stock<span style={{ color: '#00d2ff', textShadow: '0 0 20px rgba(0, 210, 255, 0.5)' }}>Whiz</span>
          </h1>
          <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', marginBottom: '40px', opacity: 0.9, maxWidth: '700px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            The ultimate intelligence platform for data-driven investors. 
            Analyze sectors, track opportunities, and master your portfolio.
          </p>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/sectors" style={{
              padding: '18px 45px',
              background: '#00d2ff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '50px',
              fontSize: '1.2rem',
              fontWeight: '800',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              boxShadow: '0 10px 25px rgba(0, 210, 255, 0.4)',
            }}>
              Explore Markets
            </Link>
            <Link to="/signup" style={{
              padding: '18px 45px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '50px',
              fontSize: '1.2rem',
              fontWeight: '800',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'background 0.3s ease'
            }}>
              Get Started
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'bounce 2s infinite',
          fontSize: '2rem',
          opacity: 0.6
        }}>
          ↓
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

      {/* Testimonial / Stats Section */}
      <section style={{ 
        padding: '100px 20px', 
        textAlign: 'center', 
        background: 'linear-gradient(rgba(15, 32, 39, 0.9), rgba(15, 32, 39, 0.9)), url("https://images.pexels.com/photos/186461/pexels-photo-186461.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: 'white' 
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '60px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Trusted by Market Enthusiasts</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
            <div>
              <div style={{ fontSize: '3.5rem', fontWeight: '900', color: '#00d2ff' }}>500+</div>
              <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>Stocks Tracked</p>
            </div>
            <div>
              <div style={{ fontSize: '3.5rem', fontWeight: '900', color: '#00d2ff' }}>15+</div>
              <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>Market Sectors</p>
            </div>
            <div>
              <div style={{ fontSize: '3.5rem', fontWeight: '900', color: '#00d2ff' }}>24/7</div>
              <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>Insights</p>
            </div>
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
        <div style={{ 
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
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0) translateX(-50%);}
          40% {transform: translateY(-10px) translateX(-50%);}
          60% {transform: translateY(-5px) translateX(-50%);}
        }
        button:hover, a:hover {
          transform: translateY(-3px) scale(1.02);
        }
      `}} />
    </div>
  );
};

export default Home;
