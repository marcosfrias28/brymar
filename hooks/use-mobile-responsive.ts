/**
 * Hook for responsive design and mobile optimization
 */

import { useState, useEffect, useCallback } from 'react';
import {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    getCurrentBreakpoint,
    getViewportHeight,
    getViewportWidth,
    isVirtualKeyboardOpen,
    performanceUtils,
    type Breakpoint,
} from '@/lib/utils/mobile-utils';

interface ResponsiveState {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isTouchDevice: boolean;
    breakpoint: Breakpoint;
    viewportHeight: number;
    viewportWidth: number;
    isKeyboardOpen: boolean;
    orientation: 'portrait' | 'landscape';
}

interface UseResponsiveOptions {
    debounceMs?: number;
    trackKeyboard?: boolean;
    trackOrientation?: boolean;
}

export function useResponsive(options: UseResponsiveOptions = {}) {
    const {
        debounceMs = 150,
        trackKeyboard = true,
        trackOrientation = true,
    } = options;

    const [state, setState] = useState<ResponsiveState>(() => ({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        breakpoint: 'lg' as Breakpoint,
        viewportHeight: 0,
        viewportWidth: 0,
        isKeyboardOpen: false,
        orientation: 'landscape',
    }));

    const updateState = useCallback(() => {
        const newState: ResponsiveState = {
            isMobile: isMobile(),
            isTablet: isTablet(),
            isDesktop: isDesktop(),
            isTouchDevice: isTouchDevice(),
            breakpoint: getCurrentBreakpoint(),
            viewportHeight: getViewportHeight(),
            viewportWidth: getViewportWidth(),
            isKeyboardOpen: trackKeyboard ? isVirtualKeyboardOpen() : false,
            orientation:
                trackOrientation && typeof window !== 'undefined'
                    ? window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
                    : 'landscape',
        };

        setState(newState);
    }, [trackKeyboard, trackOrientation]);

    const debouncedUpdateState = useCallback(
        performanceUtils.debounce(updateState, debounceMs),
        [updateState, debounceMs]
    );

    useEffect(() => {
        // Initial state update
        updateState();

        // Add event listeners
        window.addEventListener('resize', debouncedUpdateState);

        if (trackOrientation) {
            window.addEventListener('orientationchange', debouncedUpdateState);
        }

        // Cleanup
        return () => {
            window.removeEventListener('resize', debouncedUpdateState);
            if (trackOrientation) {
                window.removeEventListener('orientationchange', debouncedUpdateState);
            }
        };
    }, [debouncedUpdateState, trackOrientation]);

    // Additional utility functions
    const getColumns = useCallback((mobile: number, tablet: number, desktop: number) => {
        if (state.isMobile) return mobile;
        if (state.isTablet) return tablet;
        return desktop;
    }, [state.isMobile, state.isTablet]);

    const getSpacing = useCallback((mobile: string, desktop: string) => {
        return state.isMobile ? mobile : desktop;
    }, [state.isMobile]);

    const isBreakpoint = useCallback((breakpoint: Breakpoint) => {
        return state.breakpoint === breakpoint;
    }, [state.breakpoint]);

    const isBreakpointUp = useCallback((breakpoint: Breakpoint) => {
        const breakpoints: Record<Breakpoint, number> = {
            sm: 0,
            md: 1,
            lg: 2,
            xl: 3,
            '2xl': 4,
        };

        return breakpoints[state.breakpoint] >= breakpoints[breakpoint];
    }, [state.breakpoint]);

    const isBreakpointDown = useCallback((breakpoint: Breakpoint) => {
        const breakpoints: Record<Breakpoint, number> = {
            sm: 0,
            md: 1,
            lg: 2,
            xl: 3,
            '2xl': 4,
        };

        return breakpoints[state.breakpoint] <= breakpoints[breakpoint];
    }, [state.breakpoint]);

    return {
        ...state,
        getColumns,
        getSpacing,
        isBreakpoint,
        isBreakpointUp,
        isBreakpointDown,
    };
}

// Hook for mobile-specific keyboard handling
export function useMobileKeyboard() {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        if (typeof window === 'undefined' || !isMobile()) return;

        let initialViewportHeight = window.visualViewport?.height || window.innerHeight;

        const handleViewportChange = () => {
            const currentHeight = window.visualViewport?.height || window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;

            const keyboardOpen = heightDifference > 150; // Threshold for keyboard detection

            setIsKeyboardOpen(keyboardOpen);
            setKeyboardHeight(keyboardOpen ? heightDifference : 0);
        };

        // Use visual viewport API if available (better for mobile)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportChange);
            return () => {
                window.visualViewport?.removeEventListener('resize', handleViewportChange);
            };
        } else {
            // Fallback to window resize
            window.addEventListener('resize', handleViewportChange);
            return () => {
                window.removeEventListener('resize', handleViewportChange);
            };
        }
    }, []);

    return {
        isKeyboardOpen,
        keyboardHeight,
    };
}

// Hook for touch gestures
export function useTouchGestures() {
    const [touchState, setTouchState] = useState({
        isPressed: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        deltaX: 0,
        deltaY: 0,
    });

    const handleTouchStart = useCallback((e: TouchEvent) => {
        const touch = e.touches[0];
        setTouchState({
            isPressed: true,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY,
            deltaX: 0,
            deltaY: 0,
        });
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!touchState.isPressed) return;

        const touch = e.touches[0];
        setTouchState(prev => ({
            ...prev,
            currentX: touch.clientX,
            currentY: touch.clientY,
            deltaX: touch.clientX - prev.startX,
            deltaY: touch.clientY - prev.startY,
        }));
    }, [touchState.isPressed]);

    const handleTouchEnd = useCallback(() => {
        setTouchState(prev => ({
            ...prev,
            isPressed: false,
        }));
    }, []);

    return {
        touchState,
        handlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
        },
    };
}

// Hook for mobile-optimized form inputs
export function useMobileFormOptimization() {
    const { isMobile, isKeyboardOpen } = useResponsive({ trackKeyboard: true });

    const getInputProps = useCallback((type: 'text' | 'email' | 'tel' | 'number' = 'text') => {
        const baseProps = {
            className: 'min-h-[44px] text-base', // Prevents zoom on iOS
            autoComplete: 'off',
            autoCorrect: 'off',
            autoCapitalize: 'off',
            spellCheck: false,
        };

        // Mobile-specific input attributes
        if (isMobile) {
            return {
                ...baseProps,
                inputMode: type === 'number' ? 'numeric' as const : 'text' as const,
                pattern: type === 'number' ? '[0-9]*' : undefined,
            };
        }

        return baseProps;
    }, [isMobile]);

    const getTextareaProps = useCallback(() => {
        return {
            className: 'min-h-[88px] text-base resize-none', // Double height for touch, no resize on mobile
            autoComplete: 'off',
            autoCorrect: 'off',
            autoCapitalize: 'sentences',
            spellCheck: true,
        };
    }, []);

    return {
        isMobile,
        isKeyboardOpen,
        getInputProps,
        getTextareaProps,
    };
}