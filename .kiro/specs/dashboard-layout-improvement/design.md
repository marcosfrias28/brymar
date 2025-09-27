# Design Document

## Overview

This design establishes a unified, flexible layout system for all dashboard routes in the Brymar Inmobiliaria platform. The solution focuses on creating a consistent user experience while maintaining the existing aesthetic and incorporating strategic use of the secondary color palette (rgb(240, 229, 193) / rgb(233, 216, 166) in dark mode).

## Architecture

### Layout Component Hierarchy

```
DashboardPageLayout (New)
├── PageHeader
│   ├── Breadcrumbs (Optional)
│   ├── Title & Description
│   └── Actions (Optional)
├── PageContent
│   ├── ContentArea (Flexible)
│   └── Sidebar (Optional)
└── PageFooter (Optional)
```

### Enhanced Admin Sidebar Structure

```
AdminSidebar (Enhanced)
├── Header (Logo)
├── Main Navigation
│   ├── Dashboard
│   ├── Properties (with submenu)
│   ├── Lands (with submenu)
│   ├── Blog (with submenu)
│   └── Sections
├── Management Section
│   ├── Users (if permissions)
│   ├── Analytics (if permissions)
│   └── Administration (admin only)
└── Secondary Navigation
    ├── Search
    ├── Settings
    └── Help
```

## Components and Interfaces

### 1. DashboardPageLayout Component

**Purpose:** Standardized layout wrapper for all dashboard pages

**Props Interface:**

```typescript
interface DashboardPageLayoutProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType;
}
```

**Features:**

- Consistent spacing and typography
- Responsive design with mobile-first approach
- Flexible content area with optional sidebar
- Integrated breadcrumb navigation
- Action buttons area for page-specific controls
- Secondary color accents for visual hierarchy

### 2. Enhanced AdminSidebar Component

**Enhancements:**

- Complete route coverage including "new" creation routes
- Expandable menu items with submenus for better organization
- Secondary color accents for active states and hover effects
- Permission-based menu item visibility
- Improved visual hierarchy with grouped sections

**New Navigation Structure:**

```typescript
interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType;
  badge?: string | number;
  children?: NavigationItem[];
  permission?: string;
}
```

### 3. PageHeader Component

**Purpose:** Standardized header for all dashboard pages

**Features:**

- Consistent title typography (text-3xl font-bold font-serif)
- Optional description with muted styling
- Breadcrumb navigation with secondary color accents
- Action buttons area with proper spacing
- Responsive layout that stacks on mobile

### 4. ContentGrid Component

**Purpose:** Flexible grid system for dashboard content

**Variants:**

- Single column (default)
- Two column (main + sidebar)
- Three column (for complex layouts)
- Card grid (for property/land listings)

## Data Models

### Layout Configuration

```typescript
interface LayoutConfig {
  showBreadcrumbs: boolean;
  showActions: boolean;
  contentLayout: "single" | "two-column" | "three-column" | "grid";
  spacing: "compact" | "normal" | "relaxed";
  theme: {
    useSecondaryAccents: boolean;
    headerStyle: "minimal" | "standard" | "prominent";
  };
}
```

### Route Configuration

```typescript
interface RouteConfig {
  path: string;
  title: string;
  description?: string;
  icon: React.ComponentType;
  permission?: string;
  children?: RouteConfig[];
  badge?: () => string | number;
}
```

## Error Handling

### Layout Error Boundaries

1. **Page Level Errors:** Graceful fallback with navigation intact
2. **Component Level Errors:** Isolated error states for individual sections
3. **Permission Errors:** Clear messaging with appropriate actions
4. **Loading States:** Consistent skeleton components

### Error Recovery Strategies

- Retry mechanisms for failed data loads
- Fallback content for missing permissions
- Progressive enhancement for optional features
- Clear error messaging with actionable steps

## Testing Strategy

### Unit Tests

1. **Layout Components:**

   - Props handling and default values
   - Responsive behavior
   - Accessibility compliance
   - Color scheme application

2. **Navigation Components:**
   - Route generation based on permissions
   - Active state management
   - Menu expansion/collapse behavior
   - Badge display logic

### Integration Tests

1. **Layout Integration:**

   - Sidebar and content area coordination
   - Responsive breakpoint behavior
   - Theme switching functionality
   - Navigation state persistence

2. **Permission Integration:**
   - Menu visibility based on user roles
   - Route access control
   - Dynamic content rendering
   - Error state handling

### Visual Regression Tests

1. **Layout Consistency:**

   - Cross-page layout uniformity
   - Color scheme application
   - Typography consistency
   - Spacing and alignment

2. **Responsive Design:**
   - Mobile layout behavior
   - Tablet breakpoint handling
   - Desktop optimization
   - Component reflow testing

## Design System Specifications

### Color Usage Strategy

**Primary Colors:**

- `--primary: rgb(148, 210, 189)` - Main brand color for key actions
- `--accent: rgb(0, 95, 115)` - Interactive elements and focus states

**Secondary Color Integration:**

- `--secondary: rgb(240, 229, 193)` (light) / `rgb(233, 216, 166)` (dark)
- Usage: Badges, subtle highlights, active states, accent borders
- Application: 10-15% of interface elements for visual interest

**Implementation Examples:**

- Active sidebar items: Secondary color background with reduced opacity
- Badge notifications: Secondary color with contrasting text
- Form field focus rings: Secondary color accent
- Card borders on hover: Secondary color with subtle animation
- Status indicators: Secondary color for positive states

### Typography Hierarchy

**Headers:**

- Page titles: `text-3xl font-bold font-serif` (Lora)
- Section titles: `text-xl font-semibold font-sans` (Poppins)
- Card titles: `text-lg font-medium font-sans`

**Body Text:**

- Primary: `text-base font-normal font-sans`
- Secondary: `text-sm text-muted-foreground font-sans`
- Captions: `text-xs text-muted-foreground font-sans`

### Spacing System

**Page Level:**

- Container padding: `px-4 lg:px-6`
- Section gaps: `gap-6 md:gap-8`
- Component spacing: `space-y-4 md:space-y-6`

**Component Level:**

- Card padding: `p-4 md:p-6`
- Button spacing: `px-4 py-2`
- Form field gaps: `space-y-4`

### Animation and Interactions

**Micro-interactions:**

- Hover states: 150ms ease-in-out transitions
- Focus states: Ring animation with secondary color
- Loading states: Shimmer animation on skeleton components
- Menu expansions: 200ms cubic-bezier transitions

**Page Transitions:**

- Route changes: Subtle fade-in effect
- Content updates: Staggered animation for lists
- Modal appearances: Scale and fade animation

## Implementation Phases

### Phase 1: Core Layout System

- DashboardPageLayout component
- PageHeader component
- Basic responsive grid system
- Typography and spacing standardization

### Phase 2: Enhanced Navigation

- Updated AdminSidebar with complete routes
- Submenu functionality
- Permission-based visibility
- Secondary color integration

### Phase 3: Content Components

- Standardized card components
- Form layout improvements
- Data table enhancements
- Loading and error states

### Phase 4: Polish and Optimization

- Animation refinements
- Accessibility improvements
- Performance optimizations
- Visual regression testing

## Accessibility Considerations

### Navigation

- Keyboard navigation support
- Screen reader compatibility
- Focus management
- ARIA labels and descriptions

### Visual Design

- Color contrast compliance (WCAG 2.1 AA)
- Focus indicators with sufficient contrast
- Scalable text and components
- Reduced motion preferences

### Interactive Elements

- Touch target sizing (minimum 44px)
- Clear interactive states
- Error message association
- Form validation feedback
