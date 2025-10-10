// Property Wizard Actions for New Framework

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
    type ActionState,
    createSuccessResponse,
    createErrorResponse,
} from "@/lib/validations";
import { PropertyWizardData } from "@/types/property-wizard";
import { PropertyCompleteSchema, PropertyDraftSchema } from "@/lib/schemas/property-wizard-schemas";
import { saveUnifiedDraft, loadUnifiedDraft, deleteUnifiedDraft } from "./unified-wizard-actions";
import { addProperty, updateProperty } from "@/app/actions/property-actions";

// Schema for completing a property wizard
const completePropertyWizardSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    data: PropertyCompleteSchema,
    draftId: z.string().optional(),
});

// Schema for saving a property wizard draft (very lenient for drafts)
const savePropertyDraftSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    data: z.record(z.any()).optional().default({}), // Accept any data structure for drafts
    currentStep: z.string().min(1, "Current step is required"),
    draftId: z.string().optional(),
});

/**
 * Complete property wizard and create/update property
 */
export async function completePropertyWizard(
    data: z.infer<typeof completePropertyWizardSchema>
): Promise<ActionState<{ propertyId: string }>> {
    try {
        // Validate input
        const validatedData = completePropertyWizardSchema.parse(data);

        // Transform wizard data to property data format for the existing schema
        const propertyFormData = new FormData();
        propertyFormData.append("title", validatedData.data.title);
        propertyFormData.append("description", validatedData.data.description);
        propertyFormData.append("price", validatedData.data.price.toString());
        propertyFormData.append("type", validatedData.data.propertyType);
        propertyFormData.append("bedrooms", (validatedData.data.bedrooms || 0).toString());
        propertyFormData.append("bathrooms", (validatedData.data.bathrooms || 0).toString());
        propertyFormData.append("area", validatedData.data.surface.toString());
        propertyFormData.append("location", validatedData.data.address?.formattedAddress || "");
        propertyFormData.append("status", validatedData.data.status);

        // Create or update property
        let result;
        if (validatedData.data.id) {
            // Update existing property
            propertyFormData.append("id", validatedData.data.id);
            result = await updateProperty(propertyFormData);
        } else {
            // Create new property
            result = await addProperty(propertyFormData);
        }

        if (!result.success) {
            return createErrorResponse(
                result.error || "Error al crear la propiedad"
            ) as ActionState<{ propertyId: string }>;
        }

        // Delete draft if it exists
        if (validatedData.draftId) {
            await deleteUnifiedDraft({
                draftId: validatedData.draftId,
                userId: validatedData.userId,
            });
        }

        // Revalidate relevant paths
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/properties");
        revalidatePath("/properties");

        return createSuccessResponse(
            { propertyId: result.data!.id.toString() },
            "Propiedad creada exitosamente"
        );
    } catch (error) {
        console.error("Error completing property wizard:", error);

        if (error instanceof z.ZodError) {
            return createErrorResponse(
                "Datos de propiedad inválidos"
            ) as ActionState<{ propertyId: string }>;
        }

        return createErrorResponse(
            "Error al completar el asistente de propiedades"
        ) as ActionState<{ propertyId: string }>;
    }
}

/**
 * Save property wizard draft
 */
export async function savePropertyDraft(
    data: z.infer<typeof savePropertyDraftSchema>
): Promise<ActionState<{ draftId: string }>> {
    try {
        // Validate input
        const validatedData = savePropertyDraftSchema.parse(data);

        // Save using unified wizard actions
        const result = await saveUnifiedDraft({
            userId: validatedData.userId,
            wizardType: "property",
            wizardConfigId: "property-wizard",
            formData: validatedData.data,
            currentStep: validatedData.currentStep,
            draftId: validatedData.draftId,
        });

        return result;
    } catch (error) {
        console.error("Error saving property draft:", error);

        if (error instanceof z.ZodError) {
            console.error("Validation errors:", error.errors);
            return createErrorResponse(
                "Error de validación en el borrador. Los datos se guardarán sin validación estricta."
            ) as ActionState<{ draftId: string }>;
        }

        return createErrorResponse(
            "Error al guardar el borrador de propiedad"
        ) as ActionState<{ draftId: string }>;
    }
}

/**
 * Load property wizard draft
 */
export async function loadPropertyDraft(
    draftId: string,
    userId: string
): Promise<ActionState<{
    data: Partial<PropertyWizardData>;
    currentStep: string;
    stepProgress: Record<string, boolean>;
    completionPercentage: number;
}>> {
    try {
        // Load using unified wizard actions
        const result = await loadUnifiedDraft({
            draftId,
            userId,
        });

        if (!result.success) {
            return result as ActionState<{
                data: Partial<PropertyWizardData>;
                currentStep: string;
                stepProgress: Record<string, boolean>;
                completionPercentage: number;
            }>;
        }

        // Transform the data to PropertyWizardData format
        const transformedData: Partial<PropertyWizardData> = {
            ...result.data!.data,
            // Ensure characteristics are in the correct format
            characteristics: result.data!.data.characteristics?.map((char: any) =>
                typeof char === 'string'
                    ? { id: char, name: char, category: 'feature' as const, selected: true }
                    : char
            ) || [],
        };

        return createSuccessResponse(
            {
                data: transformedData,
                currentStep: result.data!.currentStep,
                stepProgress: result.data!.stepProgress,
                completionPercentage: result.data!.completionPercentage,
            },
            "Borrador de propiedad cargado exitosamente"
        );
    } catch (error) {
        console.error("Error loading property draft:", error);
        return createErrorResponse(
            "Error al cargar el borrador de propiedad"
        ) as ActionState<{
            data: Partial<PropertyWizardData>;
            currentStep: string;
            stepProgress: Record<string, boolean>;
            completionPercentage: number;
        }>;
    }
}

