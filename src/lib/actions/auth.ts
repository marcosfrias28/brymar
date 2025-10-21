"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
    SignUpInput,
    AuthenticateUserInput,
    ForgotPasswordInput,
    ResetPasswordInput,
    UpdateUserProfileInput,
    ChangePasswordInput,
    SendVerificationOTPInput,
    VerifyOTPInput,
    ActionResult,
    User,
    UserPreferences
} from "@/lib/types";
import { AppError, ValidationError, UnauthorizedError, handleActionError } from "@/lib/utils/errors";
import { getRedirectUrlForRole, type UserRole } from "@/lib/auth/admin-config";
import * as logger from "@/lib/logger";

/**
 * Convert Better Auth user object to our User type
 */
function convertBetterAuthUser(betterAuthUser: any): User {
    const defaultPreferences: UserPreferences = {
        notifications: {
            email: true,
            push: false,
            marketing: false
        },
        privacy: {
            profileVisible: true,
            showEmail: false,
            showPhone: false
        },
        display: {
            theme: "light",
            language: "es",
            currency: "USD"
        }
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
        role: betterAuthUser.role || 'user',
        emailVerified: betterAuthUser.emailVerified,
        phoneVerified: betterAuthUser.phoneVerified,
        preferences: betterAuthUser.preferences || defaultPreferences,
        lastLoginAt: betterAuthUser.lastLoginAt,
        isActive: true,
        createdAt: betterAuthUser.createdAt || new Date(),
        updatedAt: betterAuthUser.updatedAt || new Date()
    };
}

/**
 * Sign in with email and password
 */
