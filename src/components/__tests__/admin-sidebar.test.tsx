import React from "react";
import { render, screen } from "@testing-library/react";
import { AdminSidebar } from "../admin-sidebar";

// Mock dependencies
jest.mock("@/hooks/use-admin", () => ({
  useAdmin: jest.fn(() => ({
    canManageUsers: false,
    canAccessDashboard: true,
    canViewAnalytics: false,
    canManageBlog: false,
    isAdmin: false,
    user: null,
  })),
}));

jest.mock("@/presentation/hooks/use-user", () => ({
  useUser: jest.fn(() => ({
    user: {
      name: "Test User",
      email: "test@example.com",
      role: "agent",
      image: "/test-avatar.jpg",
    },
  })),
}));

jest.mock("@/hooks/use-responsive", () => ({
  useResponsive: () => ({
    isMobile: false,
    isMobileOrTablet: false,
  }),
}));

jest.mock("@/components/ui/page-transition", () => ({
  PageTransition: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/nav-main", () => ({
  NavMain: ({ items }: any) => (
    <div data-testid="nav-main">
      {items.map((item: any, index: number) => (
        <div
          key={index}
          data-testid={`nav-item-${item.title.toLowerCase().replace(" ", "-")}`}
        >
          {item.title}
          {item.children && (
            <div
              data-testid={`nav-submenu-${item.title
                .toLowerCase()
                .replace(" ", "-")}`}
            >
              {item.children.map((child: any, childIndex: number) => (
                <div key={childIndex}>{child.title}</div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  ),
}));

jest.mock("@/components/nav-documents", () => ({
  NavDocuments: ({ items }: any) => (
    <div data-testid="nav-documents">
      {items.map((item: any, index: number) => (
        <div key={index}>{item.name}</div>
      ))}
    </div>
  ),
}));

jest.mock("@/components/nav-secondary", () => ({
  NavSecondary: ({ items }: any) => (
    <div data-testid="nav-secondary">
      {items.map((item: any, index: number) => (
        <div key={index}>{item.title}</div>
      ))}
    </div>
  ),
}));

jest.mock("@/components/nav-user", () => ({
  NavUser: ({ user }: any) => (
    <div data-testid="nav-user">
      <div>{user.name}</div>
      <div>{user.email}</div>
    </div>
  ),
}));

jest.mock("@/components/ui/logo", () => {
  return function Logo() {
    return <div data-testid="logo">Brymar Logo</div>;
  };
});

jest.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children, ...props }: any) => (
    <div data-testid="sidebar" {...props}>
      {children}
    </div>
  ),
  SidebarContent: ({ children }: any) => (
    <div data-testid="sidebar-content">{children}</div>
  ),
  SidebarFooter: ({ children }: any) => (
    <div data-testid="sidebar-footer">{children}</div>
  ),
  SidebarHeader: ({ children }: any) => (
    <div data-testid="sidebar-header">{children}</div>
  ),
  SidebarMenu: ({ children }: any) => (
    <div data-testid="sidebar-menu">{children}</div>
  ),
  SidebarMenuButton: ({ children, ...props }: any) => (
    <button data-testid="sidebar-menu-button" {...props}>
      {children}
    </button>
  ),
  SidebarMenuItem: ({ children }: any) => (
    <div data-testid="sidebar-menu-item">{children}</div>
  ),
}));

const { useAdmin } = require("@/hooks/use-admin");
const { useUser } = require("@/presentation/hooks/use-user");

describe("AdminSidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders the sidebar with logo", () => {
      render(<AdminSidebar />);

      expect(screen.getByTestId("logo")).toBeInTheDocument();
      expect(screen.getByText("Brymar Logo")).toBeInTheDocument();
    });

    it("renders user information", () => {
      render(<AdminSidebar />);

      expect(screen.getByTestId("nav-user")).toBeInTheDocument();
      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    it("renders main navigation", () => {
      render(<AdminSidebar />);

      expect(screen.getByTestId("nav-main")).toBeInTheDocument();
    });

    it("renders secondary navigation", () => {
      render(<AdminSidebar />);

      expect(screen.getByTestId("nav-secondary")).toBeInTheDocument();
      expect(screen.getByText("Buscar")).toBeInTheDocument();
      expect(screen.getByText("Configuración")).toBeInTheDocument();
      expect(screen.getByText("Ayuda")).toBeInTheDocument();
    });
  });

  describe("Navigation Items Based on Permissions", () => {
    it("renders basic navigation items for agent user", () => {
      render(<AdminSidebar />);

      expect(screen.getByTestId("nav-item-dashboard")).toBeInTheDocument();
      expect(screen.getByTestId("nav-item-propiedades")).toBeInTheDocument();
      expect(screen.getByTestId("nav-item-terrenos")).toBeInTheDocument();
      expect(screen.getByTestId("nav-item-secciones")).toBeInTheDocument();
    });

    it("includes property submenu items", () => {
      render(<AdminSidebar />);

      const propertiesSubmenu = screen.getByTestId("nav-submenu-propiedades");
      expect(propertiesSubmenu).toBeInTheDocument();
      expect(screen.getByText("Ver Todas")).toBeInTheDocument();
      expect(screen.getByText("Nueva Propiedad")).toBeInTheDocument();
    });

    it("includes lands submenu items", () => {
      render(<AdminSidebar />);

      const landsSubmenu = screen.getByTestId("nav-submenu-terrenos");
      expect(landsSubmenu).toBeInTheDocument();
      expect(screen.getByText("Ver Todos")).toBeInTheDocument();
      expect(screen.getByText("Nuevo Terreno")).toBeInTheDocument();
    });

    it("includes blog navigation when user has blog permissions", () => {
      useAdmin.mockReturnValue({
        canManageUsers: false,
        canAccessDashboard: true,
        canViewAnalytics: false,
        canManageBlog: true,
        isAdmin: false,
        user: null,
      });

      render(<AdminSidebar />);

      expect(screen.getByTestId("nav-item-blog")).toBeInTheDocument();
      const blogSubmenu = screen.getByTestId("nav-submenu-blog");
      expect(blogSubmenu).toBeInTheDocument();
      expect(screen.getByText("Ver Artículos")).toBeInTheDocument();
      expect(screen.getByText("Nuevo Artículo")).toBeInTheDocument();
    });

    it("does not include blog navigation when user lacks blog permissions", () => {
      useAdmin.mockReturnValue({
        canManageUsers: false,
        canAccessDashboard: true,
        canViewAnalytics: false,
        canManageBlog: false,
        isAdmin: false,
        user: null,
      });

      render(<AdminSidebar />);

      expect(screen.queryByTestId("nav-item-blog")).not.toBeInTheDocument();
    });
  });

  describe("Management Section Based on Permissions", () => {
    it("includes user management when user has permissions", () => {
      useAdmin.mockReturnValue({
        canManageUsers: true,
        canAccessDashboard: true,
        canViewAnalytics: false,
        canManageBlog: false,
        isAdmin: false,
        user: null,
      });

      render(<AdminSidebar />);

      expect(screen.getByText("Gestión de Usuarios")).toBeInTheDocument();
    });

    it("includes analytics when user has permissions", () => {
      useAdmin.mockReturnValue({
        canManageUsers: false,
        canAccessDashboard: true,
        canViewAnalytics: true,
        canManageBlog: false,
        isAdmin: false,
        user: null,
      });

      render(<AdminSidebar />);

      expect(screen.getByText("Análisis y Reportes")).toBeInTheDocument();
    });

    it("includes database access when user has dashboard access", () => {
      useAdmin.mockReturnValue({
        canManageUsers: false,
        canAccessDashboard: true,
        canViewAnalytics: false,
        canManageBlog: false,
        isAdmin: false,
        user: null,
      });

      render(<AdminSidebar />);

      expect(screen.getByText("Base de Datos")).toBeInTheDocument();
    });

    it("includes administration section for admin users", () => {
      useUser.mockReturnValue({
        user: {
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
          image: "/admin-avatar.jpg",
        },
      });

      render(<AdminSidebar />);

      expect(screen.getByText("Administración")).toBeInTheDocument();
    });

    it("does not include administration section for non-admin users", () => {
      useUser.mockReturnValue({
        user: {
          name: "Agent User",
          email: "agent@example.com",
          role: "agent",
          image: "/agent-avatar.jpg",
        },
      });

      render(<AdminSidebar />);

      expect(screen.queryByText("Administración")).not.toBeInTheDocument();
    });
  });

  describe("User Data Handling", () => {
    it("handles missing user data gracefully", () => {
      useUser.mockReturnValue({
        user: null,
      });

      render(<AdminSidebar />);

      expect(screen.getByTestId("nav-user")).toBeInTheDocument();
      expect(screen.getByText("Usuario")).toBeInTheDocument();
      expect(screen.getByText("usuario@brymar.com")).toBeInTheDocument();
    });

    it("uses provided user data when available", () => {
      useUser.mockReturnValue({
        user: {
          name: "John Doe",
          email: "john@example.com",
          role: "agent",
          image: "/john-avatar.jpg",
        },
      });

      render(<AdminSidebar />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    it("handles partial user data", () => {
      useUser.mockReturnValue({
        user: {
          name: "Jane Doe",
          email: null,
          role: "agent",
          image: null,
        },
      });

      render(<AdminSidebar />);

      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      expect(screen.getByText("usuario@brymar.com")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels", () => {
      const { container } = render(<AdminSidebar />);

      const sidebar = container.querySelector("[aria-label]");
      expect(sidebar).toHaveAttribute("aria-label");
    });

    it("renders semantic navigation elements", () => {
      render(<AdminSidebar />);

      expect(screen.getByTestId("nav-main")).toBeInTheDocument();
      expect(screen.getByTestId("nav-secondary")).toBeInTheDocument();
      expect(screen.getByTestId("nav-user")).toBeInTheDocument();
    });
  });
});
