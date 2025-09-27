import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DashboardPageLayout } from "../layout/dashboard-page-layout";
import { AdminSidebar } from "../admin-sidebar";
import { BreadcrumbItem } from "@/types/layout";

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/dashboard/properties",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock hooks
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

jest.mock("@/hooks/use-user", () => ({
  useUser: () => ({
    user: {
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      image: "/admin-avatar.jpg",
    },
  }),
}));

jest.mock("@/hooks/use-responsive", () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
    isMobileOrTablet: false,
  }),
}));

// Mock components
jest.mock("@/components/ui/page-transition", () => ({
  PageTransition: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/nav-main", () => ({
  NavMain: ({ items }: any) => (
    <nav data-testid="nav-main">
      {items.map((item: any, index: number) => (
        <div key={index}>
          <a
            href={item.url}
            data-testid={`nav-link-${item.title
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
            onClick={(e) => {
              e.preventDefault();
              mockPush(item.url);
            }}
          >
            {item.title}
          </a>
          {item.children && (
            <div
              data-testid={`submenu-${item.title
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              {item.children.map((child: any, childIndex: number) => (
                <a
                  key={childIndex}
                  href={child.url}
                  data-testid={`nav-link-${child.title
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  onClick={(e) => {
                    e.preventDefault();
                    mockPush(child.url);
                  }}
                >
                  {child.title}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  ),
}));

jest.mock("@/components/nav-documents", () => ({
  NavDocuments: ({ items }: any) => (
    <nav data-testid="nav-documents">
      {items.map((item: any, index: number) => (
        <a
          key={index}
          href={item.url}
          data-testid={`doc-link-${item.name
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
          onClick={(e) => {
            e.preventDefault();
            mockPush(item.url);
          }}
        >
          {item.name}
        </a>
      ))}
    </nav>
  ),
}));

jest.mock("@/components/nav-secondary", () => ({
  NavSecondary: ({ items }: any) => (
    <nav data-testid="nav-secondary">
      {items.map((item: any, index: number) => (
        <a
          key={index}
          href={item.url}
          data-testid={`secondary-link-${item.title
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
          onClick={(e) => {
            e.preventDefault();
            mockPush(item.url);
          }}
        >
          {item.title}
        </a>
      ))}
    </nav>
  ),
}));

jest.mock("@/components/nav-user", () => ({
  NavUser: ({ user }: any) => (
    <div data-testid="nav-user">
      <span>{user.name}</span>
      <button
        data-testid="user-menu-button"
        onClick={() => mockPush("/profile")}
      >
        User Menu
      </button>
    </div>
  ),
}));

jest.mock("@/components/ui/logo", () => {
  return function Logo() {
    return (
      <a
        href="/dashboard"
        data-testid="logo-link"
        onClick={(e) => {
          e.preventDefault();
          mockPush("/dashboard");
        }}
      >
        Brymar Logo
      </a>
    );
  };
});

describe("Navigation Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Sidebar Navigation", () => {
    it("navigates to dashboard when logo is clicked", async () => {
      render(<AdminSidebar />);

      const logoLink = screen.getByTestId("logo-link");
      fireEvent.click(logoLink);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("navigates to main navigation items", async () => {
      render(<AdminSidebar />);

      const dashboardLink = screen.getByTestId("nav-link-dashboard");
      fireEvent.click(dashboardLink);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("navigates to properties section", async () => {
      render(<AdminSidebar />);

      const propertiesLink = screen.getByTestId("nav-link-propiedades");
      fireEvent.click(propertiesLink);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard/properties");
      });
    });

    it("navigates to property creation page", async () => {
      render(<AdminSidebar />);

      const newPropertyLink = screen.getByTestId("nav-link-nueva-propiedad");
      fireEvent.click(newPropertyLink);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard/properties/new");
      });
    });

    it("navigates to lands section", async () => {
      render(<AdminSidebar />);

      const landsLink = screen.getByTestId("nav-link-terrenos");
      fireEvent.click(landsLink);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard/lands");
      });
    });

    it("navigates to land creation page", async () => {
      render(<AdminSidebar />);

      const newLandLink = screen.getByTestId("nav-link-nuevo-terreno");
      fireEvent.click(newLandLink);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard/lands/new");
      });
    });

    it("navigates to blog section", async () => {
      render(<AdminSidebar />);

      const blogLink = screen.getByTestId("nav-link-blog");
      fireEvent.click(blogLink);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard/blog");
      });
    });

    it("navigates to blog creation page", async () => {
      render(<AdminSidebar />);

      const newBlogLink = screen.getByTestId("nav-link-nuevo-artículo");
      fireEvent.click(newBlogLink);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard/blog/new");
      });
    });

    it("navigates to sections page", async () => {
      render(<AdminSidebar />);

      const sectionsLink = screen.getByTestId("nav-link-secciones");
      fireEvent.click(sectionsLink);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard/sections");
      });
    });
  });

  describe("Management Navigation", () => {
    it("navigates to user management", async () => {
      render(<AdminSidebar />);

      const userManagementLink = screen.getByTestId(
        "doc-link-gestión-de-usuarios"
      );
      fireEvent.click(userManagementLink);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard/users");
      });
    });

    it("navigates to analytics", async () => {
      render(<AdminSidebar />);

      const analyticsLink = screen.getByTestId("doc-link-análisis-y-reportes");
      fireEvent.click(analyticsLink);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard/analytics");
      });
    });

    it("navigates to database management", async () => {
      render(<AdminSidebar />);

      const databaseLink = screen.getByTestId("doc-link-base-de-datos");
      fireEvent.click(databaseLink);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard/database");
      });
    });

    it("navigates to administration", async () => {
      render(<AdminSidebar />);

      const adminLink = screen.getByTestId("doc-link-administración");
      fireEvent.click(adminLink);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard/admin");
      });
    });
  });

  describe("Secondary Navigation", () => {
    it("navigates to search", async () => {
      render(<AdminSidebar />);

      const searchLink = screen.getByTestId("secondary-link-buscar");
      fireEvent.click(searchLink);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/search");
      });
    });

    it("navigates to settings", async () => {
      render(<AdminSidebar />);

      const settingsLink = screen.getByTestId("secondary-link-configuración");
      fireEvent.click(settingsLink);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard/settings");
      });
    });

    it("navigates to help", async () => {
      render(<AdminSidebar />);

      const helpLink = screen.getByTestId("secondary-link-ayuda");
      fireEvent.click(helpLink);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/help");
      });
    });
  });

  describe("User Navigation", () => {
    it("navigates to user profile", async () => {
      render(<AdminSidebar />);

      const userMenuButton = screen.getByTestId("user-menu-button");
      fireEvent.click(userMenuButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/profile");
      });
    });
  });

  describe("Breadcrumb Navigation", () => {
    it("renders breadcrumbs and handles navigation", async () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Properties", href: "/dashboard/properties" },
        { label: "Edit Property" },
      ];

      render(
        <DashboardPageLayout title="Edit Property" breadcrumbs={breadcrumbs}>
          <div>Property form content</div>
        </DashboardPageLayout>
      );

      // Check breadcrumbs are rendered
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Properties")).toBeInTheDocument();
      expect(screen.getByText("Edit Property")).toBeInTheDocument();
    });
  });

  describe("Layout Integration with Navigation", () => {
    it("integrates sidebar with page layout", () => {
      const sidebar = <AdminSidebar />;

      render(
        <DashboardPageLayout title="Properties" sidebar={sidebar}>
          <div>Properties content</div>
        </DashboardPageLayout>
      );

      // Check both layout and sidebar are rendered
      expect(screen.getByText("Properties")).toBeInTheDocument();
      expect(screen.getByText("Properties content")).toBeInTheDocument();
      expect(screen.getByTestId("nav-main")).toBeInTheDocument();
      expect(screen.getByTestId("logo-link")).toBeInTheDocument();
    });

    it("handles navigation state consistency", async () => {
      const sidebar = <AdminSidebar />;

      render(
        <DashboardPageLayout title="Dashboard" sidebar={sidebar}>
          <div>Dashboard content</div>
        </DashboardPageLayout>
      );

      // Navigate to properties
      const propertiesLink = screen.getByTestId("nav-link-propiedades");
      fireEvent.click(propertiesLink);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard/properties");
      });
    });
  });
});
