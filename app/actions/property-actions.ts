"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { eq, desc, asc, count, and, ilike, or, gte, lte } from "drizzle-orm"
import {
  type ActionState,
  createValidatedAction,
  createSuccessResponse,
  createErrorResponse
} from "@/lib/validations"
import db from "@/lib/db/drizzle"
import { properties } from "@/lib/db/schema"

// Base schema for validation
const basePropertySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  price: z.number().min(1000).max(10000000),
  type: z.string().min(3).max(50),
  bedrooms: z.number().min(1).max(10),
  bathrooms: z.number().min(1).max(10),
  area: z.number().min(20).max(10000),
  location: z.string().min(3).max(100),
})

// Schema for form input with optional status (will default to "sale")
const propertyInputSchema = basePropertySchema.extend({
  status: z.enum(["sale", "rent"]).optional().default("sale"),
})

async function addPropertyAction(
  data: {
    title: string;
    description: string;
    price: number;
    type: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    location: string;
    status?: "sale" | "rent";
  }
): Promise<ActionState<any>> {
  try {
    // Note: Image handling would need to be done differently with the new system
    // For now, we'll handle it in the component or create a separate image upload action

    const result = await db.insert(properties).values({
      title: data.title,
      description: data.description,
      price: data.price,
      type: data.type,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area,
      location: data.location,
      status: data.status || "sale", // Apply default here
      images: [], // Will be handled separately
    }).returning();

    revalidatePath("/dashboard/properties");
    return createSuccessResponse(result[0], "Propiedad agregada exitosamente!");
  } catch (error) {
    // console.error("Error adding property:", error);
    return createErrorResponse("Error al agregar la propiedad");
  }
}

export const addProperty = createValidatedAction(propertyInputSchema, addPropertyAction);

async function updatePropertyAction(
  data: {
    id: string;
    title: string;
    description: string;
    price: number;
    type: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    location: string;
    status?: "sale" | "rent";
  }
): Promise<ActionState> {
  try {
    const updateData = {
      title: data.title,
      description: data.description,
      price: data.price,
      type: data.type,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area,
      location: data.location,
      status: data.status || "sale", // Apply default here
    };

    await db.update(properties).set(updateData).where(eq(properties.id, parseInt(data.id)));

    revalidatePath("/dashboard/properties");
    return createSuccessResponse(undefined, "Propiedad actualizada exitosamente!");
  } catch (error) {
    // console.error("Error updating property:", error);
    return createErrorResponse("Error al actualizar la propiedad");
  }
}

export const updateProperty = createValidatedAction(
  propertyInputSchema.extend({ id: z.string() }),
  updatePropertyAction
);

const deletePropertySchema = z.object({
  id: z.string().min(1, "ID is required"),
});

async function deletePropertyAction(
  data: { id: string }
): Promise<ActionState> {
  try {
    await db.delete(properties).where(eq(properties.id, parseInt(data.id)));
    revalidatePath("/dashboard/properties");
    return createSuccessResponse(undefined, "Propiedad eliminada exitosamente!");
  } catch (error) {
    // console.error("Error deleting property:", error);
    return createErrorResponse("Error al eliminar la propiedad");
  }
}

export const deleteProperty = createValidatedAction(deletePropertySchema, deletePropertyAction);

// Helper function for backward compatibility
export const deletePropertyById = async (id: string): Promise<ActionState> => {
  const formData = new FormData();
  formData.append('id', id);
  return await deleteProperty(formData);
};

export const getProperties = async (page = 1, limit = 12, filters?: any) => {
  try {
    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = []

    if (filters?.status && filters.status !== "all") {
      whereConditions.push(eq(properties.status, filters.status))
    }

    if (filters?.type && filters.type !== "all") {
      whereConditions.push(eq(properties.type, filters.type))
    }

    // Get properties with pagination
    const propertiesQuery = db.select().from(properties)
    if (whereConditions.length > 0) {
      propertiesQuery.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))
    }
    const propertiesResult = await propertiesQuery
      .orderBy(desc(properties.createdAt))
      .limit(limit)
      .offset(offset)

    // Get total count
    const totalQuery = db.select({ count: count() }).from(properties)
    if (whereConditions.length > 0) {
      totalQuery.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))
    }
    const totalResult = await totalQuery

    return {
      properties: propertiesResult,
      total: totalResult[0].count,
      totalPages: Math.ceil(totalResult[0].count / limit),
    }
  } catch (error) {
    // console.error("Error fetching properties:", error)
    return { properties: [], total: 0, totalPages: 0 }
  }
}

export const getPropertyById = async (id: string) => {
  try {
    const result = await db.select().from(properties).where(eq(properties.id, parseInt(id)))
    return result[0] || null
  } catch (error) {
    // console.error("Error fetching property:", error)
    return null
  }
}

