// Export useAuth from auth provider
export {
	type AuthContextValue,
	useAuth,
} from "@/components/providers/auth-provider";

// Export auth action hooks for convenience
export {
	useChangePassword,
	useForgotPassword,
	useResetPassword,
	useSendVerificationOTP,
	useSignIn,
	useSignOut,
	useSignUp,
	useUpdateUserProfile,
	useVerifyOTP,
} from "./use-auth-actions";
