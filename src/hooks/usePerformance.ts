import React, { useEffect, useState, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
}

interface PerformanceOptions {
  enableMemoryTracking?: boolean;
  enableNetworkTracking?: boolean;
  enableRenderTracking?: boolean;
  sampleRate?: number; // 0-1, percentage of times to track
}

export const usePerformanceMonitor = (
  componentName: string,
  options: PerformanceOptions = {}
) => {
  const {
    enableMemoryTracking = true,
    enableNetworkTracking = true,
    enableRenderTracking = true,
    sampleRate = 0.1
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0
  });

  const [isTracking, setIsTracking] = useState(false);

  const startTracking = useCallback(() => {
    if (Math.random() > sampleRate) return; // Skip tracking based on sample rate
    
    setIsTracking(true);
    const startTime = performance.now();
    
    // Track memory usage if available
    if (enableMemoryTracking && 'memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
      }));
    }

    // Track network requests
    if (enableNetworkTracking) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const networkRequests = entries.filter(entry => 
          entry.entryType === 'fetch' || entry.entryType === 'xmlhttprequest'
        ).length;
        
        setMetrics(prev => ({
          ...prev,
          networkRequests: prev.networkRequests + networkRequests
        }));
      });

      observer.observe({ entryTypes: ['resource'] });

      return () => observer.disconnect();
    }

    return () => {
      const endTime = performance.now();
      setMetrics(prev => ({
        ...prev,
        loadTime: endTime - startTime
      }));
      setIsTracking(false);
    };
  }, [enableMemoryTracking, enableNetworkTracking, sampleRate]);

  const trackRender = useCallback((renderStartTime: number) => {
    if (!enableRenderTracking || !isTracking) return;
    
    const renderEndTime = performance.now();
    setMetrics(prev => ({
      ...prev,
      renderTime: renderEndTime - renderStartTime
    }));
  }, [enableRenderTracking, isTracking]);

  const logMetrics = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance metrics for ${componentName}:`, metrics);
    }
  }, [componentName, metrics]);

  return {
    metrics,
    startTracking,
    trackRender,
    logMetrics,
    isTracking
  };
};

// Hook for debouncing expensive operations
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for throttling function calls
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const [isThrottled, setIsThrottled] = useState(false);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (!isThrottled) {
        callback(...args);
        setIsThrottled(true);
        setTimeout(() => setIsThrottled(false), delay);
      }
    },
    [callback, delay, isThrottled]
  ) as T;

  return throttledCallback;
};

// Hook for memoizing expensive calculations
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

// Hook for optimizing re-renders
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = callback;
  }, deps);

  return useCallback((...args: Parameters<T>) => {
    return ref.current?.(...args);
  }, []) as T;
};

// Performance optimization utilities
export const performanceUtils = {
  // Batch DOM updates
  batchUpdates: (updates: (() => void)[]) => {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  },

  // Preload critical resources
  preloadResource: (url: string, type: 'image' | 'script' | 'style' | 'font') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    document.head.appendChild(link);
  },

  // Optimize images
  optimizeImage: (src: string, width?: number, height?: number, quality = 80) => {
    if (src.includes('unsplash.com')) {
      const params = new URLSearchParams();
      if (width) params.set('w', width.toString());
      if (height) params.set('h', height.toString());
      params.set('q', quality.toString());
      params.set('auto', 'format');
      return `${src}&${params.toString()}`;
    }
    return src;
  },

  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Get connection speed
  getConnectionSpeed: () => {
    const connection = (navigator as any).connection;
    if (connection) {
      return connection.effectiveType; // 'slow-2g', '2g', '3g', '4g'
    }
    return 'unknown';
  },

  // Adaptive loading based on connection
  shouldLoadHeavyContent: () => {
    const speed = performanceUtils.getConnectionSpeed();
    return speed === '4g' || speed === 'unknown';
  }
};

// Component for performance monitoring
interface PerformanceMonitorProps {
  componentName: string;
  children: React.ReactNode;
  options?: PerformanceOptions;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  componentName,
  children,
  options
}) => {
  const { startTracking, trackRender, logMetrics } = usePerformanceMonitor(
    componentName,
    options
  );

  useEffect(() => {
    const cleanup = startTracking();
    return cleanup;
  }, [startTracking]);

  useEffect(() => {
    logMetrics();
  }, [logMetrics]);

  const renderStartTime = performance.now();
  useEffect(() => {
    trackRender(renderStartTime);
  });

  return <>{children}</>;
};
