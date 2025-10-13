// Re-export all animation utilities for easy importing
export * from "./animations";
export * from "./secondary-colors";

// Common animation combinations
export const commonAnimations = {
    // Button animations
    primaryButton: "hover:bg-primary/90 hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-secondary/50 transition-all duration-200 ease-out",
    secondaryButton: "hover:bg-secondary/80 hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-secondary/50 transition-all duration-200 ease-out",

    // Card animations
    interactiveCard: "hover:border-secondary/30 hover:shadow-lg hover:shadow-secondary/5 hover:-translate-y-1 transition-all duration-200 ease-out",

    // Input animations
    focusInput: "focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2 transition-all duration-150 ease-out",

    // Navigation animations
    navItem: "hover:bg-secondary/10 hover:translate-x-1 focus-visible:ring-2 focus-visible:ring-secondary/50 transition-all duration-200 ease-out",

    // Page transitions
    pageEnter: "animate-fade-in",
    staggeredList: "animate-fade-in animation-delay-100",
} as const;