// Core grid components
export {
    ContentGrid,
    CardGrid,
    ResponsiveGrid,
    AccentGrid,
    type GridLayout,
    type GridSpacing
} from "./content-grid"

// Note: Dashboard grids removed during cleanup

// Existing shared components
export { AdaptiveGrid } from "./adaptive-grid"
export { UnifiedPageLayout } from "./unified-page-layout"
export { UniversalCard } from "./universal-card"
export { CompactStats } from "./compact-stats"
export { CompactToolbar } from "./compact-toolbar"

// Grid utilities
export {
    gridUtils,
    responsiveUtils,
    secondaryColorUtils,
    dashboardGridConfigs,
    createAccentedGrid,
    type GridBreakpoint,
    type GridColumns,
    type GridConfig
} from "../../lib/utils/grid-utils"

// Utility components for consistent styling
export {
    Badge,
    StatusIndicator,
    StatusDot,
    ActionButton,
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardAction,
    CardDescription,
    CardContent,
    badgeVariants,
    statusIndicatorVariants,
    actionButtonVariants,
    cardVariants,
    secondaryColorClasses,
    type StatusIndicatorProps,
    type StatusDotProps,
    type ActionButtonProps,
    type CardProps
} from "../ui/utility-components"