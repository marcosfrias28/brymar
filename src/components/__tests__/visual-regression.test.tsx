import React from "react";
import { render } from "@testing-library/react";
import { DashboardPageLayout } from "../layout/dashboard-page-layout";
import { ContentGrid } from "../layout/content-grid";
import { PageHeader } from "../layout/page-header";
import { AdminSidebar } from "../admin-sidebar";
import { BreadcrumbItem } from "@/types/layout";

// Mock dependencies
jest.mock("@/hooks/use-responsive", () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
    isMobileOrTablet: false,
  }),
}));

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

describe("Visual Regression Tests", () => {
  describe("Layout Consistency", () => {
    it("renders consistent DashboardPageLayout structure", () => {
      const { container } = render(
        <DashboardPageLayout title="Test Page">
          <div>Content</div>
        </DashboardPageLayout>
      );

      // Check for consistent structure
      expect(container.firstChild).toHaveClass(
        "flex",
        "flex-col",
        "min-h-screen",
        "bg-background"
      );

      // Check for skip link
      const skipLink = container.querySelector('a[href="#main-content"]');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveClass("sr-only");

      // Check for main content
      const mainContent = container.querySelector("#main-content");
      expect(mainContent).toBeInTheDocument();
      expect(mainContent).toHaveAttribute("role", "main");
    });

    it("renders consistent PageHeader structure", () => {
      const { container } = render(
        <PageHeader title="Test Title" description="Test Description" />
      );

      // Check for consistent header structure
      expect(container.firstChild).toHaveClass(
        "space-y-4",
        "pb-6",
        "border-b",
        "border-border"
      );

      // Check title styling
      const title = container.querySelector("h1");
      expect(title).toHaveClass(
        "text-3xl",
        "font-bold",
        "tracking-tight",
        "font-serif"
      );

      // Check description styling
      const description = container.querySelector("p");
      expect(description).toHaveClass(
        "text-muted-foreground",
        "text-base",
        "max-w-2xl"
      );
    });

    it("renders consistent ContentGrid structure", () => {
      const { container } = render(
        <ContentGrid>
          <div>Content</div>
        </ContentGrid>
      );

      // Check for consistent spacing
      expect(container.firstChild).toHaveClass(
        "w-full",
        "max-w-full",
        "space-y-6"
      );
    });

    it("renders consistent AdminSidebar structure", () => {
      const { container } = render(<AdminSidebar />);

      // Check for sidebar structure
      const sidebar =
        container.querySelector("[data-sidebar]") || container.firstChild;
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe("Color Scheme Consistency", () => {
    it("applies consistent color classes in DashboardPageLayout", () => {
      const { container } = render(
        <DashboardPageLayout title="Test Page">
          <div>Content</div>
        </DashboardPageLayout>
      );

      expect(container.firstChild).toHaveClass("bg-background");
    });

    it("applies consistent color classes in PageHeader", () => {
      const { container } = render(<PageHeader title="Test Title" />);

      const title = container.querySelector("h1");
      expect(title).toHaveClass("text-foreground");

      const border = container.querySelector(".border-border");
      expect(border).toBeInTheDocument();
    });

    it("applies consistent focus ring colors", () => {
      const { container } = render(
        <DashboardPageLayout title="Test Page">
          <div>Content</div>
        </DashboardPageLayout>
      );

      const skipLink = container.querySelector('a[href="#main-content"]');
      expect(skipLink).toHaveClass("focus:ring-secondary");
    });
  });

  describe("Typography Consistency", () => {
    it("applies consistent typography in page titles", () => {
      const { container } = render(<PageHeader title="Test Title" />);

      const title = container.querySelector("h1");
      expect(title).toHaveClass(
        "text-3xl",
        "font-bold",
        "tracking-tight",
        "font-serif"
      );
    });

    it("applies consistent typography in descriptions", () => {
      const { container } = render(
        <PageHeader title="Test Title" description="Test Description" />
      );

      const description = container.querySelector("p");
      expect(description).toHaveClass("text-muted-foreground", "text-base");
    });
  });

  describe("Spacing Consistency", () => {
    it("applies consistent padding in DashboardPageLayout", () => {
      const { container } = render(
        <DashboardPageLayout title="Test Page">
          <div>Content</div>
        </DashboardPageLayout>
      );

      const pageContainer = container.querySelector(".p-3");
      expect(pageContainer).toBeInTheDocument();
      expect(pageContainer).toHaveClass("sm:p-4", "md:p-6", "lg:p-8");
    });

    it("applies consistent spacing in PageHeader", () => {
      const { container } = render(<PageHeader title="Test Title" />);

      expect(container.firstChild).toHaveClass("space-y-4", "pb-6");
    });

    it("applies consistent gaps in ContentGrid", () => {
      const { container } = render(
        <ContentGrid layout="grid">
          <div>Content</div>
        </ContentGrid>
      );

      expect(container.firstChild).toHaveClass("gap-6");
    });
  });

  describe("Layout Variants Consistency", () => {
    it("renders single column layout consistently", () => {
      const { container } = render(
        <ContentGrid layout="single">
          <div>Content</div>
        </ContentGrid>
      );

      expect(container.firstChild).toHaveClass(
        "w-full",
        "max-w-full",
        "space-y-6"
      );
    });

    it("renders two-column layout consistently", () => {
      const { container } = render(
        <ContentGrid layout="two-column">
          <div>Content</div>
        </ContentGrid>
      );

      expect(container.firstChild).toHaveClass(
        "grid",
        "grid-cols-1",
        "md:grid-cols-2",
        "gap-6"
      );
    });

    it("renders three-column layout consistently", () => {
      const { container } = render(
        <ContentGrid layout="three-column">
          <div>Content</div>
        </ContentGrid>
      );

      expect(container.firstChild).toHaveClass(
        "grid",
        "grid-cols-1",
        "sm:grid-cols-2",
        "lg:grid-cols-3",
        "gap-6"
      );
    });

    it("renders grid layout consistently", () => {
      const { container } = render(
        <ContentGrid layout="grid">
          <div>Content</div>
        </ContentGrid>
      );

      expect(container.firstChild).toHaveClass(
        "grid",
        "grid-cols-1",
        "sm:grid-cols-2",
        "md:grid-cols-3",
        "lg:grid-cols-4",
        "xl:grid-cols-5",
        "gap-6"
      );
    });
  });

  describe("Sidebar Integration Consistency", () => {
    it("renders sidebar layout consistently", () => {
      const sidebar = <div>Sidebar</div>;
      const { container } = render(
        <ContentGrid sidebar={sidebar}>
          <div>Content</div>
        </ContentGrid>
      );

      expect(container.firstChild).toHaveClass(
        "grid",
        "grid-cols-1",
        "lg:grid-cols-4",
        "gap-6"
      );

      const mainContent = container.querySelector(".lg\\:col-span-3");
      expect(mainContent).toBeInTheDocument();

      const sidebarArea = container.querySelector(".lg\\:col-span-1");
      expect(sidebarArea).toBeInTheDocument();
    });
  });

  describe("Breadcrumb Consistency", () => {
    it("renders breadcrumbs consistently", () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Current Page" },
      ];

      const { container } = render(
        <PageHeader title="Test Title" breadcrumbs={breadcrumbs} />
      );

      const breadcrumbContainer = container.querySelector(".animate-fade-in");
      expect(breadcrumbContainer).toBeInTheDocument();
    });
  });

  describe("Search Input Consistency", () => {
    it("renders search input consistently", () => {
      const { container } = render(
        <PageHeader title="Test Title" showSearch={true} />
      );

      const searchContainer = container.querySelector(".relative.group");
      expect(searchContainer).toBeInTheDocument();

      const searchIcon = container.querySelector("svg");
      expect(searchIcon).toBeInTheDocument();

      const searchInput = container.querySelector("input");
      expect(searchInput).toHaveClass(
        "pl-10",
        "w-full",
        "sm:w-64",
        "bg-background",
        "border-border"
      );
    });
  });

  describe("Animation Classes Consistency", () => {
    it("applies consistent animation classes", () => {
      const { container } = render(
        <PageHeader title="Test Title" description="Test Description" />
      );

      const animatedElements = container.querySelectorAll(".animate-fade-in");
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility Consistency", () => {
    it("maintains consistent ARIA labels", () => {
      const { container } = render(
        <DashboardPageLayout title="Test Page">
          <div>Content</div>
        </DashboardPageLayout>
      );

      const main = container.querySelector("main");
      expect(main).toHaveAttribute(
        "aria-label",
        "Test Page - Contenido principal"
      );
      expect(main).toHaveAttribute("role", "main");

      const banner = container.querySelector('[role="banner"]');
      expect(banner).toBeInTheDocument();
    });

    it("maintains consistent focus management", () => {
      const { container } = render(
        <DashboardPageLayout title="Test Page">
          <div>Content</div>
        </DashboardPageLayout>
      );

      const skipLink = container.querySelector('a[href="#main-content"]');
      expect(skipLink).toHaveClass(
        "focus:not-sr-only",
        "focus:absolute",
        "focus:top-4",
        "focus:left-4",
        "focus:z-50"
      );
    });
  });
});
