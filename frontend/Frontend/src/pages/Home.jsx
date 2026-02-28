import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      background: 'url("https://images.pexels.com/photos/6770610/pexels-photo-6770610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1") no-repeat center center/cover',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      position: 'relative'
    }}>
      {/* Overlay to ensure text readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1
      }}></div>

      <div style={{
        padding: '60px 40px',
        borderRadius: '24px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(15px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        maxWidth: '900px',
        position: 'relative',
        zIndex: 2
      }}>
        <h1 style={{ fontSize: '5rem', marginBottom: '15px', fontWeight: '900', letterSpacing: '-2px' }}>
          Stock<span style={{ color: '#00d2ff' }}>Whiz</span>
        </h1>
        <p style={{ fontSize: '1.4rem', marginBottom: '40px', opacity: 0.9, lineHeight: '1.6' }}>
          Unleash the power of data-driven investing. <br/>
          Smart analysis, real-time insights, and creative portfolio tracking.
        </p>
        
        <div style={{ display: 'flex', gap: '25px', justifyContent: 'center' }}>
          <Link to="/sectors" style={{
            padding: '15px 40px',
            background: '#00d2ff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '50px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(0, 210, 255, 0.4)',
            border: 'none'
          }}>
            Explore Markets
          </Link>
          <Link to="/signup" style={{
            padding: '15px 40px',
            background: 'white',
            color: '#0f2027',
            textDecoration: 'none',
            borderRadius: '50px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            border: 'none'
          }}>
            Join Now
          </Link>
        </div>

        <div style={{ 
          marginTop: '60px', 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '30px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '40px'
        }}>
          <div>
            <h4 style={{ color: '#00d2ff', margin: '0 0 5px 0' }}>AI-Powered</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>Smart classification of opportunities</p>
          </div>
          <div>
            <h4 style={{ color: '#00d2ff', margin: '0 0 5px 0' }}>Comprehensive</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>Coverage across all major sectors</p>
          </div>
          <div>
            <h4 style={{ color: '#00d2ff', margin: '0 0 5px 0' }}>Insightful</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>Visual tracking of market discounts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
