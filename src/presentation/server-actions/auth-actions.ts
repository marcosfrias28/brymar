"use server";

import { redirect } from "next/navigation";
import * as logger from "@/lib/logger";
import {
    RegisterUserUseCase,
    UpdateUserProfileUseCase
} from "@/application/use-cases/user";
import {
    CreateUserInput,
    UpdateUserProfileInput
} from "@/application/dto/user";
import {
    createSuccessResponse,
    createErrorResponse,
    type ActionState
} from "@/lib/validations";
import { DomainError } from "@/domain/shared/errors/DomainError";
import { ApplicationError } from "@/application/errors/ApplicationError";
import { container } from "@/infrastructure/container/Container";
import { initializeContainer } from "@/infrastructure/container/ServiceRegistration";

// Initialize container if not already done
if (!container.has('RegisterUserUseCase')) {
    initializeContainer();
}

export async function signIn(formData: FormData): Promise<ActionState> {
    // TODO: AuthenticateUserUseCase requires ISessionRepository, IPasswordService, ITokenService
    // which are not yet implemented. For now, return a stub response.
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        if (!email || !password) {
            return createErrorResponse("Email and password are required");
        }

        // Stub implementation - replace with real authentication when services are available
        await logger.info("Sign in attempt", { email });

        // For now, redirect to dashboard (in real implementation, this would be after successful auth)
        redirect("/dashboard");
    } catch (error) {
        await logger.error("Sign in failed", error, { email });
        return createErrorResponse("Sign in failed");
    }
}

export async function signUp(formData: FormData): Promise<ActionState> {
    const email = formData.get("email") as string;

    try {
        const input = CreateUserInput.fromFormData(formData);
        const registerUserUseCase = container.get<RegisterUserUseCase>('RegisterUserUseCase');

        await registerUserUseCase.execute(input);

        return createSuccessResponse(undefined, "Account created successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        await logger.error("Sign up failed", error, { email });
        return createErrorResponse("Sign up failed");
    }
}

export async function signOut(): Promise<void> {
    // Implementation would use auth service to sign out
    redirect("/");
}

export async function forgotPassword(formData: FormData): Promise<ActionState> {
    // TODO: ForgotPasswordUseCase requires email service and token generation
    // which are not yet fully implemented. For now, return a stub response.
    const email = formData.get("email") as string;

    try {
        if (!email) {
            return createErrorResponse("Email is required");
        }

        // Stub implementation - replace with real forgot password when services are available
        await logger.info("Forgot password request", { email });

        return createSuccessResponse(undefined, "Password reset instructions sent to your email");
    } catch (error) {
        await logger.error("Failed to process password reset request", error, { email });
        return createErrorResponse("Failed to process password reset request");
    }
}

export async function resetPassword(formData: FormData): Promise<ActionState> {
    // TODO: ResetPasswordUseCase requires password hashing and token validation
    // which are not yet fully implemented. For now, return a stub response.
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;

    try {
        if (!token || !password) {
            return createErrorResponse("Token and new password are required");
        }

        // Stub implementation - replace with real reset password when services are available
        await logger.info("Reset password attempt", { token });

        return createSuccessResponse(undefined, "Password reset successfully");
    } catch (error) {
        await logger.error("Failed to reset password", error, { token });
        return createErrorResponse("Failed to reset password");
    }
}

export async function sendVerificationOTP(formData: FormData): Promise<ActionState> {
    // TODO: SendVerificationOTPUseCase requires OTP generation and email service
    // which are not yet fully implemented. For now, return a stub response.
    const email = formData.get("email") as string;

    try {
        if (!email) {
            return createErrorResponse("Email is required");
        }

        // Stub implementation - replace with real OTP sending when services are available
        await logger.info("Send verification OTP request", { email });

        return createSuccessResponse(undefined, "Verification code sent to your email");
    } catch (error) {
        await logger.error("Failed to send verification code", error, { email });
        return createErrorResponse("Failed to send verification code");
    }
}

export async function verifyOTP(formData: FormData): Promise<ActionState> {
    // TODO: VerifyOTPUseCase requires OTP validation logic
    // which is not yet fully implemented. For now, return a stub response.
    const email = formData.get("email") as string;
    const otp = formData.get("otp") as string;

    try {
        if (!email || !otp) {
            return createErrorResponse("Email and verification code are required");
        }

        // Stub implementation - replace with real OTP verification when services are available
        await logger.info("Verify OTP attempt", { email, otp });

        return createSuccessResponse(undefined, "Email verified successfully");
    } catch (error) {
        await logger.error("Failed to verify code", error, { email, otp });
        return createErrorResponse("Failed to verify code");
    }
}

export async function updateUserAction(formData: FormData): Promise<ActionState> {
    const userId = formData.get("userId") as string;

    try {
        if (!userId) {
            return createErrorResponse("User ID is required");
        }

        const input = UpdateUserProfileInput.fromFormData(formData, userId);
        const updateUserProfileUseCase = container.get<UpdateUserProfileUseCase>('UpdateUserProfileUseCase');

        await updateUserProfileUseCase.execute(input);

        return createSuccessResponse(undefined, "User profile updated successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        await logger.error("Failed to update user profile", error, { userId });
        return createErrorResponse("Failed to update user profile");
    }
}