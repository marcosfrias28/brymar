"use server"

import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"
import { z } from "zod"
import { eq, desc, count, and } from "drizzle-orm"
import { type ActionState, validatedAction } from "../validations"
import db from "../db/drizzle"
import { lands } from "../db/schema"

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
    await db.insert(lands).values({
      name: data.name,
      description: data.description,
      area: data.area,
      price: data.price,
      location: data.location,
      type: data.type,
      images: imageUrls,
      createdAt: new Date(),
    })

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

      const updateData: any = {
        name: data.name,
        description: data.description,
        area: data.area,
        price: data.price,
        location: data.location,
        type: data.type,
        updatedAt: new Date(),
      }

      if (imageUrls.length > 0) {
        updateData.images = imageUrls
      }

      await db.update(lands).set(updateData).where(eq(lands.id, parseInt(data.id)))

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
    await db.delete(lands).where(eq(lands.id, parseInt(id)))
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

    // Build where conditions
    const whereConditions = []
    if (filters?.type && filters.type !== "all") {
      whereConditions.push(eq(lands.type, filters.type))
    }

    // Get lands with pagination
    const landsQuery = db.select().from(lands)
    if (whereConditions.length > 0) {
      landsQuery.where(whereConditions[0])
    }
    const landsResult = await landsQuery
      .orderBy(desc(lands.createdAt))
      .limit(limit)
      .offset(offset)

    // Get total count
    const totalQuery = db.select({ count: count() }).from(lands)
    if (whereConditions.length > 0) {
      totalQuery.where(whereConditions[0])
    }
    const totalResult = await totalQuery

    return {
      lands: landsResult,
      total: totalResult[0].count,
      totalPages: Math.ceil(totalResult[0].count / limit),
    }
  } catch (error) {
    console.error("Error fetching lands:", error)
    return { lands: [], total: 0, totalPages: 0 }
  }
}

export const getLandById = async (id: string) => {
  try {
    const result = await db.select().from(lands).where(eq(lands.id, parseInt(id)))
    return result[0] || null
  } catch (error) {
    console.error("Error fetching land:", error)
    return null
  }
}
