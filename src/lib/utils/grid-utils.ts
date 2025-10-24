import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type GridBreakpoint = "sm" | "md" | "lg" | "xl" | "2xl";
export type GridLayout = "single" | "two-column" | "three-column" | "card-grid";
export type GridSpacing = "compact" | "normal" | "relaxed";

// Grid configuration interfaces
export interface GridColumns {
	sm?: number;
	md?: number;
	lg?: number;
	xl?: number;
	"2xl"?: number;
}

export interface GridConfig {
	layout: GridLayout;
	spacing: GridSpacing;
	columns?: GridColumns;
	minItemWidth?: string;
	maxColumns?: number;
}

// Responsive grid utilities
export const gridUtils = {
	// Generate responsive column classes
	getColumnClasses: (columns: GridColumns): string => {
		const classes = ["grid", "grid-cols-1"];

		if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
		if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
		if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
		if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
		if (columns["2xl"]) classes.push(`2xl:grid-cols-${columns["2xl"]}`);

		return classes.join(" ");
	},

	// Generate spacing classes
	getSpacingClasses: (spacing: GridSpacing): string => {
		switch (spacing) {
			case "compact":
				return "gap-3 md:gap-4";
			case "relaxed":
				return "gap-6 md:gap-8 lg:gap-10";
			default:
				return "gap-4 md:gap-6";
		}
	},

	// Generate layout-specific classes
	getLayoutClasses: (layout: GridLayout, hasSidebar = false): string => {
		switch (layout) {
			case "single":
				return "grid grid-cols-1";

			case "two-column":
				return hasSidebar
					? "grid grid-cols-1 lg:grid-cols-[1fr_300px]"
					: "grid grid-cols-1 md:grid-cols-2";

			case "three-column":
				return hasSidebar
					? "grid grid-cols-1 lg:grid-cols-[250px_1fr_250px]"
					: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

			case "card-grid":
				return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

			default:
				return "grid grid-cols-1";
		}
	},

	// Generate auto-fit grid with minimum width
	getAutoFitClasses: (_minWidth = "280px"): string => {
		return `grid gap-4 md:gap-6`;
	},

	// Combine all grid classes
	combineGridClasses: (...classes: (string | undefined)[]): string => {
		return twMerge(clsx(classes.filter(Boolean)));
	},
};

// Predefined grid configurations for common dashboard layouts
export const dashboardGridConfigs: Record<string, GridConfig> = {
	// Property and land listings
	propertyGrid: {
		layout: "card-grid",
		spacing: "normal",
		columns: { sm: 1, md: 2, lg: 3, xl: 4, "2xl": 5 },
		minItemWidth: "280px",
	},

	// Blog posts
	blogGrid: {
		layout: "card-grid",
		spacing: "normal",
		columns: { sm: 1, md: 2, lg: 3, xl: 3 },
		minItemWidth: "320px",
	},

	// Dashboard stats cards
	statsGrid: {
		layout: "card-grid",
		spacing: "compact",
		columns: { sm: 2, md: 2, lg: 4, xl: 4 },
		minItemWidth: "200px",
	},

	// Settings or form sections
	settingsGrid: {
		layout: "two-column",
		spacing: "relaxed",
		columns: { sm: 1, md: 1, lg: 2 },
	},

	// Dashboard main content with sidebar
	dashboardMain: {
		layout: "two-column",
		spacing: "normal",
	},

	// Full width single column
	singleColumn: {
		layout: "single",
		spacing: "normal",
	},
};

// Utility functions for responsive behavior
export const responsiveUtils = {
	// Get responsive padding classes
	getResponsivePadding: (size: "sm" | "md" | "lg" = "md"): string => {
		switch (size) {
			case "sm":
				return "p-3 md:p-4";
			case "lg":
				return "p-6 md:p-8 lg:p-10";
			default:
				return "p-4 md:p-6";
		}
	},

	// Get responsive margin classes
	getResponsiveMargin: (size: "sm" | "md" | "lg" = "md"): string => {
		switch (size) {
			case "sm":
				return "m-3 md:m-4";
			case "lg":
				return "m-6 md:m-8 lg:m-10";
			default:
				return "m-4 md:m-6";
		}
	},

	// Get responsive text size classes
	getResponsiveTextSize: (
		level: "xs" | "sm" | "base" | "lg" | "xl" = "base",
	): string => {
		switch (level) {
			case "xs":
				return "text-xs sm:text-sm";
			case "sm":
				return "text-sm sm:text-base";
			case "lg":
				return "text-base sm:text-lg";
			case "xl":
				return "text-lg sm:text-xl md:text-2xl";
			default:
				return "text-sm sm:text-base";
		}
	},
};

// Secondary color integration utilities
export const secondaryColorUtils = {
	// Get secondary accent classes
	getSecondaryAccent: (
		intensity: "light" | "medium" | "strong" = "medium",
	): string => {
		switch (intensity) {
			case "light":
				return "bg-secondary/5 border-secondary/10";
			case "strong":
				return "bg-secondary/20 border-secondary/40";
			default:
				return "bg-secondary/10 border-secondary/20";
		}
	},

	// Get secondary hover classes
	getSecondaryHover: (): string => {
		return "hover:bg-secondary/20 hover:border-secondary/30 transition-colors duration-200";
	},

	// Get secondary focus classes
	getSecondaryFocus: (): string => {
		return "focus-visible:ring-secondary/50 focus-visible:border-secondary";
	},

	// Get secondary status classes
	getSecondaryStatus: (
		status: "active" | "pending" | "inactive" = "active",
	): string => {
		switch (status) {
			case "pending":
				return "bg-secondary/10 text-secondary-foreground/80 border-secondary/20";
			case "inactive":
				return "bg-secondary/5 text-secondary-foreground/60 border-secondary/10";
			default:
				return "bg-secondary/20 text-secondary-foreground border-secondary/40";
		}
	},
};

// Helper function to create grid container with secondary accents
export function createAccentedGrid(
	layout: GridLayout,
	spacing: GridSpacing = "normal",
	showAccents = true,
): string {
	const baseClasses = gridUtils.getLayoutClasses(layout);
	const spacingClasses = gridUtils.getSpacingClasses(spacing);
	const accentClasses = showAccents
		? secondaryColorUtils.getSecondaryAccent()
		: "";

	return gridUtils.combineGridClasses(
		baseClasses,
		spacingClasses,
		accentClasses,
		showAccents ? "rounded-lg p-4 md:p-6" : "",
	);
}
