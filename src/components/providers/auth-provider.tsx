"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { createContext, useCallback, useContext } from "react";
import {
	useSignIn,
	useSignOut,
	useUpdateUserProfile,
} from "@/hooks/use-auth-actions";
import { authClient } from "@/lib/auth/auth-client";
import type { User } from "@/lib/types";
import type {
	AuthenticateUserInput,
	UpdateUserProfileInput,
} from "@/lib/types";

export type AuthContextValue = {
	user: User | null;
	loading: boolean;
	isLoading: boolean;
	isAuthenticated: boolean;
	status: "loading" | "authenticated" | "unauthenticated";
	error: string | null;
	signIn: (credentials: AuthenticateUserInput) => Promise<void>;
	signOut: () => Promise<void>;
	updateProfile: (profileData: UpdateUserProfileInput) => Promise<void>;
	refresh: () => Promise<void>;
	refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapUser(u: any): User {
    return {
        id: u.id,
        email: u.email,
        name: u.name,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        avatar: u.image || u.avatar,
        bio: u.bio,
        location: u.location,
        website: u.website,
        role: u.role || "user",
        emailVerified: u.emailVerified,
        phoneVerified: u.phoneVerified,
        preferences:
            u.preferences || {
                notifications: { email: true, push: false, marketing: false },
                privacy: { profileVisible: true, showEmail: false, showPhone: false },
                display: { theme: "light", language: "es", currency: "USD" },
            },
        lastLoginAt: u.lastLoginAt,
        isActive: true,
        createdAt: u.createdAt || new Date(),
        updatedAt: u.updatedAt || new Date(),
    };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const signInMutation = useSignIn();
    const signOutMutation = useSignOut();
    const updateProfileMutation = useUpdateUserProfile();

    const { data: session, isPending: loading, error, refetch } = useQuery({
        queryKey: ["auth", "session"],
        queryFn: () => authClient.getSession(),
    });

    const [isInitialLoad, setIsInitialLoad] = React.useState(true);
    const [lastFetchTime, setLastFetchTime] = React.useState(0);
    React.useEffect(() => {
        const t = setTimeout(() => setIsInitialLoad(false), 100);
        return () => clearTimeout(t);
    }, []);

    const debounced = React.useCallback(() => {
        const now = Date.now();
        if (now - lastFetchTime < 2000) return;
        setLastFetchTime(now);
        refetch();
    }, [refetch, lastFetchTime]);

    const rawUser = (session as any)?.user ?? (session as any)?.data?.user;
    const user = rawUser ? mapUser(rawUser as any) : null;

    const signIn = useCallback(async (credentials: AuthenticateUserInput) => {
        await signInMutation.mutateAsync(credentials);
        await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
        await debounced();
    }, [signInMutation, queryClient, debounced]);

    const refresh = useCallback(async () => {
        await debounced();
    }, [debounced]);

    const updateProfile = useCallback(async (profileData: UpdateUserProfileInput) => {
        await updateProfileMutation.mutateAsync(profileData);
        await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
        await debounced();
    }, [updateProfileMutation, queryClient, debounced]);

    const signOut = useCallback(async () => {
        await signOutMutation.mutateAsync();
        await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
    }, [signOutMutation, queryClient]);

    const value: AuthContextValue = {
        user,
        loading: loading || isInitialLoad,
        isLoading: loading || isInitialLoad,
        isAuthenticated: Boolean(user),
        status: loading || isInitialLoad ? "loading" : user ? "authenticated" : "unauthenticated",
        error: error?.message || null,
        signIn,
        signOut,
        updateProfile,
        refresh,
        refetch: refresh,
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
