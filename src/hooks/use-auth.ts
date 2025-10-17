"use client";

import { useEffect, useState } from "react";
import { authClient, type Session } from "@/lib/auth/auth-client";

interface AuthState {
    user: Session["user"] | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

/**
 * Hook para manejar el estado de autenticación del usuario
 */
export function useAuth(): AuthState {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        session: null,
        isLoading: true,
        isAuthenticated: false,
    });

    useEffect(() => {
        let mounted = true;

        // Función para obtener la sesión actual
        const getSession = async () => {
            try {
                const session = await authClient.getSession();

                if (mounted) {
                    setAuthState({
                        user: session.data?.user || null,
                        session: session.data || null,
                        isLoading: false,
                        isAuthenticated: !!session.data?.user,
                    });
                }
            } catch (error) {
                console.error("Error getting session:", error);
                if (mounted) {
                    setAuthState({
                        user: null,
                        session: null,
                        isLoading: false,
                        isAuthenticated: false,
                    });
                }
            }
        };

        // Obtener sesión inicial
        getSession();

        // Polling para detectar cambios de sesión
        const pollInterval = setInterval(() => {
            if (mounted) {
                getSession();
            }
        }, 30000); // Verificar cada 30 segundos

        // Cleanup
        return () => {
            mounted = false;
            clearInterval(pollInterval);
        };
    }, []);

    return authState;
}

/**
 * Hook para funciones de autenticación del cliente
 */
export function useAuthActions() {
    return {
        signIn: authClient.signIn.email,
        signUp: authClient.signUp.email,
        signOut: authClient.signOut,
        sendVerificationOTP: authClient.emailOtp.sendVerificationOtp,
        verifyEmailOTP: authClient.verifyEmail,
        forgetPassword: authClient.forgetPassword,
        resetPassword: authClient.resetPassword,
        changePassword: authClient.changePassword,
        updateUser: authClient.updateUser,
    };
}