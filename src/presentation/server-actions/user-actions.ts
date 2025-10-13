"use server";

import { revalidatePath } from "next/cache";
import { CreateUserInput } from "@/application/dto/user/CreateUserInput";
import { UpdateUserProfileInput } from "@/application/dto/user/UpdateUserProfileInput";
import { RegisterUserUseCase } from "@/application/use-cases/user/RegisterUserUseCase";
import { UpdateUserProfileUseCase } from "@/application/use-cases/user/UpdateUserProfileUseCase";
import { AuthenticateUserUseCase } from "@/application/use-cases/user/AuthenticateUserUseCase";
import {
    createSuccessResponse,
    createErrorResponse,
    type ActionState
} from "@/lib/validations";
import { DomainError } from "@/domain/shared/errors/DomainError";
import { ApplicationError } from "@/application/errors/ApplicationError";

export async function registerUser(formData: FormData): Promise<ActionState> {
    try {
        const input = CreateUserInput.fromFormData(formData);
        const registerUserUseCase = new RegisterUserUseCase(/* dependencies */);

        const result = await registerUserUseCase.execute(input);

        return createSuccessResponse(result, "User registered successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        console.error("Register user error:", error);
        return createErrorResponse("Failed to register user");
    }
}

export async function updateUserProfile(formData: FormData): Promise<ActionState> {
    try {
        const input = UpdateUserProfileInput.fromFormData(formData);
        const updateUserProfileUseCase = new UpdateUserProfileUseCase(/* dependencies */);

        const result = await updateUserProfileUseCase.execute(input);

        revalidatePath("/profile");

        return createSuccessResponse(result, "Profile updated successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        console.error("Update profile error:", error);
        return createErrorResponse("Failed to update profile");
    }
}

export async function authenticateUser(formData: FormData): Promise<ActionState> {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email || !password) {
            return createErrorResponse("Email and password are required");
        }

        const authenticateUserUseCase = new AuthenticateUserUseCase(/* dependencies */);

        const result = await authenticateUserUseCase.execute({ email, password });

        return createSuccessResponse(result, "Authentication successful");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        console.error("Authentication error:", error);
        return createErrorResponse("Authentication failed");
    }
}