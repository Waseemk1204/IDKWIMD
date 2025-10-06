import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Simple test component
const SimpleTest: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#e8f4fd', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px', color: '#1e40af' }}>
          🚀 React Router Test 🚀
        </h1>
        <p style={{ fontSize: '24px', color: '#1e3a8a' }}>
          React Router is working!
        </p>
        <p style={{ fontSize: '16px', color: '#64748b', marginTop: '20px' }}>
          This component uses React Router successfully.
        </p>
      </div>
    </div>
  );
};

export function SimpleRouterTest() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SimpleTest />} />
        <Route path="*" element={<SimpleTest />} />
      </Routes>
    </BrowserRouter>
  );
}
