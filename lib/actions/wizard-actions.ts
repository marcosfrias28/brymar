"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import {
    type ActionState,
    createValidatedAction,
    createSuccessResponse,
    createErrorResponse,
} from "@/lib/validations";
import db from "@/lib/db/drizzle";
import {
    properties,
    propertyDrafts,
    propertyImages,
    propertyVideos,
    aiGenerations,
    propertyCharacteristics,
    propertyDraftCharacteristics,
} from "@/lib/db/schema";
import { PropertyFormDataSchema } from "@/lib/schemas/wizard-schemas";
import type { PropertyFormData } from "@/types/wizard";
import { calculateCompletionPercentage } from "@/lib/utils/wizard-validation";
import { ValidationError, WizardError, DraftServiceError } from "../errors/wizard-errors";
import { validatePropertyFormData } from "../validation/server-validation";
import { retryDraftOperation } from "../utils/retry-logic";

// Security imports
import { sanitizeFormData } from "../security/input-sanitization";
import { checkFormSubmissionRateLimit, checkDraftSaveRateLimit, recordSuccessfulOperation, recordFailedOperation } from "../security/rate-limiting";
import { validateCSRFInServerAction } from "../security/csrf-protection";

// Schema for publishing a property from wizard
const publishPropertySchema = PropertyFormDataSchema.extend({
    userId: z.string().min(1, "User ID is required"),
    _csrf_token: z.string().optional(), // CSRF token
});

// Schema for saving a draft
const saveDraftSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    formData: z.union([
        z.record(z.any()), // Object format
        z.string() // JSON string format - will be parsed in the action
    ]),
    stepCompleted: z.number().min(0).max(4).optional(),
    draftId: z.string().optional(), // For updating existing draft
    _csrf_token: z.string().optional(), // CSRF token
});

// Schema for loading a draft
const loadDraftSchema = z.object({
    draftId: z.string().min(1, "Draft ID is required"),
    userId: z.string().min(1, "User ID is required"),
});

// Schema for deleting a draft
const deleteDraftSchema = z.object({
    draftId: z.string().min(1, "Draft ID is required"),
    userId: z.string().min(1, "User ID is required"),
});

/**
 * Publish a property from the wizard
 */
