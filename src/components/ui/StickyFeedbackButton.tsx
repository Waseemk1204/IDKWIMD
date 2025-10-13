import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Mail, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from './Button';
import { createPortal } from 'react-dom';

interface StickyFeedbackButtonProps {
  className?: string;
}

export const StickyFeedbackButton: React.FC<StickyFeedbackButtonProps> = ({ className = '' }) => {
  console.log('StickyFeedbackButton rendering...');
  
  // Try direct DOM manipulation as a last resort
  useEffect(() => {
    console.log('Creating button via direct DOM manipulation...');
    
    const buttonDiv = document.createElement('div');
    buttonDiv.innerHTML = `
      <div style="
        position: fixed !important;
        top: 50px !important;
        right: 50px !important;
        z-index: 999999 !important;
        background-color: yellow !important;
        padding: 30px !important;
        border: 10px solid red !important;
        font-size: 24px !important;
        font-weight: bold !important;
        width: 400px !important;
        height: 300px !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      ">
        <div>FEEDBACK BUTTON TEST - DOM MANIPULATION</div>
        <button onclick="console.log('DOM BUTTON CLICKED!')" style="
          background-color: red !important;
          color: white !important;
          padding: 15px 30px !important;
          font-size: 18px !important;
          border: none !important;
          cursor: pointer !important;
          margin-top: 20px !important;
          display: block !important;
        ">
          CLICK ME - DOM VERSION
        </button>
      </div>
    `;
    
    document.body.appendChild(buttonDiv);
    
    return () => {
      if (document.body.contains(buttonDiv)) {
        document.body.removeChild(buttonDiv);
      }
    };
  }, []);
  
  // Also try the portal approach
  const buttonElement = (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        backgroundColor: 'yellow',
        padding: '20px',
        border: '5px solid red',
        fontSize: '20px',
        fontWeight: 'bold',
        width: '300px',
        height: '200px'
      }}
    >
      <div>FEEDBACK BUTTON TEST - PORTAL</div>
      <button
        onClick={() => console.log('PORTAL BUTTON CLICKED!')}
        style={{
          backgroundColor: 'red',
          color: 'white',
          padding: '10px 20px',
          fontSize: '16px',
          border: 'none',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        CLICK ME - PORTAL
      </button>
    </div>
  );

  return createPortal(buttonElement, document.body);
};
