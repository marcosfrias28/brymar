"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { eq, desc, count, and, ilike, or } from "drizzle-orm"
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
): Promise<ActionState> {
  try {
    // Note: Image handling would need to be done differently with the new system
    // For now, we'll handle it in the component or create a separate image upload action
    
    await db.insert(properties).values({
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
    });

    revalidatePath("/dashboard/properties");
    return createSuccessResponse(undefined, "Propiedad agregada exitosamente!");
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

const searchSchema = z.object({
  query: z.string().min(1).max(100),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(12),
})

async function searchPropertiesActionFunction(
  data: { query: string; page?: number; limit?: number }
): Promise<ActionState<{ properties: any[]; total: number; totalPages: number; currentPage: number }>> {
  try {
    const result = await searchProperties(data.query, data.page, data.limit);
    
    return createSuccessResponse(
      result,
      `Found ${result.total} properties`
    );
  } catch (error) {
    // console.error('Search properties action error:', error);
    return {
      success: false,
      error: 'An error occurred while searching properties'
    } as ActionState<{ properties: any[]; total: number; totalPages: number; currentPage: number }>;
  }
}

export const searchPropertiesAction = createValidatedAction(
  searchSchema, 
  searchPropertiesActionFunction
);
