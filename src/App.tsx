import { AppRouter } from './AppRouter';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';

export function App() {
  useEffect(() => {
    // Remove any scroll-to-top arrows that might be added by browser extensions
    const removeScrollArrows = () => {
      // Target common selectors for scroll-to-top buttons
      const selectors = [
        '[class*="scroll-to-top"]',
        '[class*="back-to-top"]',
        '[class*="scrolltop"]',
        '[id*="scroll-to-top"]',
        '[id*="back-to-top"]',
        '[id*="scrolltop"]',
        '[data-scroll-to-top]',
        '[data-back-to-top]',
        '[aria-label*="scroll to top"]',
        '[aria-label*="back to top"]',
        '[title*="scroll to top"]',
        '[title*="back to top"]'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          element.remove();
        });
      });

      // Also remove any elements positioned near the top that look like arrows
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        
        // Check if element is positioned near the top and right side
        if (
          style.position === 'fixed' &&
          rect.top > 60 && rect.top < 150 && // Below navbar but not too far
          rect.right < 100 && rect.right > 10 && // On the right side
          (element.textContent?.includes('↑') || 
           element.innerHTML?.includes('↑') ||
           element.innerHTML?.includes('→') ||
           element.innerHTML?.includes('←') ||
           element.innerHTML?.includes('↓') ||
           (element.className && String(element.className).includes('arrow')) ||
           element.id?.includes('arrow') ||
           (element.className && String(element.className).includes('chevron')) ||
           element.id?.includes('chevron'))
        ) {
          element.remove();
        }
      });

      // Remove any SVG elements that look like arrows
      const svgElements = document.querySelectorAll('svg');
      svgElements.forEach(svg => {
        const rect = svg.getBoundingClientRect();
        const style = window.getComputedStyle(svg);
        
        // Check if SVG is positioned like an arrow and contains arrow-like paths
        if (
          (style.position === 'fixed' || style.position === 'absolute') &&
          rect.top > 60 && rect.top < 200 &&
          (rect.right < 100 || rect.left > window.innerWidth - 100) &&
          (svg.innerHTML.includes('path') && 
           (svg.innerHTML.includes('arrow') || 
            svg.innerHTML.includes('chevron') ||
            svg.innerHTML.includes('M10.293') || // Common arrow path
            svg.innerHTML.includes('M12 19l7-7'))) // Another common arrow path
        ) {
          svg.remove();
        }
      });

      // Remove any elements in the top-right area that might be arrows
      const topRightElements = document.querySelectorAll('*');
      topRightElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        
        // Check if element is in the top-right area and might be an arrow
        if (
          (style.position === 'fixed' || style.position === 'absolute') &&
          rect.top >= 0 && rect.top <= 120 && // Top area
          rect.right <= 100 && rect.right >= 0 && // Right side
          (element.textContent?.includes('→') || 
           element.textContent?.includes('↑') ||
           element.textContent?.includes('←') ||
           element.textContent?.includes('↓') ||
           element.innerHTML?.includes('→') ||
           element.innerHTML?.includes('↑') ||
           element.innerHTML?.includes('←') ||
           element.innerHTML?.includes('↓') ||
           (element.className && String(element.className).includes('arrow')) ||
           element.id?.includes('arrow') ||
           (element.className && String(element.className).includes('chevron')) ||
           element.id?.includes('chevron') ||
           element.tagName === 'SVG')
        ) {
          element.remove();
        }
      });

      // Remove any elements that appear on hover (like the one below Find Work button)
      const hoverElements = document.querySelectorAll('[class*="hover"]');
      hoverElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        
        // Check if element is positioned near buttons and contains arrow content
        if (
          (style.position === 'absolute' || style.position === 'fixed') &&
          rect.top > 200 && rect.top < 400 && // Below hero section
          (element.textContent?.includes('→') || 
           element.textContent?.includes('↑') ||
           element.innerHTML?.includes('→') ||
           element.innerHTML?.includes('↑') ||
           (element.className && String(element.className).includes('arrow')) ||
           element.id?.includes('arrow'))
        ) {
          element.remove();
        }
      });
    };

    // Run immediately and on DOM changes
    removeScrollArrows();
    
    // Set up a mutation observer to catch dynamically added elements
    const observer = new MutationObserver(removeScrollArrows);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id', 'style']
    });

    // Also run periodically to catch any missed elements
    const interval = setInterval(removeScrollArrows, 500); // More frequent checking

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
            <AppRouter />
            <Toaster position="top-right" />
            <SpeedInsights />
            <Analytics />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>;
}