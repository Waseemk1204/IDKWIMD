import React from 'react';

// Ultra-minimal test component with no external dependencies
const UltraMinimalTest: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f0f0', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px', color: '#333' }}>
          🎉 SUCCESS! 🎉
        </h1>
        <p style={{ fontSize: '24px', color: '#666' }}>
          The site is working!
        </p>
        <p style={{ fontSize: '16px', color: '#888', marginTop: '20px' }}>
          This is an ultra-minimal test component with no external dependencies.
        </p>
      </div>
    </div>
  );
};

export default UltraMinimalTest;
