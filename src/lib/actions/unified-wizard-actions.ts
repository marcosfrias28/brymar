"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
	type ActionState,
	createErrorResponse,
	createSuccessResponse,
} from "@/lib/validations";
import { WizardPersistence } from "@/lib/wizard/wizard-persistence";
import type { WizardData } from "@/types/wizard-core";

// Schema for saving a unified wizard draft
const saveUnifiedDraftSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
	wizardType: z.enum(["property", "land", "blog"]),
	wizardConfigId: z.string().min(1, "Wizard config ID is required"),
	formData: z.record(z.string(), z.any()),
	currentStep: z.string().min(1, "Current step is required"),
	draftId: z.string().optional(),
	_csrf_token: z.string().optional(),
});

// Schema for loading a unified wizard draft
const loadUnifiedDraftSchema = z.object({
	draftId: z.string().min(1, "Draft ID is required"),
	userId: z.string().min(1, "User ID is required"),
});

// Schema for deleting a unified wizard draft
const deleteUnifiedDraftSchema = z.object({
	draftId: z.string().min(1, "Draft ID is required"),
	userId: z.string().min(1, "User ID is required"),
});

// Schema for listing unified wizard drafts
const listUnifiedDraftsSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
	wizardType: z.enum(["property", "land", "blog"]).optional(),
	configId: z.string().optional(),
	limit: z.coerce.number().min(1).max(100).default(20),
	offset: z.coerce.number().min(0).default(0),
	sortBy: z
		.enum(["updatedAt", "createdAt", "completionPercentage"])
		.default("updatedAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Save a unified wizard draft
 */
export async function saveUnifiedDraft(
	data: z.infer<typeof saveUnifiedDraftSchema>,
): Promise<ActionState<{ draftId: string }>> {
	try {
		// Validate input
		const validatedData = saveUnifiedDraftSchema.parse(data);

		// Save draft using the unified persistence system
		const result = await WizardPersistence.saveDraft(
			validatedData.wizardType,
			validatedData.wizardConfigId,
			validatedData.formData,
			validatedData.currentStep,
			validatedData.userId,
			validatedData.draftId,
			{
				autoSave: false, // This is a manual save
				enableOfflineSupport: true,
			},
		);

		if (!result.success) {
			return createErrorResponse(
				result.error || "Error al guardar el borrador",
			) as ActionState<{ draftId: string }>;
		}

		// Revalidate relevant paths
		revalidatePath("/dashboard");
		revalidatePath(`/dashboard/${validatedData.wizardType}`);

		return createSuccessResponse(
			result.data!,
			"Borrador guardado exitosamente",
		);
	} catch (error) {
		console.error("Error saving unified draft:", error);

		if (error instanceof z.ZodError) {
			return createErrorResponse(
				"Datos de formulario inválidos",
			) as ActionState<{ draftId: string }>;
		}

		return createErrorResponse("Error al guardar el borrador") as ActionState<{
			draftId: string;
		}>;
	}
}

/**
 * Load a unified wizard draft
 */
export async function loadUnifiedDraft(
	data: z.infer<typeof loadUnifiedDraftSchema>,
): Promise<
	ActionState<{
		data: Record<string, any>;
		currentStep: string;
		stepProgress: Record<string, boolean>;
		completionPercentage: number;
	}>
> {
	try {
		// Validate input
		const validatedData = loadUnifiedDraftSchema.parse(data);

		// Load draft using the unified persistence system
		const result = await WizardPersistence.loadDraft(
			validatedData.draftId,
			validatedData.userId,
		);

		if (!result.success) {
			return createErrorResponse(
				result.error || "Borrador no encontrado",
			) as ActionState<{
				data: Record<string, any>;
				currentStep: string;
				stepProgress: Record<string, boolean>;
				completionPercentage: number;
			}>;
		}

		return createSuccessResponse(result.data!, "Borrador cargado exitosamente");
	} catch (error) {
		console.error("Error loading unified draft:", error);

		if (error instanceof z.ZodError) {
			return createErrorResponse("Parámetros inválidos") as ActionState<{
				data: Record<string, any>;
				currentStep: string;
				stepProgress: Record<string, boolean>;
				completionPercentage: number;
			}>;
		}

		return createErrorResponse("Error al cargar el borrador") as ActionState<{
			data: Record<string, any>;
			currentStep: string;
			stepProgress: Record<string, boolean>;
			completionPercentage: number;
		}>;
	}
}

/**
 * Delete a unified wizard draft
 */
export async function deleteUnifiedDraft(
	data: z.infer<typeof deleteUnifiedDraftSchema>,
): Promise<ActionState<void>> {
	try {
		// Validate input
		const validatedData = deleteUnifiedDraftSchema.parse(data);

		// Delete draft using the unified persistence system
		const result = await WizardPersistence.deleteDraft(
			validatedData.draftId,
			validatedData.userId,
		);

		if (!result.success) {
			return createErrorResponse(
				result.error || "Error al eliminar el borrador",
			);
		}

		// Revalidate relevant paths
		revalidatePath("/dashboard");

		return createSuccessResponse(undefined, "Borrador eliminado exitosamente");
	} catch (error) {
		console.error("Error deleting unified draft:", error);

		if (error instanceof z.ZodError) {
			return createErrorResponse("Parámetros inválidos");
		}

		return createErrorResponse("Error al eliminar el borrador");
	}
}

/**
 * List unified wizard drafts for a user
 */
export async function listUnifiedDrafts(
	data: z.infer<typeof listUnifiedDraftsSchema>,
): Promise<
	ActionState<{
		drafts: Array<{
			id: string;
			wizardType: string;
			wizardConfigId: string;
			title?: string;
			description?: string;
			currentStep: string;
			completionPercentage: number;
			createdAt: Date;
			updatedAt: Date;
		}>;
		total: number;
	}>
> {
	try {
		// Validate input
		const validatedData = listUnifiedDraftsSchema.parse(data);

		// List drafts using the unified persistence system
		const result = await WizardPersistence.listDrafts(validatedData.userId, {
			wizardType: validatedData.wizardType,
			configId: validatedData.configId,
			limit: validatedData.limit,
			offset: validatedData.offset,
			sortBy: validatedData.sortBy,
			sortOrder: validatedData.sortOrder,
		});

		if (!result.success) {
			return createErrorResponse(
				result.error || "Error al cargar los borradores",
			) as ActionState<{
				drafts: Array<{
					id: string;
					wizardType: string;
					wizardConfigId: string;
					title?: string;
					description?: string;
					currentStep: string;
					completionPercentage: number;
					createdAt: Date;
					updatedAt: Date;
				}>;
				total: number;
			}>;
		}

		const drafts = result.data?.map((draft) => ({
			id: draft.id,
			wizardType: draft.wizardType,
			wizardConfigId: draft.wizardConfigId,
			title: draft.title || undefined,
			description: draft.description || undefined,
			currentStep: draft.currentStep,
			completionPercentage: draft.completionPercentage || 0,
			createdAt: draft.createdAt,
			updatedAt: draft.updatedAt,
		}));

		return createSuccessResponse(
			{
				drafts,
				total: drafts.length, // In a real implementation, this would be a separate count query
			},
			"Borradores cargados exitosamente",
		);
	} catch (error) {
		console.error("Error listing unified drafts:", error);

		if (error instanceof z.ZodError) {
			return createErrorResponse("Parámetros inválidos") as ActionState<{
				drafts: Array<{
					id: string;
					wizardType: string;
					wizardConfigId: string;
					title?: string;
					description?: string;
					currentStep: string;
					completionPercentage: number;
					createdAt: Date;
					updatedAt: Date;
				}>;
				total: number;
			}>;
		}

		return createErrorResponse(
			"Error al cargar los borradores",
		) as ActionState<{
			drafts: Array<{
				id: string;
				wizardType: string;
				wizardConfigId: string;
				title?: string;
				description?: string;
				currentStep: string;
				completionPercentage: number;
				createdAt: Date;
				updatedAt: Date;
			}>;
			total: number;
		}>;
	}
}

/**
 * Auto-save a unified wizard draft
 */
export async function autoSaveUnifiedDraft<T extends WizardData>(
	wizardType: "property" | "land" | "blog",
	configId: string,
	data: Partial<T>,
	currentStep: string,
	userId: string,
	draftId?: string,
	interval?: number,
): Promise<{ success: boolean; draftId?: string; error?: string }> {
	try {
		const result = await WizardPersistence.autoSaveDraft(
			wizardType,
			configId,
			data,
			currentStep,
			userId,
			draftId,
			{
				autoSave: true,
				enableOfflineSupport: true,
				interval,
			},
		);

		return {
			success: result.success,
			draftId: result.data?.draftId,
			error: result.error,
		};
	} catch (error) {
		console.error("Error auto-saving unified draft:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Auto-save failed",
		};
	}
}

/**
 * Sync local drafts with database when coming back online
 */
export async function syncUnifiedDrafts(
	userId: string,
): Promise<ActionState<{ synced: number; failed: number }>> {
	try {
		const result = await WizardPersistence.syncDrafts(userId);

		if (!result.success) {
			return createErrorResponse(
				result.error || "Error al sincronizar borradores",
			) as ActionState<{ synced: number; failed: number }>;
		}

		return createSuccessResponse(
			result.data!,
			`Sincronización completada: ${result.data?.synced} exitosos, ${result.data?.failed} fallidos`,
		);
	} catch (error) {
		console.error("Error syncing unified drafts:", error);
		return createErrorResponse(
			"Error al sincronizar borradores",
		) as ActionState<{ synced: number; failed: number }>;
	}
}

/**
 * Get cache statistics for debugging
 */
export async function getWizardCacheStats(): Promise<
	ActionState<{
		memoryCache: { size: number; keys: string[] };
		localStorage: { size: number; keys: string[] };
		autoSaveTimeouts: { count: number; keys: string[] };
	}>
> {
	try {
		const stats = WizardPersistence.getCacheStats();
		return createSuccessResponse(stats, "Estadísticas de caché obtenidas");
	} catch (error) {
		console.error("Error getting cache stats:", error);
		return createErrorResponse(
			"Error al obtener estadísticas de caché",
		) as ActionState<{
			memoryCache: { size: number; keys: string[] };
			localStorage: { size: number; keys: string[] };
			autoSaveTimeouts: { count: number; keys: string[] };
		}>;
	}
}
