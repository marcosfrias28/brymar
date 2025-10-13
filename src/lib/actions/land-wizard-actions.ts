"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, desc, count } from "drizzle-orm";
import {
    type ActionState,
    createValidatedAction,
    createSuccessResponse,
    createErrorResponse
} from '@/lib/validations';
import db from '@/lib/db/drizzle';
import { lands } from '@/lib/db/schema';
import {
    LandFormDataSchema,
    LandDraftSchema,
    type LandFormData,
    type LandDraftData
} from '@/lib/schemas/land-wizard-schemas';
import { LandDraftManager } from '@/lib/utils/draft-management';

// Draft management schemas
const SaveLandDraftSchema = z.object({
    draftId: z.string().optional(),
    userId: z.string(),
    formData: LandDraftSchema,
    stepCompleted: z.number().min(0).max(4),
    completionPercentage: z.number().min(0).max(100),
});

const LoadLandDraftSchema = z.object({
    draftId: z.string(),
    userId: z.string(),
});

const DeleteLandDraftSchema = z.object({
    draftId: z.string(),
    userId: z.string(),
});

// Create land from wizard
async function createLandFromWizardAction(data: LandFormData): Promise<ActionState<{ landId: number }>> {
    try {
        // Transform wizard data to database format
        const landData = {
            name: data.name || data.title, // Use name or title
            description: data.description,
            area: Math.round(data.surface), // Convert to integer
            price: Math.round(data.price), // Convert to integer
            location: data.location,
            type: data.landType,
            images: data.images?.map(img => img.url) || [],
            createdAt: new Date(),
        };

        const result = await db.insert(lands).values(landData).returning();

        revalidatePath("/dashboard/lands");
        return createSuccessResponse(
            { landId: result[0].id },
            "Terreno creado exitosamente!"
        );
    } catch (error) {
        console.error("Error creating land from wizard:", error);
        return createErrorResponse("Error al crear el terreno") as ActionState<{ landId: number }>;
    }
}

export async function createLandFromWizard(data: LandFormData): Promise<ActionState<{ landId: number }>> {
    return createLandFromWizardAction(data);
}

// Update land from wizard
async function updateLandFromWizardAction(
    data: LandFormData & { id: string }
): Promise<ActionState<{ landId: string }>> {
    try {
        const landData = {
            name: data.name || data.title, // Use name or title
            description: data.description,
            area: Math.round(data.surface),
            price: Math.round(data.price),
            location: data.location,
            type: data.landType,
            images: data.images?.map(img => img.url) || [],
            updatedAt: new Date(),
        };

        await db
            .update(lands)
            .set(landData)
            .where(eq(lands.id, parseInt(data.id)));

        revalidatePath("/dashboard/lands");
        revalidatePath(`/dashboard/lands/${data.id}`);

        return createSuccessResponse(
            { landId: data.id },
            "Terreno actualizado exitosamente!"
        );
    } catch (error) {
        console.error("Error updating land from wizard:", error);
        return createErrorResponse("Error al actualizar el terreno") as ActionState<{ landId: string }>;
    }
}

export async function updateLandFromWizard(data: LandFormData & { id: string }): Promise<ActionState<{ landId: string }>> {
    return updateLandFromWizardAction(data);
}

// Save land draft
async function saveLandDraftAction(data: {
    draftId?: string;
    userId: string;
    formData: LandDraftData;
    stepCompleted: number;
    completionPercentage: number;
}): Promise<ActionState<{ draftId: string }>> {
    try {
        const result = await LandDraftManager.save({
            draftId: data.draftId,
            userId: data.userId,
            formData: data.formData,
            stepCompleted: data.stepCompleted,
            completionPercentage: data.completionPercentage,
            title: data.formData.name || data.formData.title,
            metadata: {
                landType: data.formData.landType
            }
        });

        if (result.success && result.data) {
            return createSuccessResponse(
                { draftId: result.data.draftId },
                result.message || "Borrador guardado exitosamente"
            );
        } else {
            return createErrorResponse(result.message || "Error al guardar el borrador") as ActionState<{ draftId: string }>;
        }
    } catch (error) {
        console.error("Error saving land draft:", error);
        return createErrorResponse("Error al guardar el borrador") as ActionState<{ draftId: string }>;
    }
}

