"use server";

import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { propertyInquiries } from "@/lib/db/schema";
import { extractValidationErrors, type FormState } from "@/lib/types/forms";
import { z } from "zod";


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
    _prevState: FormState<{ properties: any[]; total: number }>,
    formData: FormData
): Promise<FormState<{ properties: any[]; total: number }>> {
	try {
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
			page: formData.get("page") ? Number.parseInt(formData.get("page") as string, 10) : 1,
			limit: formData.get("limit") ? Number.parseInt(formData.get("limit") as string, 10) : 20,
		};

		let base: any = db.select().from(properties);
		const conditions: any[] = [];
		conditions.push(eq(properties.status, "published"));
		if (_filters.minPrice !== undefined) conditions.push(gte(properties.price, _filters.minPrice));
		if (_filters.maxPrice !== undefined) conditions.push(lte(properties.price, _filters.maxPrice));
		if (_filters.propertyType) conditions.push(eq(properties.type, _filters.propertyType));
			if (conditions.length) base = base.where(and(...conditions));

		const page = Math.max(_filters.page || 1, 1);
		const limit = Math.min(Math.max(_filters.limit || 20, 1), 100);
		const offset = (page - 1) * limit;

    const totalRows = await db
        .select({ count: sql<number>`count(*)` })
        .from(properties)
        .where(eq(properties.status, "published"));
		const total = Number(totalRows[0]?.count || 0);

		const results = await base.orderBy(desc(properties.createdAt)).limit(limit).offset(offset);

		return {
			success: true,
			data: { properties: results, total },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "Failed to search properties",
		};
	}
}


const InquirySchema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
});

export async function createPropertyInquiryAction(
  _prevState: FormState<{ id: string }>,
  formData: FormData
): Promise<FormState<{ id: string }>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const data = {
      propertyId: formData.get("propertyId") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || undefined,
      message: formData.get("message") as string,
    };

    const validation = InquirySchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        errors: extractValidationErrors(validation.error),
      };
    }

    const [inquiry] = await db
      .insert(propertyInquiries)
      .values({
        id: crypto.randomUUID(),
        propertyId: validation.data.propertyId,
        userId: session?.user?.id || null,
        name: validation.data.name,
        email: validation.data.email,
        phone: validation.data.phone || null,
        message: validation.data.message,
        status: "new",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath(`/properties/${validation.data.propertyId}`);
    return { success: true, data: { id: inquiry.id }, message: "Inquiry sent" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send inquiry",
    };
  }
}
