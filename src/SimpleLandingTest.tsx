import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Simplified Landing component without complex imports
const SimpleLanding: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px' 
      }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '20px 0',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
            Part-Time Pays
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a href="/login" style={{ 
              padding: '8px 16px', 
              textDecoration: 'none', 
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '6px'
            }}>
              Login
            </a>
            <a href="/signup" style={{ 
              padding: '8px 16px', 
              textDecoration: 'none', 
              color: 'white',
              backgroundColor: '#3b82f6',
              borderRadius: '6px'
            }}>
              Sign Up
            </a>
          </div>
        </header>
        
        <main style={{ padding: '60px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ 
              fontSize: '48px', 
              fontWeight: 'bold', 
              color: '#1e293b',
              marginBottom: '20px'
            }}>
              Find Your Perfect Part-Time Job
            </h2>
            <p style={{ 
              fontSize: '20px', 
              color: '#64748b',
              marginBottom: '40px'
            }}>
              Connect with employers and discover flexible work opportunities
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <a href="/signup" style={{ 
                padding: '12px 24px', 
                backgroundColor: '#3b82f6',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500'
              }}>
                Get Started
              </a>
              <a href="/login" style={{ 
                padding: '12px 24px', 
                backgroundColor: 'transparent',
                color: '#3b82f6',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                border: '1px solid #3b82f6'
              }}>
                Sign In
              </a>
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '30px',
            marginTop: '60px'
          }}>
            <div style={{ 
              padding: '30px', 
              backgroundColor: 'white', 
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
                For Job Seekers
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Find flexible part-time opportunities that fit your schedule and skills.
              </p>
            </div>
            
            <div style={{ 
              padding: '30px', 
              backgroundColor: 'white', 
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
                For Employers
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Post jobs and find talented part-time workers for your business.
              </p>
            </div>
          </div>
        </main>
        
        <footer style={{ 
          marginTop: '80px', 
          padding: '40px 0', 
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <p>&copy; 2024 Part-Time Pays. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export function SimpleLandingTest() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SimpleLanding />} />
        <Route path="*" element={<SimpleLanding />} />
      </Routes>
    </BrowserRouter>
  );
}
