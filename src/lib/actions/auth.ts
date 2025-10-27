/**
 * Authentication and user-related server actions
 */

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getRedirectUrlForRole, type UserRole } from "@/lib/auth/admin-config";
import { auth } from "@/lib/auth/auth";
import * as logger from "@/lib/logger";
import type {
	ActionResult,
	AuthenticateUserInput,
	ChangePasswordInput,
	ForgotPasswordInput,
	ResetPasswordInput,
	SendVerificationOTPInput,
	SignUpInput,
	UpdateUserProfileInput,
	User,
	UserPreferences,
	VerifyOTPInput,
} from "@/lib/types";
import type { FormState } from "@/lib/types/forms";
import {
	AppError,
	handleActionError,
	UnauthorizedError,
	ValidationError,
} from "@/lib/utils/errors";

// Zod schemas for validation
const verifyOTPSchema = z.object({
	email: z.email("Invalid email format"),
	otp: z.string().regex(/^\d{6}$/, "OTP code must be 6 digits"),
});

/**
 * Convert Better Auth user object to our User type
 */
function convertBetterAuthUser(betterAuthUser: any): User {
	const defaultPreferences: UserPreferences = {
		notifications: {
			email: true,
			push: false,
			marketing: false,
		},
		privacy: {
			profileVisible: true,
			showEmail: false,
			showPhone: false,
		},
		display: {
			theme: "light",
			language: "es",
			currency: "USD",
		},
	};

	return {
		id: betterAuthUser.id,
		email: betterAuthUser.email,
		name: betterAuthUser.name,
		firstName: betterAuthUser.firstName,
		lastName: betterAuthUser.lastName,
		phone: betterAuthUser.phone,
		avatar: betterAuthUser.image || betterAuthUser.avatar,
		bio: betterAuthUser.bio,
		location: betterAuthUser.location,
		website: betterAuthUser.website,
		role: betterAuthUser.role || "user",
		emailVerified: betterAuthUser.emailVerified,
		phoneVerified: betterAuthUser.phoneVerified,
		preferences: betterAuthUser.preferences || defaultPreferences,
		lastLoginAt: betterAuthUser.lastLoginAt,
		isActive: true,
		createdAt: betterAuthUser.createdAt || new Date(),
		updatedAt: betterAuthUser.updatedAt || new Date(),
	};
}

/**
 * Verify OTP code - Updated to use Zod validation
 */
export async function verifyOTP(
	input: VerifyOTPInput,
): Promise<ActionResult<void>> {
	try {
		// Validate input using Zod schema
		const validatedInput = verifyOTPSchema.parse(input);

		await logger.info("Verifying OTP", {
			email: validatedInput.email,
			otp: validatedInput.otp
		});

		// Use Better Auth to verify OTP
		const result = await auth.api.verifyEmailOTP({
			body: {
				email: validatedInput.email,
				otp: validatedInput.otp
			},
			headers: await headers(),
		});

		if (!result.user) {
			throw new ValidationError("Invalid or expired OTP code", {
				otp: ["Invalid or expired OTP code"],
			});
		}

		await logger.info("OTP verified successfully", {
			email: validatedInput.email,
			userId: result.user.id,
		});

		// Revalidate profile page to show updated verification status
		revalidatePath("/profile");
		revalidatePath("/dashboard");

		return {
			success: true,
			data: undefined,
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			// Convert Zod errors to ValidationError format
			const validationErrors: Record<string, string[]> = {};
			error.issues.forEach((issue) => {
				const field = issue.path[0] as string;
				if (!validationErrors[field]) {
					validationErrors[field] = [];
				}
				validationErrors[field].push(issue.message);
			});
			throw new ValidationError("Invalid input", validationErrors);
		}

		await logger.error("Verify OTP error", error, {
			email: input.email,
			otp: input.otp,
		});
		return handleActionError(error);
	}
}

/**
 * Sign in with email and password
 */
