"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { createContext, useCallback, useContext } from "react";
import { useSignOut, useUpdateUserProfile } from "@/hooks/use-auth-actions";
import { getCurrentUser } from "@/lib/actions/auth";
import type { User } from "@/lib/types";

export type AuthContextValue = {
	user: User | null;
	loading: boolean;
	isLoading: boolean;
	isAuthenticated: boolean;
	error: string | null;
	updateProfile: (profileData: any) => Promise<void>;
	refetch: () => Promise<void>;
	signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const queryClient = useQueryClient();
	const signOutMutation = useSignOut();
	const updateProfileMutation = useUpdateUserProfile();

	// Use React Query to manage user state with optimized approach
	const {
		data: userResult,
		isLoading: loading,
		error,
		refetch: refetchUser,
	} = useQuery({
		queryKey: ["auth", "currentUser"],
		queryFn: getCurrentUser, // Use server-side only to avoid conflicts
		staleTime: 10 * 60 * 1000, // 10 minutes - longer cache
		gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
		refetchOnWindowFocus: false, // Disable refetch on window focus
		refetchOnMount: false, // Disable refetch on mount
		refetchOnReconnect: false, // Disable refetch on reconnect
		retry: (failureCount, error) => {
			// Don't retry on auth errors
			if (error instanceof Error && error.message.includes("Unauthorized")) {
				return false;
			}
			// Limit retries to prevent infinite loops
			return failureCount < 1;
		},
		// Add a timeout to prevent hanging requests
		meta: {
			timeout: 5000, // 5 second timeout
		},
	});

	// Add a small delay to allow session to be established after login
	const [isInitialLoad, setIsInitialLoad] = React.useState(true);
	const [lastFetchTime, setLastFetchTime] = React.useState(0);

	React.useEffect(() => {
		const timer = setTimeout(() => {
			setIsInitialLoad(false);
		}, 100); // Small delay to allow session establishment

		return () => clearTimeout(timer);
	}, []);

	// Debounced refetch to prevent rapid successive calls
	const debouncedRefetch = React.useCallback(() => {
		const now = Date.now();
		if (now - lastFetchTime < 2000) {
			// Minimum 2 seconds between fetches
			return;
		}
		setLastFetchTime(now);
		refetchUser();
	}, [refetchUser, lastFetchTime]);

	// Only refetch on explicit user actions, not on automatic events
	React.useEffect(() => {
		// Only listen for manual auth changes, not automatic ones
		const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
			// Only handle explicit invalidations, not automatic updates
			if (event.type === "removed" && event.query.queryKey[0] === "auth") {
				// Only refetch if the query was explicitly removed, using debounced version
				debouncedRefetch();
			}
		});

		return unsubscribe;
	}, [queryClient, debouncedRefetch]);

	const user = (userResult?.success ? userResult.data : null) || null;

	const refetch = useCallback(async () => {
		await debouncedRefetch();
	}, [debouncedRefetch]);

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
		loading: loading || isInitialLoad,
		isLoading: loading || isInitialLoad,
		isAuthenticated: Boolean(user),
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
