/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useAdmin } from "@/hooks/use-admin";

// Mock the wizard pages
jest.mock("next/navigation");
jest.mock("@/hooks/use-user");
jest.mock("@/hooks/use-admin");
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

// Mock wizard components
jest.mock("@/components/wizard/land/land-wizard", () => ({
  LandWizard: ({ onComplete, onCancel }: any) => (
    <div>
      <div>Land Wizard Component</div>
      <button onClick={() => onComplete("land-123")}>Complete</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

jest.mock("@/components/wizard/blog/blog-wizard", () => ({
  BlogWizard: ({ onComplete, onCancel }: any) => (
    <div>
      <div>Blog Wizard Component</div>
      <button onClick={() => onComplete({ title: "Test Blog" })}>
        Complete
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

jest.mock("@/components/wizard", () => ({
  PropertyWizard: ({ onComplete }: any) => (
    <div>
      <div>Property Wizard Component</div>
      <button onClick={() => onComplete({ title: "Test Property" })}>
        Complete
      </button>
    </div>
  ),
}));

// Mock layout components
jest.mock("@/components/layout/dashboard-page-layout", () => ({
  DashboardPageLayout: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/auth/route-guard", () => ({
  RouteGuard: ({ children, requiredPermission }: any) => {
    const { hasPermission } = require("@/hooks/use-admin")();
    return hasPermission(requiredPermission) ? (
      children
    ) : (
      <div>Access Denied</div>
    );
  },
}));

// Mock error boundary and recovery components
jest.mock("@/components/wizard/wizard-error-boundary", () => ({
  WizardErrorBoundaryWrapper: ({ children }: any) => children,
}));

jest.mock("@/components/wizard/comprehensive-error-recovery", () => ({
  ComprehensiveErrorRecovery: ({ children }: any) => children,
}));

jest.mock("@/components/wizard/network-aware-wizard", () => ({
  NetworkAwareWizard: ({ children }: any) => children,
}));

jest.mock("@/components/wizard/shared/consistent-navigation", () => ({
  generateWizardBreadcrumbs: () => [],
  ConsistentLoadingState: () => <div>Loading...</div>,
  ConsistentErrorState: () => <div>Error State</div>,
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();

describe("Wizard Permission Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });
  });

  describe("Land Wizard Permission Integration", () => {
    it("should allow access for users with lands.manage permission", async () => {
      const mockUser = {
        id: "agent-id",
        role: "agent",
        email: "agent@test.com",
        emailVerified: true,
      };

      (useUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
      });

      (useAdmin as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        hasPermission: jest.fn((permission) => permission === "lands.manage"),
        canAccessRoute: jest.fn(() => true),
        hasRole: jest.fn((role) => role === "agent"),
        isAdmin: false,
        isAgent: true,
        isUser: false,
        permissions: ["lands.manage"],
      });

      // Import and render the component
      const NewLandPage =
        require("@/app/(dashboard)/dashboard/lands/new/page").default;
      render(<NewLandPage />);

      expect(screen.getByText("Land Wizard Component")).toBeInTheDocument();
    });

    it("should deny access for users without lands.manage permission", async () => {
      const mockUser = {
        id: "user-id",
        role: "user",
        email: "user@test.com",
        emailVerified: true,
      };

      (useUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
      });

      (useAdmin as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        hasPermission: jest.fn(() => false),
        canAccessRoute: jest.fn(() => false),
        hasRole: jest.fn((role) => role === "user"),
        isAdmin: false,
        isAgent: false,
        isUser: true,
        permissions: ["lands.view"],
      });

      const NewLandPage =
        require("@/app/(dashboard)/dashboard/lands/new/page").default;
      render(<NewLandPage />);

      expect(screen.getByText("Access Denied")).toBeInTheDocument();
    });

    it("should handle land wizard completion with proper user context", async () => {
      const mockUser = {
        id: "agent-id",
        role: "agent",
        email: "agent@test.com",
        emailVerified: true,
      };

      (useUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
      });

      (useAdmin as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        hasPermission: jest.fn(() => true),
        canAccessRoute: jest.fn(() => true),
        hasRole: jest.fn((role) => role === "agent"),
        isAdmin: false,
        isAgent: true,
        isUser: false,
        permissions: ["lands.manage"],
      });

      const NewLandPage =
        require("@/app/(dashboard)/dashboard/lands/new/page").default;
      render(<NewLandPage />);

      const completeButton = screen.getByText("Complete");
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard/lands/land-123");
      });
    });
  });

  describe("Blog Wizard Permission Integration", () => {
    it("should allow access for users with blog.manage permission", async () => {
      const mockUser = {
        id: "admin-id",
        role: "admin",
        email: "admin@test.com",
        emailVerified: true,
      };

      (useUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
      });

      (useAdmin as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        hasPermission: jest.fn((permission) => permission === "blog.manage"),
        canAccessRoute: jest.fn(() => true),
        hasRole: jest.fn((role) => role === "admin"),
        isAdmin: true,
        isAgent: false,
        isUser: false,
        permissions: ["blog.manage"],
      });

      const NewBlogPage =
        require("@/app/(dashboard)/dashboard/blog/new/page").default;
      render(<NewBlogPage />);

      expect(screen.getByText("Blog Wizard Component")).toBeInTheDocument();
    });

    it("should deny access for agents without blog.manage permission", async () => {
      const mockUser = {
        id: "agent-id",
        role: "agent",
        email: "agent@test.com",
        emailVerified: true,
      };

      (useUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
      });

      (useAdmin as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        hasPermission: jest.fn((permission) => permission !== "blog.manage"),
        canAccessRoute: jest.fn(() => false),
        hasRole: jest.fn((role) => role === "agent"),
        isAdmin: false,
        isAgent: true,
        isUser: false,
        permissions: ["properties.manage", "lands.manage"],
      });

      const NewBlogPage =
        require("@/app/(dashboard)/dashboard/blog/new/page").default;
      render(<NewBlogPage />);

      expect(screen.getByText("Access Denied")).toBeInTheDocument();
    });
  });

  describe("Property Wizard Permission Integration", () => {
    it("should allow access for users with properties.manage permission", async () => {
      const mockUser = {
        id: "agent-id",
        role: "agent",
        email: "agent@test.com",
        emailVerified: true,
      };

      (useUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
      });

      (useAdmin as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        hasPermission: jest.fn(
          (permission) => permission === "properties.manage"
        ),
        canAccessRoute: jest.fn(() => true),
        hasRole: jest.fn((role) => role === "agent"),
        isAdmin: false,
        isAgent: true,
        isUser: false,
        permissions: ["properties.manage"],
      });

      const NewPropertyPage =
        require("@/app/(dashboard)/dashboard/properties/new/page").default;
      render(<NewPropertyPage />);

      expect(screen.getByText("Property Wizard Component")).toBeInTheDocument();
    });

    it("should deny access for regular users", async () => {
      const mockUser = {
        id: "user-id",
        role: "user",
        email: "user@test.com",
        emailVerified: true,
      };

      (useUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
      });

      (useAdmin as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        hasPermission: jest.fn(() => false),
        canAccessRoute: jest.fn(() => false),
        hasRole: jest.fn((role) => role === "user"),
        isAdmin: false,
        isAgent: false,
        isUser: true,
        permissions: ["properties.view"],
      });

      const NewPropertyPage =
        require("@/app/(dashboard)/dashboard/properties/new/page").default;
      render(<NewPropertyPage />);

      expect(screen.getByText("Access Denied")).toBeInTheDocument();
    });
  });

  describe("Authentication State Handling", () => {
    it("should show loading state when user authentication is pending", () => {
      (useUser as jest.Mock).mockReturnValue({
        user: null,
        loading: true,
      });

      (useAdmin as jest.Mock).mockReturnValue({
        user: null,
        loading: true,
        hasPermission: jest.fn(() => false),
        canAccessRoute: jest.fn(() => false),
        hasRole: jest.fn(() => false),
        isAdmin: false,
        isAgent: false,
        isUser: false,
        permissions: [],
      });

      const NewLandPage =
        require("@/app/(dashboard)/dashboard/lands/new/page").default;
      render(<NewLandPage />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should show error state when user is not authenticated", () => {
      (useUser as jest.Mock).mockReturnValue({
        user: null,
        loading: false,
      });

      (useAdmin as jest.Mock).mockReturnValue({
        user: null,
        loading: false,
        hasPermission: jest.fn(() => false),
        canAccessRoute: jest.fn(() => false),
        hasRole: jest.fn(() => false),
        isAdmin: false,
        isAgent: false,
        isUser: false,
        permissions: [],
      });

      const NewLandPage =
        require("@/app/(dashboard)/dashboard/lands/new/page").default;
      render(<NewLandPage />);

      expect(screen.getByText("Error State")).toBeInTheDocument();
    });
  });

  describe("User Context Validation", () => {
    it("should pass correct user ID to wizard components", () => {
      const mockUser = {
        id: "test-user-id",
        role: "agent",
        email: "agent@test.com",
        emailVerified: true,
      };

      (useUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
      });

      (useAdmin as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        hasPermission: jest.fn(() => true),
        canAccessRoute: jest.fn(() => true),
        hasRole: jest.fn((role) => role === "agent"),
        isAdmin: false,
        isAgent: true,
        isUser: false,
        permissions: ["lands.manage"],
      });

      // Mock the LandWizard to capture props
      const mockLandWizard = jest.fn(() => <div>Land Wizard</div>);
      jest.doMock("@/components/wizard/land/land-wizard", () => ({
        LandWizard: mockLandWizard,
      }));

      const NewLandPage =
        require("@/app/(dashboard)/dashboard/lands/new/page").default;
      render(<NewLandPage />);

      // Verify that the wizard receives the correct user ID
      expect(mockLandWizard).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "test-user-id",
        }),
        expect.anything()
      );
    });
  });
});