async function publishPropertyAction(
    data: PropertyFormData & { userId: string; _csrf_token?: string }
): Promise<ActionState<{ propertyId: number }>> {
    const clientId = `user:${data.userId}`;

    try {
        // CSRF Protection
        if (data._csrf_token) {
            await validateCSRFInServerAction(data, data.userId);
        }

        // Rate limiting
        await checkFormSubmissionRateLimit(clientId);

        // Input sanitization
        const sanitizedData = sanitizeFormData(data) as PropertyFormData & { userId: string };

        // Server-side validation
        await validatePropertyFormData(sanitizedData);
        // Convert wizard data to existing property schema format
        const propertyData = {
            title: sanitizedData.title,
            description: sanitizedData.description,
            price: sanitizedData.price,
            type: sanitizedData.propertyType,
            bedrooms: sanitizedData.bedrooms || 0,
            bathrooms: sanitizedData.bathrooms || 0,
            area: sanitizedData.surface,
            location: sanitizedData.address?.formattedAddress || `${sanitizedData.address?.city}, ${sanitizedData.address?.province}`,
            status: "sale", // Default status - can be enhanced later
            featured: false,
            images: sanitizedData.images?.map((img) => img.url) || [], // Convert to simple URL array for existing schema compatibility
        };

        // Insert the property using existing schema
        const [newProperty] = await db
            .insert(properties)
            .values(propertyData)
            .returning({ id: properties.id });

        // Store wizard-specific metadata in propertyImages table
        if (sanitizedData.images && sanitizedData.images.length > 0) {
            const imageRecords = sanitizedData.images.map((img, index) => ({
                id: img.id,
                propertyId: newProperty.id,
                userId: sanitizedData.userId,
                url: img.url,
                filename: img.filename,
                originalFilename: img.filename,
                size: img.size,
                contentType: img.contentType,
                width: img.width,
                height: img.height,
                displayOrder: img.displayOrder || index,
            }));

            await db.insert(propertyImages).values(imageRecords);
        }

        // Store AI generation metadata if applicable
        if (sanitizedData.aiGenerated) {
            const aiRecords = [];

            if (sanitizedData.aiGenerated.title) {
                aiRecords.push({
                    id: crypto.randomUUID(),
                    propertyId: newProperty.id,
                    userId: sanitizedData.userId,
                    generationType: "title" as const,
                    inputData: { propertyType: sanitizedData.propertyType, price: sanitizedData.price },
                    generatedContent: sanitizedData.title,
                    language: sanitizedData.language || "es",
                    success: true,
                });
            }

            if (sanitizedData.aiGenerated.description) {
                aiRecords.push({
                    id: crypto.randomUUID(),
                    propertyId: newProperty.id,
                    userId: sanitizedData.userId,
                    generationType: "description" as const,
                    inputData: {
                        propertyType: sanitizedData.propertyType,
                        price: sanitizedData.price,
                        characteristics: sanitizedData.characteristics?.map(c => c.name) || []
                    },
                    generatedContent: sanitizedData.description,
                    language: sanitizedData.language || "es",
                    success: true,
                });
            }

            if (aiRecords.length > 0) {
                await db.insert(aiGenerations).values(aiRecords);
            }
        }

        // Clean up draft if this was published from a draft
        if (sanitizedData.status === "published") {
            await db
                .delete(propertyDrafts)
                .where(eq(propertyDrafts.userId, sanitizedData.userId));
        }

        // Record successful operation
        await recordSuccessfulOperation('formSubmission', clientId);

        revalidatePath("/dashboard/properties");
        revalidatePath("/properties");

        return createSuccessResponse(
            { propertyId: newProperty.id },
            "¡Propiedad publicada exitosamente!"
        );
    } catch (error) {
        console.error("Error publishing property:", error);

        // Record failed operation
        await recordFailedOperation('formSubmission', clientId);

        // Enhanced error handling
        if (error instanceof ValidationError) {
            return createErrorResponse(error.userMessage) as ActionState<{ propertyId: number }>;
        }

        if (error instanceof WizardError) {
            return createErrorResponse(error.userMessage) as ActionState<{ propertyId: number }>;
        }

        return createErrorResponse("Error al publicar la propiedad") as ActionState<{ propertyId: number }>;
    }
}

export const publishProperty = createValidatedAction(
    publishPropertySchema,
    publishPropertyAction
);

// Schema for updating an existing property
const updatePropertySchema = publishPropertySchema.extend({
    propertyId: z.number().min(1, "Property ID is required"),
});

/**
 * Update an existing property from the wizard
 */
