"use server";

import { revalidatePath } from "next/cache";
import * as logger from "@/lib/logger";
import { SearchLandsInput } from "@/application/dto/land/SearchLandsInput";
import { GetLandByIdInput } from "@/application/dto/land/GetLandByIdInput";
import { CreateLandInput } from "@/application/dto/land/CreateLandInput";
import { UpdateLandInput } from "@/application/dto/land/UpdateLandInput";
import { SearchLandsUseCase } from "@/application/use-cases/land/SearchLandsUseCase";
import { GetLandByIdUseCase } from "@/application/use-cases/land/GetLandByIdUseCase";
import { CreateLandUseCase } from "@/application/use-cases/land/CreateLandUseCase";
import { UpdateLandUseCase } from "@/application/use-cases/land/UpdateLandUseCase";
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
if (!container.has('SearchLandsUseCase')) {
    initializeContainer();
}

export async function getLandById(id: string): Promise<ActionState<any>> {
    try {
        const input = GetLandByIdInput.fromId(id);
        const getLandByIdUseCase = container.get<GetLandByIdUseCase>('GetLandByIdUseCase');
        const result = await getLandByIdUseCase.execute(input);

        if (!result) {
            return createErrorResponse("Land not found");
        }

        return createSuccessResponse(result, "Land retrieved successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        await logger.error("Failed to retrieve land", error, { landId: id });
        return createErrorResponse("Failed to retrieve land");
    }
}

export async function createLand(formData: FormData): Promise<ActionState<any>> {
    try {
        // Map form data to input DTO
        const input = CreateLandInput.fromFormData(formData);

        // Execute use case
        const createLandUseCase = container.get<CreateLandUseCase>('CreateLandUseCase');
        const result = await createLandUseCase.execute(input);

        // Revalidate cache
        revalidatePath("/dashboard/lands");
        revalidatePath("/search");

        // Return success response
        return createSuccessResponse(result, "Land created successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        await logger.error("Failed to create land", error);
        return createErrorResponse("Failed to create land");
    }
}

export async function updateLand(formData: FormData): Promise<ActionState<any>> {
    try {
        const input = UpdateLandInput.fromFormData(formData);
        const updateLandUseCase = container.get<UpdateLandUseCase>('UpdateLandUseCase');

        const result = await updateLandUseCase.execute(input);

        revalidatePath("/dashboard/lands");
        revalidatePath(`/lands/${result.id}`);
        revalidatePath("/search");

        return createSuccessResponse(result, "Land updated successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        await logger.error("Failed to update land", error);
        return createErrorResponse("Failed to update land");
    }
}

// Alias for createLand to match the task requirement
export const addLand = createLand;

export async function searchLands(formData: FormData): Promise<ActionState<any>> {
    try {
        await logger.info("Starting land search", {
            formDataKeys: Array.from(formData.keys())
        });

        const input = SearchLandsInput.fromFormData(formData);

        await logger.info("Created search input", {
            hasQuery: !!input.query,
            hasLocation: !!input.location,
            landTypes: input.landTypes,
            limit: input.limit,
            offset: input.offset
        });

        const searchLandsUseCase = container.get<SearchLandsUseCase>('SearchLandsUseCase');
        const result = await searchLandsUseCase.execute(input);

        await logger.info("Land search completed", {
            landsCount: result.lands?.length || 0,
            total: result.total
        });

        // Convert to plain object to avoid serialization issues
        const plainResult = result.toJSON();

        return createSuccessResponse(plainResult, "Lands retrieved successfully");
    } catch (error) {
        await logger.error("Failed to search lands", error, {
            formDataKeys: Array.from(formData.keys()),
            errorType: error?.constructor?.name,
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });

        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('validation')) {
                return createErrorResponse("Invalid search parameters provided");
            }
            if (error.message.includes('database')) {
                return createErrorResponse("Database connection error. Please try again.");
            }
            if (error.message.includes('container')) {
                return createErrorResponse("Service configuration error. Please contact support.");
            }
        }

        return createErrorResponse("Failed to search lands. Please try again.");
    }
}

// Alias for searchLands to match the task requirement
export const searchLandsAction = searchLands;

// This file contains the DDD-based land actions