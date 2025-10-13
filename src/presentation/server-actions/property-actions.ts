"use server";

import { revalidatePath } from "next/cache";
import { CreatePropertyInput } from "@/application/dto/property/CreatePropertyInput";
import { UpdatePropertyInput } from "@/application/dto/property/UpdatePropertyInput";
import { SearchPropertiesInput } from "@/application/dto/property/SearchPropertiesInput";
import { CreatePropertyUseCase } from "@/application/use-cases/property/CreatePropertyUseCase";
import { UpdatePropertyUseCase } from "@/application/use-cases/property/UpdatePropertyUseCase";
import { SearchPropertiesUseCase } from "@/application/use-cases/property/SearchPropertiesUseCase";
import { PublishPropertyUseCase } from "@/application/use-cases/property/PublishPropertyUseCase";
import {
    createSuccessResponse,
    createErrorResponse,
    type ActionState
} from "@/lib/validations";
import { DomainError } from "@/domain/shared/errors/DomainError";
import { ApplicationError } from "@/application/errors/ApplicationError";

// Container would be injected here in a real implementation
// For now, we'll create instances directly
const createPropertyUseCase = new CreatePropertyUseCase(
    // Dependencies would be injected from container
);

export async function createProperty(formData: FormData): Promise<ActionState> {
    try {
        // Map form data to input DTO
        const input = CreatePropertyInput.fromFormData(formData);

        // Execute use case
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

        console.error("Create property error:", error);
        return createErrorResponse("Failed to create property");
    }
}

export async function updateProperty(formData: FormData): Promise<ActionState> {
    try {
        const input = UpdatePropertyInput.fromFormData(formData);
        const updatePropertyUseCase = new UpdatePropertyUseCase(/* dependencies */);

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

        console.error("Update property error:", error);
        return createErrorResponse("Failed to update property");
    }
}

export async function searchProperties(formData: FormData): Promise<ActionState> {
    try {
        const input = SearchPropertiesInput.fromFormData(formData);
        const searchPropertiesUseCase = new SearchPropertiesUseCase(/* dependencies */);

        const result = await searchPropertiesUseCase.execute(input);

        return createSuccessResponse(result, "Properties retrieved successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        console.error("Search properties error:", error);
        return createErrorResponse("Failed to search properties");
    }
}

export async function publishProperty(formData: FormData): Promise<ActionState> {
    try {
        const publishPropertyUseCase = new PublishPropertyUseCase(/* dependencies */);

        // Extract property ID from form data
        const propertyId = formData.get("propertyId") as string;
        if (!propertyId) {
            return createErrorResponse("Property ID is required");
        }

        const result = await publishPropertyUseCase.execute({ propertyId });

        revalidatePath("/dashboard/properties");
        revalidatePath(`/properties/${propertyId}`);

        return createSuccessResponse(result, "Property published successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        console.error("Publish property error:", error);
        return createErrorResponse("Failed to publish property");
    }
}

// Note: Legacy functions are available in @/lib/actions/property-actions
// This file contains the new DDD-based implementations