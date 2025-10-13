"use server";

import { redirect } from "next/navigation";
import { AuthenticateUserUseCase } from "@/application/use-cases/user/AuthenticateUserUseCase";
import { RegisterUserUseCase } from "@/application/use-cases/user/RegisterUserUseCase";
import {
    createSuccessResponse,
    createErrorResponse,
    type ActionState
} from "@/lib/validations";
import { DomainError } from "@/domain/shared/errors/DomainError";
import { ApplicationError } from "@/application/errors/ApplicationError";

export async function signIn(formData: FormData): Promise<ActionState> {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email || !password) {
            return createErrorResponse("Email and password are required");
        }

        const authenticateUserUseCase = new AuthenticateUserUseCase(/* dependencies */);

        const result = await authenticateUserUseCase.execute({ email, password });

        // Redirect on successful authentication
        redirect("/dashboard");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        console.error("Sign in error:", error);
        return createErrorResponse("Sign in failed");
    }
}

export async function signUp(formData: FormData): Promise<ActionState> {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;

        if (!email || !password || !firstName || !lastName) {
            return createErrorResponse("All fields are required");
        }

        const registerUserUseCase = new RegisterUserUseCase(/* dependencies */);

        const result = await registerUserUseCase.execute({
            email,
            password,
            profile: {
                firstName,
                lastName
            }
        });

        return createSuccessResponse(result, "Account created successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        console.error("Sign up error:", error);
        return createErrorResponse("Sign up failed");
    }
}

export async function signOut(): Promise<void> {
    // Implementation would use auth service to sign out
    redirect("/");
}