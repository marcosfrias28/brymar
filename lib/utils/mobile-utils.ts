/**
 * Mobile utility functions for responsive design and touch interactions
 */

// Device detection utilities
export const isMobile = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
};

export const isTablet = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isDesktop = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
};

export const isTouchDevice = (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Viewport utilities
export const getViewportHeight = (): number => {
    if (typeof window === 'undefined') return 0;
    return window.innerHeight;
};

export const getViewportWidth = (): number => {
    if (typeof window === 'undefined') return 0;
    return window.innerWidth;
};

// Touch-friendly sizing
export const getTouchFriendlySize = (baseSize: number): number => {
    return isTouchDevice() ? Math.max(baseSize, 44) : baseSize; // 44px minimum for touch
};

// Keyboard handling for mobile
export const isVirtualKeyboardOpen = (): boolean => {
    if (typeof window === 'undefined') return false;

    // Detect if virtual keyboard is open by comparing viewport height
    const initialHeight = window.screen.height;
    const currentHeight = window.innerHeight;

    return currentHeight < initialHeight * 0.75;
};

// Safe area utilities for mobile devices
export const getSafeAreaInsets = () => {
    if (typeof window === 'undefined') {
        return { top: 0, right: 0, bottom: 0, left: 0 };
    }

    const style = getComputedStyle(document.documentElement);

    return {
        top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
        right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
        bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
    };
};

// Responsive breakpoints (matching Tailwind defaults)
export const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const getCurrentBreakpoint = (): Breakpoint => {
    if (typeof window === 'undefined') return 'sm';

    const width = window.innerWidth;

    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    return 'sm';
};

// Responsive grid columns
export const getResponsiveColumns = (
    mobile: number = 1,
    tablet: number = 2,
    desktop: number = 3
): number => {
    const breakpoint = getCurrentBreakpoint();

    if (breakpoint === 'sm') return mobile;
    if (breakpoint === 'md') return tablet;
    return desktop;
};

// Mobile-specific CSS classes
export const mobileClasses = {
    // Touch-friendly buttons
    touchButton: 'min-h-[44px] min-w-[44px] touch-manipulation',

    // Mobile-optimized text sizes
    mobileText: {
        xs: 'text-xs sm:text-sm',
        sm: 'text-sm sm:text-base',
        base: 'text-base sm:text-lg',
        lg: 'text-lg sm:text-xl',
        xl: 'text-xl sm:text-2xl',
    },

    // Mobile-optimized spacing
    mobileSpacing: {
        xs: 'space-y-2 sm:space-y-3',
        sm: 'space-y-3 sm:space-y-4',
        base: 'space-y-4 sm:space-y-6',
        lg: 'space-y-6 sm:space-y-8',
    },

    // Mobile-optimized padding
    mobilePadding: {
        xs: 'p-2 sm:p-3',
        sm: 'p-3 sm:p-4',
        base: 'p-4 sm:p-6',
        lg: 'p-6 sm:p-8',
    },

    // Mobile-optimized containers
    mobileContainer: 'px-4 sm:px-6 lg:px-8',

    // Mobile-friendly forms
    mobileForm: 'space-y-4 sm:space-y-6',
    mobileInput: 'min-h-[44px] text-base', // Prevents zoom on iOS

    // Mobile navigation
    mobileNav: 'fixed bottom-0 left-0 right-0 bg-background border-t z-50 safe-area-pb',

    // Mobile modal/dialog
    mobileModal: 'fixed inset-0 z-50 bg-background sm:relative sm:bg-transparent',

    // Mobile-optimized grids
    mobileGrid: {
        single: 'grid grid-cols-1',
        double: 'grid grid-cols-1 sm:grid-cols-2',
        triple: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        quad: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    },
} as const;

// Gesture utilities
export const gestureUtils = {
    // Prevent default touch behaviors
    preventScroll: (e: TouchEvent) => {
        e.preventDefault();
    },

    // Handle touch start for custom interactions
    handleTouchStart: (callback: (touch: Touch) => void) => {
        return (e: TouchEvent) => {
            if (e.touches.length === 1) {
                callback(e.touches[0]);
            }
        };
    },

    // Handle touch move for drag operations
    handleTouchMove: (callback: (touch: Touch) => void) => {
        return (e: TouchEvent) => {
            if (e.touches.length === 1) {
                e.preventDefault();
                callback(e.touches[0]);
            }
        };
    },

    // Handle touch end
    handleTouchEnd: (callback: () => void) => {
        return (e: TouchEvent) => {
            callback();
        };
    },
};

// Performance utilities for mobile
export const performanceUtils = {
    // Debounce for touch events
    debounce: <T extends (...args: any[]) => void>(
        func: T,
        wait: number
    ): ((...args: Parameters<T>) => void) => {
        let timeout: NodeJS.Timeout;
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    },

    // Throttle for scroll events
    throttle: <T extends (...args: any[]) => void>(
        func: T,
        limit: number
    ): ((...args: Parameters<T>) => void) => {
        let inThrottle: boolean;
        return (...args: Parameters<T>) => {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },

    // Request animation frame wrapper
    raf: (callback: () => void) => {
        if (typeof window !== 'undefined') {
            return window.requestAnimationFrame(callback);
        }
        return setTimeout(callback, 16); // Fallback for SSR
    },
};