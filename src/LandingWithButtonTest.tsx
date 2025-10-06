import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Button } from '../components/ui/Button';

// Landing component with basic Button import
const LandingWithButton: React.FC = () => {
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
            <Button variant="outline" size="sm">
              Login
            </Button>
            <Button variant="primary" size="sm">
              Sign Up
            </Button>
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
              <Button size="lg">
                Get Started
              </Button>
              <Button variant="outline" size="lg">
                Sign In
              </Button>
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

export function LandingWithButtonTest() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingWithButton />} />
        <Route path="*" element={<LandingWithButton />} />
      </Routes>
    </BrowserRouter>
  );
}
