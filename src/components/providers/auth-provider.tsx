"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/actions/auth";
import { User } from "@/lib/types";
import { useSignOut, useUpdateUserProfile } from "@/hooks/use-auth-actions";

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  updateProfile: (profileData: any) => Promise<void>;
  refetch: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const signOutMutation = useSignOut();
  const updateProfileMutation = useUpdateUserProfile();

  // Use React Query to manage user state
  const {
    data: userResult,
    isLoading: loading,
    error,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["auth", "currentUser"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const user = (userResult?.success ? userResult.data : null) || null;

  const refetch = useCallback(async () => {
    await refetchUser();
  }, [refetchUser]);

  const updateProfile = useCallback(
    async (profileData: any) => {
      await updateProfileMutation.mutateAsync(profileData);
    },
    [updateProfileMutation]
  );

  const signOut = useCallback(async () => {
    await signOutMutation.mutateAsync();
  }, [signOutMutation]);

  const value: AuthContextValue = {
    user,
    loading,
    isLoading: loading,
    isAuthenticated: !!user,
    error: error?.message || null,
    updateProfile,
    refetch,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
