import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/components/providers/auth-provider";

jest.mock("@/lib/auth/auth-client", () => {
  return {
    authClient: {
      getSession: jest.fn(),
    },
  };
});

jest.mock("@/hooks/use-auth-actions", () => {
  return {
    useSignIn: () => ({ mutateAsync: jest.fn().mockResolvedValue({ success: true }) }),
    useSignOut: () => ({ mutateAsync: jest.fn().mockResolvedValue({ success: true }) }),
    useUpdateUserProfile: () => ({ mutateAsync: jest.fn().mockResolvedValue({ success: true }) }),
  };
});

const userFixture = {
  id: "u1",
  email: "test@example.com",
  name: "Test User",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}><AuthProvider>{children}</AuthProvider></QueryClientProvider>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("returns unauthenticated when no session", async () => {
    const { authClient } = require("@/lib/auth/auth-client");
    authClient.getSession.mockResolvedValue({ user: null });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status !== "loading"));

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.status === "loading" || result.current.status === "unauthenticated").toBe(true);
  });

  it("returns authenticated when session has user", async () => {
    const { authClient } = require("@/lib/auth/auth-client");
    authClient.getSession.mockResolvedValue({ user: userFixture });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status === "authenticated"));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.status).toBe("authenticated");
  });

  it("signIn updates session state", async () => {
    const { authClient } = require("@/lib/auth/auth-client");
    authClient.getSession.mockResolvedValueOnce({ user: null });
    authClient.getSession.mockResolvedValueOnce({ user: userFixture });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status !== "authenticated"));
    expect(result.current.isAuthenticated).toBe(false);

    await act(async () => {
      await result.current.signIn({ email: "test@example.com", password: "password123" });
    });

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
  });

  it("signOut clears session state", async () => {
    const { authClient } = require("@/lib/auth/auth-client");
    authClient.getSession.mockResolvedValueOnce({ user: userFixture });
    authClient.getSession.mockResolvedValueOnce({ user: null });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status === "authenticated"));
    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      await result.current.signOut();
    });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(false));
  });
});