export async function signIn(
	input: AuthenticateUserInput,
): Promise<ActionResult<{ user: any; redirectUrl: string }>> {
	try {
		if (!input.email || !input.password) {
			throw new ValidationError("Email and password are required", {
				email: input.email ? [] : ["Email is required"],
				password: input.password ? [] : ["Password is required"],
			});
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(input.email)) {
			throw new ValidationError("Invalid email format", {
				email: ["Invalid email format"],
			});
		}

		await logger.info("Sign in attempt", { email: input.email });

		// Use Better Auth to authenticate
		const result = await auth.api.signInEmail({
			body: {
				email: input.email,
				password: input.password,
			},
			headers: await headers(),
		});

		if (!result.user) {
			await logger.warning("Invalid credentials", { email: input.email });
			throw new UnauthorizedError("Invalid credentials");
		}

		const userRole = ((result.user as any).role || "user") as UserRole;

		await logger.info("Sign in successful", {
			userId: result.user.id,
			email: result.user.email,
			role: userRole,
		});

		// Determine redirect URL based on user role
		const redirectUrl = getRedirectUrlForRole(userRole);

		return {
			success: true,
			data: { user: result.user, redirectUrl },
		};
	} catch (error) {
		await logger.error("Sign in error", error, { email: input.email });
		return handleActionError(error);
	}
}

/**
 * Sign up a new user
 */
