import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Mail, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from './Button';

interface StickyFeedbackButtonProps {
  className?: string;
}

export const StickyFeedbackButton: React.FC<StickyFeedbackButtonProps> = ({ className = '' }) => {
  console.log('StickyFeedbackButton rendering...');
  
  return (
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
        fontWeight: 'bold'
      }}
    >
      <div>FEEDBACK BUTTON TEST</div>
      <button
        onClick={() => console.log('SIMPLE BUTTON CLICKED!')}
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
        CLICK ME
      </button>
    </div>
  );
};
