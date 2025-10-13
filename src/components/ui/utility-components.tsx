/**
 * Utility Components for Dashboard Layout Improvement
 *
 * This module exports enhanced utility components with secondary color integration
 * for consistent styling across the dashboard interface.
 */

// Enhanced Badge component with secondary color variants
export { Badge, badgeVariants } from "./badge";

// Status Indicator components for color-coded states
export {
  StatusIndicator,
  StatusDot,
  statusIndicatorVariants,
  type StatusIndicatorProps,
  type StatusDotProps,
} from "./status-indicator";

// Action Button component with consistent styling and secondary color integration
export {
  ActionButton,
  actionButtonVariants,
  type ActionButtonProps,
} from "./action-button";

// Enhanced Card component with hover effects and secondary accents
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
  type CardProps,
} from "./card";

// Re-export secondary color utilities for easy access
export {
  secondaryColorClasses,
  statusVariants,
  badgeVariants as secondaryBadgeVariants,
  navigationClasses,
  interactiveClasses,
  getSecondaryAccentClass,
  getSecondaryHoverClass,
  getSecondaryFocusClass,
  combineSecondaryClasses,
  type SecondaryColorClass,
  type StatusVariant,
  type BadgeVariant,
  type NavigationClass,
  type InteractiveClass,
} from '@/lib/utils/secondary-colors';