export async function signUp(
	input: SignUpInput,
): Promise<ActionResult<{ user: any; redirectUrl: string }>> {
	try {
		if (!input.email || !input.password || !input.name) {
			throw new ValidationError("All fields are required", {
				email: input.email ? [] : ["Email is required"],
				password: input.password ? [] : ["Password is required"],
				name: input.name ? [] : ["Name is required"],
			});
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(input.email)) {
			throw new ValidationError("Invalid email format", {
				email: ["Invalid email format"],
			});
		}

		// Validate password strength
		if (input.password.length < 8) {
			throw new ValidationError("Password must be at least 8 characters", {
				password: ["Password must be at least 8 characters"],
			});
		}

		await logger.info("Sign up attempt", {
			email: input.email,
			name: input.name,
		});

		// Use Better Auth to register
		const result = await auth.api.signUpEmail({
			body: {
				email: input.email,
				password: input.password,
				name: input.name,
			},
			headers: await headers(),
		});

		if (!result.user) {
			throw new AppError("Failed to create account");
		}

		// Use the user information from the sign-up result
		const userRole = ((result.user as any).role || "user") as UserRole;

		await logger.info("Sign up successful", {
			userId: result.user.id,
			email: result.user.email,
			role: userRole,
		});

		// Determine redirect URL based on user role
		const redirectUrl = getRedirectUrlForRole(userRole);

		return {
			success: true,
			data: { user: result.user, redirectUrl },
		};
	} catch (error) {
		await logger.error("Sign up error", error, {
			email: input.email,
			name: input.name,
		});
		return handleActionError(error);
	}
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<ActionResult<void>> {
	try {
		await logger.info("Sign out attempt");

		// Use Better Auth to sign out
		await auth.api.signOut({
			headers: await headers(),
		});

		await logger.info("Sign out successful");

		return {
			success: true,
			data: undefined,
		};
	} catch (error) {
		await logger.error("Sign out error", error);
		return handleActionError(error);
	}
}

/**
 * Request password reset
 */
export async function forgotPassword(
	input: ForgotPasswordInput,
): Promise<ActionResult<void>> {
	try {
		if (!input.email) {
			throw new ValidationError("Email is required", {
				email: ["Email is required"],
			});
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(input.email)) {
			throw new ValidationError("Invalid email format", {
				email: ["Invalid email format"],
			});
		}

		await logger.info("Password reset request", { email: input.email });

		// Get the base URL from environment or headers
		const headersList = await headers();
		const host = headersList.get("host") || "localhost:3000";
		const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
		const baseUrl = process.env.BETTER_AUTH_URL || `${protocol}://${host}`;
		const callbackURL = `${baseUrl}/reset-password`;

		// Use Better Auth to send password reset email
		await auth.api.forgetPassword({
			body: { 
				email: input.email,
				redirectTo: callbackURL,
			},
			headers: headersList,
		});

		await logger.info("Password reset email sent", { email: input.email });

		return {
			success: true,
			data: undefined,
		};
	} catch (error) {
		await logger.error("Forgot password error", error, { email: input.email });

		// For security, don't reveal if user exists or not
		if (error instanceof Error && error.message?.includes("User not found")) {
			return {
				success: true,
				data: undefined,
			};
		}

		return handleActionError(error);
	}
}

/**
 * Reset password with token
 */
export async function resetPassword(
	input: ResetPasswordInput,
): Promise<ActionResult<void>> {
	try {
		if (!input.token || !input.password || !input.confirmPassword) {
			throw new ValidationError("All fields are required", {
				token: input.token ? [] : ["Token is required"],
				password: input.password ? [] : ["Password is required"],
				confirmPassword: input.confirmPassword
					? []
					: ["Password confirmation is required"],
			});
		}

		if (input.password !== input.confirmPassword) {
			throw new ValidationError("Passwords do not match", {
				confirmPassword: ["Passwords do not match"],
			});
		}

		// Validate password strength
		if (input.password.length < 8) {
			throw new ValidationError("Password must be at least 8 characters", {
				password: ["Password must be at least 8 characters"],
			});
		}

		await logger.info("Password reset attempt", { token: input.token });

		// Use Better Auth to reset password
		await auth.api.resetPassword({
			body: {
				token: input.token,
				newPassword: input.password,
			},
			headers: await headers(),
		});

		await logger.info("Password reset successful");

		return {
			success: true,
			data: undefined,
		};
	} catch (error) {
		await logger.error("Reset password error", error, { token: input.token });
		return handleActionError(error);
	}
}

/**
 * Update user profile
 */
export async function updateUserProfile(
	input: UpdateUserProfileInput,
): Promise<ActionResult<User>> {
	try {
		// Get current session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			throw new UnauthorizedError("Not authenticated");
		}

		if (
			!input.name &&
			!input.email &&
			!input.firstName &&
			!input.lastName &&
			!input.phone &&
			!input.avatar &&
			!input.bio &&
			!input.location &&
			!input.website
		) {
			throw new ValidationError("At least one field must be provided", {});
		}

		// Validate email if provided
		if (input.email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(input.email)) {
				throw new ValidationError("Invalid email format", {
					email: ["Invalid email format"],
				});
			}
		}

		await logger.info("Profile update attempt", {
			userId: session.user.id,
			name: input.name,
			email: input.email,
		});

		// Use Better Auth to update profile
		const updateData: any = {};
		if (input.name) updateData.name = input.name;
		if (input.email) updateData.email = input.email;
		// Note: Better Auth might not support all fields, we may need to extend this

		await auth.api.updateUser({
			body: updateData,
			headers: await headers(),
		});

		await logger.info("Profile updated successfully", {
			userId: session.user.id,
			name: input.name,
			email: input.email,
		});

		// Get updated session
		const updatedSession = await auth.api.getSession({
			headers: await headers(),
		});

		const updatedUser = updatedSession?.user
			? convertBetterAuthUser(updatedSession.user)
			: null;

		return {
			success: true,
			data: updatedUser!,
		};
	} catch (error) {
		await logger.error("Update profile error", error, {
			name: input.name,
			email: input.email,
		});
		return handleActionError(error);
	}
}

/**
 * Change password for authenticated user
 */
