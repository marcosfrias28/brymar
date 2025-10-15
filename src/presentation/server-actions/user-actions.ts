"use server";

import { revalidatePath } from "next/cache";
import * as logger from "@/lib/logger";
import { CreateUserInput } from "@/application/dto/user/CreateUserInput";
import { UpdateUserProfileInput } from "@/application/dto/user/UpdateUserProfileInput";
import { RemoveFavoriteInput } from "@/application/dto/user/RemoveFavoriteInput";
import { MarkNotificationAsReadInput } from "@/application/dto/user/MarkNotificationAsReadInput";
import { MarkAllNotificationsAsReadInput } from "@/application/dto/user/MarkAllNotificationsAsReadInput";
import { RegisterUserUseCase } from "@/application/use-cases/user/RegisterUserUseCase";
import { UpdateUserProfileUseCase } from "@/application/use-cases/user/UpdateUserProfileUseCase";
// import { AuthenticateUserUseCase } from "@/application/use-cases/user/AuthenticateUserUseCase";
import { RemoveFavoriteUseCase } from "@/application/use-cases/user/RemoveFavoriteUseCase";
import { MarkNotificationAsReadUseCase } from "@/application/use-cases/user/MarkNotificationAsReadUseCase";
import { MarkAllNotificationsAsReadUseCase } from "@/application/use-cases/user/MarkAllNotificationsAsReadUseCase";
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

export async function registerUser(formData: FormData): Promise<ActionState> {
    const email = formData.get("email") as string;

    try {
        const input = CreateUserInput.fromFormData(formData);
        const registerUserUseCase = container.get<RegisterUserUseCase>("RegisterUserUseCase");

        await registerUserUseCase.execute(input);

        return createSuccessResponse(undefined, "User registered successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        await logger.error("Failed to register user", error, { email });
        return createErrorResponse("Failed to register user");
    }
}

export async function updateUserProfile(formData: FormData): Promise<ActionState> {
    const userId = formData.get('userId') as string;

    try {
        if (!userId) {
            return createErrorResponse("User ID is required");
        }

        const input = UpdateUserProfileInput.fromFormData(formData, userId);
        const updateUserProfileUseCase = container.get<UpdateUserProfileUseCase>("UpdateUserProfileUseCase");

        await updateUserProfileUseCase.execute(input);

        revalidatePath("/profile");

        return createSuccessResponse(undefined, "Profile updated successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        await logger.error("Failed to update profile", error, { userId });
        return createErrorResponse("Failed to update profile");
    }
}

export async function authenticateUser(formData: FormData): Promise<ActionState> {
    // TODO: AuthenticateUserUseCase requires ISessionRepository, IPasswordService, ITokenService
    // which are not yet implemented. For now, return a stub response.
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        if (!email || !password) {
            return createErrorResponse("Email and password are required");
        }

        // Stub implementation - replace with real authentication when services are available
        await logger.info("Authentication attempt", { email });

        return createSuccessResponse(undefined, "Authentication successful");
    } catch (error) {
        await logger.error("Authentication failed", error, { email });
        return createErrorResponse("Authentication failed");
    }
}

export async function removeFavoriteAction(formData: FormData): Promise<ActionState> {
    const userId = formData.get("userId") as string;
    const propertyId = formData.get("propertyId") as string;

    try {
        const input = RemoveFavoriteInput.fromFormData(formData);
        const removeFavoriteUseCase = container.get<RemoveFavoriteUseCase>("RemoveFavoriteUseCase");

        const result = await removeFavoriteUseCase.execute(input);

        revalidatePath("/profile");
        revalidatePath("/dashboard");

        return createSuccessResponse(undefined, result.getMessage() || "Favorite removed successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        await logger.error("Failed to remove favorite", error, { userId, propertyId });
        return createErrorResponse("Failed to remove favorite");
    }
}

export async function markNotificationAsReadAction(formData: FormData): Promise<ActionState> {
    const userId = formData.get("userId") as string;
    const notificationId = formData.get("notificationId") as string;

    try {
        const input = MarkNotificationAsReadInput.fromFormData(formData);
        const markNotificationAsReadUseCase = container.get<MarkNotificationAsReadUseCase>("MarkNotificationAsReadUseCase");

        const result = await markNotificationAsReadUseCase.execute(input);

        revalidatePath("/profile");
        revalidatePath("/dashboard");

        return createSuccessResponse(undefined, result.getMessage() || "Notification marked as read successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        await logger.error("Failed to mark notification as read", error, { userId, notificationId });
        return createErrorResponse("Failed to mark notification as read");
    }
}

export async function markAllNotificationsAsReadAction(formData: FormData): Promise<ActionState> {
    const userId = formData.get("userId") as string;

    try {
        const input = MarkAllNotificationsAsReadInput.fromFormData(formData);
        const markAllNotificationsAsReadUseCase = container.get<MarkAllNotificationsAsReadUseCase>("MarkAllNotificationsAsReadUseCase");

        const result = await markAllNotificationsAsReadUseCase.execute(input);

        revalidatePath("/profile");
        revalidatePath("/dashboard");

        return createSuccessResponse(undefined, result.getMessage() || "All notifications marked as read successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        await logger.error("Failed to mark all notifications as read", error, { userId });
        return createErrorResponse("Failed to mark all notifications as read");
    }
}