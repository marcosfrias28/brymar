"use server";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { lands } from "@/lib/db/schema";
import {
	LandFormDataSchema,
	type LandFormData,
} from "@/lib/schemas/land-wizard-schemas";
import type { ActionResult } from "@/lib/types/shared";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper function to generate slug from name
function _generateSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}

/**
 * Load a land draft by ID
 */
export async function loadLandDraft(
	draftId: string,
	userId: string
): Promise<ActionResult<LandFormData | null>> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id || session.user.id !== userId) {
			return { success: false, error: "Unauthorized" };
		}

		const [draft] = await db
			.select()
			.from(lands)
			.where(eq(lands.id, draftId))
			.limit(1);

		if (!draft) {
			return { success: true, data: null };
		}

		// Convert database record to wizard data format
		const wizardData: LandFormData = {
			name: draft.name,
			title: draft.name, // Alias for compatibility
			description: draft.description,
			price: draft.price,
			surface: draft.area,
			landType: draft.type as any,
			location: draft.location,
			address:
				typeof draft.address === "object" && draft.address
					? (draft.address as any)
					: undefined,
			images: Array.isArray(draft.images) ? (draft.images as any[]) : [],
			status: draft.status as "draft" | "published",
			// Extract from features object
			zoning:
				typeof draft.features === "object" && draft.features
					? (draft.features as any).zoning
					: undefined,
			utilities:
				typeof draft.features === "object" && draft.features
					? (draft.features as any).utilities
					: [],
			characteristics:
				typeof draft.features === "object" && draft.features
					? (draft.features as any).characteristics
					: [],
			coordinates:
				typeof draft.features === "object" && draft.features
					? (draft.features as any).coordinates
					: undefined,
			accessRoads:
				typeof draft.features === "object" && draft.features
					? (draft.features as any).accessRoads
					: [],
			nearbyLandmarks:
				typeof draft.features === "object" && draft.features
					? (draft.features as any).nearbyLandmarks
					: [],
			aerialImages:
				typeof draft.features === "object" && draft.features
					? (draft.features as any).aerialImages
					: [],
			documentImages:
				typeof draft.features === "object" && draft.features
					? (draft.features as any).documentImages
					: [],
			language: "es",
			aiGenerated: {
				name: false,
				description: false,
				characteristics: false,
			},
			tags:
				typeof draft.features === "object" && draft.features
					? (draft.features as any).tags
					: [],
			seoTitle:
				typeof draft.features === "object" && draft.features
					? (draft.features as any).seoTitle
					: undefined,
			seoDescription:
				typeof draft.features === "object" && draft.features
					? (draft.features as any).seoDescription
					: undefined,
		};

		return { success: true, data: wizardData };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to load draft",
		};
	}
}

/**
 * Save a land draft
 */
export async function saveLandDraft(
	data: LandFormData
): Promise<ActionResult<{ id: string }>> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		const [draft] = await db
			.insert(lands)
			.values({
				id: crypto.randomUUID(),
				name: data.name,
				description: data.description,
				area: Math.round(data.surface),
				price: Math.round(data.price),
				currency: "USD",
				location: data.location,
				address: data.address || null,
				type: data.landType,
				features: {
					zoning: data.zoning,
					utilities: data.utilities || [],
					characteristics: data.characteristics || [],
					coordinates: data.coordinates,
					accessRoads: data.accessRoads || [],
					nearbyLandmarks: data.nearbyLandmarks || [],
					aerialImages: data.aerialImages || [],
					documentImages: data.documentImages || [],
					aiGenerated: data.aiGenerated,
					tags: data.tags || [],
					seoTitle: data.seoTitle,
					seoDescription: data.seoDescription,
				},
				images: data.images || [],
				status: "draft",
				userId: session.user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning({ id: lands.id });

		revalidatePath("/dashboard/lands");

		return { success: true, data: { id: draft.id } };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to save draft",
		};
	}
}

/**
 * Create a land from wizard data
 */
export async function createLandFromWizard(
	data: LandFormData
): Promise<ActionResult<{ id: string }>> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		// Validate data
		const validation = LandFormDataSchema.safeParse(data);
		if (!validation.success) {
			return {
				success: false,
				error: "Invalid data",
				errors: validation.error.flatten().fieldErrors,
			};
		}

		const [land] = await db
			.insert(lands)
			.values({
				id: crypto.randomUUID(),
				name: data.name,
				description: data.description,
				area: Math.round(data.surface),
				price: Math.round(data.price),
				currency: "USD",
				location: data.location,
				address: data.address || null,
				type: data.landType,
				features: {
					zoning: data.zoning,
					utilities: data.utilities || [],
					characteristics: data.characteristics || [],
					coordinates: data.coordinates,
					accessRoads: data.accessRoads || [],
					nearbyLandmarks: data.nearbyLandmarks || [],
					aerialImages: data.aerialImages || [],
					documentImages: data.documentImages || [],
					aiGenerated: data.aiGenerated,
					tags: data.tags || [],
					seoTitle: data.seoTitle,
					seoDescription: data.seoDescription,
				},
				images: data.images || [],
				status: data.status === "published" ? "published" : "draft",
				userId: session.user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning({ id: lands.id });

		revalidatePath("/dashboard/lands");
		revalidatePath("/lands");

		return { success: true, data: { id: land.id } };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to create land",
		};
	}
}

/**
 * Update a land from wizard data
 */
export async function updateLandFromWizard(
	id: string,
	data: LandFormData
): Promise<ActionResult<{ id: string }>> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		// Validate data
		const validation = LandFormDataSchema.safeParse(data);
		if (!validation.success) {
			return {
				success: false,
				error: "Invalid data",
				errors: validation.error.flatten().fieldErrors,
			};
		}

		const [land] = await db
			.update(lands)
			.set({
				name: data.name,
				description: data.description,
				area: Math.round(data.surface),
				price: Math.round(data.price),
				location: data.location,
				address: data.address || null,
				type: data.landType,
				features: {
					zoning: data.zoning,
					utilities: data.utilities || [],
					characteristics: data.characteristics || [],
					coordinates: data.coordinates,
					accessRoads: data.accessRoads || [],
					nearbyLandmarks: data.nearbyLandmarks || [],
					aerialImages: data.aerialImages || [],
					documentImages: data.documentImages || [],
					aiGenerated: data.aiGenerated,
					tags: data.tags || [],
					seoTitle: data.seoTitle,
					seoDescription: data.seoDescription,
				},
				images: data.images || [],
				status: data.status === "published" ? "published" : "draft",
				updatedAt: new Date(),
			})
			.where(eq(lands.id, id))
			.returning({ id: lands.id });

		revalidatePath("/dashboard/lands");
		revalidatePath("/lands");

		return { success: true, data: { id: land.id } };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to update land",
		};
	}
}