export async function changePassword(
	input: ChangePasswordInput,
): Promise<ActionResult<void>> {
	try {
		// Get current session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			throw new UnauthorizedError("Not authenticated");
		}

		if (
			!input.currentPassword ||
			!input.newPassword ||
			!input.confirmPassword
		) {
			throw new ValidationError("All fields are required", {
				currentPassword: input.currentPassword
					? []
					: ["Current password is required"],
				newPassword: input.newPassword ? [] : ["New password is required"],
				confirmPassword: input.confirmPassword
					? []
					: ["Password confirmation is required"],
			});
		}

		if (input.newPassword !== input.confirmPassword) {
			throw new ValidationError("New passwords do not match", {
				confirmPassword: ["New passwords do not match"],
			});
		}

		// Validate password strength
		if (input.newPassword.length < 8) {
			throw new ValidationError("New password must be at least 8 characters", {
				newPassword: ["New password must be at least 8 characters"],
			});
		}

		if (input.currentPassword === input.newPassword) {
			throw new ValidationError(
				"New password must be different from current password",
				{
					newPassword: ["New password must be different from current password"],
				},
			);
		}

		await logger.info("Password change attempt", { userId: session.user.id });

		// Use Better Auth to change password
		await auth.api.changePassword({
			body: {
				currentPassword: input.currentPassword,
				newPassword: input.newPassword,
			},
			headers: await headers(),
		});

		await logger.info("Password changed successfully", {
			userId: session.user.id,
		});

		return {
			success: true,
			data: undefined,
		};
	} catch (error) {
		await logger.error("Change password error", error);
		return handleActionError(error);
	}
}

/**
 * Send verification OTP
 */
export async function sendVerificationOTP(
	input: SendVerificationOTPInput,
): Promise<ActionResult<void>> {
	try {
		if (!input.email) {
			throw new ValidationError("Email is required", {
				email: ["Email is required"],
			});
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(input.email)) {
			throw new ValidationError("Invalid email format", {
				email: ["Invalid email format"],
			});
		}

		await logger.info("Sending verification OTP", { email: input.email });

		// Use Better Auth to send OTP
		await auth.api.sendVerificationOTP({
			body: {
				email: input.email,
				type: "email-verification",
			},
			headers: await headers(),
		});

		await logger.info("Verification OTP sent successfully", {
			email: input.email,
		});

		return {
			success: true,
			data: undefined,
		};
	} catch (error) {
		await logger.error("Send verification OTP error", error, {
			email: input.email,
		});
		return handleActionError(error);
	}
}

/**
 * Get current user session
 */
export async function getCurrentUser(): Promise<ActionResult<User | null>> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return {
				success: true,
				data: null,
			};
		}

		return {
			success: true,
			data: convertBetterAuthUser(session.user),
		};
	} catch (error) {
		await logger.error("Get current user error", error);
		return handleActionError(error);
	}
}

// Server action wrappers using FormState pattern
export async function signInAction(
	_prevState: FormState<{ user: any; redirectUrl: string }>,
	formData: FormData,
): Promise<FormState<{ user: any; redirectUrl: string }>> {
	try {
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const _rememberMe = formData.get("rememberMe") === "true";

		// Validation
		const errors: Record<string, string[]> = {};

		if (!email) {
			errors.email = ["Email is required"];
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				errors.email = ["Invalid email format"];
			}
		}

		if (!password) {
			errors.password = ["Password is required"];
		}

		if (Object.keys(errors).length > 0) {
			return {
				success: false,
				errors,
			};
		}

		await logger.info("Sign in attempt", { email });

		// Use Better Auth to authenticate
		const result = await auth.api.signInEmail({
			body: {
				email,
				password,
			},
			headers: await headers(),
		});

		if (!result.user) {
			await logger.warning("Invalid credentials", { email });
			return {
				success: false,
				errors: {
					email: ["Invalid email or password"],
				},
			};
		}

		const userRole = ((result.user as any).role || "user") as UserRole;

		await logger.info("Sign in successful", {
			userId: result.user.id,
			email: result.user.email,
			role: userRole,
		});

		// Determine redirect URL based on user role
		const redirectUrl = getRedirectUrlForRole(userRole);

		// Redirect on success
		redirect(redirectUrl);
	} catch (error) {
		// Re-throw redirect errors immediately without logging
		if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
			throw error;
		}

		await logger.error("Sign in error", error);

		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to sign in",
		};
	}
}