async function updatePropertyAction(
    data: PropertyFormData & { userId: string; propertyId: number }
): Promise<ActionState<{ propertyId: number }>> {
    try {
        // Convert wizard data to existing property schema format
        const propertyData = {
            title: data.title,
            description: data.description,
            price: data.price,
            type: data.propertyType,
            bedrooms: data.bedrooms || 0,
            bathrooms: data.bathrooms || 0,
            area: data.surface,
            location: data.address?.formattedAddress || `${data.address?.city}, ${data.address?.province}`,
            status: "sale", // Keep existing status logic
            featured: false, // Keep existing featured status
            images: data.images?.map((img) => img.url) || [],
            updatedAt: new Date(),
        };

        // Update the property
        await db
            .update(properties)
            .set(propertyData)
            .where(eq(properties.id, data.propertyId));

        // Update wizard-specific metadata in propertyImages table
        // First, delete existing images for this property
        await db
            .delete(propertyImages)
            .where(eq(propertyImages.propertyId, data.propertyId));

        // Insert new images
        if (data.images && data.images.length > 0) {
            const imageRecords = data.images.map((img, index) => ({
                id: img.id,
                propertyId: data.propertyId,
                userId: data.userId,
                url: img.url,
                filename: img.filename,
                originalFilename: img.filename,
                size: img.size,
                contentType: img.contentType,
                width: img.width,
                height: img.height,
                displayOrder: img.displayOrder || index,
            }));

            await db.insert(propertyImages).values(imageRecords);
        }

        // Update AI generation metadata if applicable
        if (data.aiGenerated) {
            // Delete existing AI generations for this property
            await db
                .delete(aiGenerations)
                .where(eq(aiGenerations.propertyId, data.propertyId));

            const aiRecords = [];

            if (data.aiGenerated.title) {
                aiRecords.push({
                    id: crypto.randomUUID(),
                    propertyId: data.propertyId,
                    userId: data.userId,
                    generationType: "title" as const,
                    inputData: { propertyType: data.propertyType, price: data.price },
                    generatedContent: data.title,
                    language: data.language || "es",
                    success: true,
                });
            }

            if (data.aiGenerated.description) {
                aiRecords.push({
                    id: crypto.randomUUID(),
                    propertyId: data.propertyId,
                    userId: data.userId,
                    generationType: "description" as const,
                    inputData: {
                        propertyType: data.propertyType,
                        price: data.price,
                        characteristics: data.characteristics?.map(c => c.name) || []
                    },
                    generatedContent: data.description,
                    language: data.language || "es",
                    success: true,
                });
            }

            if (aiRecords.length > 0) {
                await db.insert(aiGenerations).values(aiRecords);
            }
        }

        revalidatePath("/dashboard/properties");
        revalidatePath(`/dashboard/properties/${data.propertyId}`);
        revalidatePath("/properties");

        return createSuccessResponse(
            { propertyId: data.propertyId },
            "¡Propiedad actualizada exitosamente!"
        );
    } catch (error) {
        console.error("Error updating property:", error);

        // Enhanced error handling
        if (error instanceof ValidationError) {
            return createErrorResponse(error.userMessage) as ActionState<{ propertyId: number }>;
        }

        if (error instanceof WizardError) {
            return createErrorResponse(error.userMessage) as ActionState<{ propertyId: number }>;
        }

        return createErrorResponse("Error al actualizar la propiedad") as ActionState<{ propertyId: number }>;
    }
}

export const updateProperty = createValidatedAction(
    updatePropertySchema,
    updatePropertyAction
);

/**
 * Save property as draft
 */
async function saveDraftAction(data: {
    userId: string;
    formData: Record<string, any> | string;
    stepCompleted?: number;
    draftId?: string;
    _csrf_token?: string;
}): Promise<ActionState<{ draftId: string }>> {
    const clientId = `user:${data.userId}`;

    try {
        // CSRF Protection
        if (data._csrf_token) {
            await validateCSRFInServerAction(data, data.userId);
        }

        // Rate limiting
        await checkDraftSaveRateLimit(clientId);

        // Parse formData if it's a string
        let parsedFormData: Record<string, any>;
        if (typeof data.formData === 'string') {
            try {
                parsedFormData = JSON.parse(data.formData);
            } catch (error) {
                return createErrorResponse("Invalid JSON in formData") as ActionState<{ draftId: string }>;
            }
        } else {
            parsedFormData = data.formData;
        }

        // Input sanitization
        const sanitizedFormData = sanitizeFormData(parsedFormData);
        const draftData = {
            userId: data.userId,
            formData: sanitizedFormData,
            stepCompleted: data.stepCompleted || 0,
            title: sanitizedFormData.title || "Borrador sin título",
            propertyType: sanitizedFormData.propertyType || null,
            completionPercentage: calculateCompletionPercentage(sanitizedFormData),
            updatedAt: new Date(),
        };

        let draftId: string;

        if (data.draftId) {
            // Update existing draft
            await db
                .update(propertyDrafts)
                .set(draftData)
                .where(eq(propertyDrafts.id, data.draftId));
            draftId = data.draftId;
        } else {
            // Create new draft
            const newDraftId = crypto.randomUUID();
            await db.insert(propertyDrafts).values({
                id: newDraftId,
                ...draftData,
            });
            draftId = newDraftId;
        }

        // Record successful operation
        await recordSuccessfulOperation('draftSave', clientId);

        return createSuccessResponse(
            { draftId },
            "Borrador guardado exitosamente"
        );
    } catch (error) {
        console.error("Error saving draft:", error);

        // Record failed operation
        await recordFailedOperation('draftSave', clientId);

        return createErrorResponse("Error al guardar el borrador") as ActionState<{ draftId: string }>;
    }
}

export const saveDraft = createValidatedAction(saveDraftSchema, saveDraftAction);

