/**
 * Animation Utilities for Dashboard Layout Improvements
 * 
 * This module provides consistent animation classes and utilities for micro-interactions,
 * hover effects, focus states, and page transitions with secondary color integration.
 */

import { secondaryColorClasses } from "./secondary-colors";

// Core animation timing functions
export const animationTimings = {
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
    slower: "500ms",
} as const;

// Easing functions
export const easingFunctions = {
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    smooth: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
} as const;

// Hover animation classes with secondary colors
export const hoverAnimations = {
    // Basic hover effects
    subtle: "hover:bg-secondary/5 transition-colors duration-200 ease-out",
    gentle: "hover:bg-secondary/10 hover:border-secondary/20 transition-all duration-200 ease-out",
    prominent: "hover:bg-secondary/15 hover:border-secondary/30 hover:shadow-md transition-all duration-200 ease-out",

    // Scale effects
    scaleSubtle: "hover:scale-[1.02] transition-transform duration-200 ease-out",
    scaleGentle: "hover:scale-105 transition-transform duration-200 ease-out",

    // Combined effects
    liftAndGlow: "hover:bg-secondary/10 hover:shadow-lg hover:shadow-secondary/10 hover:-translate-y-0.5 transition-all duration-200 ease-out",
    borderGlow: "hover:border-secondary/40 hover:shadow-[0_0_0_1px_rgb(var(--secondary)/0.2)] transition-all duration-200 ease-out",
} as const;

// Focus animation classes with secondary colors
export const focusAnimations = {
    ring: "focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2 transition-all duration-150 ease-out",
    ringLarge: "focus-visible:ring-4 focus-visible:ring-secondary/40 focus-visible:ring-offset-2 transition-all duration-150 ease-out",
    border: "focus-visible:border-secondary focus-visible:shadow-[0_0_0_1px_rgb(var(--secondary)/0.5)] transition-all duration-150 ease-out",
    glow: "focus-visible:shadow-[0_0_0_3px_rgb(var(--secondary)/0.3)] transition-all duration-150 ease-out",
} as const;

// Loading animation classes
export const loadingAnimations = {
    pulse: "animate-pulse",
    shimmer: "animate-pulse bg-gradient-to-r from-muted via-secondary/20 to-muted",
    spin: "animate-spin",
    bounce: "animate-bounce",
    fadeIn: "animate-in fade-in",
    slideIn: "animate-in slide-in-from-bottom",
} as const;

// Sidebar menu animation classes
export const sidebarAnimations = {
    // Menu expansion animations
    expandMenu: "transition-all duration-300 ease-out data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",

    // Chevron rotation
    chevronRotate: "transition-transform duration-200 ease-out group-data-[state=open]:rotate-90",

    // Menu item hover effects
    menuItemHover: `${hoverAnimations.gentle} hover:translate-x-1`,
    submenuItemHover: `${hoverAnimations.subtle} hover:translate-x-0.5`,

    // Active state animations
    activeSlide: "relative before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-secondary before:transition-all before:duration-200",
} as const;

// Page transition animations
export const pageTransitions = {
    fadeIn: "animate-in fade-in",
    slideUp: "animate-in slide-in-from-bottom",
    slideDown: "animate-in slide-in-from-top",
    slideLeft: "animate-in slide-in-from-right",
    slideRight: "animate-in slide-in-from-left",

    // Staggered animations for lists
    staggeredFadeIn: "animate-in fade-in",
    staggeredSlideUp: "animate-in slide-in-from-bottom",
} as const;

// Button animation classes
export const buttonAnimations = {
    press: "active:scale-95 transition-transform duration-75 ease-out",
    pressSubtle: "active:scale-98 transition-transform duration-75 ease-out",

    // Loading states
    loading: "animate-pulse cursor-not-allowed opacity-70",

    // Success/error states
    success: "bg-green-500 hover:bg-green-600 transition-colors duration-200",
    error: "bg-red-500 hover:bg-red-600 transition-colors duration-200",
} as const;

