"use server"

import { revalidatePath } from "next/cache"
// import { put } from "@vercel/blob" // Unused
import { z } from "zod"
import { eq, desc, count } from "drizzle-orm"
import { type ActionState, createValidatedAction, createSuccessResponse, createErrorResponse } from "@/lib/validations"
import db from "@/lib/db/drizzle"
import { lands } from "@/lib/db/schema"

const landSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  area: z.number().min(100).max(1000000),
  price: z.number().min(10000).max(50000000),
  location: z.string().min(3).max(100),
  type: z.enum(["commercial", "residential", "agricultural", "beachfront"]).default("residential"),
})

async function addLandAction(
  data: { name: string; description: string; area: number; price: number; location: string; type?: string }
): Promise<ActionState> {
  try {
    await db.insert(lands).values({
      name: data.name,
      description: data.description,
      area: data.area,
      price: data.price,
      location: data.location,
      type: data.type || "residential",
      images: [], // Images will be handled separately if needed
      createdAt: new Date(),
    })

    revalidatePath("/dashboard/lands")
    return createSuccessResponse(undefined, "Terreno agregado exitosamente!")
  } catch (error) {
    console.error("Error adding land:", error)
    return createErrorResponse("Error al agregar el terreno")
  }
}

export const addLand = createValidatedAction(landSchema, addLandAction)

async function updateLandAction(
  data: { id: string; name: string; description: string; area: number; price: number; location: string; type?: string }
): Promise<ActionState> {
  try {
    const updateData = {
      name: data.name,
      description: data.description,
      area: data.area,
      price: data.price,
      location: data.location,
      type: data.type || "residential",
      updatedAt: new Date(),
    }

    await db.update(lands).set(updateData).where(eq(lands.id, parseInt(data.id)))

    revalidatePath("/dashboard/lands")
    return createSuccessResponse(undefined, "Terreno actualizado exitosamente!")
  } catch (error) {
    console.error("Error updating land:", error)
    return createErrorResponse("Error al actualizar el terreno")
  }
}

export const updateLand = createValidatedAction(
  landSchema.extend({ id: z.string() }),
  updateLandAction
)

const deleteLandSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

async function deleteLandAction(
  data: { id: string }
): Promise<ActionState> {
  try {
    await db.delete(lands).where(eq(lands.id, parseInt(data.id)));
    revalidatePath("/dashboard/lands");
    return createSuccessResponse(undefined, "Terreno eliminado exitosamente!");
  } catch (error) {
    console.error("Error deleting land:", error);
    return createErrorResponse("Error al eliminar el terreno");
  }
}

export const deleteLand = createValidatedAction(deleteLandSchema, deleteLandAction);

// Helper function for backward compatibility
export const deleteLandById = async (id: string): Promise<ActionState> => {
  const formData = new FormData();
  formData.append('id', id);
  return await deleteLand(formData);
};

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
