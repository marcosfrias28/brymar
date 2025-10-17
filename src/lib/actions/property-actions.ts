"use server"

import { revalidatePath } from "next/cache"
import { eq, desc, count, and, ilike, or } from "drizzle-orm"
import { z } from "zod"
import {
  type ActionState,
  createValidatedAction,
  createSuccessResponse,
  createErrorResponse
} from "../validations"
import {
  PropertyFormSchema,
  PropertyUpdateFormSchema,
  PropertySearchSchema,
  validateData,
  type PropertyFormData,
  type PropertyUpdateFormData,
  type PropertySearchParams
} from "../unified-schema"
import {
  validatePropertyBusinessRules,
  createDatabaseError,
  handleError
} from "../unified-errors"
import db from "../db/drizzle"
import { properties } from "../db/schema"

async function addPropertyAction(data: PropertyFormData): Promise<ActionState> {
  try {
    // Validate business rules
    validatePropertyBusinessRules({
      type: data.type,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area,
      price: data.price
    });

    await db.insert(properties).values({
      title: data.title,
      description: data.description,
      price: data.price,
      type: data.type,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area,
      location: data.location,
      status: data.status || "draft",
      featured: data.featured || false,
      images: data.images || [],
      createdAt: new Date(),
    })

    revalidatePath("/dashboard/properties")
    return createSuccessResponse(undefined, "Propiedad agregada exitosamente!")
  } catch (error) {
    console.error("Error adding property:", error)
    if (error instanceof Error && error.message.includes('database')) {
      throw createDatabaseError("Error al guardar la propiedad", "INSERT", error);
    }
    throw handleError(error);
  }
}

export const addProperty = createValidatedAction(PropertyFormSchema, addPropertyAction)

async function updatePropertyAction(data: PropertyUpdateFormData): Promise<ActionState> {
  try {
    // Validate business rules
    validatePropertyBusinessRules({
      type: data.type,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area,
      price: data.price
    });

    const updateData = {
      title: data.title,
      description: data.description,
      price: data.price,
      type: data.type,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area,
      location: data.location,
      status: data.status,
      featured: data.featured,
      images: data.images || [],
      updatedAt: new Date(),
    }

    await db.update(properties).set(updateData).where(eq(properties.id, data.id))

    revalidatePath("/dashboard/properties")
    return createSuccessResponse(undefined, "Propiedad actualizada exitosamente!")
  } catch (error) {
    console.error("Error updating property:", error)
    if (error instanceof Error && error.message.includes('database')) {
      throw createDatabaseError("Error al actualizar la propiedad", "UPDATE", error);
    }
    throw handleError(error);
  }
}

export const updateProperty = createValidatedAction(PropertyUpdateFormSchema, updatePropertyAction)

// Simple delete schema
const deletePropertySchema = z.object({
  id: z.number().min(1, "ID de propiedad requerido")
})

async function deletePropertyAction(data: z.infer<typeof deletePropertySchema>): Promise<ActionState> {
  try {
    await db.delete(properties).where(eq(properties.id, data.id))
    revalidatePath("/dashboard/properties")
    return createSuccessResponse(undefined, "Propiedad eliminada exitosamente!")
  } catch (error) {
    console.error("Error deleting property:", error)
    if (error instanceof Error && error.message.includes('database')) {
      throw createDatabaseError("Error al eliminar la propiedad", "DELETE", error);
    }
    throw handleError(error);
  }
}

export const deleteProperty = createValidatedAction(deletePropertySchema, deletePropertyAction)

// Funzioni di lettura (non hanno bisogno di validazione)
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
    console.error("Error fetching properties:", error)
    return { properties: [], total: 0, totalPages: 0 }
  }
}

export const getPropertyById = async (id: string) => {
  try {
    const result = await db.select().from(properties).where(eq(properties.id, parseInt(id)))
    return result[0] || null
  } catch (error) {
    console.error("Error fetching property:", error)
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
    console.error("Error searching properties:", error)
    return {
      properties: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
    }
  }
}

export const getFeaturedProperties = async (limit = 6) => {
  try {
    const result = await db
      .select()
      .from(properties)
      .where(eq(properties.featured, true))
      .orderBy(desc(properties.createdAt))
      .limit(limit)

    return result
  } catch (error) {
    console.error("Error fetching featured properties:", error)
    return []
  }
}

type SearchResult = {
  properties: any[]
  total: number
  totalPages: number
  currentPage: number
}

async function searchPropertiesActionHandler(data: PropertySearchParams): Promise<ActionState<SearchResult | void>> {
  try {
    const result = await searchProperties(data.query || "", data.page, data.limit)

    return createSuccessResponse(
      result,
      `Se encontraron ${result.total} propiedades`
    )
  } catch (error) {
    console.error('Search properties action error:', error)
    throw handleError(error);
  }
}

export const searchPropertiesAction = createValidatedAction(PropertySearchSchema, searchPropertiesActionHandler)

// Toggle featured schema
const toggleFeaturedSchema = z.object({
  id: z.number().min(1, "ID de propiedad requerido"),
  featured: z.boolean()
})

async function toggleFeaturedAction(data: z.infer<typeof toggleFeaturedSchema>): Promise<ActionState> {
  try {
    await db
      .update(properties)
      .set({
        featured: data.featured,
        updatedAt: new Date()
      })
      .where(eq(properties.id, data.id))

    revalidatePath("/dashboard/properties")
    const message = data.featured
      ? "Propiedad marcada como destacada"
      : "Propiedad removida de destacadas"

    return createSuccessResponse(undefined, message)
  } catch (error) {
    console.error("Error toggling featured status:", error)
    if (error instanceof Error && error.message.includes('database')) {
      throw createDatabaseError("Error al actualizar el estado destacado", "UPDATE", error);
    }
    throw handleError(error);
  }
}

export const toggleFeaturedProperty = createValidatedAction(toggleFeaturedSchema, toggleFeaturedAction)