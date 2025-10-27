"use server";

import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import db from "@/lib/db/drizzle";
import {
	properties,
	propertyInquiries,
	propertyViews,
} from "@/lib/db/schema/properties";
import type {
	CreatePropertyInput,
	CreatePropertyInquiryInput,
	CreatePropertyInquiryResult,
	CreatePropertyResult,
	GetPropertyResult,
	Property,
	PropertySearchFilters,
	PropertySearchResult,
	PublishPropertyInput,
	PublishPropertyResult,
	SearchPropertiesResult,
	UpdatePropertyInput,
	UpdatePropertyResult,
} from "@/lib/types/properties";
import { handleActionError } from "@/lib/utils/errors";

/**
 * Create a new property
 */
export async function createProperty(
	input: CreatePropertyInput,
): Promise<CreatePropertyResult> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		const propertyId = randomUUID();
		const now = new Date();

		const [property] = await db
			.insert(properties)
			.values({
				id: propertyId,
				title: input.title,
				description: input.description,
				price: input.price,
				currency: input.currency,
				address: input.address,
				type: input.type,
				features: input.features,
				images: input.images || [],
				featured: input.featured || false,
				userId: session.user.id,
				status: "draft",
				createdAt: now,
				updatedAt: now,
			})
			.returning();

		revalidatePath("/dashboard/properties");
		revalidatePath("/properties");

		return { success: true, data: property as Property };
	} catch (error) {
		return handleActionError(error);
	}
}

/**
 * Update an existing property
 */
export async function updateProperty(
	input: UpdatePropertyInput,
): Promise<UpdatePropertyResult> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		const { id, ...updateData } = input;
		const now = new Date();

		// Check if user owns the property or is admin
		const existingProperty = await db
			.select()
			.from(properties)
			.where(eq(properties.id, id))
			.limit(1);

		if (!existingProperty.length) {
			return { success: false, error: "Property not found" };
		}

		if (
			existingProperty[0].userId !== session.user.id &&
			session.user.role !== "admin"
		) {
			return { success: false, error: "Unauthorized to update this property" };
		}

		const [property] = await db
			.update(properties)
			.set({
				...updateData,
				updatedAt: now,
			})
			.where(eq(properties.id, id))
			.returning();

		revalidatePath("/dashboard/properties");
		revalidatePath(`/properties/${id}`);
		revalidatePath("/properties");

		return { success: true, data: property as Property };
	} catch (error) {
		return handleActionError(error);
	}
}

/**
 * Update property action for useActionState
 */
export async function updatePropertyAction(
	prevState: UpdatePropertyResult,
	formData: FormData,
): Promise<UpdatePropertyResult> {
	try {
		const id = formData.get("id") as string;
		const title = formData.get("title") as string;
		const description = formData.get("description") as string;
		const price = formData.get("price") as string;
		const type = formData.get("type") as string;
		const status = formData.get("status") as string;
		const bedrooms = formData.get("bedrooms") as string;
		const bathrooms = formData.get("bathrooms") as string;
		const area = formData.get("area") as string;

		// Parse JSON fields if they exist
		const address = formData.get("address")
			? JSON.parse(formData.get("address") as string)
			: undefined;
		const images = formData.get("images")
			? JSON.parse(formData.get("images") as string)
			: undefined;

		// Build features object from individual fields or JSON
		const featuresJson = formData.get("features");
		const features = featuresJson
			? JSON.parse(featuresJson as string)
			: {
					bedrooms: bedrooms ? Number.parseInt(bedrooms, 10) : 0,
					bathrooms: bathrooms ? Number.parseInt(bathrooms, 10) : 0,
					area: area ? Number.parseFloat(area) : 0,
					amenities: [],
					features: [],
				};

		const input: UpdatePropertyInput = {
			id,
			title,
			description,
			price: price ? Number.parseFloat(price) : undefined,
			type,
			status,
			address,
			features,
			images,
		};

		return await updateProperty(input);
	} catch (error) {
		return handleActionError(error);
	}
}

/**
 * Get a property by ID
 */
export async function getPropertyById(id: string): Promise<GetPropertyResult> {
	try {
		const [property] = await db
			.select()
			.from(properties)
			.where(eq(properties.id, id))
			.limit(1);

		if (!property) {
			return { success: false, error: "Property not found" };
		}

		// Track view (optional - could be done in a separate action)
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		if (session?.user?.id && session.user.id !== property.userId) {
			// Only track views from other users
			await db
				.insert(propertyViews)
				.values({
					propertyId: id,
					userId: session.user.id,
					createdAt: new Date(),
				})
				.catch(() => {
					// Ignore view tracking errors
				});
		}

		return { success: true, data: property as Property };
	} catch (error) {
		return handleActionError(error);
	}
}

/**
 * Search properties with filters
 */
