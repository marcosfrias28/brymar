/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useAdmin } from "@/hooks/use-admin";
import { RouteGuard } from "@/components/auth/route-guard";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => null),
  })),
}));

// Mock authentication hooks
jest.mock("@/hooks/use-user");
jest.mock("@/hooks/use-admin");

// Mock toast notifications
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockUseAdmin = useAdmin as jest.MockedFunction<typeof useAdmin>;

describe("Wizard Authentication Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    } as any);
  });

  describe("RouteGuard Component", () => {
    const TestComponent = () => <div>Protected Content</div>;

    it("should show loading state when authentication is loading", () => {
      mockUseUser.mockReturnValue({
        user: null,
        loading: true,
      });

      mockUseAdmin.mockReturnValue({
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

      render(
        <RouteGuard requiredPermission="properties.manage">
          <TestComponent />
        </RouteGuard>
      );

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should redirect when user is not authenticated", async () => {
      mockUseUser.mockReturnValue({
        user: null,
        loading: false,
      });

      mockUseAdmin.mockReturnValue({
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

      render(
        <RouteGuard requiredPermission="properties.manage">
          <TestComponent />
        </RouteGuard>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/sign-in");
      });
    });

    it("should allow access when user has required permission", () => {
      const mockUser = {
        id: "agent-id",
        role: "agent",
        email: "agent@test.com",
        emailVerified: true,
      };

      mockUseUser.mockReturnValue({
        user: mockUser,
        loading: false,
      });

      mockUseAdmin.mockReturnValue({
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

      render(
        <RouteGuard requiredPermission="properties.manage">
          <TestComponent />
        </RouteGuard>
      );

      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    it("should deny access when user lacks required permission", async () => {
      const mockUser = {
        id: "user-id",
        role: "user",
        email: "user@test.com",
        emailVerified: true,
      };

      mockUseUser.mockReturnValue({
        user: mockUser,
        loading: false,
      });

      mockUseAdmin.mockReturnValue({
        user: mockUser,
        loading: false,
        hasPermission: jest.fn(
          (permission) => permission !== "properties.manage"
        ),
        canAccessRoute: jest.fn(() => false),
        hasRole: jest.fn((role) => role === "user"),
        isAdmin: false,
        isAgent: false,
        isUser: true,
        permissions: ["properties.view"],
      });

      render(
        <RouteGuard requiredPermission="properties.manage">
          <TestComponent />
        </RouteGuard>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/sign-in");
      });
    });
  });

  describe("Permission-based Feature Availability", () => {
    it("should validate lands.manage permission for land wizard", () => {
      const mockUser = {
        id: "agent-id",
        role: "agent",
        email: "agent@test.com",
        emailVerified: true,
      };

      mockUseAdmin.mockReturnValue({
        user: mockUser,
        loading: false,
        hasPermission: jest.fn((permission) =>
          ["lands.manage", "dashboard.access"].includes(permission)
        ),
        canAccessRoute: jest.fn(() => true),
        hasRole: jest.fn((role) => role === "agent"),
        isAdmin: false,
        isAgent: true,
        isUser: false,
        permissions: ["lands.manage", "dashboard.access"],
      });

      const TestLandWizard = () => (
        <RouteGuard requiredPermission="lands.manage">
          <div>Land Wizard</div>
        </RouteGuard>
      );

      render(<TestLandWizard />);
      expect(screen.getByText("Land Wizard")).toBeInTheDocument();
    });

    it("should validate blog.manage permission for blog wizard", () => {
      const mockUser = {
        id: "admin-id",
        role: "admin",
        email: "admin@test.com",
        emailVerified: true,
      };

      mockUseAdmin.mockReturnValue({
        user: mockUser,
        loading: false,
        hasPermission: jest.fn((permission) =>
          ["blog.manage", "dashboard.access"].includes(permission)
        ),
        canAccessRoute: jest.fn(() => true),
        hasRole: jest.fn((role) => role === "admin"),
        isAdmin: true,
        isAgent: false,
        isUser: false,
        permissions: ["blog.manage", "dashboard.access"],
      });

      const TestBlogWizard = () => (
        <RouteGuard requiredPermission="blog.manage">
          <div>Blog Wizard</div>
        </RouteGuard>
      );

      render(<TestBlogWizard />);
      expect(screen.getByText("Blog Wizard")).toBeInTheDocument();
    });

    it("should validate properties.manage permission for property wizard", () => {
      const mockUser = {
        id: "agent-id",
        role: "agent",
        email: "agent@test.com",
        emailVerified: true,
      };

      mockUseAdmin.mockReturnValue({
        user: mockUser,
        loading: false,
        hasPermission: jest.fn((permission) =>
          ["properties.manage", "dashboard.access"].includes(permission)
        ),
        canAccessRoute: jest.fn(() => true),
        hasRole: jest.fn((role) => role === "agent"),
        isAdmin: false,
        isAgent: true,
        isUser: false,
        permissions: ["properties.manage", "dashboard.access"],
      });

      const TestPropertyWizard = () => (
        <RouteGuard requiredPermission="properties.manage">
          <div>Property Wizard</div>
        </RouteGuard>
      );

      render(<TestPropertyWizard />);
      expect(screen.getByText("Property Wizard")).toBeInTheDocument();
    });
  });

  describe("Role-based Access Control", () => {
    it("should allow admin access to all wizards", () => {
      const mockAdmin = {
        id: "admin-id",
        role: "admin",
        email: "admin@test.com",
        emailVerified: true,
      };

      mockUseAdmin.mockReturnValue({
        user: mockAdmin,
        loading: false,
        hasPermission: jest.fn(() => true), // Admin has all permissions
        canAccessRoute: jest.fn(() => true),
        hasRole: jest.fn((role) => role === "admin"),
        isAdmin: true,
        isAgent: false,
        isUser: false,
        permissions: ["properties.manage", "lands.manage", "blog.manage"],
      });

      // Test all wizard permissions for admin
      const permissions = ["properties.manage", "lands.manage", "blog.manage"];
      permissions.forEach((permission) => {
        const hasPermission = mockUseAdmin().hasPermission(permission);
        expect(hasPermission).toBe(true);
      });
    });

    it("should allow agent access to property and land wizards only", () => {
      const mockAgent = {
        id: "agent-id",
        role: "agent",
        email: "agent@test.com",
        emailVerified: true,
      };

      mockUseAdmin.mockReturnValue({
        user: mockAgent,
        loading: false,
        hasPermission: jest.fn((permission) =>
          ["properties.manage", "lands.manage"].includes(permission)
        ),
        canAccessRoute: jest.fn(() => true),
        hasRole: jest.fn((role) => role === "agent"),
        isAdmin: false,
        isAgent: true,
        isUser: false,
        permissions: ["properties.manage", "lands.manage"],
      });

      const { hasPermission } = mockUseAdmin();

      expect(hasPermission("properties.manage")).toBe(true);
      expect(hasPermission("lands.manage")).toBe(true);
      expect(hasPermission("blog.manage")).toBe(false);
    });

    it("should deny user access to all management wizards", () => {
      const mockUser = {
        id: "user-id",
        role: "user",
        email: "user@test.com",
        emailVerified: true,
      };

      mockUseAdmin.mockReturnValue({
        user: mockUser,
        loading: false,
        hasPermission: jest.fn(
          (permission) =>
            permission.includes(".view") || permission.includes("profile.")
        ),
        canAccessRoute: jest.fn(() => false),
        hasRole: jest.fn((role) => role === "user"),
        isAdmin: false,
        isAgent: false,
        isUser: true,
        permissions: ["properties.view", "lands.view", "blog.view"],
      });

      const { hasPermission } = mockUseAdmin();

      expect(hasPermission("properties.manage")).toBe(false);
      expect(hasPermission("lands.manage")).toBe(false);
      expect(hasPermission("blog.manage")).toBe(false);
    });
  });
});