export async function signUpAction(
	_prevState: FormState<{ user: any; redirectUrl: string }>,
	formData: FormData,
): Promise<FormState<{ user: any; redirectUrl: string }>> {
	try {
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirmPassword") as string;
		const name = formData.get("name") as string;
		const _firstName = formData.get("firstName") as string;
		const _lastName = formData.get("lastName") as string;
		const _phone = formData.get("phone") as string;

		// Validation
		const errors: Record<string, string[]> = {};

		if (!email) {
			errors.email = ["Email is required"];
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				errors.email = ["Invalid email format"];
			}
		}

		if (!password) {
			errors.password = ["Password is required"];
		} else if (password.length < 8) {
			errors.password = ["Password must be at least 8 characters"];
		}

		if (!name) {
			errors.name = ["Name is required"];
		}

		if (confirmPassword && password !== confirmPassword) {
			errors.confirmPassword = ["Passwords do not match"];
		}

		if (Object.keys(errors).length > 0) {
			return {
				success: false,
				errors,
			};
		}

		await logger.info("Sign up attempt", { email, name });

		// Use Better Auth to register
		const result = await auth.api.signUpEmail({
			body: {
				email,
				password,
				name,
			},
			headers: await headers(),
		});

		if (!result.user) {
			return {
				success: false,
				message: "Failed to create account",
			};
		}

		const userRole = ((result.user as any).role || "user") as UserRole;

		await logger.info("Sign up successful", {
			userId: result.user.id,
			email: result.user.email,
			role: userRole,
		});

		// Determine redirect URL based on user role
		const redirectUrl = getRedirectUrlForRole(userRole);

		// Redirect on success
		redirect(redirectUrl);
	} catch (error) {
		// Re-throw redirect errors immediately without logging
		if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
			throw error;
		}

		await logger.error("Sign up error", error);

		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to sign up",
		};
	}
}

export async function signOutAction() {
	const result = await signOut();

	if (result.success) {
		redirect("/");
	}

	return result;
}

export async function forgotPasswordAction(
	prevState: ActionResult<void>,
	formData: FormData,
): Promise<ActionResult<void>> {
	const email = formData.get("email") as string;
	return forgotPassword({ email });
}

export async function resetPasswordAction(
	prevState: ActionResult<void>,
	formData: FormData,
): Promise<ActionResult<void>> {
	const token = formData.get("token") as string;
	const password = formData.get("password") as string;
	const confirmPassword = formData.get("confirmPassword") as string;

	const result = await resetPassword({ token, password, confirmPassword });

	// Redirect to sign-in page on success
	if (result.success) {
		redirect("/sign-in");
	}

	return result;
}

export async function updateUserProfileAction(
	prevState: ActionResult<User>,
	formData: FormData,
): Promise<ActionResult<User>> {
	const id = formData.get("id") as string;
	const name = formData.get("name") as string;
	const email = formData.get("email") as string;
	const firstName = formData.get("firstName") as string;
	const lastName = formData.get("lastName") as string;
	const phone = formData.get("phone") as string;
	const avatar = formData.get("avatar") as string;
	const bio = formData.get("bio") as string;
	const location = formData.get("location") as string;
	const website = formData.get("website") as string;

	const result = await updateUserProfile({
		id,
		name: name || undefined,
		email: email || undefined,
		firstName: firstName || undefined,
		lastName: lastName || undefined,
		phone: phone || undefined,
		avatar: avatar || undefined,
		bio: bio || undefined,
		location: location || undefined,
		website: website || undefined,
	});

	if (result.success) {
		revalidatePath("/profile");
		revalidatePath("/dashboard");
	}

	return result;
}

export async function changePasswordAction(formData: FormData) {
	const currentPassword = formData.get("currentPassword") as string;
	const newPassword = formData.get("newPassword") as string;
	const confirmPassword = formData.get("confirmPassword") as string;

	return changePassword({ currentPassword, newPassword, confirmPassword });
}

export async function sendVerificationOTPAction(formData: FormData) {
	const email = formData.get("email") as string;
	return sendVerificationOTP({ email });
}

export async function verifyOTPAction(formData: FormData) {
	const email = formData.get("email") as string;
	const otp = formData.get("otp") as string;
	return verifyOTP({ email, otp });
}
