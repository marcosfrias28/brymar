"use server"

import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"
import { z } from "zod"
import { neon } from "@neondatabase/serverless"
import { type ActionState, validatedAction } from "../validations"

const sql = neon(process.env.DATABASE_URL!)

const landSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  area: z.number().min(100).max(1000000),
  price: z.number().min(10000).max(50000000),
  location: z.string().min(3).max(100),
  type: z.enum(["commercial", "residential", "agricultural", "beachfront"]).default("residential"),
})

export const addLand = validatedAction(landSchema, async (data: any, formData: FormData): Promise<ActionState> => {
  try {
    const imageUrls = []

    for (let i = 0; i < 10; i++) {
      const image = formData.get(`image${i}`) as File
      if (image && image.size > 0) {
        try {
          const { url } = await put(`lands/${Date.now()}-${image.name}`, image, {
            access: "public",
          })
          imageUrls.push(url)
        } catch (error) {
          console.error("Error uploading image:", error)
        }
      }
    }

    await sql`
      INSERT INTO lands (name, description, area, price, location, type, images, created_at)
      VALUES (${data.name}, ${data.description}, ${data.area}, ${data.price}, ${data.location}, ${data.type}, ${JSON.stringify(imageUrls)}, NOW())
    `

    revalidatePath("/dashboard/lands")
    return { success: true, message: "Terreno agregado exitosamente!" }
  } catch (error) {
    console.error("Error adding land:", error)
    return { error: "Error al agregar el terreno" }
  }
})

export const updateLand = validatedAction(
  landSchema.extend({ id: z.string() }),
  async (data: any, formData: FormData): Promise<ActionState> => {
    try {
      const imageUrls = []

      for (let i = 0; i < 10; i++) {
        const image = formData.get(`image${i}`) as File
        if (image && image.size > 0) {
          try {
            const { url } = await put(`lands/${Date.now()}-${image.name}`, image, {
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
          UPDATE lands 
          SET name = ${data.name}, description = ${data.description}, area = ${data.area}, 
              price = ${data.price}, location = ${data.location}, type = ${data.type}, 
              images = ${JSON.stringify(imageUrls)}, updated_at = NOW()
          WHERE id = ${data.id}
        `
          : sql`
          UPDATE lands 
          SET name = ${data.name}, description = ${data.description}, area = ${data.area}, 
              price = ${data.price}, location = ${data.location}, type = ${data.type}, 
              updated_at = NOW()
          WHERE id = ${data.id}
        `

      await updateQuery

      revalidatePath("/dashboard/lands")
      return { success: true, message: "Terreno actualizado exitosamente!" }
    } catch (error) {
      console.error("Error updating land:", error)
      return { error: "Error al actualizar el terreno" }
    }
  },
)

export const deleteLand = async (id: string): Promise<ActionState> => {
  try {
    await sql`DELETE FROM lands WHERE id = ${id}`
    revalidatePath("/dashboard/lands")
    return { success: true, message: "Terreno eliminado exitosamente!" }
  } catch (error) {
    console.error("Error deleting land:", error)
    return { error: "Error al eliminar el terreno" }
  }
}

export const getLands = async (page = 1, limit = 12, filters?: any) => {
  try {
    const offset = (page - 1) * limit

    let whereClause = ""
    const params: any[] = []

    if (filters?.type && filters.type !== "all") {
      whereClause += " WHERE type = $" + (params.length + 1)
      params.push(filters.type)
    }

    const lands = await sql`
      SELECT * FROM lands 
      ${whereClause ? sql.unsafe(whereClause) : sql``}
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `

    const totalResult = await sql`
      SELECT COUNT(*) as count FROM lands 
      ${whereClause ? sql.unsafe(whereClause) : sql``}
    `

    return {
      lands,
      total: Number.parseInt(totalResult[0].count),
      totalPages: Math.ceil(Number.parseInt(totalResult[0].count) / limit),
    }
  } catch (error) {
    console.error("Error fetching lands:", error)
    return { lands: [], total: 0, totalPages: 0 }
  }
}

export const getLandById = async (id: string) => {
  try {
    const result = await sql`SELECT * FROM lands WHERE id = ${id}`
    return result[0] || null
  } catch (error) {
    console.error("Error fetching land:", error)
    return null
  }
}
