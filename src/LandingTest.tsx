import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';

export function LandingTest() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}
