/**
 * Performance Optimization Utilities
 * 
 * This module provides utilities for optimizing component performance,
 * bundle size, and runtime efficiency.
 */

import { useCallback, useMemo, useRef, useEffect } from 'react';

// Debounce utility for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate?: boolean
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };

        const callNow = immediate && !timeout;

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) func(...args);
    };
};

// Throttle utility for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Memoization utility with size limit
export const memoizeWithLimit = <T extends (...args: any[]) => any>(
    fn: T,
    limit: number = 100
): T => {
    const cache = new Map();

    return ((...args: Parameters<T>): ReturnType<T> => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn(...args);

        // Implement LRU cache
        if (cache.size >= limit) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }

        cache.set(key, result);
        return result;
    }) as T;
};

// Lazy loading utilities
export const lazyLoadImage = (
    img: HTMLImageElement,
    src: string,
    placeholder?: string
): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Set placeholder if provided
        if (placeholder) {
            img.src = placeholder;
        }

        // Create new image to preload
        const imageLoader = new Image();

        imageLoader.onload = () => {
            img.src = src;
            img.classList.add('loaded');
            resolve();
        };

        imageLoader.onerror = reject;
        imageLoader.src = src;
    });
};

// Intersection Observer for lazy loading
export const createLazyLoader = (
    callback: (entry: IntersectionObserverEntry) => void,
    options: IntersectionObserverInit = {}
): IntersectionObserver | null => {
    if (typeof IntersectionObserver === 'undefined') {
        return null;
    }

    const defaultOptions: IntersectionObserverInit = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
        ...options
    };

    return new IntersectionObserver((entries) => {
        entries.forEach(callback);
    }, defaultOptions);
};

// Performance monitoring utilities
export const performanceMonitor = {
    // Measure function execution time
    measureFunction: <T extends (...args: any[]) => any>(
        fn: T,
        name?: string
    ): T => {
        return ((...args: Parameters<T>): ReturnType<T> => {
            const startTime = performance.now();
            const result = fn(...args);
            const endTime = performance.now();

            console.log(`${name || fn.name} took ${endTime - startTime} milliseconds`);
            return result;
        }) as T;
    },

    // Measure component render time
    measureRender: (componentName: string) => {
        const startTime = performance.now();

        return () => {
            const endTime = performance.now();
            console.log(`${componentName} render took ${endTime - startTime} milliseconds`);
        };
    },

    // Track memory usage
    trackMemory: (label: string) => {
        if ('memory' in performance) {
            const memory = (performance as any).memory;
            console.log(`${label} - Memory usage:`, {
                used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
                total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
                limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
            });
        }
    }
};

// Bundle size optimization utilities
export const bundleOptimization = {
    // Dynamic import with error handling
    dynamicImport: async <T>(
        importFn: () => Promise<T>,
        fallback?: T
    ): Promise<T> => {
        try {
            return await importFn();
        } catch (error) {
            console.error('Dynamic import failed:', error);
            if (fallback) {
                return fallback;
            }
            throw error;
        }
    },

    // Preload critical resources
    preloadResource: (href: string, as: string, type?: string): void => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        if (type) link.type = type;
        document.head.appendChild(link);
    },

    // Prefetch non-critical resources
    prefetchResource: (href: string): void => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
    }
};

// React performance hooks
export const usePerformanceOptimization = () => {
    // Debounced callback hook
    const useDebouncedCallback = <T extends (...args: any[]) => any>(
        callback: T,
        delay: number,
        deps: React.DependencyList
    ) => {
        const debouncedFn = useMemo(
            () => debounce(callback, delay),
            [callback, delay, ...deps]
        );

        return debouncedFn;
    };

    // Throttled callback hook
    const useThrottledCallback = <T extends (...args: any[]) => any>(
        callback: T,
        delay: number,
        deps: React.DependencyList
    ) => {
        const throttledFn = useMemo(
            () => throttle(callback, delay),
            [callback, delay, ...deps]
        );

        return throttledFn;
    };

    // Memoized expensive calculation
    const useExpensiveCalculation = <T>(
        calculation: () => T,
        deps: React.DependencyList
    ): T => {
        return useMemo(calculation, deps);
    };

    // Stable callback reference
    const useStableCallback = <T extends (...args: any[]) => any>(
        callback: T
    ): T => {
        const callbackRef = useRef(callback);
        callbackRef.current = callback;

        return useCallback(
            ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
            []
        );
    };

    return {
        useDebouncedCallback,
        useThrottledCallback,
        useExpensiveCalculation,
        useStableCallback
    };
};

