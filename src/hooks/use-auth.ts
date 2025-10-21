// Export useAuth from auth provider
export { useAuth, type AuthContextValue } from "@/components/providers/auth-provider";

// Export auth action hooks for convenience
export {
    useSignIn,
    useSignUp,
    useSignOut,
    useForgotPassword,
    useResetPassword,
    useUpdateUserProfile,
    useChangePassword,
    useSendVerificationOTP,
    useVerifyOTP,
} from "./use-auth-actions";
