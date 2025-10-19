"use client";

import { useState, useEffect, useCallback } from "react";

import { UpdateUserProfileUseCase } from "@/application/use-cases/user/UpdateUserProfileUseCase";
import { GetCurrentUserUseCase } from "@/application/use-cases/user/GetCurrentUserUseCase";
import { SignOutUseCase } from "@/application/use-cases/user/SignOutUseCase";
import { UpdateUserProfileInput } from "@/application/dto/user/UpdateUserProfileInput";
import { GetCurrentUserInput } from "@/application/dto/user/GetCurrentUserInput";
import { SignOutInput } from "@/application/dto/user/SignOutInput";
import { GetCurrentUserOutput } from "@/application/dto/user/GetCurrentUserOutput";
import { container } from "@/infrastructure/container/Container";
import { initializeContainer } from "@/infrastructure/container/ServiceRegistration";
import { authClient } from "@/lib/auth/auth-client";

// Initialize container if not already done
if (!container.has('UpdateUserProfileUseCase')) {
    initializeContainer();
}

export interface UseUserReturn {
    user: GetCurrentUserOutput | null;
    session: any | null;
    loading: boolean;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    updateProfile: (profileData: any) => Promise<void>;
    refetch: () => Promise<void>;
    signOut: () => Promise<void>;
}

export function useUser(): UseUserReturn {
    const [user, setUser] = useState<GetCurrentUserOutput | null>(null);
    const [session, setSession] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const updateProfile = useCallback(async (profileData: any) => {
        try {
            setError(null);

            const updateUserProfileUseCase = container.get<UpdateUserProfileUseCase>('UpdateUserProfileUseCase');
            const input = UpdateUserProfileInput.create(profileData);
            await updateUserProfileUseCase.execute(input);

            // Refetch the updated user data
            await refetch();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Update failed");
        }
    }, []);

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Get current session from Better Auth
            const sessionResponse = await authClient.getSession();
            setSession(sessionResponse.data || null);

            if (!sessionResponse.data?.user?.id) {
                setUser(null);
                setSession(null);
                setLoading(false);
                return;
            }

            // Use the GetCurrentUserUseCase to fetch user data
            const getCurrentUserUseCase = container.get<GetCurrentUserUseCase>('GetCurrentUserUseCase');
            const input = GetCurrentUserInput.fromUserId(sessionResponse.data.user.id);
            const result = await getCurrentUserUseCase.execute(input);

            setUser(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch user");
            setUser(null);
            setSession(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            setError(null);

            // Get current session for the sign out use case
            const session = await authClient.getSession();
            const userId = session.data?.user?.id;

            // Use the SignOutUseCase
            const signOutUseCase = container.get<SignOutUseCase>('SignOutUseCase');
            const input = SignOutInput.create(userId);
            await signOutUseCase.execute(input);

            // Sign out from Better Auth
            await authClient.signOut();

            // Clear local state
            setUser(null);

            // Redirect to home page
            window.location.href = '/';
        } catch (err) {
            setError(err instanceof Error ? err.message : "Sign out failed");
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const initialize = async () => {
            if (mounted) {
                await refetch();
            }
        };

        initialize();

        // Polling para detectar cambios de sesión
        const pollInterval = setInterval(() => {
            if (mounted) {
                refetch();
            }
        }, 30000); // Verificar cada 30 segundos

        return () => {
            mounted = false;
            clearInterval(pollInterval);
        };
    }, [refetch]);

    return {
        user,
        session,
        loading,
        isLoading: loading,
        isAuthenticated: !!user,
        error,
        updateProfile,
        refetch,
        signOut,
    };
}