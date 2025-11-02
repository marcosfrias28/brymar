"use server";

/**
 * Property Wizard Actions
 * Server actions for property wizard functionality
 */

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/index.ts";
import { properties } from "@/lib/db/schema/index.ts";
import type { PropertyWizardData } from "@/types/property-wizard.ts";
import type { ActionResult } from "@/lib/types/shared.ts";
import {
	PropertyDraftSchema,
	PropertyCompleteSchema,
} from "@/lib/schemas/property-wizard-schemas.ts";
import { extractValidationErrors } from "@/lib/types/forms.ts";

/**
 * Load property draft data for editing
 */
export async function loadPropertyDraft(
	draftId: string,
	authorId: string
): Promise<PropertyWizardData | null> {
	try {
		const [property] = await db
			.select()
			.from(properties)
			.where(
				and(
					eq(properties.id, draftId),
					eq(properties.userId, authorId),
					eq(properties.status, "draft")
				)
			)
			.limit(1);

		if (!property) {
			return null;
		}

		// Map database property to wizard data
		return {
			id: property.id,
			title: property.title || "",
			description: property.description || "",
			status: property.status as "draft" | "published",
			createdAt: property.createdAt,
			updatedAt: property.updatedAt,
			price: property.price || 0,
			surface: (property.features as any)?.area || 0,
			propertyType: property.type as any,
			bedrooms: (property.features as any)?.bedrooms,
			bathrooms: (property.features as any)?.bathrooms,
			characteristics: (property.features as any)?.characteristics || [],
			coordinates: (property.address as any)?.coordinates,
			address: property.address as any,
			images: (property.images as any) || [],
			videos: (property.videos as any) || [],
			language: "es" as const,
			aiGenerated: {
				title: false,
				description: false,
				tags: false,
			},
		};
	} catch (error) {
		console.error("Error loading property draft:", error);
		return null;
	}
}

/**
 * Save property draft data
 */
export async function savePropertyDraft(
	data: Partial<PropertyWizardData>,
	authorId: string
): Promise<ActionResult<{ draftId: string }>> {
	try {
		// Validate draft data (lenient validation)
		const validation = PropertyDraftSchema.safeParse(data);

		if (!validation.success) {
			return {
				success: false,
				errors: extractValidationErrors(validation.error),
			};
		}

		const validatedData = validation.data;
		const draftId = validatedData.id || crypto.randomUUID();

		// Check if draft exists
		const [existingDraft] = await db
			.select()
			.from(properties)
			.where(
				and(
					eq(properties.id, draftId),
					eq(properties.userId, authorId),
					eq(properties.status, "draft")
				)
			)
			.limit(1);

		const propertyData = {
			title: validatedData.title || "Borrador de Propiedad",
			description: validatedData.description || "",
			price: validatedData.price || 0,
			currency: "USD",
			type: validatedData.propertyType || "house",
			address: validatedData.address || {},
			features: {
				area: validatedData.surface || 0,
				bedrooms: validatedData.bedrooms,
				bathrooms: validatedData.bathrooms,
				characteristics: validatedData.characteristics || [],
			},
			images: validatedData.images || [],
			videos: validatedData.videos || [],
			status: "draft" as const,
			userId: authorId,
			updatedAt: new Date(),
		};

		if (existingDraft) {
			// Update existing draft
			await db
				.update(properties)
				.set(propertyData)
				.where(eq(properties.id, draftId));
		} else {
			// Create new draft
			await db.insert(properties).values({
				id: draftId,
				createdAt: new Date(),
				...propertyData,
			});
		}

		return {
			success: true,
			data: { draftId },
		};
	} catch (error) {
		console.error("Error saving property draft:", error);
		return {
			success: false,
			errors: { general: ["Error al guardar el borrador"] },
		};
	}
}

/**
 * Create property from wizard data
 */
export async function createPropertyFromWizard(
	data: PropertyWizardData,
	authorId: string
): Promise<ActionResult<{ propertyId: string }>> {
	try {
		// Validate complete data
		const validation = PropertyCompleteSchema.safeParse(data);

		if (!validation.success) {
			return {
				success: false,
				errors: extractValidationErrors(validation.error),
			};
		}

		const validatedData = validation.data;
		const propertyId = crypto.randomUUID();

		// Create property
		await db.insert(properties).values({
			id: propertyId,
			title: validatedData.title,
			description: validatedData.description,
			price: validatedData.price,
			currency: "USD",
			type: validatedData.propertyType || "house",
			address: validatedData.address || {},
			features: {
				area: validatedData.surface,
				bedrooms: validatedData.bedrooms,
				bathrooms: validatedData.bathrooms,
				characteristics: validatedData.characteristics || [],
			},
			images: validatedData.images || [],
			videos: validatedData.videos || [],
			status: "published",
			userId: authorId,
			publishedAt: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		return {
			success: true,
			data: { propertyId },
		};
	} catch (error) {
		console.error("Error creating property:", error);
		return {
			success: false,
			errors: { general: ["Error al crear la propiedad"] },
		};
	}
}

/**
 * Update property from wizard data
 */
export async function updatePropertyFromWizard(
	propertyId: string,
	data: PropertyWizardData,
	authorId: string
): Promise<ActionResult<{ propertyId: string }>> {
	try {
		// Validate complete data
		const validation = PropertyCompleteSchema.safeParse(data);

		if (!validation.success) {
			return {
				success: false,
				errors: extractValidationErrors(validation.error),
			};
		}

		const validatedData = validation.data;

		// Update property
		await db
			.update(properties)
			.set({
				title: validatedData.title,
				description: validatedData.description,
				price: validatedData.price,
				type: validatedData.propertyType || "house",
				address: validatedData.address || {},
				features: {
					area: validatedData.surface,
					bedrooms: validatedData.bedrooms,
					bathrooms: validatedData.bathrooms,
					characteristics: validatedData.characteristics || [],
				},
				images: validatedData.images || [],
				videos: validatedData.videos || [],
				updatedAt: new Date(),
			})
			.where(eq(properties.id, propertyId));

		return {
			success: true,
			data: { propertyId },
		};
	} catch (error) {
		console.error("Error updating property:", error);
		return {
			success: false,
			errors: { general: ["Error al actualizar la propiedad"] },
		};
	}
}
