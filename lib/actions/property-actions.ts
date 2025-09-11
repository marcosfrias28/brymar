"use server"

import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"
import { z } from "zod"
import { neon } from "@neondatabase/serverless"
import { type ActionState, validatedAction } from "../validations"

const sql = neon(process.env.DATABASE_URL!)

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

      await sql`
      INSERT INTO properties (title, description, price, type, bedrooms, bathrooms, area, location, status, images, created_at)
      VALUES (${data.title}, ${data.description}, ${data.price}, ${data.type}, ${data.bedrooms}, ${data.bathrooms}, ${data.area}, ${data.location}, ${data.status}, ${JSON.stringify(imageUrls)}, NOW())
    `

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

      const updateQuery =
        imageUrls.length > 0
          ? sql`
          UPDATE properties 
          SET title = ${data.title}, description = ${data.description}, price = ${data.price}, 
              type = ${data.type}, bedrooms = ${data.bedrooms}, bathrooms = ${data.bathrooms}, 
              area = ${data.area}, location = ${data.location}, status = ${data.status}, 
              images = ${JSON.stringify(imageUrls)}, updated_at = NOW()
          WHERE id = ${data.id}
        `
          : sql`
          UPDATE properties 
          SET title = ${data.title}, description = ${data.description}, price = ${data.price}, 
              type = ${data.type}, bedrooms = ${data.bedrooms}, bathrooms = ${data.bathrooms}, 
              area = ${data.area}, location = ${data.location}, status = ${data.status}, 
              updated_at = NOW()
          WHERE id = ${data.id}
        `

      await updateQuery

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
    await sql`DELETE FROM properties WHERE id = ${id}`
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

    let whereClause = ""
    const params: any[] = []

    if (filters?.status && filters.status !== "all") {
      whereClause += " WHERE status = $" + (params.length + 1)
      params.push(filters.status)
    }

    if (filters?.type && filters.type !== "all") {
      whereClause += (whereClause ? " AND" : " WHERE") + " type = $" + (params.length + 1)
      params.push(filters.type)
    }

    const properties = await sql`
      SELECT * FROM properties 
      ${whereClause ? sql.unsafe(whereClause) : sql``}
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `

    const totalResult = await sql`
      SELECT COUNT(*) as count FROM properties 
      ${whereClause ? sql.unsafe(whereClause) : sql``}
    `

    return {
      properties,
      total: Number.parseInt(totalResult[0].count),
      totalPages: Math.ceil(Number.parseInt(totalResult[0].count) / limit),
    }
  } catch (error) {
    console.error("Error fetching properties:", error)
    return { properties: [], total: 0, totalPages: 0 }
  }
}

export const getPropertyById = async (id: string) => {
  try {
    const result = await sql`SELECT * FROM properties WHERE id = ${id}`
    return result[0] || null
  } catch (error) {
    console.error("Error fetching property:", error)
    return null
  }
}

export const searchProperties = async (query: string, page = 1, limit = 12) => {
  try {
    const offset = (page - 1) * limit
    const searchQuery = `%${query}%`
    
    const result = await sql`
      SELECT * FROM properties 
      WHERE title ILIKE ${searchQuery} 
         OR description ILIKE ${searchQuery}
         OR location ILIKE ${searchQuery}
         OR type ILIKE ${searchQuery}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    
    const countResult = await sql`
      SELECT COUNT(*) as total FROM properties 
      WHERE title ILIKE ${searchQuery} 
         OR description ILIKE ${searchQuery}
         OR location ILIKE ${searchQuery}
         OR type ILIKE ${searchQuery}
    `
    
    return {
      properties: result,
      total: parseInt(countResult[0].total),
      totalPages: Math.ceil(parseInt(countResult[0].total) / limit),
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
