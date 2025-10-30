/**
 * Land server actions - replaces land use cases and DTOs
 */

"use server";

import { and, eq, gte, ilike, inArray, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { lands } from "@/lib/db/schema/lands";
import type {
	CreateLandInput,
	CreateLandResult,
	DeleteLandResult,
	GetLandResult,
	Land,
	LandSearchFilters,
	LandType,
	SearchLandsResult,
	UpdateLandInput,
	UpdateLandResult,
} from "@/lib/types";

/**
 * Create a new land listing
 */
export async function createLand(
	input: CreateLandInput
): Promise<CreateLandResult> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		if (!session?.user?.id) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		// Validate required fields
		if (!input.name?.trim()) {
			return {
				success: false,
				error: "Land name is required",
			};
		}

		if (!input.description?.trim()) {
			return {
				success: false,
				error: "Land description is required",
			};
		}

		if (!input.area || input.area <= 0) {
			return {
				success: false,
				error: "Valid land area is required",
			};
		}

		if (!input.price || input.price <= 0) {
			return {
				success: false,
				error: "Valid price is required",
			};
		}

		const landId = uuidv4();

		const [land] = await db
			.insert(lands)
			.values({
				id: landId,
				name: input.name.trim(),
				description: input.description.trim(),
				area: input.area,
				price: input.price,
				currency: input.currency || "USD",
				location: input.location.trim(),
				address: input.address || null,
				type: input.type,
				features: input.features,
				images: input.images || [],
				status: "available",
				userId: session.user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		// Revalidate relevant pages
		revalidatePath("/dashboard/lands");
		revalidatePath("/lands");
		revalidatePath("/search");

		return {
			success: true,
			data: land as Land,
		};
	} catch (_error) {
		return {
			success: false,
			error: "Failed to create land listing",
		};
	}
}

/**
 * Update an existing land listing
 */
export async function updateLand(
	input: UpdateLandInput
): Promise<UpdateLandResult> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		if (!session?.user?.id) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		if (!input.id) {
			return {
				success: false,
				error: "Land ID is required",
			};
		}

		// Check if land exists and user owns it
		const existingLand = await db
			.select()
			.from(lands)
			.where(and(eq(lands.id, input.id), eq(lands.userId, session.user.id)))
			.limit(1);

		if (existingLand.length === 0) {
			return {
				success: false,
				error: "Land not found or access denied",
			};
		}

		// Prepare update data (only include defined fields)
		const updateData: any = {
			updatedAt: new Date(),
		};

		if (input.name !== undefined) {
			if (!input.name.trim()) {
				return {
					success: false,
					error: "Land name cannot be empty",
				};
			}
			updateData.name = input.name.trim();
		}

		if (input.description !== undefined) {
			if (!input.description.trim()) {
				return {
					success: false,
					error: "Land description cannot be empty",
				};
			}
			updateData.description = input.description.trim();
		}

		if (input.area !== undefined) {
			if (input.area <= 0) {
				return {
					success: false,
					error: "Valid land area is required",
				};
			}
			updateData.area = input.area;
		}

		if (input.price !== undefined) {
			if (input.price <= 0) {
				return {
					success: false,
					error: "Valid price is required",
				};
			}
			updateData.price = input.price;
		}

		if (input.currency !== undefined) {
			updateData.currency = input.currency;
		}

		if (input.location !== undefined) {
			updateData.location = input.location.trim();
		}

		if (input.address !== undefined) {
			updateData.address = input.address;
		}

		if (input.type !== undefined) {
			updateData.type = input.type;
		}

		if (input.features !== undefined) {
			updateData.features = input.features;
		}

		if (input.images !== undefined) {
			updateData.images = input.images;
		}

		const [updatedLand] = await db
			.update(lands)
			.set(updateData)
			.where(eq(lands.id, input.id))
			.returning();

		// Revalidate relevant pages
		revalidatePath("/dashboard/lands");
		revalidatePath("/lands");
		revalidatePath(`/lands/${input.id}`);
		revalidatePath("/search");

		return {
			success: true,
			data: updatedLand as Land,
		};
	} catch (_error) {
		return {
			success: false,
			error: "Failed to update land listing",
		};
	}
}

/**
 * Get a land by ID
 */