/**
 * Load a draft by ID
 */
async function loadDraftAction(data: {
    draftId: string;
    userId: string;
}): Promise<ActionState<{ draft: any }>> {
    try {
        const [draft] = await db
            .select()
            .from(propertyDrafts)
            .where(eq(propertyDrafts.id, data.draftId));

        if (!draft) {
            return createErrorResponse("Borrador no encontrado") as ActionState<{ draft: any }>;
        }

        if (draft.userId !== data.userId) {
            return createErrorResponse("No tienes permisos para acceder a este borrador") as ActionState<{ draft: any }>;
        }

        return createSuccessResponse({ draft }, "Borrador cargado exitosamente");
    } catch (error) {
        console.error("Error loading draft:", error);
        return createErrorResponse("Error al cargar el borrador") as ActionState<{ draft: any }>;
    }
}

export const loadDraft = createValidatedAction(loadDraftSchema, loadDraftAction);

/**
 * Delete a draft
 */
async function deleteDraftAction(data: {
    draftId: string;
    userId: string;
}): Promise<ActionState> {
    try {
        const result = await db
            .delete(propertyDrafts)
            .where(eq(propertyDrafts.id, data.draftId))
            .returning({ id: propertyDrafts.id });

        if (result.length === 0) {
            return createErrorResponse("Borrador no encontrado");
        }

        return createSuccessResponse(undefined, "Borrador eliminado exitosamente");
    } catch (error) {
        console.error("Error deleting draft:", error);
        return createErrorResponse("Error al eliminar el borrador");
    }
}

export const deleteDraft = createValidatedAction(
    deleteDraftSchema,
    deleteDraftAction
);

/**
 * Get user's drafts
 */
export async function getUserDrafts(userId: string) {
    try {
        const drafts = await db
            .select()
            .from(propertyDrafts)
            .where(eq(propertyDrafts.userId, userId))
            .orderBy(desc(propertyDrafts.updatedAt));

        return drafts;
    } catch (error) {
        console.error("Error fetching user drafts:", error);
        return [];
    }
}

/**
 * Convert existing property to wizard format for editing
 */
export async function convertPropertyToWizardFormat(propertyId: number): Promise<Partial<PropertyFormData> | null> {
    try {
        // Get the property
        const [property] = await db
            .select()
            .from(properties)
            .where(eq(properties.id, propertyId));

        if (!property) {
            return null;
        }

        // Get associated images
        const images = await db
            .select()
            .from(propertyImages)
            .where(eq(propertyImages.propertyId, propertyId));

        // Get AI generation metadata
        const aiGenerationRecords = await db
            .select()
            .from(aiGenerations)
            .where(eq(aiGenerations.propertyId, propertyId));

        // Convert to wizard format
        const wizardData: Partial<PropertyFormData> = {
            title: property.title,
            description: property.description,
            price: property.price,
            surface: property.area,
            propertyType: property.type as any, // Type conversion needed
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,

            // Convert location string back to address object (best effort)
            address: {
                street: "",
                city: property.location.split(",")[0]?.trim() || "",
                province: property.location.split(",")[1]?.trim() || "",
                country: "Dominican Republic",
                formattedAddress: property.location,
            },

            // Default coordinates (would need geocoding to get exact coordinates)
            coordinates: {
                latitude: 18.7357, // Default to Santo Domingo
                longitude: -70.1627,
            },

            // Convert images
            images: images.map(img => ({
                id: img.id,
                url: img.url,
                filename: img.filename,
                size: img.size,
                contentType: img.contentType,
                width: img.width || undefined,
                height: img.height || undefined,
                displayOrder: img.displayOrder || 0,
            })),

            // Set AI generation flags
            aiGenerated: {
                title: aiGenerationRecords.some(ai => ai.generationType === "title"),
                description: aiGenerationRecords.some(ai => ai.generationType === "description"),
                tags: aiGenerationRecords.some(ai => ai.generationType === "tags"),
            },

            status: "published" as const,
            language: "es" as const,
            characteristics: [], // Would need to be populated from characteristics table
        };

        return wizardData;
    } catch (error) {
        console.error("Error converting property to wizard format:", error);
        return null;
    }
}