export async function signIn(input: AuthenticateUserInput): Promise<ActionResult<{ user: any; redirectUrl: string }>> {
    try {
        if (!input.email || !input.password) {
            throw new ValidationError("Email and password are required", {
                email: input.email ? [] : ["Email is required"],
                password: input.password ? [] : ["Password is required"]
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email)) {
            throw new ValidationError("Invalid email format", {
                email: ["Invalid email format"]
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

        const userRole = ((result.user as any).role || 'user') as UserRole;

        await logger.info("Sign in successful", {
            userId: result.user.id,
            email: result.user.email,
            role: userRole
        });

        // Determine redirect URL based on user role
        const redirectUrl = getRedirectUrlForRole(userRole);

        return {
            success: true,
            data: { user: result.user, redirectUrl }
        };
    } catch (error) {
        await logger.error("Sign in error", error, { email: input.email });
        return handleActionError(error);
    }
}

/**
 * Sign up a new user
 */
export async function signUp(input: SignUpInput): Promise<ActionResult<{ user: any; redirectUrl: string }>> {
    try {
        if (!input.email || !input.password || !input.name) {
            throw new ValidationError("All fields are required", {
                email: input.email ? [] : ["Email is required"],
                password: input.password ? [] : ["Password is required"],
                name: input.name ? [] : ["Name is required"]
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email)) {
            throw new ValidationError("Invalid email format", {
                email: ["Invalid email format"]
            });
        }

        // Validate password strength
        if (input.password.length < 8) {
            throw new ValidationError("Password must be at least 8 characters", {
                password: ["Password must be at least 8 characters"]
            });
        }

        await logger.info("Sign up attempt", { email: input.email, name: input.name });

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
        const userRole = ((result.user as any).role || 'user') as UserRole;

        await logger.info("Sign up successful", {
            userId: result.user.id,
            email: result.user.email,
            role: userRole
        });

        // Determine redirect URL based on user role
        const redirectUrl = getRedirectUrlForRole(userRole);

        return {
            success: true,
            data: { user: result.user, redirectUrl }
        };
    } catch (error) {
        await logger.error("Sign up error", error, { email: input.email, name: input.name });
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
            data: undefined
        };
    } catch (error) {
        await logger.error("Sign out error", error);
        return handleActionError(error);
    }
}

/**
 * Request password reset
 */
export async function forgotPassword(input: ForgotPasswordInput): Promise<ActionResult<void>> {
    try {
        if (!input.email) {
            throw new ValidationError("Email is required", {
                email: ["Email is required"]
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email)) {
            throw new ValidationError("Invalid email format", {
                email: ["Invalid email format"]
            });
        }

        await logger.info("Password reset request", { email: input.email });

        // Use Better Auth to send password reset email
        await auth.api.forgetPassword({
            body: { email: input.email },
            headers: await headers(),
        });

        await logger.info("Password reset email sent", { email: input.email });

        return {
            success: true,
            data: undefined
        };
    } catch (error) {
        await logger.error("Forgot password error", error, { email: input.email });

        // For security, don't reveal if user exists or not
        if (error instanceof Error && error.message?.includes("User not found")) {
            return {
                success: true,
                data: undefined
            };
        }

        return handleActionError(error);
    }
}

/**
 * Reset password with token
 */
export async function resetPassword(input: ResetPasswordInput): Promise<ActionResult<void>> {
    try {
        if (!input.token || !input.password || !input.confirmPassword) {
            throw new ValidationError("All fields are required", {
                token: input.token ? [] : ["Token is required"],
                password: input.password ? [] : ["Password is required"],
                confirmPassword: input.confirmPassword ? [] : ["Password confirmation is required"]
            });
        }

        if (input.password !== input.confirmPassword) {
            throw new ValidationError("Passwords do not match", {
                confirmPassword: ["Passwords do not match"]
            });
        }

        // Validate password strength
        if (input.password.length < 8) {
            throw new ValidationError("Password must be at least 8 characters", {
                password: ["Password must be at least 8 characters"]
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
            data: undefined
        };
    } catch (error) {
        await logger.error("Reset password error", error, { token: input.token });
        return handleActionError(error);
    }
}

/**
 * Update user profile
 */
export async function updateUserProfile(input: UpdateUserProfileInput): Promise<ActionResult<User>> {
    try {
        // Get current session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new UnauthorizedError("Not authenticated");
        }

        if (!input.name && !input.email && !input.firstName && !input.lastName && !input.phone && !input.avatar && !input.bio && !input.location && !input.website) {
            throw new ValidationError("At least one field must be provided", {});
        }

        // Validate email if provided
        if (input.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.email)) {
                throw new ValidationError("Invalid email format", {
                    email: ["Invalid email format"]
                });
            }
        }

        await logger.info("Profile update attempt", {
            userId: session.user.id,
            name: input.name,
            email: input.email
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
            email: input.email
        });

        // Get updated session
        const updatedSession = await auth.api.getSession({
            headers: await headers(),
        });

        const updatedUser = updatedSession?.user ? convertBetterAuthUser(updatedSession.user) : null;

        return {
            success: true,
            data: updatedUser!
        };
    } catch (error) {
        await logger.error("Update profile error", error, {
            name: input.name,
            email: input.email
        });
        return handleActionError(error);
    }
}

/**
 * Change password for authenticated user
 */
export async function changePassword(input: ChangePasswordInput): Promise<ActionResult<void>> {
    try {
        // Get current session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new UnauthorizedError("Not authenticated");
        }

        if (!input.currentPassword || !input.newPassword || !input.confirmPassword) {
            throw new ValidationError("All fields are required", {
                currentPassword: input.currentPassword ? [] : ["Current password is required"],
                newPassword: input.newPassword ? [] : ["New password is required"],
                confirmPassword: input.confirmPassword ? [] : ["Password confirmation is required"]
            });
        }

        if (input.newPassword !== input.confirmPassword) {
            throw new ValidationError("New passwords do not match", {
                confirmPassword: ["New passwords do not match"]
            });
        }

        // Validate password strength
        if (input.newPassword.length < 8) {
            throw new ValidationError("New password must be at least 8 characters", {
                newPassword: ["New password must be at least 8 characters"]
            });
        }

        if (input.currentPassword === input.newPassword) {
            throw new ValidationError("New password must be different from current password", {
                newPassword: ["New password must be different from current password"]
            });
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

        await logger.info("Password changed successfully", { userId: session.user.id });

        return {
            success: true,
            data: undefined
        };
    } catch (error) {
        await logger.error("Change password error", error);
        return handleActionError(error);
    }
}

/**
 * Send verification OTP
 */
export async function sendVerificationOTP(input: SendVerificationOTPInput): Promise<ActionResult<void>> {
    try {
        if (!input.email) {
            throw new ValidationError("Email is required", {
                email: ["Email is required"]
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email)) {
            throw new ValidationError("Invalid email format", {
                email: ["Invalid email format"]
            });
        }

        await logger.info("Sending verification OTP", { email: input.email });

        // Use Better Auth to send OTP
        await auth.api.sendVerificationOTP({
            body: {
                email: input.email,
                type: "email-verification"
            },
            headers: await headers(),
        });

        await logger.info("Verification OTP sent successfully", { email: input.email });

        return {
            success: true,
            data: undefined
        };
    } catch (error) {
        await logger.error("Send verification OTP error", error, { email: input.email });
        return handleActionError(error);
    }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(input: VerifyOTPInput): Promise<ActionResult<void>> {
    try {
        if (!input.email || !input.otp) {
            throw new ValidationError("Email and OTP code are required", {
                email: input.email ? [] : ["Email is required"],
                otp: input.otp ? [] : ["OTP code is required"]
            });
        }

        // Validate OTP format (usually 6 digits)
        if (!/^\d{6}$/.test(input.otp)) {
            throw new ValidationError("OTP code must be 6 digits", {
                otp: ["OTP code must be 6 digits"]
            });
        }

        await logger.info("Verifying OTP", { email: input.email, otp: input.otp });

        // Use Better Auth to verify OTP
        const result = await auth.api.verifyEmailOTP({
            body: { email: input.email, otp: input.otp },
            headers: await headers(),
        });

        if (!result.user) {
            throw new ValidationError("Invalid or expired OTP code", {
                otp: ["Invalid or expired OTP code"]
            });
        }

        await logger.info("OTP verified successfully", {
            email: input.email,
            userId: result.user.id
        });

        return {
            success: true,
            data: undefined
        };
    } catch (error) {
        await logger.error("Verify OTP error", error, { email: input.email, otp: input.otp });
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
                data: null
            };
        }

        return {
            success: true,
            data: convertBetterAuthUser(session.user)
        };
    } catch (error) {
        await logger.error("Get current user error", error);
        return handleActionError(error);
    }
}

// Server action wrappers for form data (backward compatibility)
export async function signInAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const rememberMe = formData.get("rememberMe") === "true";

    const result = await signIn({ email, password, rememberMe });

    if (result.success && result.data?.redirectUrl) {
        redirect(result.data.redirectUrl);
    }

    return result;
}

export async function signUpAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;

    const result = await signUp({
        email,
        password,
        name,
        firstName,
        lastName,
        phone
    });

    if (result.success && result.data?.redirectUrl) {
        redirect(result.data.redirectUrl);
    }

    return result;
}

export async function signOutAction() {
    const result = await signOut();

    if (result.success) {
        redirect("/");
    }

    return result;
}

export async function forgotPasswordAction(formData: FormData) {
    const email = formData.get("email") as string;
    return forgotPassword({ email });
}

export async function resetPasswordAction(formData: FormData) {
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    return resetPassword({ token, password, confirmPassword });
}

export async function updateUserProfileAction(formData: FormData) {
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
        website: website || undefined
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