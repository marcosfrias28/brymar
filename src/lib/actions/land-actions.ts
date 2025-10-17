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
import {
    LandFormSchema,
    LandUpdateFormSchema,
    LandSearchSchema,
    type LandFormData,
    type LandUpdateFormData,
    type LandSearchParams
} from "../unified-schema"
import {
    validateLandBusinessRules,
    createDatabaseError,
    handleError
} from "../unified-errors"
import db from "../db/drizzle"
import { lands } from "../db/schema"

// ============================================================================
// LAND CRUD ACTIONS
// ============================================================================

async function addLandAction(data: LandFormData): Promise<ActionState> {
    try {
        // Validate business rules
        validateLandBusinessRules({
            type: data.type,
            area: data.area,
            price: data.price
        });

        await db.insert(lands).values({
            name: data.name,
            description: data.description,
            area: data.area,
            price: data.price,
            location: data.location,
            type: data.type,
            status: data.status || "draft",
            features: data.features || [],
            images: data.images || [],
            createdAt: new Date(),
        })

        revalidatePath("/dashboard/lands")
        return createSuccessResponse(undefined, "Terreno agregado exitosamente!")
    } catch (error) {
        console.error("Error adding land:", error)
        if (error instanceof Error && error.message.includes('database')) {
            throw createDatabaseError("Error al guardar el terreno", "INSERT", error);
        }
        throw handleError(error);
    }
}

export const addLand = createValidatedAction(LandFormSchema, addLandAction)

async function updateLandAction(data: LandUpdateFormData): Promise<ActionState> {
    try {
        // Validate business rules
        validateLandBusinessRules({
            type: data.type,
            area: data.area,
            price: data.price
        });

        const updateData = {
            name: data.name,
            description: data.description,
            area: data.area,
            price: data.price,
            location: data.location,
            type: data.type,
            status: data.status,
            features: data.features || [],
            images: data.images || [],
            updatedAt: new Date(),
        }

        await db.update(lands).set(updateData).where(eq(lands.id, data.id))

        revalidatePath("/dashboard/lands")
        return createSuccessResponse(undefined, "Terreno actualizado exitosamente!")
    } catch (error) {
        console.error("Error updating land:", error)
        if (error instanceof Error && error.message.includes('database')) {
            throw createDatabaseError("Error al actualizar el terreno", "UPDATE", error);
        }
        throw handleError(error);
    }
}

export const updateLand = createValidatedAction(LandUpdateFormSchema, updateLandAction)

// Simple delete schema
const deleteLandSchema = z.object({
    id: z.number().min(1, "ID de terreno requerido")
})

async function deleteLandAction(data: z.infer<typeof deleteLandSchema>): Promise<ActionState> {
    try {
        await db.delete(lands).where(eq(lands.id, data.id))
        revalidatePath("/dashboard/lands")
        return createSuccessResponse(undefined, "Terreno eliminado exitosamente!")
    } catch (error) {
        console.error("Error deleting land:", error)
        if (error instanceof Error && error.message.includes('database')) {
            throw createDatabaseError("Error al eliminar el terreno", "DELETE", error);
        }
        throw handleError(error);
    }
}

export const deleteLand = createValidatedAction(deleteLandSchema, deleteLandAction)

// ============================================================================
// LAND QUERY FUNCTIONS
// ============================================================================

export const getLands = async (page = 1, limit = 12, filters?: any) => {
    try {
        const offset = (page - 1) * limit

        // Build where conditions
        const whereConditions = []

        if (filters?.status && filters.status !== "all") {
            whereConditions.push(eq(lands.status, filters.status))
        }

        if (filters?.type && filters.type !== "all") {
            whereConditions.push(eq(lands.type, filters.type))
        }

        // Get lands with pagination
        const landsQuery = db.select().from(lands)
        if (whereConditions.length > 0) {
            landsQuery.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))
        }
        const landsResult = await landsQuery
            .orderBy(desc(lands.createdAt))
            .limit(limit)
            .offset(offset)

        // Get total count
        const totalQuery = db.select({ count: count() }).from(lands)
        if (whereConditions.length > 0) {
            totalQuery.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))
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

export const searchLands = async (query: string, page = 1, limit = 12) => {
    try {
        const offset = (page - 1) * limit
        const whereConditions = [
            or(
                ilike(lands.name, `%${query}%`),
                ilike(lands.description, `%${query}%`),
                ilike(lands.location, `%${query}%`),
                ilike(lands.type, `%${query}%`),
            ),
        ]

        const landsResult = await db
            .select()
            .from(lands)
            .where(and(...whereConditions))
            .orderBy(desc(lands.createdAt))
            .limit(limit)
            .offset(offset)

        const totalResult = await db
            .select({ count: count() })
            .from(lands)
            .where(and(...whereConditions))

        return {
            lands: landsResult,
            total: totalResult[0].count,
            totalPages: Math.ceil(totalResult[0].count / limit),
            currentPage: page,
        }
    } catch (error) {
        console.error("Error searching lands:", error)
        return {
            lands: [],
            total: 0,
            totalPages: 0,
            currentPage: page,
        }
    }
}

// ============================================================================
// LAND SEARCH ACTION
// ============================================================================

type SearchResult = {
    lands: any[]
    total: number
    totalPages: number
    currentPage: number
}

async function searchLandsActionHandler(data: LandSearchParams): Promise<ActionState<SearchResult | void>> {
    try {
        const result = await searchLands(data.query || "", data.page, data.limit)

        return createSuccessResponse(
            result,
            `Se encontraron ${result.total} terrenos`
        )
    } catch (error) {
        console.error('Search lands action error:', error)
        throw handleError(error);
    }
}

export const searchLandsAction = createValidatedAction(LandSearchSchema, searchLandsActionHandler)