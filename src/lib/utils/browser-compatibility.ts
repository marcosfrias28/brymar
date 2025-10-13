/**
 * Browser Compatibility Utilities
 * 
 * This module provides utilities for detecting browser capabilities,
 * handling cross-browser compatibility, and providing fallbacks.
 */

// Browser detection utilities
export const browserDetection = {
    // User agent based detection (for fallbacks only)
    getUserAgent: (): string => {
        return typeof navigator !== 'undefined' ? navigator.userAgent : '';
    },

    // Feature detection (preferred method)
    supports: {
        // CSS features
        cssGrid: (): boolean => {
            return typeof CSS !== 'undefined' && CSS.supports && CSS.supports('display', 'grid');
        },

        cssFlexbox: (): boolean => {
            return typeof CSS !== 'undefined' && CSS.supports && CSS.supports('display', 'flex');
        },

        cssCustomProperties: (): boolean => {
            return typeof CSS !== 'undefined' && CSS.supports && CSS.supports('--custom-property', 'value');
        },

        cssContainerQueries: (): boolean => {
            return typeof CSS !== 'undefined' && CSS.supports && CSS.supports('container-type', 'inline-size');
        },

        // JavaScript features
        intersectionObserver: (): boolean => {
            return typeof IntersectionObserver !== 'undefined';
        },

        resizeObserver: (): boolean => {
            return typeof ResizeObserver !== 'undefined';
        },

        webAnimations: (): boolean => {
            return typeof Element !== 'undefined' && 'animate' in Element.prototype;
        },

        // Modern JavaScript features
        es6Modules: (): boolean => {
            try {
                return typeof eval('import') === 'function';
            } catch {
                return false;
            }
        },

        asyncAwait: (): boolean => {
            try {
                return (async () => { })().constructor === (async () => { }).constructor;
            } catch {
                return false;
            }
        },

        // Web APIs
        localStorage: (): boolean => {
            try {
                return typeof Storage !== 'undefined' && 'localStorage' in window;
            } catch {
                return false;
            }
        },

        sessionStorage: (): boolean => {
            try {
                return typeof Storage !== 'undefined' && 'sessionStorage' in window;
            } catch {
                return false;
            }
        },

        // Touch and pointer events
        touchEvents: (): boolean => {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        },

        pointerEvents: (): boolean => {
            return 'onpointerdown' in window;
        },

        // Media queries
        prefersReducedMotion: (): boolean => {
            return typeof window !== 'undefined' &&
                window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        },

        prefersColorScheme: (): boolean => {
            return typeof window !== 'undefined' &&
                window.matchMedia &&
                (window.matchMedia('(prefers-color-scheme: dark)').matches ||
                    window.matchMedia('(prefers-color-scheme: light)').matches);
        }
    }
};

// Polyfill utilities
export const polyfills = {
    // IntersectionObserver polyfill check
    needsIntersectionObserver: (): boolean => {
        return !browserDetection.supports.intersectionObserver();
    },

    // ResizeObserver polyfill check
    needsResizeObserver: (): boolean => {
        return !browserDetection.supports.resizeObserver();
    },

    // CSS custom properties fallback
    applyCSSCustomPropertiesFallback: (element: HTMLElement, properties: Record<string, string>): void => {
        if (!browserDetection.supports.cssCustomProperties()) {
            Object.entries(properties).forEach(([property, value]) => {
                // Apply fallback values directly to style
                const cssProperty = property.replace(/^--/, '');
                (element.style as any)[cssProperty] = value;
            });
        }
    }
};

// Performance optimization based on browser capabilities
export const performanceOptimizations = {
    // Use passive event listeners when supported
    getEventListenerOptions: (passive: boolean = true): boolean | AddEventListenerOptions => {
        try {
            const opts = Object.defineProperty({}, 'passive', {
                get: function () {
                    return true;
                }
            });
            window.addEventListener('testPassive', () => { }, opts);
            window.removeEventListener('testPassive', () => { }, opts);
            return { passive };
        } catch {
            return false;
        }
    },

    // Use requestIdleCallback when available
    scheduleWork: (callback: () => void, timeout: number = 5000): void => {
        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(callback, { timeout });
        } else {
            setTimeout(callback, 0);
        }
    },

    // Use requestAnimationFrame for smooth animations
    scheduleAnimation: (callback: () => void): number => {
        if ('requestAnimationFrame' in window) {
            return requestAnimationFrame(callback);
        } else {
            return setTimeout(callback, 16) as any; // ~60fps fallback
        }
    }
};

