/**
 * Utility Components for Dashboard Layout Improvement
 *
 * This module exports enhanced utility components with secondary color integration
 * for consistent styling across the dashboard interface.
 */

// Re-export secondary color utilities for easy access
export {
	type BadgeVariant,
	badgeVariants as secondaryBadgeVariants,
	combineSecondaryClasses,
	getSecondaryAccentClass,
	getSecondaryFocusClass,
	getSecondaryHoverClass,
	type InteractiveClass,
	interactiveClasses,
	type NavigationClass,
	navigationClasses,
	type SecondaryColorClass,
	type StatusVariant,
	secondaryColorClasses,
	statusVariants,
} from "@/lib/utils/secondary-colors";
// Action Button component with consistent styling and secondary color integration
export {
	ActionButton,
	type ActionButtonProps,
	actionButtonVariants,
} from "./action-button";
// Enhanced Badge component with secondary color variants
export { Badge, badgeVariants } from "./badge";

// Enhanced Card component with hover effects and secondary accents
export {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	type CardProps,
	CardTitle,
	cardVariants,
} from "./card";
// Status Indicator components for color-coded states
export {
	StatusDot,
	type StatusDotProps,
	StatusIndicator,
	type StatusIndicatorProps,
	statusIndicatorVariants,
} from "./status-indicator";
