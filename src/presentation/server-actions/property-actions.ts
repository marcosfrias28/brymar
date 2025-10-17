"use server";

import { revalidatePath } from "next/cache";
import * as logger from "@/lib/logger";
import { CreatePropertyInput } from "@/application/dto/property/CreatePropertyInput";
import { UpdatePropertyInput } from "@/application/dto/property/UpdatePropertyInput";
import { SearchPropertiesInput } from "@/application/dto/property/SearchPropertiesInput";
import { GetPropertyByIdInput } from "@/application/dto/property/GetPropertyByIdInput";
import { PublishPropertyInput } from "@/application/dto/property/PublishPropertyInput";
import { CreatePropertyUseCase } from "@/application/use-cases/property/CreatePropertyUseCase";
import { UpdatePropertyUseCase } from "@/application/use-cases/property/UpdatePropertyUseCase";
import { SearchPropertiesUseCase } from "@/application/use-cases/property/SearchPropertiesUseCase";
import { PublishPropertyUseCase } from "@/application/use-cases/property/PublishPropertyUseCase";
import { GetPropertyByIdUseCase } from "@/application/use-cases/property/GetPropertyByIdUseCase";
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
if (!container.has('CreatePropertyUseCase')) {
    initializeContainer();
}

export async function getPropertyById(id: string): Promise<ActionState<any>> {
    try {
        const input = GetPropertyByIdInput.fromId(id);
        const getPropertyByIdUseCase = container.get<GetPropertyByIdUseCase>('GetPropertyByIdUseCase');
        const result = await getPropertyByIdUseCase.execute(input);

        if (!result) {
            return createErrorResponse("Property not found");
        }

        return createSuccessResponse(result, "Property retrieved successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        await logger.error("Failed to retrieve property", error, { propertyId: id });
        return createErrorResponse("Failed to retrieve property");
    }
}

export async function createProperty(formData: FormData): Promise<ActionState<any>> {
    try {
        // Map form data to input DTO
        const input = CreatePropertyInput.fromFormData(formData);

        // Execute use case
        const createPropertyUseCase = container.get<CreatePropertyUseCase>('CreatePropertyUseCase');
        const result = await createPropertyUseCase.execute(input);

        // Revalidate cache
        revalidatePath("/dashboard/properties");

        // Return success response
        return createSuccessResponse(result, "Property created successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        await logger.error("Failed to create property", error);
        return createErrorResponse("Failed to create property");
    }
}

export async function updateProperty(formData: FormData): Promise<ActionState<any>> {
    try {
        const input = UpdatePropertyInput.fromFormData(formData);
        const updatePropertyUseCase = container.get<UpdatePropertyUseCase>('UpdatePropertyUseCase');

        const result = await updatePropertyUseCase.execute(input);

        revalidatePath("/dashboard/properties");
        revalidatePath(`/properties/${result.id}`);

        return createSuccessResponse(result, "Property updated successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        await logger.error("Failed to update property", error);
        return createErrorResponse("Failed to update property");
    }
}

// Alias for createProperty to match the task requirement
export const addProperty = createProperty;

export async function searchProperties(formData: FormData): Promise<ActionState<any>> {
    try {
        await logger.info("Starting property search", {
            formDataKeys: Array.from(formData.keys())
        });

        const input = SearchPropertiesInput.fromFormData(formData);

        await logger.info("Created search input", {
            hasQuery: !!input.query,
            hasLocation: !!input.location,
            propertyTypes: input.propertyTypes,
            limit: input.limit,
            offset: input.offset
        });

        const searchPropertiesUseCase = container.get<SearchPropertiesUseCase>('SearchPropertiesUseCase');
        const result = await searchPropertiesUseCase.execute(input);

        await logger.info("Search completed", {
            propertiesCount: result.properties?.length || 0,
            total: result.total
        });

        // Convert to plain object to avoid serialization issues with Next.js
        const plainResult = result.toJSON();

        return createSuccessResponse(plainResult, "Properties retrieved successfully");
    } catch (error) {
        await logger.error("Failed to search properties", error, {
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

        return createErrorResponse("Failed to search properties. Please try again.");
    }
}

// Alias for searchProperties to match the task requirement
export const searchPropertiesAction = searchProperties;

export async function publishProperty(formData: FormData): Promise<ActionState<any>> {
    try {
        const input = PublishPropertyInput.fromFormData(formData);
        const publishPropertyUseCase = container.get<PublishPropertyUseCase>('PublishPropertyUseCase');
        const result = await publishPropertyUseCase.execute(input);

        revalidatePath("/dashboard/properties");
        revalidatePath(`/properties/${input.id}`);

        return createSuccessResponse(result, "Property published successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        await logger.error("Failed to publish property", error);
        return createErrorResponse("Failed to publish property");
    }
}

// Note: Legacy functions are available in @/lib/actions/property-actions
// This file contains the new DDD-based implementations