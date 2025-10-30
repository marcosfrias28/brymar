"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { lands } from "@/lib/db/schema";
import { LandFormDataSchema } from "@/lib/schemas/land-wizard-schemas";
import { extractValidationErrors, type FormState } from "@/lib/types/forms";

/**
 * Create a new land using FormState pattern
 */
export async function createLandAction(
	_prevState: FormState<{ id: string }>,
	formData: FormData
): Promise<FormState<{ id: string }>> {
	try {
		// Check authentication
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return {
				success: false,
				message: "You must be logged in to create a land listing",
			};
		}

		// Parse form data
		const data = {
			name: formData.get("name") as string,
			title:
				(formData.get("title") as string) || (formData.get("name") as string),
			description: formData.get("description") as string,
			price: Number.parseFloat(formData.get("price") as string),
			surface: Number.parseFloat(formData.get("surface") as string),
			landType: formData.get("landType") as string,
			zoning: formData.get("zoning") as string,
			utilities: formData.get("utilities")
				? JSON.parse(formData.get("utilities") as string)
				: [],
			characteristics: formData.get("characteristics")
				? JSON.parse(formData.get("characteristics") as string)
				: [],
			location: formData.get("location") as string,
			coordinates: formData.get("coordinates")
				? JSON.parse(formData.get("coordinates") as string)
				: undefined,
			address: formData.get("address")
				? JSON.parse(formData.get("address") as string)
				: undefined,
			accessRoads: formData.get("accessRoads")
				? JSON.parse(formData.get("accessRoads") as string)
				: [],
			nearbyLandmarks: formData.get("nearbyLandmarks")
				? JSON.parse(formData.get("nearbyLandmarks") as string)
				: [],
			images: formData.get("images")
				? JSON.parse(formData.get("images") as string)
				: [],
			aerialImages: formData.get("aerialImages")
				? JSON.parse(formData.get("aerialImages") as string)
				: [],
			documentImages: formData.get("documentImages")
				? JSON.parse(formData.get("documentImages") as string)
				: [],
			status: (formData.get("status") as string) || "draft",
			language: (formData.get("language") as string) || "es",
			aiGenerated: formData.get("aiGenerated")
				? JSON.parse(formData.get("aiGenerated") as string)
				: {
						name: false,
						description: false,
						characteristics: false,
					},
			tags: formData.get("tags")
				? JSON.parse(formData.get("tags") as string)
				: [],
			seoTitle: formData.get("seoTitle") as string,
			seoDescription: formData.get("seoDescription") as string,
		};

		// Validate with Zod schema
		const validation = LandFormDataSchema.safeParse(data);

		if (!validation.success) {
			return {
				success: false,
				errors: extractValidationErrors(validation.error),
			};
		}

		// Create land - map to database schema
		const [land] = await db
			.insert(lands)
			.values({
				id: crypto.randomUUID(),
				name: validation.data.name,
				description: validation.data.description,
				area: Math.round(validation.data.surface), // Convert to integer
				price: Math.round(validation.data.price), // Convert to integer
				currency: "USD",
				type: validation.data.landType,
				location: validation.data.location,
				address: validation.data.address || {},
				features: {
					zoning: validation.data.zoning,
					utilities: validation.data.utilities,
					characteristics: validation.data.characteristics,
					coordinates: validation.data.coordinates,
					accessRoads: validation.data.accessRoads,
					nearbyLandmarks: validation.data.nearbyLandmarks,
					aerialImages: validation.data.aerialImages,
					documentImages: validation.data.documentImages,
					aiGenerated: validation.data.aiGenerated,
					tags: validation.data.tags,
					seoTitle: validation.data.seoTitle,
					seoDescription: validation.data.seoDescription,
				},
				images: validation.data.images,
				status:
					validation.data.status === "published" ? "available" : "archived",
				userId: session.user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		revalidatePath("/dashboard/lands");
		revalidatePath("/lands");

		// Redirect to the land edit page
		redirect(`/dashboard/lands/${land.id}/edit`);
	} catch (error) {
		if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
			throw error; // Re-throw redirect errors
		}

		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: "Failed to create land listing",
		};
	}
}

/**
 * Update an existing land using FormState pattern
 */