// Virtual scrolling utilities
export const virtualScrolling = {
    // Calculate visible items for virtual scrolling
    calculateVisibleItems: (
        scrollTop: number,
        containerHeight: number,
        itemHeight: number,
        totalItems: number,
        overscan: number = 5
    ) => {
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        const endIndex = Math.min(
            totalItems - 1,
            Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
        );

        return { startIndex, endIndex };
    },

    // Create virtual scroll container
    createVirtualScrollContainer: (
        itemHeight: number,
        totalItems: number
    ) => {
        const totalHeight = itemHeight * totalItems;

        return {
            totalHeight,
            getItemStyle: (index: number) => ({
                position: 'absolute' as const,
                top: index * itemHeight,
                height: itemHeight,
                width: '100%'
            })
        };
    }
};

// Image optimization utilities
export const imageOptimization = {
    // Generate responsive image srcSet
    generateSrcSet: (
        baseSrc: string,
        sizes: number[] = [320, 640, 768, 1024, 1280, 1920]
    ): string => {
        return sizes
            .map(size => {
                const src = baseSrc.replace(/\.(jpg|jpeg|png|webp)$/i, `_${size}w.$1`);
                return `${src} ${size}w`;
            })
            .join(', ');
    },

    // Lazy load images with intersection observer
    lazyLoadImages: (selector: string = 'img[data-src]'): void => {
        const images = document.querySelectorAll(selector);

        const imageObserver = createLazyLoader((entry) => {
            if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                const src = img.dataset.src;

                if (src) {
                    lazyLoadImage(img, src)
                        .then(() => {
                            img.classList.add('loaded');
                            imageObserver?.unobserve(img);
                        })
                        .catch(console.error);
                }
            }
        });

        if (imageObserver) {
            images.forEach(img => imageObserver.observe(img));
        }
    }
};

// CSS optimization utilities
export const cssOptimization = {
    // Remove unused CSS classes (development helper)
    findUnusedClasses: (cssText: string): string[] => {
        const classRegex = /\.([a-zA-Z0-9_-]+)/g;
        const classes = [];
        let match;

        while ((match = classRegex.exec(cssText)) !== null) {
            classes.push(match[1]);
        }

        return classes.filter(className => {
            return !document.querySelector(`.${className}`);
        });
    },

    // Critical CSS extraction (simplified)
    extractCriticalCSS: (selectors: string[]): string => {
        const criticalRules: string[] = [];

        Array.from(document.styleSheets).forEach(sheet => {
            try {
                Array.from(sheet.cssRules).forEach(rule => {
                    if (rule instanceof CSSStyleRule) {
                        const selector = rule.selectorText;
                        if (selectors.some(s => selector.includes(s))) {
                            criticalRules.push(rule.cssText);
                        }
                    }
                });
            } catch (e) {
                // Handle cross-origin stylesheets
                console.warn('Cannot access stylesheet:', e);
            }
        });

        return criticalRules.join('\n');
    }
};

// Export performance metrics
export const getPerformanceMetrics = () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    return {
        // Core Web Vitals approximation
        fcp: navigation.responseStart - navigation.fetchStart, // First Contentful Paint approximation
        lcp: navigation.loadEventEnd - navigation.fetchStart, // Largest Contentful Paint approximation
        cls: 0, // Cumulative Layout Shift (would need separate measurement)
        fid: 0, // First Input Delay (would need separate measurement)

        // Other metrics
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,

        // Memory (if available)
        memory: 'memory' in performance ? (performance as any).memory : null
    };
};