// CSS compatibility utilities
export const cssCompatibility = {
    // Generate vendor prefixes for CSS properties
    addVendorPrefixes: (property: string, value: string): Record<string, string> => {
        const prefixes = ['-webkit-', '-moz-', '-ms-', '-o-', ''];
        const result: Record<string, string> = {};

        prefixes.forEach(prefix => {
            result[`${prefix}${property}`] = value;
        });

        return result;
    },

    // Apply CSS with fallbacks
    applyWithFallback: (element: HTMLElement, styles: Record<string, string | string[]>): void => {
        Object.entries(styles).forEach(([property, value]) => {
            if (Array.isArray(value)) {
                // Apply multiple values for fallback
                value.forEach(val => {
                    (element.style as any)[property] = val;
                });
            } else {
                (element.style as any)[property] = value;
            }
        });
    },

    // Check if CSS property is supported
    isPropertySupported: (property: string, value?: string): boolean => {
        if (typeof CSS !== 'undefined' && CSS.supports) {
            return value ? CSS.supports(property, value) : CSS.supports(property);
        }

        // Fallback method
        const element = document.createElement('div');
        const camelCase = property.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
        return camelCase in element.style;
    }
};

// JavaScript compatibility utilities
export const jsCompatibility = {
    // Safe array methods with fallbacks
    safeArrayFrom: <T>(arrayLike: ArrayLike<T>): T[] => {
        if (Array.from) {
            return Array.from(arrayLike);
        }
        return Array.prototype.slice.call(arrayLike);
    },

    // Safe object methods
    safeObjectAssign: <T extends object>(target: T, ...sources: Partial<T>[]): T => {
        if (Object.assign) {
            return Object.assign(target, ...sources);
        }

        // Fallback implementation
        sources.forEach(source => {
            if (source) {
                Object.keys(source).forEach(key => {
                    (target as any)[key] = (source as any)[key];
                });
            }
        });

        return target;
    },

    // Safe Promise check
    hasPromiseSupport: (): boolean => {
        return typeof Promise !== 'undefined';
    }
};

// Browser-specific optimizations
export const browserOptimizations = {
    // Safari-specific fixes
    safari: {
        // Fix for Safari's handling of flexbox
        fixFlexboxGaps: (element: HTMLElement): void => {
            const userAgent = browserDetection.getUserAgent();
            if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
                element.style.display = 'flex';
                element.style.flexWrap = 'wrap';
                // Add margin-based gaps for older Safari versions
                const children = element.children;
                for (let i = 0; i < children.length; i++) {
                    (children[i] as HTMLElement).style.marginRight = '1rem';
                    (children[i] as HTMLElement).style.marginBottom = '1rem';
                }
            }
        }
    },

    // Internet Explorer specific fixes (if still needed)
    ie: {
        // Fix for IE's handling of CSS Grid
        fixCSSGrid: (element: HTMLElement): void => {
            if (!browserDetection.supports.cssGrid()) {
                // Fallback to flexbox layout
                element.style.display = 'flex';
                element.style.flexWrap = 'wrap';
            }
        }
    },

    // Firefox-specific optimizations
    firefox: {
        // Optimize scrolling performance
        optimizeScrolling: (element: HTMLElement): void => {
            const userAgent = browserDetection.getUserAgent();
            if (userAgent.includes('Firefox')) {
                element.style.scrollBehavior = 'smooth';
                element.style.willChange = 'scroll-position';
            }
        }
    }
};

// Comprehensive browser compatibility check
export const checkBrowserCompatibility = () => {
    const results = {
        score: 0,
        maxScore: 0,
        features: {} as Record<string, boolean>,
        recommendations: [] as string[]
    };

    // Check essential features
    const essentialFeatures = [
        'cssFlexbox',
        'cssCustomProperties',
        'localStorage',
        'touchEvents'
    ];

    const modernFeatures = [
        'cssGrid',
        'cssContainerQueries',
        'intersectionObserver',
        'resizeObserver',
        'webAnimations'
    ];

    // Test essential features
    essentialFeatures.forEach(feature => {
        const supported = (browserDetection.supports as any)[feature]();
        results.features[feature] = supported;
        results.maxScore += 2; // Essential features worth more
        if (supported) results.score += 2;
        else results.recommendations.push(`Consider polyfill for ${feature}`);
    });

    // Test modern features
    modernFeatures.forEach(feature => {
        const supported = (browserDetection.supports as any)[feature]();
        results.features[feature] = supported;
        results.maxScore += 1;
        if (supported) results.score += 1;
        else results.recommendations.push(`${feature} not supported - using fallback`);
    });

    // Calculate percentage
    results.score = Math.round((results.score / results.maxScore) * 100);

    return results;
};

// Export browser info for debugging
export const getBrowserInfo = () => {
    return {
        userAgent: browserDetection.getUserAgent(),
        features: Object.fromEntries(
            Object.entries(browserDetection.supports).map(([key, fn]) => [key, fn()])
        ),
        compatibility: checkBrowserCompatibility()
    };
};