// Card animation classes
export const cardAnimations = {
    hover: `${hoverAnimations.liftAndGlow} hover:border-secondary/30`,
    hoverSubtle: `${hoverAnimations.gentle} hover:border-secondary/20`,

    // Interactive cards
    clickable: `${hoverAnimations.liftAndGlow} ${buttonAnimations.pressSubtle} cursor-pointer`,

    // Loading states
    loading: "animate-pulse bg-muted/50",

    // Entrance animations
    fadeIn: pageTransitions.fadeIn,
    slideUp: pageTransitions.slideUp,
} as const;

// Form element animations
export const formAnimations = {
    input: `${focusAnimations.ring} ${hoverAnimations.subtle} transition-all duration-200 ease-out`,
    inputError: "focus-visible:ring-red-500/50 border-red-500 transition-all duration-200 ease-out",

    // Label animations
    floatingLabel: "transition-all duration-200 ease-out peer-focus:text-secondary peer-focus:scale-90 peer-focus:-translate-y-2",

    // Validation states
    valid: "border-green-500 focus-visible:ring-green-500/50 transition-all duration-200 ease-out",
    invalid: "border-red-500 focus-visible:ring-red-500/50 transition-all duration-200 ease-out",
} as const;

// Memoized utility functions for dynamic animations to improve performance
const animationCache = new Map<string, string>();

export const createHoverAnimation = (
    bgOpacity: number = 10,
    borderOpacity: number = 20,
    duration: keyof typeof animationTimings = "normal"
) => {
    const key = `hover-${bgOpacity}-${borderOpacity}-${duration}`;
    if (animationCache.has(key)) {
        return animationCache.get(key)!;
    }

    const animation = `hover:bg-secondary/${bgOpacity} hover:border-secondary/${borderOpacity} transition-all duration-${animationTimings[duration]} ease-out`;
    animationCache.set(key, animation);
    return animation;
};

export const createFocusAnimation = (
    ringOpacity: number = 50,
    duration: keyof typeof animationTimings = "fast"
) => {
    const key = `focus-${ringOpacity}-${duration}`;
    if (animationCache.has(key)) {
        return animationCache.get(key)!;
    }

    const animation = `focus-visible:ring-2 focus-visible:ring-secondary/${ringOpacity} focus-visible:ring-offset-2 transition-all duration-${animationTimings[duration]} ease-out`;
    animationCache.set(key, animation);
    return animation;
};

export const createStaggeredAnimation = (delay: number) => {
    const key = `stagger-${delay}`;
    if (animationCache.has(key)) {
        return animationCache.get(key)!;
    }

    const animation = `animate-in fade-in slide-in-from-bottom-2 duration-300` +
        (delay > 0 ? ` delay-${delay * 100}` : "");
    animationCache.set(key, animation);
    return animation;
};

// Performance optimization: Prefers reduced motion
export const getReducedMotionClasses = (normalClasses: string, reducedClasses: string = "") => {
    return `motion-safe:${normalClasses} ${reducedClasses}`;
};

// Animation presets for common UI patterns
export const animationPresets = {
    // Navigation
    navItem: `${hoverAnimations.gentle} ${focusAnimations.ring} transition-all duration-200 ease-out`,
    navItemActive: `${secondaryColorClasses.navActive} ${sidebarAnimations.activeSlide}`,

    // Interactive elements
    button: `${hoverAnimations.gentle} ${focusAnimations.ring} ${buttonAnimations.press}`,
    card: `${cardAnimations.hoverSubtle} ${focusAnimations.border}`,
    input: `${formAnimations.input}`,

    // Loading states
    skeleton: `${loadingAnimations.shimmer}`,
    spinner: `${loadingAnimations.spin}`,

    // Page elements
    pageContent: `${pageTransitions.fadeIn}`,
    modalContent: `${pageTransitions.slideUp}`,

    // Lists and grids
    listItem: `${pageTransitions.staggeredFadeIn}`,
    gridItem: `${cardAnimations.hover}`,
} as const;

// Type definitions
export type HoverAnimation = keyof typeof hoverAnimations;
export type FocusAnimation = keyof typeof focusAnimations;
export type LoadingAnimation = keyof typeof loadingAnimations;
export type SidebarAnimation = keyof typeof sidebarAnimations;
export type PageTransition = keyof typeof pageTransitions;
export type ButtonAnimation = keyof typeof buttonAnimations;
export type CardAnimation = keyof typeof cardAnimations;
export type FormAnimation = keyof typeof formAnimations;
export type AnimationPreset = keyof typeof animationPresets;