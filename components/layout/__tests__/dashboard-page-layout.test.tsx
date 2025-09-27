import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DashboardPageLayout } from "../dashboard-page-layout";
import { BreadcrumbItem } from "@/types/layout";

// Mock dependencies
jest.mock("@/hooks/use-responsive", () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
    isMobileOrTablet: false,
  }),
}));

jest.mock("@/components/ui/page-transition", () => ({
  PageTransition: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

jest.mock("@/lib/utils/accessibility", () => ({
  ariaLabels: {
    skipToContent: "Skip to main content",
  },
}));

jest.mock("@/components/ui/breadcrumb", () => ({
  Breadcrumb: ({ items }: any) => (
    <nav data-testid="breadcrumb">
      {items.map((item: any, index: number) => (
        <span key={index}>{item.label}</span>
      ))}
    </nav>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

describe("DashboardPageLayout", () => {
  const defaultProps = {
    title: "Test Page",
    children: <div>Test Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders with required props", () => {
      render(<DashboardPageLayout {...defaultProps} />);

      expect(screen.getByText("Test Page")).toBeInTheDocument();
      expect(screen.getByText("Test Content")).toBeInTheDocument();
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("renders with description when provided", () => {
      render(
        <DashboardPageLayout {...defaultProps} description="Test description" />
      );

      expect(screen.getByText("Test description")).toBeInTheDocument();
    });

    it("renders breadcrumbs when provided", () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Current Page" },
      ];

      render(
        <DashboardPageLayout {...defaultProps} breadcrumbs={breadcrumbs} />
      );

      // Check if breadcrumb component is rendered
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Current Page")).toBeInTheDocument();
    });

    it("renders actions when provided", () => {
      const actions = <button type="button">Test Action</button>;

      render(<DashboardPageLayout {...defaultProps} actions={actions} />);

      expect(screen.getByText("Test Action")).toBeInTheDocument();
    });

    it("renders sidebar when provided", () => {
      const sidebar = <div>Test Sidebar</div>;

      render(<DashboardPageLayout {...defaultProps} sidebar={sidebar} />);

      expect(screen.getByText("Test Sidebar")).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("renders search input when showSearch is true", () => {
      render(<DashboardPageLayout {...defaultProps} showSearch={true} />);

      expect(screen.getByPlaceholderText("Buscar...")).toBeInTheDocument();
    });

    it("uses custom search placeholder when provided", () => {
      render(
        <DashboardPageLayout
          {...defaultProps}
          showSearch={true}
          searchPlaceholder="Custom search..."
        />
      );

      expect(
        screen.getByPlaceholderText("Custom search...")
      ).toBeInTheDocument();
    });

    it("does not render search input when showSearch is false", () => {
      render(<DashboardPageLayout {...defaultProps} showSearch={false} />);

      expect(
        screen.queryByPlaceholderText("Buscar...")
      ).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("includes skip to content link", () => {
      render(<DashboardPageLayout {...defaultProps} />);

      const skipLink = screen.getByText("Skip to main content");
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute("href", "#main-content");
    });

    it("has proper ARIA labels", () => {
      render(<DashboardPageLayout {...defaultProps} />);

      const main = screen.getByRole("main");
      expect(main).toHaveAttribute(
        "aria-label",
        "Test Page - Contenido principal"
      );
      expect(main).toHaveAttribute("id", "main-content");
    });

    it("has proper semantic structure", () => {
      render(<DashboardPageLayout {...defaultProps} />);

      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByRole("main")).toBeInTheDocument();
    });
  });

  describe("CSS Classes", () => {
    it("applies custom className when provided", () => {
      const { container } = render(
        <DashboardPageLayout {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("applies custom contentClassName when provided", () => {
      render(
        <DashboardPageLayout
          {...defaultProps}
          contentClassName="custom-content-class"
        />
      );

      const main = screen.getByRole("main");
      expect(main).toHaveClass("custom-content-class");
    });
  });

  describe("Layout Variants", () => {
    it("uses single column layout without sidebar", () => {
      render(<DashboardPageLayout {...defaultProps} />);

      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();
      expect(screen.queryByText("Test Sidebar")).not.toBeInTheDocument();
    });

    it("uses two column layout with sidebar", () => {
      const sidebar = <div>Test Sidebar</div>;

      render(<DashboardPageLayout {...defaultProps} sidebar={sidebar} />);

      expect(screen.getByText("Test Content")).toBeInTheDocument();
      expect(screen.getByText("Test Sidebar")).toBeInTheDocument();
    });
  });
});
