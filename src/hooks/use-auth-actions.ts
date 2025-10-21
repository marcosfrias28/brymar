import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
    updateUserProfile,
    changePassword,
    sendVerificationOTP,
    verifyOTP,
} from "@/lib/actions/auth";
import {
    SignUpInput,
    AuthenticateUserInput,
    ForgotPasswordInput,
    ResetPasswordInput,
    UpdateUserProfileInput,
    ChangePasswordInput,
    SendVerificationOTPInput,
    VerifyOTPInput,
} from "@/lib/types";

/**
 * Hook for sign in mutation
 */
export function useSignIn() {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: signIn,
        onSuccess: (result) => {
            if (result.success && result.data?.redirectUrl) {
                toast.success("Sign in successful");
                queryClient.invalidateQueries({ queryKey: ["auth"] });
                router.push(result.data.redirectUrl);
            }
        },
        onError: (error: any) => {
            toast.error(error.message || "Sign in failed");
        },
    });
}

/**
 * Hook for sign up mutation
 */
export function useSignUp() {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: signUp,
        onSuccess: (result) => {
            if (result.success && result.data?.redirectUrl) {
                toast.success("Account created successfully! Welcome!");
                queryClient.invalidateQueries({ queryKey: ["auth"] });
                router.push(result.data.redirectUrl);
            }
        },
        onError: (error: any) => {
            toast.error(error.message || "Sign up failed");
        },
    });
}

/**
 * Hook for sign out mutation
 */
export function useSignOut() {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: signOut,
        onSuccess: () => {
            toast.success("Signed out successfully");
            queryClient.clear(); // Clear all cached data
            router.push("/");
        },
        onError: (error: any) => {
            toast.error(error.message || "Sign out failed");
        },
    });
}

/**
 * Hook for forgot password mutation
 */
export function useForgotPassword() {
    return useMutation({
        mutationFn: forgotPassword,
        onSuccess: () => {
            toast.success("Password reset instructions sent to your email");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to send password reset email");
        },
    });
}

/**
 * Hook for reset password mutation
 */
export function useResetPassword() {
    const router = useRouter();

    return useMutation({
        mutationFn: resetPassword,
        onSuccess: () => {
            toast.success("Password reset successfully. You can now sign in.");
            router.push("/sign-in");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to reset password");
        },
    });
}

/**
 * Hook for update user profile mutation
 */
export function useUpdateUserProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            toast.success("Profile updated successfully");
            queryClient.invalidateQueries({ queryKey: ["auth"] });
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update profile");
        },
    });
}

/**
 * Hook for change password mutation
 */
export function useChangePassword() {
    return useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            toast.success("Password changed successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to change password");
        },
    });
}

/**
 * Hook for send verification OTP mutation
 */
export function useSendVerificationOTP() {
    return useMutation({
        mutationFn: sendVerificationOTP,
        onSuccess: () => {
            toast.success("Verification code sent to your email");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to send verification code");
        },
    });
}

/**
 * Hook for verify OTP mutation
 */
export function useVerifyOTP() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: verifyOTP,
        onSuccess: () => {
            toast.success("Email verified successfully");
            queryClient.invalidateQueries({ queryKey: ["auth"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to verify code");
        },
    });
}