export async function updateLandAction(
	_prevState: FormState<{ id: string }>,
	formData: FormData
): Promise<FormState<{ id: string }>> {
	try {
		// Check authentication
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return {
				success: false,
				message: "You must be logged in to update a land listing",
			};
		}

		const id = formData.get("id") as string;

		if (!id) {
			return {
				success: false,
				errors: {
					id: ["Land ID is required"],
				},
			};
		}

		// Check if land exists and user owns it
		const existingLand = await db
			.select()
			.from(lands)
			.where(eq(lands.id, id))
			.limit(1);

		if (existingLand.length === 0) {
			return {
				success: false,
				message: "Land listing not found",
			};
		}

		if (existingLand[0].userId !== session.user.id) {
			return {
				success: false,
				message: "You are not authorized to update this land listing",
			};
		}

		// Parse form data
		const data = {
			name: formData.get("name") as string,
			title:
				(formData.get("title") as string) || (formData.get("name") as string),
			description: formData.get("description") as string,
			price: Number.parseFloat(formData.get("price") as string),
			surface: Number.parseFloat(formData.get("surface") as string),
			landType: formData.get("landType") as string,
			zoning: formData.get("zoning") as string,
			utilities: formData.get("utilities")
				? JSON.parse(formData.get("utilities") as string)
				: [],
			characteristics: formData.get("characteristics")
				? JSON.parse(formData.get("characteristics") as string)
				: [],
			location: formData.get("location") as string,
			coordinates: formData.get("coordinates")
				? JSON.parse(formData.get("coordinates") as string)
				: undefined,
			address: formData.get("address")
				? JSON.parse(formData.get("address") as string)
				: undefined,
			accessRoads: formData.get("accessRoads")
				? JSON.parse(formData.get("accessRoads") as string)
				: [],
			nearbyLandmarks: formData.get("nearbyLandmarks")
				? JSON.parse(formData.get("nearbyLandmarks") as string)
				: [],
			images: formData.get("images")
				? JSON.parse(formData.get("images") as string)
				: [],
			aerialImages: formData.get("aerialImages")
				? JSON.parse(formData.get("aerialImages") as string)
				: [],
			documentImages: formData.get("documentImages")
				? JSON.parse(formData.get("documentImages") as string)
				: [],
			status: (formData.get("status") as string) || "draft",
			language: (formData.get("language") as string) || "es",
			aiGenerated: formData.get("aiGenerated")
				? JSON.parse(formData.get("aiGenerated") as string)
				: {
						name: false,
						description: false,
						characteristics: false,
					},
			tags: formData.get("tags")
				? JSON.parse(formData.get("tags") as string)
				: [],
			seoTitle: formData.get("seoTitle") as string,
			seoDescription: formData.get("seoDescription") as string,
		};

		// Validate with Zod schema
		const validation = LandFormDataSchema.safeParse(data);

		if (!validation.success) {
			return {
				success: false,
				errors: extractValidationErrors(validation.error),
			};
		}

		// Update land - map to database schema
		const [updatedLand] = await db
			.update(lands)
			.set({
				name: validation.data.name,
				description: validation.data.description,
				area: Math.round(validation.data.surface), // Convert to integer
				price: Math.round(validation.data.price), // Convert to integer
				type: validation.data.landType,
				location: validation.data.location,
				address: validation.data.address || {},
				features: {
					zoning: validation.data.zoning,
					utilities: validation.data.utilities,
					characteristics: validation.data.characteristics,
					coordinates: validation.data.coordinates,
					accessRoads: validation.data.accessRoads,
					nearbyLandmarks: validation.data.nearbyLandmarks,
					aerialImages: validation.data.aerialImages,
					documentImages: validation.data.documentImages,
					aiGenerated: validation.data.aiGenerated,
					tags: validation.data.tags,
					seoTitle: validation.data.seoTitle,
					seoDescription: validation.data.seoDescription,
				},
				images: validation.data.images,
				status:
					validation.data.status === "published" ? "available" : "archived",
				updatedAt: new Date(),
			})
			.where(eq(lands.id, id))
			.returning();

		revalidatePath("/dashboard/lands");
		revalidatePath("/lands");
		revalidatePath(`/lands/${updatedLand.id}`);

		return {
			success: true,
			message: "Land listing updated successfully",
			data: { id: updatedLand.id },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: "Failed to update land listing",
		};
	}
}

/**
 * Search lands action for useActionState
 */
export async function searchLandsAction(
	_prevState: FormState<{ lands: any[] }>,
	formData: FormData
): Promise<FormState<{ lands: any[] }>> {
	try {
		// Parse search filters from formData
		const _filters = {
			location: formData.get("location") as string,
			minPrice: formData.get("minPrice")
				? Number.parseFloat(formData.get("minPrice") as string)
				: undefined,
			maxPrice: formData.get("maxPrice")
				? Number.parseFloat(formData.get("maxPrice") as string)
				: undefined,
			landType: formData.get("landType") as string,
			minSurface: formData.get("minSurface")
				? Number.parseFloat(formData.get("minSurface") as string)
				: undefined,
			maxSurface: formData.get("maxSurface")
				? Number.parseFloat(formData.get("maxSurface") as string)
				: undefined,
		};

		// Build query
		const query = db.select().from(lands).where(eq(lands.status, "available"));

		// Apply filters
		// Note: This is a simplified version. You'll need to add proper filtering logic
		const results = await query.limit(50);

		return {
			success: true,
			data: { lands: results },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "Failed to search lands",
		};
	}
}
