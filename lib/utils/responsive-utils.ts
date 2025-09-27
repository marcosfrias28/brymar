import { cn } from "@/lib/utils";

/**
 * Responsive utility classes for consistent breakpoint handling
 */
export const responsiveClasses = {
    // Container padding
    containerPadding: "px-3 sm:px-4 md:px-6 lg:px-8",

    // Content spacing
    contentSpacing: {
        mobile: "space-y-3",
        tablet: "space-y-4",
        desktop: "space-y-6",
        responsive: "space-y-3 sm:space-y-4 lg:space-y-6"
    },

    // Grid gaps
    gridGap: {
        mobile: "gap-3",
        tablet: "gap-4",
        desktop: "gap-6",
        responsive: "gap-3 sm:gap-4 lg:gap-6"
    },

    // Text sizing
    textSize: {
        title: {
            mobile: "text-2xl",
            tablet: "text-2xl sm:text-3xl",
            desktop: "text-3xl",
            responsive: "text-2xl sm:text-3xl"
        },
        body: {
            mobile: "text-sm",
            tablet: "text-sm sm:text-base",
            desktop: "text-base",
            responsive: "text-sm sm:text-base"
        },
        caption: {
            mobile: "text-xs",
            tablet: "text-xs sm:text-sm",
            desktop: "text-sm",
            responsive: "text-xs sm:text-sm"
        }
    },

    // Touch targets
    touchTarget: {
        small: "min-h-[40px] min-w-[40px]",
        medium: "min-h-[44px] min-w-[44px]",
        large: "min-h-[48px] min-w-[48px]"
    },

    // Button padding for touch
    buttonPadding: {
        mobile: "px-4 py-3",
        desktop: "px-3 py-2",
        responsive: "px-4 py-3 sm:px-3 sm:py-2"
    },

    // Form input sizing
    inputSize: {
        mobile: "px-4 py-3 text-base", // Prevent zoom on iOS
        desktop: "px-3 py-2 text-sm",
        responsive: "px-4 py-3 text-[16px] sm:px-3 sm:py-2 sm:text-sm"
    }
};

/**
 * Responsive grid utilities
 */
export const responsiveGrids = {
    // Standard responsive grids
    cards: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    twoColumn: "grid grid-cols-1 md:grid-cols-2",
    threeColumn: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",

    // Dashboard specific grids
    dashboard: {
        stats: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        content: "grid grid-cols-1 lg:grid-cols-4",
        sidebar: "lg:col-span-3",
        aside: "lg:col-span-1"
    }
};

/**
 * Responsive layout helpers
 */
export const responsiveLayout = {
    // Flex direction changes
    stackOnMobile: "flex flex-col sm:flex-row",
    stackOnTablet: "flex flex-col md:flex-row",

    // Alignment changes
    centerOnMobile: "items-center sm:items-start",
    justifyOnMobile: "justify-center sm:justify-between",

    // Width constraints
    fullOnMobile: "w-full sm:w-auto",
    maxWidthOnMobile: "max-w-full sm:max-w-md",

    // Order changes
    reverseOnMobile: "flex-col-reverse sm:flex-row",
    lastOnMobile: "order-last sm:order-none"
};

/**
 * Tablet-specific breakpoint utilities
 */
export const tabletBreakpoints = {
    // Show/hide at tablet breakpoint
    hideOnTablet: "hidden md:block lg:block",
    showOnTablet: "block md:hidden lg:block",
    tabletOnly: "hidden md:block lg:hidden",

    // Layout changes at tablet
    tabletGrid: "md:grid-cols-2 lg:grid-cols-3",
    tabletFlex: "md:flex-row lg:flex-row",
    tabletStack: "md:flex-col lg:flex-row"
};

/**
 * Generate responsive classes based on breakpoint
 */
export function getResponsiveClasses(
    mobile: string,
    tablet?: string,
    desktop?: string
): string {
    const classes = [mobile];

    if (tablet) {
        classes.push(`md:${tablet}`);
    }

    if (desktop) {
        classes.push(`lg:${desktop}`);
    }

    return cn(...classes);
}

/**
 * Conditional responsive classes
 */
export function conditionalResponsive(
    condition: boolean,
    mobileClass: string,
    desktopClass: string
): string {
    return condition ? mobileClass : desktopClass;
}