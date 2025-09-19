"use server"

import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"
import { z } from "zod"
import { eq, desc, count, and, ilike, or } from "drizzle-orm"
import { type ActionState, validatedAction } from "../../lib/validations"
import db from "../../lib/db/drizzle"
import { properties } from "../../lib/db/schema"

const propertySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  price: z.number().min(1000).max(10000000),
  type: z.string().min(3).max(50),
  bedrooms: z.number().min(1).max(10),
  bathrooms: z.number().min(1).max(10),
  area: z.number().min(20).max(10000),
  location: z.string().min(3).max(100),
  status: z.enum(["sale", "rent"]).default("sale"),
})

export const addProperty = validatedAction(
  propertySchema,
  async (data: any, formData: FormData): Promise<ActionState> => {
    try {
      const imageUrls = []

      for (let i = 0; i < 10; i++) {
        const image = formData.get(`image${i}`) as File
        if (image && image.size > 0) {
          try {
            const { url } = await put(`properties/${Date.now()}-${image.name}`, image, {
              access: "public",
            })
            imageUrls.push(url)
          } catch (error) {
            console.error("Error uploading image:", error)
          }
        }
      }

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
        images: imageUrls,
        createdAt: new Date(),
      })

      revalidatePath("/dashboard/properties")
      return { success: true, message: "Propiedad agregada exitosamente!" }
    } catch (error) {
      console.error("Error adding property:", error)
      return { error: "Error al agregar la propiedad" }
    }
  },
)

export const updateProperty = validatedAction(
  propertySchema.extend({ id: z.string() }),
  async (data: any, formData: FormData): Promise<ActionState> => {
    try {
      const imageUrls = []

      for (let i = 0; i < 10; i++) {
        const image = formData.get(`image${i}`) as File
        if (image && image.size > 0) {
          try {
            const { url } = await put(`properties/${Date.now()}-${image.name}`, image, {
              access: "public",
            })
            imageUrls.push(url)
          } catch (error) {
            console.error("Error uploading image:", error)
          }
        }
      }

      const updateData: any = {
        title: data.title,
        description: data.description,
        price: data.price,
        type: data.type,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area,
        location: data.location,
        status: data.status,
      }

      if (imageUrls.length > 0) {
        updateData.images = imageUrls
      }

      await db.update(properties).set(updateData).where(eq(properties.id, parseInt(data.id)))

      revalidatePath("/dashboard/properties")
      return { success: true, message: "Propiedad actualizada exitosamente!" }
    } catch (error) {
      console.error("Error updating property:", error)
      return { error: "Error al actualizar la propiedad" }
    }
  },
)

export const deleteProperty = async (id: string): Promise<ActionState> => {
  try {
    await db.delete(properties).where(eq(properties.id, parseInt(id)))
    revalidatePath("/dashboard/properties")
    return { success: true, message: "Propiedad eliminada exitosamente!" }
  } catch (error) {
    console.error("Error deleting property:", error)
    return { error: "Error al eliminar la propiedad" }
  }
}

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

const searchSchema = z.object({
  query: z.string().min(1).max(100),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(12),
})

export const searchPropertiesAction = validatedAction(
  searchSchema,
  async (data: { query: string; page?: number; limit?: number }, formData: FormData): Promise<ActionState> => {
    try {
      const query = formData.get('query') as string || data.query
      const result = await searchProperties(query, data.page, data.limit)
      
      return {
        success: true,
        message: `Found ${result.total} properties`,
        data: result
      }
    } catch (error) {
      console.error('Search properties action error:', error)
      return { error: 'An error occurred while searching properties' }
    }
  }
)