/**
 * Delete property wizard draft
 */
export async function deletePropertyDraft(
    draftId: string,
    userId: string
): Promise<ActionState<void>> {
    try {
        // Delete using unified wizard actions
        const result = await deleteUnifiedDraft({
            draftId,
            userId,
        });

        return result;
    } catch (error) {
        console.error("Error deleting property draft:", error);
        return createErrorResponse("Error al eliminar el borrador de propiedad");
    }
}

/**
 * Auto-save property wizard draft
 */
export async function autoSavePropertyDraft(
    data: Partial<PropertyWizardData>,
    currentStep: string,
    userId: string,
    draftId?: string
): Promise<{ success: boolean; draftId?: string; error?: string }> {
    try {
        // Validate data as draft (partial validation)
        const validatedData = PropertyDraftSchema.parse(data);

        // Save using unified wizard actions
        const result = await saveUnifiedDraft({
            userId,
            wizardType: "property",
            wizardConfigId: "property-wizard",
            formData: validatedData,
            currentStep,
            draftId,
        });

        return {
            success: result.success || false,
            draftId: result.success ? result.data?.draftId : undefined,
            error: result.success ? undefined : result.error,
        };
    } catch (error) {
        console.error("Error auto-saving property draft:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Auto-save failed",
        };
    }
}

/**
 * Validate property wizard step
 */
export async function validatePropertyStep(
    stepId: string,
    data: Partial<PropertyWizardData>
): Promise<ActionState<{ isValid: boolean; errors: Record<string, string> }>> {
    try {
        let schema;
        let errors: Record<string, string> = {};
        let isValid = true;

        switch (stepId) {
            case "general":
                try {
                    const { PropertyGeneralSchema } = await import("@/lib/schemas/property-wizard-schemas");
                    PropertyGeneralSchema.parse({
                        title: data.title,
                        description: data.description,
                        price: data.price,
                        surface: data.surface,
                        propertyType: data.propertyType,
                        bedrooms: data.bedrooms,
                        bathrooms: data.bathrooms,
                        characteristics: data.characteristics,
                    });
                } catch (error: any) {
                    isValid = false;
                    if (error.flatten) {
                        const fieldErrors = error.flatten().fieldErrors;
                        Object.entries(fieldErrors).forEach(([field, messages]) => {
                            errors[field] = Array.isArray(messages) ? messages[0] : messages;
                        });
                    }
                }
                break;

            case "location":
                try {
                    const { PropertyLocationSchema } = await import("@/lib/schemas/property-wizard-schemas");
                    PropertyLocationSchema.parse({
                        coordinates: data.coordinates,
                        address: data.address,
                    });
                } catch (error: any) {
                    isValid = false;
                    if (error.flatten) {
                        const fieldErrors = error.flatten().fieldErrors;
                        Object.entries(fieldErrors).forEach(([field, messages]) => {
                            errors[field] = Array.isArray(messages) ? messages[0] : messages;
                        });
                    }
                }
                break;

            case "media":
                try {
                    const { PropertyMediaSchema } = await import("@/lib/schemas/property-wizard-schemas");
                    PropertyMediaSchema.parse({
                        images: data.images,
                        videos: data.videos,
                    });
                } catch (error: any) {
                    isValid = false;
                    if (error.flatten) {
                        const fieldErrors = error.flatten().fieldErrors;
                        Object.entries(fieldErrors).forEach(([field, messages]) => {
                            errors[field] = Array.isArray(messages) ? messages[0] : messages;
                        });
                    }
                }
                break;

            case "preview":
                try {
                    PropertyCompleteSchema.parse(data);
                } catch (error: any) {
                    isValid = false;
                    if (error.flatten) {
                        const fieldErrors = error.flatten().fieldErrors;
                        Object.entries(fieldErrors).forEach(([field, messages]) => {
                            errors[field] = Array.isArray(messages) ? messages[0] : messages;
                        });
                    }
                }
                break;

            default:
                return createErrorResponse(
                    "Paso de validación desconocido"
                ) as ActionState<{ isValid: boolean; errors: Record<string, string> }>;
        }

        return createSuccessResponse(
            { isValid, errors },
            isValid ? "Validación exitosa" : "Errores de validación encontrados"
        );
    } catch (error) {
        console.error("Error validating property step:", error);
        return createErrorResponse(
            "Error al validar el paso"
        ) as ActionState<{ isValid: boolean; errors: Record<string, string> }>;
    }
}