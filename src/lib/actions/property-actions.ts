"use server";

import { and, desc, eq, gte, lte, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { PropertyCompleteSchema } from "@/lib/schemas/property-wizard-schemas";
import { extractValidationErrors, type FormState } from "@/lib/types/forms";

/**
 * Create a new property using FormState pattern
 */
export async function createPropertyAction(
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
				message: "You must be logged in to create a property",
			};
		}

		// Parse form data
		const data = {
			title: formData.get("title") as string,
			description: formData.get("description") as string,
			price: Number.parseFloat(formData.get("price") as string),
			surface: Number.parseFloat(formData.get("surface") as string),
			propertyType: formData.get("propertyType") as string,
			bedrooms: formData.get("bedrooms")
				? Number.parseInt(formData.get("bedrooms") as string, 10)
				: undefined,
			bathrooms: formData.get("bathrooms")
				? Number.parseInt(formData.get("bathrooms") as string, 10)
				: undefined,
			characteristics: formData.get("characteristics")
				? JSON.parse(formData.get("characteristics") as string)
				: [],
			coordinates: formData.get("coordinates")
				? JSON.parse(formData.get("coordinates") as string)
				: undefined,
			address: formData.get("address")
				? JSON.parse(formData.get("address") as string)
				: undefined,
			images: formData.get("images")
				? JSON.parse(formData.get("images") as string)
				: [],
			videos: formData.get("videos")
				? JSON.parse(formData.get("videos") as string)
				: [],
			status: (formData.get("status") as string) || "draft",
			language: (formData.get("language") as string) || "es",
		};

		// Validate with Zod schema
		const validation = PropertyCompleteSchema.safeParse(data);

		if (!validation.success) {
			return {
				success: false,
				errors: extractValidationErrors(validation.error),
			};
		}

		// Create property - map to database schema
		const [property] = await db
			.insert(properties)
			.values({
				id: crypto.randomUUID(),
				title: validation.data.title,
				description: validation.data.description,
				price: validation.data.price,
				currency: "USD",
				type: validation.data.propertyType,
				address: validation.data.address || {},
				features: {
					surface: validation.data.surface,
					bedrooms: validation.data.bedrooms,
					bathrooms: validation.data.bathrooms,
					characteristics: validation.data.characteristics,
					coordinates: validation.data.coordinates,
				},
				images: validation.data.images,
				status: validation.data.status,
				featured: false,
				userId: session.user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		revalidatePath("/dashboard/properties");
		revalidatePath("/properties");

		// Redirect to the property edit page
		redirect(`/dashboard/properties/${property.id}/edit`);
	} catch (error) {
		if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
			throw error; // Re-throw redirect errors
		}

		return {
			success: false,
			message:
				error instanceof Error ? error.message : "Failed to create property",
		};
	}
}

/**
 * Get featured properties
 */
export async function getFeaturedProperties(limit = 6) {
	try {
		const featuredProperties = await db
			.select()
			.from(properties)
			.where(eq(properties.featured, true))
			.orderBy(desc(properties.createdAt))
			.limit(limit);

		return featuredProperties;
	} catch (_error) {
		return [];
	}
}

/**
 * Search properties function for hooks with proper filter handling
 */
export async function searchProperties(filters: any = {}) {
	try {
		// Build base query
		let query: any = db.select().from(properties);

		// Apply filters using Drizzle ORM
		const conditions = [];

		// Always show only published properties for public search
		conditions.push(eq(properties.status, "published"));

		// Apply price filters
		if (filters.minPrice !== undefined) {
			conditions.push(gte(properties.price, filters.minPrice));
		}
		if (filters.maxPrice !== undefined) {
			conditions.push(lte(properties.price, filters.maxPrice));
		}

		// Apply property type filter
		if (filters.propertyTypes && filters.propertyTypes.length > 0) {
			const typeConditions = filters.propertyTypes.map((type: string) =>
				eq(properties.type, type)
			);
			conditions.push(or(...typeConditions));
		}

		// Apply user filter
		if (filters.userId) {
			conditions.push(eq(properties.userId, filters.userId));
		}

		// Apply featured filter
		if (filters.featured !== undefined) {
			conditions.push(eq(properties.featured, filters.featured));
		}

		// Apply conditions if any
		if (conditions.length > 0) {
			const whereCondition =
				conditions.length === 1 ? conditions[0] : and(...conditions);
			query = query.where(whereCondition);
		}

		// Apply sorting
		const sortBy = filters.sortBy || "createdAt";
		const sortOrder = filters.sortOrder || "desc";

		if (sortOrder === "desc") {
			if (sortBy === "createdAt") {
				query = query.orderBy(desc(properties.createdAt));
			} else if (sortBy === "price") {
				query = query.orderBy(desc(properties.price));
			} else {
				query = query.orderBy(desc(properties.createdAt));
			}
		} else if (sortBy === "createdAt") {
			query = query.orderBy(properties.createdAt);
		} else if (sortBy === "price") {
			query = query.orderBy(properties.price);
		} else {
			query = query.orderBy(properties.createdAt);
		}

		// Apply limit
		const limit = Math.min(filters.limit || 50, 100);
		query = query.limit(limit);

		const results = await query;
		return results;
	} catch (_error) {
		return [];
	}
}

