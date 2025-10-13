"use client";

import { useState, useEffect, useCallback } from "react";
import { User } from "@/domain/user/entities/User";
import { UpdateUserProfileUseCase } from "@/application/use-cases/user/UpdateUserProfileUseCase";
import { UpdateUserProfileInput } from "@/application/dto/user/UpdateUserProfileInput";

export interface UseUserReturn {
    user: User | null;
    loading: boolean;
    error: string | null;
    updateProfile: (profileData: any) => Promise<void>;
    refetch: () => Promise<void>;
}

export function useUser(): UseUserReturn {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const updateProfile = useCallback(async (profileData: any) => {
        try {
            setError(null);

            const updateUserProfileUseCase = new UpdateUserProfileUseCase(/* dependencies */);
            const input = UpdateUserProfileInput.create(profileData);

            const result = await updateUserProfileUseCase.execute(input);

            // Update local user state
            if (user) {
                // This would typically be handled by the use case returning the updated user
                setUser(user); // Placeholder - would update with new data
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Update failed");
        }
    }, [user]);

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // This would typically call a GetCurrentUserUseCase
            // For now, we'll use a placeholder implementation

            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch user");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return {
        user,
        loading,
        error,
        updateProfile,
        refetch,
    };
}