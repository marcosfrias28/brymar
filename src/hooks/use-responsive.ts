"use client";

import * as React from "react";

// Enhanced responsive breakpoints
const BREAKPOINTS = {
    mobile: 640,    // sm
    tablet: 768,    // md
    desktop: 1024,  // lg
    wide: 1280,     // xl
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export function useResponsive() {
    const [breakpoint, setBreakpoint] = React.useState<Breakpoint | null>(null);
    const [dimensions, setDimensions] = React.useState({
        width: 0,
        height: 0,
    });

    React.useEffect(() => {
        const updateBreakpoint = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            setDimensions({ width, height });

            if (width < BREAKPOINTS.mobile) {
                setBreakpoint("mobile");
            } else if (width < BREAKPOINTS.tablet) {
                setBreakpoint("tablet");
            } else if (width < BREAKPOINTS.desktop) {
                setBreakpoint("desktop");
            } else {
                setBreakpoint("wide");
            }
        };

        // Set initial breakpoint
        updateBreakpoint();

        // Listen for resize events
        window.addEventListener("resize", updateBreakpoint);
        return () => window.removeEventListener("resize", updateBreakpoint);
    }, []);

    const isMobile = breakpoint === "mobile";
    const isTablet = breakpoint === "tablet";
    const isDesktop = breakpoint === "desktop" || breakpoint === "wide";
    const isMobileOrTablet = isMobile || isTablet;

    return {
        breakpoint,
        dimensions,
        isMobile,
        isTablet,
        isDesktop,
        isMobileOrTablet,
        // Utility functions
        isAtLeast: (bp: Breakpoint) => {
            if (!breakpoint) return false;
            const currentWidth = dimensions.width;
            return currentWidth >= BREAKPOINTS[bp];
        },
        isBelow: (bp: Breakpoint) => {
            if (!breakpoint) return false;
            const currentWidth = dimensions.width;
            return currentWidth < BREAKPOINTS[bp];
        },
    };
}

// Hook for touch device detection
export function useTouchDevice() {
    const [isTouch, setIsTouch] = React.useState(false);

    React.useEffect(() => {
        const checkTouch = () => {
            setIsTouch(
                "ontouchstart" in window ||
                navigator.maxTouchPoints > 0 ||
                // @ts-ignore
                navigator.msMaxTouchPoints > 0
            );
        };

        checkTouch();
        window.addEventListener("touchstart", checkTouch, { once: true });

        return () => {
            window.removeEventListener("touchstart", checkTouch);
        };
    }, []);

    return isTouch;
}

// Hook for orientation detection
export function useOrientation() {
    const [orientation, setOrientation] = React.useState<"portrait" | "landscape">("portrait");

    React.useEffect(() => {
        const updateOrientation = () => {
            setOrientation(window.innerHeight > window.innerWidth ? "portrait" : "landscape");
        };

        updateOrientation();
        window.addEventListener("resize", updateOrientation);
        window.addEventListener("orientationchange", updateOrientation);

        return () => {
            window.removeEventListener("resize", updateOrientation);
            window.removeEventListener("orientationchange", updateOrientation);
        };
    }, []);

    return orientation;
}