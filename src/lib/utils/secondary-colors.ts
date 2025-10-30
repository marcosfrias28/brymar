/**
 * Secondary Color Utility Classes and Functions
 *
 * This module provides consistent secondary color utilities for the dashboard interface.
 * Secondary colors: rgb(240, 229, 193) in light mode, rgb(233, 216, 166) in dark mode
 */

// CSS class utilities for secondary colors
export const secondaryColorClasses = {
	// Background utilities
	accent: "bg-secondary/10 border-secondary/20",
	accentHover:
		"hover:bg-secondary/20 hover:border-secondary/30 transition-colors duration-200",

	// Focus ring utilities
	focusRing: "focus-visible:ring-secondary/50 focus-visible:border-secondary",

	// Badge utilities
	badge: "bg-secondary text-secondary-foreground",
	badgeWithBorder:
		"bg-secondary text-secondary-foreground border border-secondary/20 shadow-sm",

	// Status indicator utilities
	statusActive: "bg-secondary/20 text-secondary-foreground border-secondary/40",
	statusPending:
		"bg-secondary/10 text-secondary-foreground/80 border-secondary/20",

	// Interactive state utilities
	interactive:
		"hover:bg-secondary/10 active:bg-secondary/20 transition-colors duration-150",

	// Button variant utilities
	buttonSecondary:
		"bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary/50",

	// Card hover effects
	cardHover:
		"hover:border-secondary/30 hover:shadow-lg hover:shadow-secondary/5 transition-all duration-200",

	// Navigation active states
	navActive:
		"bg-secondary/20 text-secondary-foreground border-l-2 border-secondary",
	navHover: "hover:bg-secondary/10 transition-colors duration-200",

	// Form element states
	inputFocus: "focus-visible:border-secondary focus-visible:ring-secondary/50",
	selectFocus:
		"focus-visible:border-secondary focus-visible:ring-secondary/50 hover:border-secondary/30",
} as const;

// Helper functions for dynamic class generation
export const getSecondaryAccentClass = (opacity = 10) =>
	`bg-secondary/${opacity} border-secondary/${Math.min(opacity * 2, 40)}`;

export const getSecondaryHoverClass = (opacity = 20) =>
	`hover:bg-secondary/${opacity} hover:border-secondary/${Math.min(opacity * 1.5, 40)}`;

export const getSecondaryFocusClass = (ringOpacity = 50) =>
	`focus-visible:ring-secondary/${ringOpacity} focus-visible:border-secondary`;

// Status indicator variants using secondary colors
export const statusVariants = {
	active:
		"bg-secondary/20 text-secondary-foreground border border-secondary/40",
	pending:
		"bg-secondary/10 text-secondary-foreground/80 border border-secondary/20",
	highlighted:
		"bg-secondary text-secondary-foreground border border-secondary/30",
} as const;

// Badge variants using secondary colors
export const badgeVariants = {
	secondary: "bg-secondary text-secondary-foreground",
	secondaryOutline:
		"border border-secondary text-secondary-foreground bg-secondary/10",
	secondarySubtle:
		"bg-secondary/20 text-secondary-foreground border border-secondary/30",
} as const;

// Navigation state classes
export const navigationClasses = {
	active:
		"bg-secondary/20 text-secondary-foreground border-l-2 border-secondary font-medium",
	hover: "hover:bg-secondary/10 transition-colors duration-200",
	subActive:
		"bg-secondary/30 text-secondary-foreground border-l-2 border-secondary ml-2 font-medium",
	subHover: "hover:bg-secondary/15 transition-colors duration-200",
} as const;

// Interactive element classes
export const interactiveClasses = {
	button: "focus-visible:ring-secondary/50 hover:border-secondary/30",
	card: "hover:border-secondary/20 hover:shadow-md transition-all duration-200",
	input:
		"focus-visible:border-secondary focus-visible:ring-secondary/50 focus-visible:ring-[3px]",
	select:
		"focus-visible:border-secondary focus-visible:ring-secondary/50 hover:border-secondary/30",
	textarea:
		"focus-visible:border-secondary focus-visible:ring-secondary/50 focus-visible:ring-[3px]",
} as const;

// Utility function to combine secondary color classes
export const combineSecondaryClasses = (
	...classes: (keyof typeof secondaryColorClasses)[]
) => classes.map((cls) => secondaryColorClasses[cls]).join(" ");

// Type definitions for better TypeScript support
export type SecondaryColorClass = keyof typeof secondaryColorClasses;
export type StatusVariant = keyof typeof statusVariants;
export type BadgeVariant = keyof typeof badgeVariants;
export type NavigationClass = keyof typeof navigationClasses;
export type InteractiveClass = keyof typeof interactiveClasses;