export const searchProperties = async (query: string, page = 1, limit = 12) => {
  try {
    const offset = (page - 1) * limit
    const whereConditions = [
      or(
        ilike(properties.title, `%${query}%`),
        ilike(properties.description, `%${query}%`),
        ilike(properties.location, `%${query}%`),
        ilike(properties.type, `%${query}%`),
      ),
    ]

    const propertiesResult = await db
      .select()
      .from(properties)
      .where(and(...whereConditions))
      .orderBy(desc(properties.createdAt))
      .limit(limit)
      .offset(offset)

    const totalResult = await db
      .select({ count: count() })
      .from(properties)
      .where(and(...whereConditions))

    return {
      properties: propertiesResult,
      total: totalResult[0].count,
      totalPages: Math.ceil(totalResult[0].count / limit),
      currentPage: page,
    }
  } catch (error) {
    // console.error("Error searching properties:", error)
    return {
      properties: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
    }
  }
}

const advancedSearchSchema = z.object({
  location: z.string().optional(),
  propertyType: z.string().optional(),
  landType: z.string().optional(),
  status: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  minArea: z.coerce.number().optional(),
  maxArea: z.coerce.number().optional(),
  amenities: z.array(z.string()).optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(12),
  sortBy: z.string().optional().default("newest"),
})

export const advancedSearchProperties = async (filters: any) => {
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
          ilike(properties.location, `%${filters.location}%`),
          ilike(properties.title, `%${filters.location}%`),
          ilike(properties.description, `%${filters.location}%`)
        )
      );
    }

    // Property type filter
    if (filters.propertyType && filters.propertyType !== "all") {
      whereConditions.push(eq(properties.type, filters.propertyType));
    }

    // Property status filter
    if (filters.status && filters.status !== "all") {
      whereConditions.push(eq(properties.status, filters.status));
    }

    // Price range filter
    if (filters.minPrice && filters.minPrice > 0) {
      whereConditions.push(gte(properties.price, filters.minPrice));
    }
    if (filters.maxPrice && filters.maxPrice > 0) {
      whereConditions.push(lte(properties.price, filters.maxPrice));
    }

    // Bedrooms filter
    if (filters.bedrooms && filters.bedrooms !== "any") {
      const bedroomCount = parseInt(filters.bedrooms);
      if (!isNaN(bedroomCount)) {
        whereConditions.push(gte(properties.bedrooms, bedroomCount));
      }
    }

    // Bathrooms filter
    if (filters.bathrooms && filters.bathrooms !== "any") {
      const bathroomCount = parseInt(filters.bathrooms);
      if (!isNaN(bathroomCount)) {
        whereConditions.push(gte(properties.bathrooms, bathroomCount));
      }
    }

    // Area range filter
    if (filters.minArea && filters.minArea > 0) {
      whereConditions.push(gte(properties.area, filters.minArea));
    }
    if (filters.maxArea && filters.maxArea > 0) {
      whereConditions.push(lte(properties.area, filters.maxArea));
    }

    // Build the base query
    const baseQuery = db.select().from(properties);

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
        finalQuery = queryWithWhere.orderBy(asc(properties.price));
        break;
      case "price-high":
        finalQuery = queryWithWhere.orderBy(desc(properties.price));
        break;
      case "area-large":
        finalQuery = queryWithWhere.orderBy(desc(properties.area));
        break;
      case "area-small":
        finalQuery = queryWithWhere.orderBy(asc(properties.area));
        break;
      case "newest":
      default:
        finalQuery = queryWithWhere.orderBy(desc(properties.createdAt));
        break;
    }

    // Execute query with pagination
    const propertiesResult = await finalQuery
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalBaseQuery = db.select({ count: count() }).from(properties);
    const totalQueryWithWhere = whereConditions.length > 0
      ? totalBaseQuery.where(
        whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions)
      )
      : totalBaseQuery;
    const totalResult = await totalQueryWithWhere;

    return {
      properties: propertiesResult,
      total: totalResult[0].count,
      totalPages: Math.ceil(totalResult[0].count / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error in advanced search:", error);
    return {
      properties: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
};

async function advancedSearchPropertiesActionFunction(
  data: any
): Promise<ActionState<{ properties: any[]; total: number; totalPages: number; currentPage: number }>> {
  try {
    const result = await advancedSearchProperties(data);

    return createSuccessResponse(
      result,
      `Found ${result.total} properties`
    );
  } catch (error) {
    console.error('Advanced search properties action error:', error);
    return {
      success: false,
      error: 'An error occurred while searching properties'
    } as ActionState<{ properties: any[]; total: number; totalPages: number; currentPage: number }>;
  }
}

export const searchPropertiesAction = createValidatedAction(
  advancedSearchSchema,
  advancedSearchPropertiesActionFunction
);
