"use server";

import { revalidatePath } from "next/cache";
import { createLand, getLandById, updateLand } from "@/lib/actions/lands";
import type {
	LandDraftData,
	LandFormData,
} from "@/lib/schemas/land-wizard-schemas";
import type { CreateLandInput, UpdateLandInput } from "@/lib/types/lands";
import type { ImageInput } from "@/lib/types/shared";
import {
	type ActionState,
	createErrorResponse,
	createSuccessResponse,
} from "@/lib/validations";

// Create land from wizard
async function createLandFromWizardAction(
	data: LandFormData
): Promise<ActionState<{ landId: string }>> {
	try {
		// Map wizard data to CreateLandInput
		const images: ImageInput[] = (data.images || []).map((img) => ({
			filename: img.filename,
			mimeType: img.contentType,
			url: img.url,
		}));

		const input: CreateLandInput = {
			name: data.name || data.title || "Untitled Land",
			description: data.description,
			area: Math.round(data.surface),
			price: Math.round(data.price),
			currency: "USD",
			location: data.location,
			address: data.address
				? {
						street: data.address.street || "",
						city: data.address.city,
						state: data.address.province,
						country: data.address.country,
						postalCode: data.address.postalCode,
						coordinates: data.coordinates
							? {
									latitude: data.coordinates.latitude,
									longitude: data.coordinates.longitude,
								}
							: undefined,
					}
				: undefined,
			type: (data.landType as any) || "residential",
			features: {
				zoning: data.zoning,
				utilities: data.utilities || [],
				access: data.accessRoads || [],
			},
			images,
		};

		const result = await createLand(input);

		if (!(result.success && result.data)) {
			return createErrorResponse(
				result.error || "Error al crear el terreno"
			) as ActionState<{ landId: string }>;
		}

		// Revalidate already handled inside createLand, but keep dashboard path for safety
		revalidatePath("/dashboard/lands");
		return createSuccessResponse(
			{ landId: result.data.id },
			"Terreno creado exitosamente!"
		);
	} catch (_error) {
		return createErrorResponse("Error al crear el terreno") as ActionState<{
			landId: string;
		}>;
	}
}

export async function createLandFromWizard(
	data: LandFormData
): Promise<ActionState<{ landId: string }>> {
	return createLandFromWizardAction(data);
}

// Update land from wizard
async function updateLandFromWizardAction(
	data: LandFormData & { id: string }
): Promise<ActionState<{ landId: string }>> {
	try {
		const images: ImageInput[] = (data.images || []).map((img) => ({
			filename: img.filename,
			mimeType: img.contentType,
			url: img.url,
		}));

		const input: UpdateLandInput = {
			id: data.id,
			name: data.name || data.title,
			description: data.description,
			area: Math.round(data.surface),
			price: Math.round(data.price),
			location: data.location,
			type: (data.landType as any) || "residential",
			features: {
				zoning: data.zoning,
				utilities: data.utilities || [],
				access: data.accessRoads || [],
			},
			images,
		};

		const result = await updateLand(input);

		if (!(result.success && result.data)) {
			return createErrorResponse(
				result.error || "Error al actualizar el terreno"
			) as ActionState<{ landId: string }>;
		}

		revalidatePath("/dashboard/lands");
		revalidatePath(`/dashboard/lands/${data.id}`);

		return createSuccessResponse(
			{ landId: result.data.id },
			"Terreno actualizado exitosamente!"
		);
	} catch (_error) {
		return createErrorResponse(
			"Error al actualizar el terreno"
		) as ActionState<{ landId: string }>;
	}
}

export async function updateLandFromWizard(
	data: LandFormData & { id: string }
): Promise<ActionState<{ landId: string }>> {
	return updateLandFromWizardAction(data);
}

// Save land draft
async function saveLandDraftAction(_data: {
	draftId?: string;
	userId: string;
	formData: LandDraftData;
	stepCompleted: number;
	completionPercentage: number;
}): Promise<ActionState<{ draftId: string }>> {
	// Draft functionality is temporarily disabled
	return createErrorResponse(
		"La funcionalidad de borradores está deshabilitada temporalmente"
	) as ActionState<{ draftId: string }>;
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
async function loadLandDraftAction(_data: {
	draftId: string;
	userId: string;
}): Promise<ActionState<{ formData: any; stepCompleted: number }>> {
	// Draft functionality is temporarily disabled
	return createErrorResponse(
		"La funcionalidad de borradores está deshabilitada temporalmente"
	) as ActionState<{ formData: any; stepCompleted: number }>;
}

export async function loadLandDraft(data: {
	draftId: string;
	userId: string;
}): Promise<ActionState<{ formData: any; stepCompleted: number }>> {
	return loadLandDraftAction(data);
}

// Delete land draft
async function deleteLandDraftAction(_data: {
	draftId: string;
	userId: string;
}): Promise<ActionState> {
	// Draft functionality is temporarily disabled
	return createErrorResponse(
		"La funcionalidad de borradores está deshabilitada temporalmente"
	);
}

export async function deleteLandDraft(data: {
	draftId: string;
	userId: string;
}): Promise<ActionState> {
	return deleteLandDraftAction(data);
}

// Get land drafts for user
export async function getLandDrafts(_userId: string) {
	// Draft functionality is temporarily disabled; return empty list
	return { drafts: [] };
}

// Get land by ID for editing in wizard
// Complete land wizard (alias for createLandFromWizard)
export async function completeLandWizard(
	data: LandFormData
): Promise<ActionState<{ landId: string }>> {
	return createLandFromWizard(data);
}

export async function getLandForWizard(
	id: string
): Promise<LandFormData | null> {
	try {
		const result = await getLandById(id);
		if (!(result.success && result.data)) {
			return null;
		}
		const land = result.data;

		// Transform database format to wizard format
		const wizardData: LandFormData = {
			name: land.name,
			title: land.name, // Map name to title for compatibility
			description: land.description,
			price: land.price,
			surface: land.area,
			landType: land.type as any,
			location: land.location,
			images: (land.images || []).map((img, index) => ({
				id: img.id || `img_${index}`,
				url: img.url,
				filename: img.filename,
				size: img.size || 0,
				contentType: img.mimeType,
				displayOrder: index,
			})),
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
	} catch (_error) {
		return null;
	}
}
