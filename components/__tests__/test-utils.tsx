import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BreadcrumbItem } from "@/types/layout";

// Mock providers for testing
const MockProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div data-testid="mock-providers">{children}</div>;
};

// Custom render function with providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: MockProviders, ...options });

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };

// Test data factories
export const createMockBreadcrumbs = (count: number = 3): BreadcrumbItem[] => {
  return Array.from({ length: count }, (_, index) => ({
    label: `Breadcrumb ${index + 1}`,
    href: index < count - 1 ? `/path/${index + 1}` : undefined,
  }));
};

export const createMockUser = (overrides = {}) => ({
  name: "Test User",
  email: "test@example.com",
  role: "agent",
  image: "/test-avatar.jpg",
  ...overrides,
});

export const createMockAdminPermissions = (overrides = {}) => ({
  canManageUsers: false,
  canAccessDashboard: true,
  canViewAnalytics: false,
  canManageBlog: false,
  isAdmin: false,
  ...overrides,
});

// Responsive breakpoint utilities
export const mockResponsiveStates = {
  mobile: {
    isMobile: true,
    isTablet: false,
    isMobileOrTablet: true,
  },
  tablet: {
    isMobile: false,
    isTablet: true,
    isMobileOrTablet: true,
  },
  desktop: {
    isMobile: false,
    isTablet: false,
    isMobileOrTablet: false,
  },
};

// CSS class assertion helpers
export const expectToHaveClasses = (element: Element, classes: string[]) => {
  classes.forEach((className) => {
    expect(element).toHaveClass(className);
  });
};

export const expectNotToHaveClasses = (element: Element, classes: string[]) => {
  classes.forEach((className) => {
    expect(element).not.toHaveClass(className);
  });
};

// Layout testing utilities
export const getLayoutContainer = (container: HTMLElement) => {
  return container.firstChild as HTMLElement;
};

export const getMainContent = (container: HTMLElement) => {
  return container.querySelector("#main-content") as HTMLElement;
};

export const getSidebar = (container: HTMLElement) => {
  return container.querySelector(".lg\\:col-span-1") as HTMLElement;
};

export const getPageHeader = (container: HTMLElement) => {
  return container.querySelector('[role="banner"]') as HTMLElement;
};

// Animation testing utilities
export const expectAnimationClasses = (element: Element) => {
  const animationClasses = [
    "animate-fade-in",
    "animation-delay-100",
    "animation-delay-200",
    "animation-delay-300",
    "animation-delay-400",
  ];

  const hasAnimationClass = animationClasses.some(
    (className) =>
      element.classList.contains(className) ||
      element.querySelector(`.${className}`)
  );

  expect(hasAnimationClass).toBe(true);
};

// Accessibility testing utilities
export const expectAccessibilityAttributes = (
  element: Element,
  attributes: Record<string, string>
) => {
  Object.entries(attributes).forEach(([attr, value]) => {
    expect(element).toHaveAttribute(attr, value);
  });
};

export const expectSemanticStructure = (container: HTMLElement) => {
  expect(container.querySelector('[role="banner"]')).toBeInTheDocument();
  expect(container.querySelector('[role="main"]')).toBeInTheDocument();
  expect(container.querySelector("#main-content")).toBeInTheDocument();
};

// Navigation testing utilities
export const expectNavigationStructure = (container: HTMLElement) => {
  expect(
    container.querySelector('[data-testid="nav-main"]')
  ).toBeInTheDocument();
  expect(
    container.querySelector('[data-testid="nav-secondary"]')
  ).toBeInTheDocument();
  expect(
    container.querySelector('[data-testid="nav-user"]')
  ).toBeInTheDocument();
};

// Responsive testing utilities
export const expectResponsiveClasses = (
  element: Element,
  breakpoint: "mobile" | "tablet" | "desktop"
) => {
  const responsiveClasses = {
    mobile: ["p-3", "space-y-3", "gap-3"],
    tablet: ["sm:p-4", "space-y-4", "gap-4"],
    desktop: ["lg:p-8", "space-y-6", "gap-6"],
  };

  const expectedClasses = responsiveClasses[breakpoint];
  const hasResponsiveClass = expectedClasses.some((className) =>
    element.classList.contains(className)
  );

  expect(hasResponsiveClass).toBe(true);
};

// Grid layout testing utilities
export const expectGridLayout = (
  element: Element,
  layout: "single" | "two-column" | "three-column" | "grid"
) => {
  const gridClasses = {
    single: ["space-y-6"],
    "two-column": ["grid", "grid-cols-1", "md:grid-cols-2"],
    "three-column": ["grid", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3"],
    grid: [
      "grid",
      "grid-cols-1",
      "sm:grid-cols-2",
      "md:grid-cols-3",
      "lg:grid-cols-4",
      "xl:grid-cols-5",
    ],
  };

  const expectedClasses = gridClasses[layout];
  expectedClasses.forEach((className) => {
    expect(element).toHaveClass(className);
  });
};

// Color scheme testing utilities
export const expectColorSchemeClasses = (element: Element) => {
  const colorClasses = [
    "bg-background",
    "text-foreground",
    "text-muted-foreground",
    "border-border",
    "focus:ring-secondary",
  ];

  const hasColorClass = colorClasses.some(
    (className) =>
      element.classList.contains(className) ||
      element.querySelector(`.${className}`)
  );

  expect(hasColorClass).toBe(true);
};

// Typography testing utilities
export const expectTypographyClasses = (
  element: Element,
  type: "title" | "description" | "body"
) => {
  const typographyClasses = {
    title: ["text-3xl", "font-bold", "font-serif"],
    description: ["text-muted-foreground", "text-base"],
    body: ["text-base", "font-normal"],
  };

  const expectedClasses = typographyClasses[type];
  expectedClasses.forEach((className) => {
    expect(element).toHaveClass(className);
  });
};
