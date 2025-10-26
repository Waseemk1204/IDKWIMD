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
    // Simple CSS-based approach to hide unwanted scroll-to-top elements from browser extensions
    const style = document.createElement('style');
    style.textContent = `
      /* Hide common scroll-to-top button patterns from browser extensions */
      [class*="scroll-to-top"],
      [class*="back-to-top"],
      [class*="scrolltop"],
      [id*="scroll-to-top"],
      [id*="back-to-top"],
      [id*="scrolltop"],
      [data-scroll-to-top],
      [data-back-to-top] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
            <AppRouter />
            <Toaster 
              position="top-right"
              closeButton
              richColors
              expand={false}
              duration={4000}
              toastOptions={{
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-text)',
                  border: '1px solid var(--toast-border)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
                className: 'toast-custom',
              }}
            />
            <SpeedInsights />
            <Analytics />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>;
}