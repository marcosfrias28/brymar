"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { eq, desc, asc, count, and, ilike, or, gte, lte } from "drizzle-orm"
import {
  type ActionState,
  createValidatedAction,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/validations';
import db from '@/lib/db/drizzle';
import { lands } from '@/lib/db/schema';

// Validation schemas
const landSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  area: z.coerce.number().min(1, "Area must be greater than 0"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  location: z.string().min(1, "Location is required"),
  type: z.string().min(1, "Type is required"),
  images: z.array(z.string()).optional(),
})

const updateLandSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  area: z.coerce.number().min(1, "Area must be greater than 0"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  location: z.string().min(1, "Location is required"),
  type: z.string().min(1, "Type is required"),
  images: z.array(z.string()).optional(),
})

const advancedLandSearchSchema = z.object({
  location: z.string().optional(),
  landType: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minArea: z.coerce.number().optional(),
  maxArea: z.coerce.number().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(12),
  sortBy: z.string().optional().default("newest"),
})

export const advancedSearchLands = async (filters: any) => {
  try {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    // Location search
    if (filters.location && filters.location.trim()) {
      whereConditions.push(
        or(
          ilike(lands.location, `%${filters.location}%`),
          ilike(lands.name, `%${filters.location}%`),
          ilike(lands.description, `%${filters.location}%`)
        )
      );
    }

    // Land type filter
    if (filters.landType && filters.landType !== "all") {
      whereConditions.push(eq(lands.type, filters.landType));
    }

    // Price range filter
    if (filters.minPrice && filters.minPrice > 0) {
      whereConditions.push(gte(lands.price, filters.minPrice));
    }
    if (filters.maxPrice && filters.maxPrice > 0) {
      whereConditions.push(lte(lands.price, filters.maxPrice));
    }

    // Area range filter
    if (filters.minArea && filters.minArea > 0) {
      whereConditions.push(gte(lands.area, filters.minArea));
    }
    if (filters.maxArea && filters.maxArea > 0) {
      whereConditions.push(lte(lands.area, filters.maxArea));
    }

    // Build the base query
    const baseQuery = db.select().from(lands);

    // Apply where conditions if any
    const queryWithWhere = whereConditions.length > 0
      ? baseQuery.where(
        whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions)
      )
      : baseQuery;

    // Apply sorting
    let finalQuery;
    switch (filters.sortBy) {
      case "price-low":
        finalQuery = queryWithWhere.orderBy(asc(lands.price));
        break;
      case "price-high":
        finalQuery = queryWithWhere.orderBy(desc(lands.price));
        break;
      case "area-large":
        finalQuery = queryWithWhere.orderBy(desc(lands.area));
        break;
      case "area-small":
        finalQuery = queryWithWhere.orderBy(asc(lands.area));
        break;
      case "newest":
      default:
        finalQuery = queryWithWhere.orderBy(desc(lands.createdAt));
        break;
    }

    // Execute query with pagination
    const landsResult = await finalQuery
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalBaseQuery = db.select({ count: count() }).from(lands);
    const totalQueryWithWhere = whereConditions.length > 0
      ? totalBaseQuery.where(
        whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions)
      )
      : totalBaseQuery;

    const totalResult = await totalQueryWithWhere;

    return {
      lands: landsResult,
      total: totalResult[0].count,
      totalPages: Math.ceil(totalResult[0].count / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error in advanced land search:", error);
    return {
      lands: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
};

async function advancedSearchLandsActionFunction(
  data: any
): Promise<ActionState<{ lands: any[]; total: number; totalPages: number; currentPage: number }>> {
  try {
    const result = await advancedSearchLands(data);

    return createSuccessResponse(
      result,
      `Found ${result.total} lands`
    );
  } catch (error) {
    console.error('Advanced search lands action error:', error);
    return {
      success: false,
      error: 'An error occurred while searching lands'
    } as ActionState<{ lands: any[]; total: number; totalPages: number; currentPage: number }>;
  }
}

export const searchLandsAction = createValidatedAction(
  advancedLandSearchSchema,
  advancedSearchLandsActionFunction
);

// CRUD Operations

export async function getLands(page = 1, limit = 12, filters?: any) {
  try {
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    if (filters?.location && filters.location.trim()) {
      whereConditions.push(
        or(
          ilike(lands.location, `%${filters.location}%`),
          ilike(lands.name, `%${filters.location}%`),
          ilike(lands.description, `%${filters.location}%`)
        )
      );
    }

    if (filters?.landType && filters.landType !== "all") {
      whereConditions.push(eq(lands.type, filters.landType));
    }

    if (filters?.minPrice && filters.minPrice > 0) {
      whereConditions.push(gte(lands.price, filters.minPrice));
    }
    if (filters?.maxPrice && filters.maxPrice > 0) {
      whereConditions.push(lte(lands.price, filters.maxPrice));
    }

    if (filters?.minArea && filters.minArea > 0) {
      whereConditions.push(gte(lands.area, filters.minArea));
    }
    if (filters?.maxArea && filters.maxArea > 0) {
      whereConditions.push(lte(lands.area, filters.maxArea));
    }

    // Build the base query
    const baseQuery = db.select().from(lands);

    // Apply where conditions if any
    const queryWithWhere = whereConditions.length > 0
      ? baseQuery.where(
        whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions)
      )
      : baseQuery;

    // Apply sorting
    let finalQuery;
    switch (filters?.sortBy) {
      case "price-low":
        finalQuery = queryWithWhere.orderBy(asc(lands.price));
        break;
      case "price-high":
        finalQuery = queryWithWhere.orderBy(desc(lands.price));
        break;
      case "area-large":
        finalQuery = queryWithWhere.orderBy(desc(lands.area));
        break;
      case "area-small":
        finalQuery = queryWithWhere.orderBy(asc(lands.area));
        break;
      case "newest":
      default:
        finalQuery = queryWithWhere.orderBy(desc(lands.createdAt));
        break;
    }

    // Execute query with pagination
    const landsResult = await finalQuery
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalBaseQuery = db.select({ count: count() }).from(lands);
    const totalQueryWithWhere = whereConditions.length > 0
      ? totalBaseQuery.where(
        whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions)
      )
      : totalBaseQuery;

    const totalResult = await totalQueryWithWhere;

    return {
      lands: landsResult,
      total: totalResult[0].count,
      totalPages: Math.ceil(totalResult[0].count / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching lands:", error);
    throw new Error("Failed to fetch lands");
  }
}

export async function getLandById(id: string) {
  try {
    const land = await db.select().from(lands).where(eq(lands.id, parseInt(id))).limit(1);

    if (land.length === 0) {
      throw new Error("Land not found");
    }

    return land[0];
  } catch (error) {
    console.error("Error fetching land:", error);
    throw new Error("Failed to fetch land");
  }
}

async function addLandFunction(data: z.infer<typeof landSchema>): Promise<ActionState> {
  try {
    const result = await db.insert(lands).values({
      name: data.name,
      description: data.description,
      area: data.area,
      price: data.price,
      location: data.location,
      type: data.type,
      images: data.images || [],
      createdAt: new Date(),
      updatedAt: null,
    }).returning();

    revalidatePath("/dashboard/lands");
    revalidatePath("/search");

    return createSuccessResponse(undefined, "Land created successfully");
  } catch (error) {
    console.error("Error creating land:", error);
    return createErrorResponse("Failed to create land");
  }
}

export const addLand = createValidatedAction(landSchema, addLandFunction);

async function updateLandFunction(data: z.infer<typeof updateLandSchema>): Promise<ActionState> {
  try {
    const result = await db
      .update(lands)
      .set({
        name: data.name,
        description: data.description,
        area: data.area,
        price: data.price,
        location: data.location,
        type: data.type,
        images: data.images || [],
        updatedAt: new Date(),
      })
      .where(eq(lands.id, data.id))
      .returning();

    if (result.length === 0) {
      return createErrorResponse("Land not found");
    }

    revalidatePath("/dashboard/lands");
    revalidatePath(`/dashboard/lands/${data.id}`);
    revalidatePath("/search");

    return createSuccessResponse(undefined, "Land updated successfully");
  } catch (error) {
    console.error("Error updating land:", error);
    return createErrorResponse("Failed to update land");
  }
}

export const updateLand = createValidatedAction(updateLandSchema, updateLandFunction);

export async function deleteLandById(id: string): Promise<ActionState> {
  try {
    const result = await db.delete(lands).where(eq(lands.id, parseInt(id))).returning();

    if (result.length === 0) {
      return createErrorResponse("Land not found");
    }

    revalidatePath("/dashboard/lands");
    revalidatePath("/search");

    return createSuccessResponse(undefined, "Land deleted successfully");
  } catch (error) {
    console.error("Error deleting land:", error);
    return createErrorResponse("Failed to delete land");
  }
}