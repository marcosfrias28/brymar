"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { eq, desc, count, and, ilike, or } from "drizzle-orm"
import {
  type ActionState,
  createValidatedAction,
  createSuccessResponse,
  createErrorResponse
} from "../validations"
import db from "../db/drizzle"
import { properties } from "../db/schema"

// Schema per aggiungere una proprietà
const propertySchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(100, "El título no puede exceder 100 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(1000, "La descripción no puede exceder 1000 caracteres"),
  price: z.coerce.number().min(1000, "El precio debe ser al menos $1,000").max(10000000, "El precio no puede exceder $10,000,000"),
  type: z.string().min(3, "El tipo debe tener al menos 3 caracteres").max(50, "El tipo no puede exceder 50 caracteres"),
  bedrooms: z.coerce.number().min(1, "Debe tener al menos 1 habitación").max(10, "No puede tener más de 10 habitaciones"),
  bathrooms: z.coerce.number().min(1, "Debe tener al menos 1 baño").max(10, "No puede tener más de 10 baños"),
  area: z.coerce.number().min(20, "El área debe ser al menos 20 m²").max(10000, "El área no puede exceder 10,000 m²"),
  location: z.string().min(3, "La ubicación debe tener al menos 3 caracteres").max(100, "La ubicación no puede exceder 100 caracteres"),
  status: z.enum(["sale", "rent"], { errorMap: () => ({ message: "El estado debe ser 'sale' o 'rent'" }) }),
  featured: z.boolean(),
})

async function addPropertyAction(data: z.infer<typeof propertySchema>): Promise<ActionState> {
  try {
    await db.insert(properties).values({
      title: data.title,
      description: data.description,
      price: data.price,
      type: data.type,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area,
      location: data.location,
      status: data.status,
      featured: data.featured || false,
      images: [], // Images will be handled separately
      createdAt: new Date(),
    })

    revalidatePath("/dashboard/properties")
    return createSuccessResponse(undefined, "Propiedad agregada exitosamente!")
  } catch (error) {
    console.error("Error adding property:", error)
    return createErrorResponse("Error al agregar la propiedad")
  }
}

export const addProperty = createValidatedAction(propertySchema, addPropertyAction)

// Schema per aggiornare una proprietà
const updatePropertySchema = z.object({
  id: z.string().min(1, "ID de propiedad requerido"),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(100, "El título no puede exceder 100 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(1000, "La descripción no puede exceder 1000 caracteres"),
  price: z.coerce.number().min(1000, "El precio debe ser al menos $1,000").max(10000000, "El precio no puede exceder $10,000,000"),
  type: z.string().min(3, "El tipo debe tener al menos 3 caracteres").max(50, "El tipo no puede exceder 50 caracteres"),
  bedrooms: z.coerce.number().min(1, "Debe tener al menos 1 habitación").max(10, "No puede tener más de 10 habitaciones"),
  bathrooms: z.coerce.number().min(1, "Debe tener al menos 1 baño").max(10, "No puede tener más de 10 baños"),
  area: z.coerce.number().min(20, "El área debe ser al menos 20 m²").max(10000, "El área no puede exceder 10,000 m²"),
  location: z.string().min(3, "La ubicación debe tener al menos 3 caracteres").max(100, "La ubicación no puede exceder 100 caracteres"),
  status: z.enum(["sale", "rent"], { errorMap: () => ({ message: "El estado debe ser 'sale' o 'rent'" }) }),
  featured: z.boolean(),
})

async function updatePropertyAction(data: z.infer<typeof updatePropertySchema>): Promise<ActionState> {
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
      status: data.status,
      featured: data.featured,
      updatedAt: new Date(),
    }

    await db.update(properties).set(updateData).where(eq(properties.id, parseInt(data.id)))

    revalidatePath("/dashboard/properties")
    return createSuccessResponse(undefined, "Propiedad actualizada exitosamente!")
  } catch (error) {
    console.error("Error updating property:", error)
    return createErrorResponse("Error al actualizar la propiedad")
  }
}

export const updateProperty = createValidatedAction(updatePropertySchema, updatePropertyAction)

// Schema per eliminare una proprietà
const deletePropertySchema = z.object({
  id: z.string().min(1, "ID de propiedad requerido")
})

async function deletePropertyAction(data: z.infer<typeof deletePropertySchema>): Promise<ActionState> {
  try {
    await db.delete(properties).where(eq(properties.id, parseInt(data.id)))
    revalidatePath("/dashboard/properties")
    return createSuccessResponse(undefined, "Propiedad eliminada exitosamente!")
  } catch (error) {
    console.error("Error deleting property:", error)
    return createErrorResponse("Error al eliminar la propiedad")
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

// Schema per la ricerca con action
const searchSchema = z.object({
  query: z.string().min(1, "La consulta de búsqueda es requerida").max(100, "La consulta no puede exceder 100 caracteres"),
  page: z.coerce.number(),
  limit: z.coerce.number(),
})

type SearchResult = {
  properties: any[]
  total: number
  totalPages: number
  currentPage: number
}

async function searchPropertiesActionHandler(data: z.infer<typeof searchSchema>): Promise<ActionState<SearchResult | void>> {
  try {
    const result = await searchProperties(data.query, data.page, data.limit)

    return createSuccessResponse(
      result,
      `Se encontraron ${result.total} propiedades`
    )
  } catch (error) {
    console.error('Search properties action error:', error)
    return createErrorResponse('Ocurrió un error al buscar propiedades')
  }
}

export const searchPropertiesAction = createValidatedAction(searchSchema, searchPropertiesActionHandler)

// Schema per toggle featured
const toggleFeaturedSchema = z.object({
  id: z.string().min(1, "ID de propiedad requerido"),
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
      .where(eq(properties.id, parseInt(data.id)))

    revalidatePath("/dashboard/properties")
    const message = data.featured
      ? "Propiedad marcada como destacada"
      : "Propiedad removida de destacadas"

    return createSuccessResponse(undefined, message)
  } catch (error) {
    console.error("Error toggling featured status:", error)
    return createErrorResponse("Error al actualizar el estado destacado")
  }
}

export const toggleFeaturedProperty = createValidatedAction(toggleFeaturedSchema, toggleFeaturedAction)