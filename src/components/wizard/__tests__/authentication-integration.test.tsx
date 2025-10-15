/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useUser } from "@/presentation/hooks/use-user";
import { useAdmin } from "@/hooks/use-admin";

// Mock all dependencies
jest.mock("next/navigation");
jest.mock("@/presentation/hooks/use-user");
jest.mock("@/hooks/use-admin");
jest.mock("sonner");

// Mock wizard actions
jest.mock("@/lib/actions/land-wizard-actions", () => ({
  createLandFromWizard: jest.fn(),
  saveLandDraft: jest.fn(),
  loadLandDraft: jest.fn(),
  deleteLandDraft: jest.fn(),
}));

jest.mock("@/lib/actions/blog-wizard-actions", () => ({
  createBlogFromWizard: jest.fn(),
  saveBlogDraft: jest.fn(),
  loadBlogDraft: jest.fn(),
  deleteBlogDraft: jest.fn(),
}));

jest.mock("@/lib/actions/wizard-actions", () => ({
  publishProperty: jest.fn(),
  saveDraft: jest.fn(),
  loadDraft: jest.fn(),
}));

// Mock components
jest.mock("@/components/wizard/land/land-wizard", () => ({
  LandWizard: ({ userId, onComplete, onCancel }: any) => (
    <div data-testid="land-wizard">
      <div>User ID: {userId}</div>
      <button onClick={() => onComplete("land-123")}>Complete Land</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

jest.mock("@/components/wizard/blog/blog-wizard", () => ({
  BlogWizard: ({ userId, onComplete, onCancel }: any) => (
    <div data-testid="blog-wizard">
      <div>User ID: {userId}</div>
      <button onClick={() => onComplete({ title: "Test Blog" })}>
        Complete Blog
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

jest.mock("@/components/wizard", () => ({
  PropertyWizard: ({ onComplete }: any) => (
    <div data-testid="property-wizard">
      <button onClick={() => onComplete({ title: "Test Property" })}>
        Complete Property
      </button>
    </div>
  ),
}));

jest.mock("@/components/layout/dashboard-page-layout", () => ({
  DashboardPageLayout: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/auth/route-guard", () => ({
  RouteGuard: ({ children, requiredPermission }: any) => {
    const { hasPermission } = require("@/hooks/use-admin")();
    if (!hasPermission(requiredPermission)) {
      return (
        <div data-testid="access-denied">
          Access Denied: {requiredPermission}
        </div>
      );
    }
    return <div data-testid="route-guard-passed">{children}</div>;
  },
}));

// Mock other components
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
  ConsistentLoadingState: ({ title }: any) => (
    <div data-testid="loading-state">{title}</div>
  ),
  ConsistentErrorState: ({ title }: any) => (
    <div data-testid="error-state">{title}</div>
  ),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();

describe("Authentication Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });
  });

  describe("Complete Authentication Flow", () => {
    it("should handle complete authentication flow for land wizard", async () => {
      // Step 1: Unauthenticated user
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
      const { rerender } = render(<NewLandPage />);

      // Should show loading state
      expect(screen.getByTestId("loading-state")).toBeInTheDocument();

      // Step 2: Authentication completes - user has permission
      const authenticatedUser = {
        id: "agent-123",
        role: "agent",
        email: "agent@test.com",
        emailVerified: true,
      };

      (useUser as jest.Mock).mockReturnValue({
        user: authenticatedUser,
        loading: false,
      });

      (useAdmin as jest.Mock).mockReturnValue({
        user: authenticatedUser,
        loading: false,
        hasPermission: jest.fn((permission) => permission === "lands.manage"),
        canAccessRoute: jest.fn(() => true),
        hasRole: jest.fn((role) => role === "agent"),
        isAdmin: false,
        isAgent: true,
        isUser: false,
        permissions: ["lands.manage"],
      });

      rerender(<NewLandPage />);

      // Should show wizard with correct user ID
      expect(screen.getByTestId("land-wizard")).toBeInTheDocument();
      expect(screen.getByText("User ID: agent-123")).toBeInTheDocument();

      // Step 3: Complete the wizard
      const completeButton = screen.getByText("Complete Land");
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard/lands/land-123");
      });
    });

    it("should handle authentication failure and redirect", async () => {
      // User without permission
      const unauthorizedUser = {
        id: "user-123",
        role: "user",
        email: "user@test.com",
        emailVerified: true,
      };

      (useUser as jest.Mock).mockReturnValue({
        user: unauthorizedUser,
        loading: false,
      });

      (useAdmin as jest.Mock).mockReturnValue({
        user: unauthorizedUser,
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

      // Should show access denied
      expect(screen.getByTestId("access-denied")).toBeInTheDocument();
      expect(
        screen.getByText("Access Denied: lands.manage")
      ).toBeInTheDocument();
    });
  });

  describe("Role-based Permission Validation", () => {
    const testCases = [
      {
        role: "admin",
        permissions: ["properties.manage", "lands.manage", "blog.manage"],
        shouldAccess: {
          properties: true,
          lands: true,
          blog: true,
        },
      },
      {
        role: "agent",
        permissions: ["properties.manage", "lands.manage"],
        shouldAccess: {
          properties: true,
          lands: true,
          blog: false,
        },
      },
      {
        role: "user",
        permissions: ["properties.view", "lands.view", "blog.view"],
        shouldAccess: {
          properties: false,
          lands: false,
          blog: false,
        },
      },
    ];

    testCases.forEach(({ role, permissions, shouldAccess }) => {
      describe(`${role} role`, () => {
        const mockUser = {
          id: `${role}-123`,
          role,
          email: `${role}@test.com`,
          emailVerified: true,
        };

        beforeEach(() => {
          (useUser as jest.Mock).mockReturnValue({
            user: mockUser,
            loading: false,
          });

          (useAdmin as jest.Mock).mockReturnValue({
            user: mockUser,
            loading: false,
            hasPermission: jest.fn((permission) =>
              permissions.includes(permission)
            ),
            canAccessRoute: jest.fn(() => true),
            hasRole: jest.fn((userRole) => userRole === role),
            isAdmin: role === "admin",
            isAgent: role === "agent",
            isUser: role === "user",
            permissions,
          });
        });

        it(`should ${
          shouldAccess.properties ? "allow" : "deny"
        } access to property wizard`, () => {
          const NewPropertyPage =
            require("@/app/(dashboard)/dashboard/properties/new/page").default;
          render(<NewPropertyPage />);

          if (shouldAccess.properties) {
            expect(screen.getByTestId("property-wizard")).toBeInTheDocument();
          } else {
            expect(screen.getByTestId("access-denied")).toBeInTheDocument();
          }
        });

        it(`should ${
          shouldAccess.lands ? "allow" : "deny"
        } access to land wizard`, () => {
          const NewLandPage =
            require("@/app/(dashboard)/dashboard/lands/new/page").default;
          render(<NewLandPage />);

          if (shouldAccess.lands) {
            expect(screen.getByTestId("land-wizard")).toBeInTheDocument();
          } else {
            expect(screen.getByTestId("access-denied")).toBeInTheDocument();
          }
        });

        it(`should ${
          shouldAccess.blog ? "allow" : "deny"
        } access to blog wizard`, () => {
          const NewBlogPage =
            require("@/app/(dashboard)/dashboard/blog/new/page").default;
          render(<NewBlogPage />);

          if (shouldAccess.blog) {
            expect(screen.getByTestId("blog-wizard")).toBeInTheDocument();
          } else {
            expect(screen.getByTestId("access-denied")).toBeInTheDocument();
          }
        });
      });
    });
  });

  describe("User Context Propagation", () => {
    it("should propagate user context correctly to all wizard components", () => {
      const mockUser = {
        id: "test-user-456",
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
        permissions: ["properties.manage", "lands.manage"],
      });

      // Test land wizard
      const NewLandPage =
        require("@/app/(dashboard)/dashboard/lands/new/page").default;
      const { unmount } = render(<NewLandPage />);
      expect(screen.getByText("User ID: test-user-456")).toBeInTheDocument();
      unmount();

      // Test blog wizard (should be denied for agent)
      const NewBlogPage =
        require("@/app/(dashboard)/dashboard/blog/new/page").default;
      render(<NewBlogPage />);
      expect(screen.getByTestId("access-denied")).toBeInTheDocument();
    });
  });

  describe("Error State Handling", () => {
    it("should handle missing user ID gracefully", () => {
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

      expect(screen.getByTestId("error-state")).toBeInTheDocument();
    });

    it("should handle authentication loading state", () => {
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

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    });
  });
});
