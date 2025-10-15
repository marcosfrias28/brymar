import React from "react";
import { render, screen } from "@testing-library/react";
import { DashboardPageLayout } from "../layout/dashboard-page-layout";
import { ContentGrid } from "../layout/content-grid";
import { PageHeader } from "../layout/page-header";
import { AdminSidebar } from "../admin-sidebar";

// Mock responsive hook with different screen sizes
const mockUseResponsive = jest.fn();

jest.mock("@/hooks/use-responsive", () => ({
  useResponsive: () => mockUseResponsive(),
}));

// Mock other dependencies
jest.mock("@/hooks/use-admin", () => ({
  useAdmin: () => ({
    canManageUsers: true,
    canAccessDashboard: true,
    canViewAnalytics: true,
    canManageBlog: true,
    isAdmin: true,
    user: null,
  }),
}));

jest.mock("@/presentation/hooks/use-user", () => ({
  useUser: () => ({
    user: {
      name: "Test User",
      email: "test@example.com",
      role: "admin",
    },
  }),
}));

jest.mock("@/components/ui/page-transition", () => ({
  PageTransition: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

jest.mock("@/components/nav-main", () => ({
  NavMain: ({ items }: any) => <div data-testid="nav-main">Navigation</div>,
}));

jest.mock("@/components/nav-documents", () => ({
  NavDocuments: ({ items }: any) => (
    <div data-testid="nav-documents">Documents</div>
  ),
}));

jest.mock("@/components/nav-secondary", () => ({
  NavSecondary: ({ items }: any) => (
    <div data-testid="nav-secondary">Secondary</div>
  ),
}));

jest.mock("@/components/nav-user", () => ({
  NavUser: ({ user }: any) => <div data-testid="nav-user">User</div>,
}));

jest.mock("@/components/ui/logo", () => {
  return function Logo() {
    return <div data-testid="logo">Logo</div>;
  };
});

describe("Responsive Behavior Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Mobile Responsive Behavior", () => {
    beforeEach(() => {
      mockUseResponsive.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isMobileOrTablet: true,
      });
    });

    it("applies mobile spacing in DashboardPageLayout", () => {
      const { container } = render(
        <DashboardPageLayout title="Test Page">
          <div>Content</div>
        </DashboardPageLayout>
      );

      // Check for mobile padding classes
      const pageContainer = container.querySelector(".p-3");
      expect(pageContainer).toBeInTheDocument();

      // Check for mobile spacing
      const spacingContainer = container.querySelector(".space-y-3");
      expect(spacingContainer).toBeInTheDocument();
    });

    it("applies mobile spacing in ContentGrid", () => {
      const { container } = render(
        <ContentGrid>
          <div>Content</div>
        </ContentGrid>
      );

      expect(container.firstChild).toHaveClass("space-y-3");
    });

    it("applies mobile gap in grid layouts", () => {
      const { container } = render(
        <ContentGrid layout="grid">
          <div>Content</div>
        </ContentGrid>
      );

      expect(container.firstChild).toHaveClass("gap-3");
    });

    it("reorders sidebar on mobile", () => {
      const sidebar = <div>Sidebar</div>;
      const { container } = render(
        <ContentGrid sidebar={sidebar}>
          <div>Content</div>
        </ContentGrid>
      );

      const sidebarElement = container.querySelector(".lg\\:col-span-1");
      expect(sidebarElement).toHaveClass("order-last", "mt-4");
    });

    it("does not apply sticky positioning on mobile", () => {
      const sidebar = <div>Sidebar</div>;
      const { container } = render(
        <ContentGrid sidebar={sidebar}>
          <div>Content</div>
        </ContentGrid>
      );

      const stickyElement = container.querySelector(".sticky");
      expect(stickyElement).not.toBeInTheDocument();
    });

    it("applies responsive search input width", () => {
      render(<PageHeader title="Test" showSearch={true} />);

      const searchInput = screen.getByPlaceholderText("Buscar...");
      expect(searchInput).toHaveClass("w-full", "sm:w-64");
    });
  });

  describe("Tablet Responsive Behavior", () => {
    beforeEach(() => {
      mockUseResponsive.mockReturnValue({
        isMobile: false,
        isTablet: true,
        isMobileOrTablet: true,
      });
    });

    it("applies tablet spacing in DashboardPageLayout", () => {
      const { container } = render(
        <DashboardPageLayout title="Test Page">
          <div>Content</div>
        </DashboardPageLayout>
      );

      // Check for tablet padding
      const pageContainer = container.querySelector(".sm\\:p-4");
      expect(pageContainer).toBeInTheDocument();

      // Check for tablet spacing
      const spacingContainer = container.querySelector(".space-y-4");
      expect(spacingContainer).toBeInTheDocument();
    });

    it("applies tablet spacing in ContentGrid", () => {
      const { container } = render(
        <ContentGrid>
          <div>Content</div>
        </ContentGrid>
      );

      expect(container.firstChild).toHaveClass("space-y-4");
    });

    it("applies tablet gap in grid layouts", () => {
      const { container } = render(
        <ContentGrid layout="grid">
          <div>Content</div>
        </ContentGrid>
      );

      expect(container.firstChild).toHaveClass("gap-4");
    });

    it("reorders sidebar on tablet", () => {
      const sidebar = <div>Sidebar</div>;
      const { container } = render(
        <ContentGrid sidebar={sidebar}>
          <div>Content</div>
        </ContentGrid>
      );

      const sidebarElement = container.querySelector(".lg\\:col-span-1");
      expect(sidebarElement).toHaveClass("order-last", "mt-4");
    });

    it("handles three-column layout on tablet", () => {
      const { container } = render(
        <ContentGrid layout="three-column">
          <div>Content</div>
        </ContentGrid>
      );

      expect(container.firstChild).toHaveClass(
        "sm:grid-cols-2",
        "lg:grid-cols-3"
      );
    });
  });

  describe("Desktop Responsive Behavior", () => {
    beforeEach(() => {
      mockUseResponsive.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isMobileOrTablet: false,
      });
    });

    it("applies desktop spacing in DashboardPageLayout", () => {
      const { container } = render(
        <DashboardPageLayout title="Test Page">
          <div>Content</div>
        </DashboardPageLayout>
      );

      // Check for desktop padding
      const pageContainer = container.querySelector(".lg\\:p-8");
      expect(pageContainer).toBeInTheDocument();

      // Check for desktop spacing
      const spacingContainer = container.querySelector(".space-y-6");
      expect(spacingContainer).toBeInTheDocument();
    });

    it("applies desktop spacing in ContentGrid", () => {
      const { container } = render(
        <ContentGrid>
          <div>Content</div>
        </ContentGrid>
      );

      expect(container.firstChild).toHaveClass("space-y-6");
    });

    it("applies desktop gap in grid layouts", () => {
      const { container } = render(
        <ContentGrid layout="grid">
          <div>Content</div>
        </ContentGrid>
      );

      expect(container.firstChild).toHaveClass("gap-6");
    });

    it("applies sticky positioning on desktop", () => {
      const sidebar = <div>Sidebar</div>;
      const { container } = render(
        <ContentGrid sidebar={sidebar}>
          <div>Content</div>
        </ContentGrid>
      );

      const stickyElement = container.querySelector(".sticky");
      expect(stickyElement).toBeInTheDocument();
      expect(stickyElement).toHaveClass("top-6");
    });

    it("does not reorder sidebar on desktop", () => {
      const sidebar = <div>Sidebar</div>;
      const { container } = render(
        <ContentGrid sidebar={sidebar}>
          <div>Content</div>
        </ContentGrid>
      );

      const sidebarElement = container.querySelector(".lg\\:col-span-1");
      expect(sidebarElement).not.toHaveClass("order-last");
    });
  });

  describe("Grid Layout Responsive Behavior", () => {
    it("handles single column on mobile", () => {
      mockUseResponsive.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isMobileOrTablet: true,
      });

      const { container } = render(
        <ContentGrid layout="grid">
          <div>Content</div>
        </ContentGrid>
      );

      expect(container.firstChild).toHaveClass("grid-cols-1");
    });

    it("handles two columns on tablet", () => {
      mockUseResponsive.mockReturnValue({
        isMobile: false,
        isTablet: true,
        isMobileOrTablet: true,
      });

      const { container } = render(
        <ContentGrid layout="grid">
          <div>Content</div>
        </ContentGrid>
      );

      expect(container.firstChild).toHaveClass("sm:grid-cols-2");
    });

    it("handles multiple columns on desktop", () => {
      mockUseResponsive.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isMobileOrTablet: false,
      });

      const { container } = render(
        <ContentGrid layout="grid">
          <div>Content</div>
        </ContentGrid>
      );

      expect(container.firstChild).toHaveClass(
        "grid-cols-1",
        "sm:grid-cols-2",
        "md:grid-cols-3",
        "lg:grid-cols-4",
        "xl:grid-cols-5"
      );
    });
  });

  describe("Two-Column Layout Responsive Behavior", () => {
    it("stacks columns on mobile", () => {
      mockUseResponsive.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isMobileOrTablet: true,
      });

      const { container } = render(
        <ContentGrid layout="two-column">
          <div>Content</div>
        </ContentGrid>
      );

      expect(container.firstChild).toHaveClass("grid-cols-1");
    });

    it("shows two columns on desktop", () => {
      mockUseResponsive.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isMobileOrTablet: false,
      });

      const { container } = render(
        <ContentGrid layout="two-column">
          <div>Content</div>
        </ContentGrid>
      );

      expect(container.firstChild).toHaveClass("md:grid-cols-2");
    });
  });

  describe("Header Responsive Behavior", () => {
    it("stacks header elements on mobile", () => {
      mockUseResponsive.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isMobileOrTablet: true,
      });

      const { container } = render(
        <PageHeader
          title="Test"
          actions={<button>Action</button>}
          showSearch={true}
        />
      );

      const headerContent = container.querySelector(".flex.flex-col");
      expect(headerContent).toHaveClass("sm:flex-row");
    });

    it("arranges header elements horizontally on desktop", () => {
      mockUseResponsive.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isMobileOrTablet: false,
      });

      const { container } = render(
        <PageHeader
          title="Test"
          actions={<button>Action</button>}
          showSearch={true}
        />
      );

      const headerContent = container.querySelector(".flex.flex-col");
      expect(headerContent).toHaveClass(
        "sm:flex-row",
        "sm:items-start",
        "sm:justify-between"
      );
    });
  });
});
