import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/providers/auth-provider";
import { useAuth } from "@/hooks/use-auth";

jest.mock("@/lib/auth/auth-client", () => ({
  authClient: {
    getSession: jest.fn().mockResolvedValue({ user: null }),
  },
}));
jest.mock("@/hooks/use-auth-actions", () => ({
  useSignIn: () => ({ mutateAsync: jest.fn().mockResolvedValue({ success: true }) }),
  useSignOut: () => ({ mutateAsync: jest.fn().mockResolvedValue({ success: true }) }),
  useUpdateUserProfile: () => ({ mutateAsync: jest.fn().mockResolvedValue({ success: true }) }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

describe("useAuth hook", () => {
  it("provides context from AuthProvider", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.status !== "loading"));
    expect(result.current).toHaveProperty("isAuthenticated");
    expect(typeof result.current.signOut).toBe("function");
    expect(typeof result.current.signIn).toBe("function");
  });
});