/**
 * Search properties action for useActionState
 */
export async function searchPropertiesAction(
	_prevState: FormState<{ properties: any[] }>,
	formData: FormData
): Promise<FormState<{ properties: any[] }>> {
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
			propertyType: formData.get("propertyType") as string,
			bedrooms: formData.get("bedrooms")
				? Number.parseInt(formData.get("bedrooms") as string, 10)
				: undefined,
			bathrooms: formData.get("bathrooms")
				? Number.parseInt(formData.get("bathrooms") as string, 10)
				: undefined,
		};

		// Build query
		const query = db
			.select()
			.from(properties)
			.where(eq(properties.status, "published"));

		// Apply filters
		// Note: This is a simplified version. You'll need to add proper filtering logic
		const results = await query.limit(50);

		return {
			success: true,
			data: { properties: results },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "Failed to search properties",
		};
	}
}

/**
 * Update an existing property using FormState pattern
 */
export async function updatePropertyAction(
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
				message: "You must be logged in to update a property",
			};
		}

		const id = formData.get("id") as string;

		if (!id) {
			return {
				success: false,
				errors: {
					id: ["Property ID is required"],
				},
			};
		}

		// Check if property exists and user owns it
		const existingProperty = await db
			.select()
			.from(properties)
			.where(eq(properties.id, id))
			.limit(1);

		if (existingProperty.length === 0) {
			return {
				success: false,
				message: "Property not found",
			};
		}

		if (existingProperty[0].userId !== session.user.id) {
			return {
				success: false,
				message: "You are not authorized to update this property",
			};
		}

		// Parse form data
		const data = {
			title: formData.get("title") as string,
			description: formData.get("description") as string,
			price: Number.parseFloat(formData.get("price") as string),
			surface: Number.parseFloat(formData.get("surface") as string),
			propertyType: formData.get("propertyType") as string,
			bedrooms: formData.get("bedrooms")
				? Number.parseInt(formData.get("bedrooms") as string, 10)
				: undefined,
			bathrooms: formData.get("bathrooms")
				? Number.parseInt(formData.get("bathrooms") as string, 10)
				: undefined,
			characteristics: formData.get("characteristics")
				? JSON.parse(formData.get("characteristics") as string)
				: [],
			coordinates: formData.get("coordinates")
				? JSON.parse(formData.get("coordinates") as string)
				: undefined,
			address: formData.get("address")
				? JSON.parse(formData.get("address") as string)
				: undefined,
			images: formData.get("images")
				? JSON.parse(formData.get("images") as string)
				: [],
			videos: formData.get("videos")
				? JSON.parse(formData.get("videos") as string)
				: [],
			status: (formData.get("status") as string) || "draft",
			language: (formData.get("language") as string) || "es",
		};

		// Validate with Zod schema
		const validation = PropertyCompleteSchema.safeParse(data);

		if (!validation.success) {
			return {
				success: false,
				errors: extractValidationErrors(validation.error),
			};
		}

		// Update property - map to database schema
		const [updatedProperty] = await db
			.update(properties)
			.set({
				title: validation.data.title,
				description: validation.data.description,
				price: validation.data.price,
				type: validation.data.propertyType,
				address: validation.data.address || {},
				features: {
					surface: validation.data.surface,
					bedrooms: validation.data.bedrooms,
					bathrooms: validation.data.bathrooms,
					characteristics: validation.data.characteristics,
					coordinates: validation.data.coordinates,
				},
				images: validation.data.images,
				status: validation.data.status,
				updatedAt: new Date(),
			})
			.where(eq(properties.id, id))
			.returning();

		revalidatePath("/dashboard/properties");
		revalidatePath("/properties");
		revalidatePath(`/properties/${updatedProperty.id}`);

		return {
			success: true,
			message: "Property updated successfully",
			data: { id: updatedProperty.id },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "Failed to update property",
		};
	}
}