export async function saveLandDraft(data: {
    draftId?: string;
    userId: string;
    formData: LandDraftData;
    stepCompleted: number;
    completionPercentage: number;
}): Promise<ActionState<{ draftId: string }>> {
    return saveLandDraftAction(data);
}

// Load land draft
async function loadLandDraftAction(data: {
    draftId: string;
    userId: string;
}): Promise<ActionState<{ formData: any; stepCompleted: number }>> {
    try {
        const result = await LandDraftManager.load({
            draftId: data.draftId,
            userId: data.userId
        });

        if (result.success && result.data) {
            return createSuccessResponse(result.data, result.message || "Borrador cargado exitosamente");
        } else {
            return createErrorResponse(result.message || "Error al cargar el borrador") as ActionState<{ formData: any; stepCompleted: number }>;
        }
    } catch (error) {
        console.error("Error loading land draft:", error);
        return createErrorResponse("Error al cargar el borrador") as ActionState<{ formData: any; stepCompleted: number }>;
    }
}

export async function loadLandDraft(data: {
    draftId: string;
    userId: string;
}): Promise<ActionState<{ formData: any; stepCompleted: number }>> {
    return loadLandDraftAction(data);
}

// Delete land draft
async function deleteLandDraftAction(data: {
    draftId: string;
    userId: string;
}): Promise<ActionState> {
    try {
        const result = await LandDraftManager.delete({
            draftId: data.draftId,
            userId: data.userId
        });

        if (result.success) {
            return createSuccessResponse(undefined, result.message || "Borrador eliminado exitosamente");
        } else {
            return createErrorResponse(result.message || "Error al eliminar el borrador");
        }
    } catch (error) {
        console.error("Error deleting land draft:", error);
        return createErrorResponse("Error al eliminar el borrador");
    }
}

export async function deleteLandDraft(data: {
    draftId: string;
    userId: string;
}): Promise<ActionState> {
    return deleteLandDraftAction(data);
}

// Get land drafts for user
export async function getLandDrafts(userId: string) {
    try {
        const result = await LandDraftManager.list(userId);

        if (result.success && result.data) {
            return { drafts: result.data };
        } else {
            console.error("Error fetching land drafts:", result.message);
            return { drafts: [] };
        }
    } catch (error) {
        console.error("Error fetching land drafts:", error);
        return { drafts: [] };
    }
}

// Get land by ID for editing in wizard
// Complete land wizard (alias for createLandFromWizard)
export async function completeLandWizard(data: LandFormData): Promise<ActionState<{ landId: number }>> {
    return createLandFromWizard(data);
}

export async function getLandForWizard(id: string): Promise<LandFormData | null> {
    try {
        const result = await db
            .select()
            .from(lands)
            .where(eq(lands.id, parseInt(id)))
            .limit(1);

        if (!result[0]) return null;

        const land = result[0];

        // Transform database format to wizard format
        const wizardData: LandFormData = {
            name: land.name,
            title: land.name, // Map name to title for compatibility
            description: land.description,
            price: land.price,
            surface: land.area,
            landType: land.type as any,
            location: land.location,
            images: (land.images as string[])?.map((url, index) => ({
                id: `img_${index}`,
                url,
                filename: `image_${index}.jpg`,
                size: 0,
                contentType: "image/jpeg",
                displayOrder: index,
            })) || [],
            status: "published",
            language: "es",
            aiGenerated: {
                name: false,
                description: false,
                characteristics: false,
            },
            characteristics: [], // Would need to be populated from a characteristics table
        };

        return wizardData;
    } catch (error) {
        console.error("Error fetching land for wizard:", error);
        return null;
    }
}