export async function searchProperties(
	filters: PropertySearchFilters = {},
): Promise<SearchPropertiesResult> {
	try {
		// Get session for authorization
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		// Build pagination
		const page = filters.page || 1;
		const limit = Math.min(filters.limit || 20, 100); // Cap at 100
		const offset = (page - 1) * limit;

		// Build where conditions using raw SQL for simplicity
		const whereConditions = [];

		// Only show published properties for non-owners/non-admins
		if (!session?.user?.id || session.user.role !== "admin") {
			whereConditions.push(`status = 'published'`);
		}

		if (filters.minPrice !== undefined) {
			whereConditions.push(`price >= ${filters.minPrice}`);
		}

		if (filters.maxPrice !== undefined) {
			whereConditions.push(`price <= ${filters.maxPrice}`);
		}

		if (filters.propertyTypes && filters.propertyTypes.length > 0) {
			const types = filters.propertyTypes.map((t) => `'${t}'`).join(",");
			whereConditions.push(`type IN (${types})`);
		}

		if (filters.location) {
			whereConditions.push(`address->>'city' ILIKE '%${filters.location}%'`);
		}

		if (filters.featured !== undefined) {
			whereConditions.push(`featured = ${filters.featured}`);
		}

		if (filters.userId) {
			whereConditions.push(`user_id = '${filters.userId}'`);
		}

		if (filters.status && filters.status.length > 0) {
			const statuses = filters.status.map((s) => `'${s}'`).join(",");
			whereConditions.push(`status IN (${statuses})`);
		}

		const whereClause =
			whereConditions.length > 0
				? `WHERE ${whereConditions.join(" AND ")}`
				: "";

		// Apply sorting
		const sortBy = filters.sortBy || "created_at";
		const sortOrder = filters.sortOrder || "desc";
		const orderClause = `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

		// Execute queries using raw SQL for better compatibility
		const propertiesQuery = `
            SELECT * FROM properties 
            ${whereClause} 
            ${orderClause} 
            LIMIT ${limit} OFFSET ${offset}
        `;

		const countQuery = `
            SELECT COUNT(*) as count FROM properties 
            ${whereClause}
        `;

		const [propertiesResult, countResult] = await Promise.all([
			db.execute(sql.raw(propertiesQuery)),
			db.execute(sql.raw(countQuery)),
		]);

		const total = Number(countResult.rows[0]?.count || 0);
		const totalPages = Math.ceil(total / limit);

		// Build applied filters list
		const appliedFilters = Object.keys(filters).filter((key) => {
			const value = filters[key as keyof PropertySearchFilters];
			return (
				value !== undefined &&
				value !== null &&
				(Array.isArray(value) ? value.length > 0 : true)
			);
		});

		const result: PropertySearchResult = {
			items: propertiesResult.rows as unknown as Property[],
			total,
			hasMore: page < totalPages,
			page,
			totalPages,
			filters: {
				applied: appliedFilters,
				available: {
					propertyTypes: [
						"house",
						"apartment",
						"condo",
						"townhouse",
						"villa",
						"studio",
						"penthouse",
						"duplex",
						"land",
						"commercial",
						"office",
						"warehouse",
					],
					priceRanges: [
						{ min: 0, max: 100000, label: "Under $100K" },
						{ min: 100000, max: 300000, label: "$100K - $300K" },
						{ min: 300000, max: 500000, label: "$300K - $500K" },
						{ min: 500000, max: 1000000, label: "$500K - $1M" },
						{ min: 1000000, max: Number.MAX_SAFE_INTEGER, label: "Over $1M" },
					],
					locations: [],
					amenities: [],
					features: [],
				},
			},
		};

		return { success: true, data: result };
	} catch (error) {
		return handleActionError(error);
	}
}

/**
 * Publish a property
 */
export async function publishProperty(
	input: PublishPropertyInput,
): Promise<PublishPropertyResult> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		// Check if user owns the property or is admin
		const existingProperty = await db
			.select()
			.from(properties)
			.where(eq(properties.id, input.id))
			.limit(1);

		if (!existingProperty.length) {
			return { success: false, error: "Property not found" };
		}

		if (
			existingProperty[0].userId !== session.user.id &&
			session.user.role !== "admin"
		) {
			return { success: false, error: "Unauthorized to publish this property" };
		}

		const now = new Date();
		const publishedAt = input.publishedAt || now;

		const [property] = await db
			.update(properties)
			.set({
				status: "published",
				publishedAt,
				updatedAt: now,
			})
			.where(eq(properties.id, input.id))
			.returning();

		revalidatePath("/dashboard/properties");
		revalidatePath(`/properties/${input.id}`);
		revalidatePath("/properties");

		return { success: true, data: property as Property };
	} catch (error) {
		return handleActionError(error);
	}
}

/**
 * Delete a property
 */
export async function deleteProperty(
	id: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		// Check if user owns the property or is admin
		const existingProperty = await db
			.select()
			.from(properties)
			.where(eq(properties.id, id))
			.limit(1);

		if (!existingProperty.length) {
			return { success: false, error: "Property not found" };
		}

		if (
			existingProperty[0].userId !== session.user.id &&
			session.user.role !== "admin"
		) {
			return { success: false, error: "Unauthorized to delete this property" };
		}

		await db.delete(properties).where(eq(properties.id, id));

		revalidatePath("/dashboard/properties");
		revalidatePath("/properties");

		return { success: true };
	} catch (error) {
		return handleActionError(error);
	}
}

/**
 * Create a property inquiry
 */
export async function createPropertyInquiry(
	input: CreatePropertyInquiryInput,
): Promise<CreatePropertyInquiryResult> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		const inquiryId = randomUUID();
		const now = new Date();

		// Verify property exists
		const [property] = await db
			.select()
			.from(properties)
			.where(eq(properties.id, input.propertyId))
			.limit(1);

		if (!property) {
			return { success: false, error: "Property not found" };
		}

		const [inquiry] = await db
			.insert(propertyInquiries)
			.values({
				id: inquiryId,
				propertyId: input.propertyId,
				userId: session?.user?.id || null,
				name: input.name,
				email: input.email,
				phone: input.phone || null,
				message: input.message,
				status: "new",
				createdAt: now,
				updatedAt: now,
			})
			.returning();

		// Revalidate property owner's dashboard
		revalidatePath("/dashboard/inquiries");

		return { success: true, data: inquiry as any };
	} catch (error) {
		return handleActionError(error);
	}
}