export async function getLandById(id: string): Promise<GetLandResult> {
	try {
		if (!id) {
			return {
				success: false,
				error: "Land ID is required",
			};
		}

		const [land] = await db
			.select()
			.from(lands)
			.where(eq(lands.id, id))
			.limit(1);

		if (!land) {
			return {
				success: false,
				error: "Land not found",
			};
		}

		return {
			success: true,
			data: land as Land,
		};
	} catch (_error) {
		return {
			success: false,
			error: "Failed to fetch land",
		};
	}
}

/**
 * Search lands with filters
 */
export async function searchLands(
	filters: LandSearchFilters = {}
): Promise<SearchLandsResult> {
	try {
		const baseQuery = db.select().from(lands);
		const conditions = [];

		// Apply filters
		if (filters.minPrice !== undefined) {
			conditions.push(gte(lands.price, filters.minPrice));
		}

		if (filters.maxPrice !== undefined) {
			conditions.push(lte(lands.price, filters.maxPrice));
		}

		if (filters.landTypes && filters.landTypes.length > 0) {
			conditions.push(inArray(lands.type, filters.landTypes));
		}

		if (filters.location) {
			conditions.push(ilike(lands.location, `%${filters.location}%`));
		}

		if (filters.minArea !== undefined) {
			conditions.push(gte(lands.area, filters.minArea));
		}

		if (filters.maxArea !== undefined) {
			conditions.push(lte(lands.area, filters.maxArea));
		}

		if (filters.status && filters.status.length > 0) {
			conditions.push(inArray(lands.status, filters.status));
		}

		if (filters.userId) {
			conditions.push(eq(lands.userId, filters.userId));
		}

		// Execute query (apply conditions if present)
		const results =
			conditions.length > 0
				? await baseQuery.where(and(...conditions))
				: await baseQuery;

		// Get available filter options (simplified for now)
		const availableFilters = {
			landTypes: [
				"residential",
				"commercial",
				"agricultural",
				"industrial",
				"recreational",
				"mixed-use",
				"vacant",
			] as LandType[],
			priceRanges: [
				{ min: 0, max: 50_000, label: "Under $50K" },
				{ min: 50_000, max: 100_000, label: "$50K - $100K" },
				{ min: 100_000, max: 250_000, label: "$100K - $250K" },
				{ min: 250_000, max: 500_000, label: "$250K - $500K" },
				{ min: 500_000, max: 1_000_000, label: "$500K - $1M" },
				{ min: 1_000_000, max: Number.MAX_SAFE_INTEGER, label: "Over $1M" },
			],
			locations: [], // Could be populated from database
			utilities: ["water", "electricity", "gas", "sewer", "internet", "phone"],
			zoning: [
				"residential",
				"commercial",
				"industrial",
				"agricultural",
				"mixed-use",
			],
		};

		const appliedFilters = [];
		if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
			appliedFilters.push("price");
		}
		if (filters.landTypes && filters.landTypes.length > 0) {
			appliedFilters.push("type");
		}
		if (filters.location) {
			appliedFilters.push("location");
		}
		if (filters.minArea !== undefined || filters.maxArea !== undefined) {
			appliedFilters.push("area");
		}

		return {
			success: true,
			data: {
				items: results as Land[],
				total: results.length,
				hasMore: false, // Implement pagination if needed
				page: 1,
				totalPages: 1,
				filters: {
					applied: appliedFilters,
					available: availableFilters,
				},
			},
		};
	} catch (_error) {
		return {
			success: false,
			error: "Failed to search lands",
		};
	}
}

/**
 * Delete a land listing
 */
export async function deleteLand(id: string): Promise<DeleteLandResult> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		if (!session?.user?.id) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		if (!id) {
			return {
				success: false,
				error: "Land ID is required",
			};
		}

		// Check if land exists and user owns it
		const existingLand = await db
			.select()
			.from(lands)
			.where(and(eq(lands.id, id), eq(lands.userId, session.user.id)))
			.limit(1);

		if (existingLand.length === 0) {
			return {
				success: false,
				error: "Land not found or access denied",
			};
		}

		await db.delete(lands).where(eq(lands.id, id));

		// Revalidate relevant pages
		revalidatePath("/dashboard/lands");
		revalidatePath("/lands");
		revalidatePath("/search");

		return {
			success: true,
		};
	} catch (_error) {
		return {
			success: false,
			error: "Failed to delete land listing",
		};
	}
}
