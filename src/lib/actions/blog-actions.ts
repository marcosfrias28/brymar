"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { eq, desc, count, and, ilike, or } from "drizzle-orm"
import {
    type ActionState,
    createValidatedAction,
    createSuccessResponse,
} from "../validations"
import {
    BlogFormSchema,
    BlogUpdateFormSchema,
    BlogSearchSchema,
    type BlogFormData,
    type BlogUpdateFormData,
    type BlogSearchParams
} from "../unified-schema"
import {
    validateBlogBusinessRules,
    createDatabaseError,
    handleError
} from "../unified-errors"
import db from "../db/drizzle"
import { blogPosts } from "../db/schema"

// ============================================================================
// BLOG CRUD ACTIONS
// ============================================================================

async function addBlogAction(data: BlogFormData): Promise<ActionState> {
    try {
        // Validate business rules
        validateBlogBusinessRules({
            title: data.title,
            content: data.content,
            readingTime: data.readingTime
        });

        await db.insert(blogPosts).values({
            title: data.title,
            content: data.content,
            author: data.author,
            category: data.category,
            status: data.status || "draft",
            image: data.image,
            readingTime: data.readingTime,
            createdAt: new Date(),
        })

        revalidatePath("/dashboard/blog")
        return createSuccessResponse(undefined, "Artículo de blog agregado exitosamente!")
    } catch (error) {
        console.error("Error adding blog post:", error)
        if (error instanceof Error && error.message.includes('database')) {
            throw createDatabaseError("Error al guardar el artículo", "INSERT", error);
        }
        throw handleError(error);
    }
}

export const addBlogPost = createValidatedAction(BlogFormSchema, addBlogAction)

async function updateBlogAction(data: BlogUpdateFormData): Promise<ActionState> {
    try {
        // Validate business rules
        validateBlogBusinessRules({
            title: data.title,
            content: data.content,
            readingTime: data.readingTime
        });

        const updateData = {
            title: data.title,
            content: data.content,
            author: data.author,
            category: data.category,
            status: data.status,
            image: data.image,
            readingTime: data.readingTime,
            updatedAt: new Date(),
        }

        await db.update(blogPosts).set(updateData).where(eq(blogPosts.id, data.id))

        revalidatePath("/dashboard/blog")
        return createSuccessResponse(undefined, "Artículo actualizado exitosamente!")
    } catch (error) {
        console.error("Error updating blog post:", error)
        if (error instanceof Error && error.message.includes('database')) {
            throw createDatabaseError("Error al actualizar el artículo", "UPDATE", error);
        }
        throw handleError(error);
    }
}

export const updateBlogPost = createValidatedAction(BlogUpdateFormSchema, updateBlogAction)

// Simple delete schema
const deleteBlogSchema = z.object({
    id: z.number().min(1, "ID de artículo requerido")
})

async function deleteBlogAction(data: z.infer<typeof deleteBlogSchema>): Promise<ActionState> {
    try {
        await db.delete(blogPosts).where(eq(blogPosts.id, data.id))
        revalidatePath("/dashboard/blog")
        return createSuccessResponse(undefined, "Artículo eliminado exitosamente!")
    } catch (error) {
        console.error("Error deleting blog post:", error)
        if (error instanceof Error && error.message.includes('database')) {
            throw createDatabaseError("Error al eliminar el artículo", "DELETE", error);
        }
        throw handleError(error);
    }
}

export const deleteBlogPost = createValidatedAction(deleteBlogSchema, deleteBlogAction)

// ============================================================================
// BLOG QUERY FUNCTIONS
// ============================================================================

export const getBlogPosts = async (page = 1, limit = 12, filters?: any) => {
    try {
        const offset = (page - 1) * limit

        // Build where conditions
        const whereConditions = []

        if (filters?.status && filters.status !== "all") {
            whereConditions.push(eq(blogPosts.status, filters.status))
        }

        if (filters?.category && filters.category !== "all") {
            whereConditions.push(eq(blogPosts.category, filters.category))
        }

        if (filters?.author && filters.author !== "all") {
            whereConditions.push(eq(blogPosts.author, filters.author))
        }

        // Get blog posts with pagination
        const postsQuery = db.select().from(blogPosts)
        if (whereConditions.length > 0) {
            postsQuery.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))
        }
        const postsResult = await postsQuery
            .orderBy(desc(blogPosts.createdAt))
            .limit(limit)
            .offset(offset)

        // Get total count
        const totalQuery = db.select({ count: count() }).from(blogPosts)
        if (whereConditions.length > 0) {
            totalQuery.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))
        }
        const totalResult = await totalQuery

        return {
            posts: postsResult,
            total: totalResult[0].count,
            totalPages: Math.ceil(totalResult[0].count / limit),
        }
    } catch (error) {
        console.error("Error fetching blog posts:", error)
        return { posts: [], total: 0, totalPages: 0 }
    }
}

export const getBlogPostById = async (id: string) => {
    try {
        const result = await db.select().from(blogPosts).where(eq(blogPosts.id, parseInt(id)))
        return result[0] || null
    } catch (error) {
        console.error("Error fetching blog post:", error)
        return null
    }
}

export const getPublishedBlogPosts = async (limit = 6) => {
    try {
        const result = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.status, "published"))
            .orderBy(desc(blogPosts.createdAt))
            .limit(limit)

        return result
    } catch (error) {
        console.error("Error fetching published blog posts:", error)
        return []
    }
}

export const searchBlogPosts = async (query: string, page = 1, limit = 12) => {
    try {
        const offset = (page - 1) * limit
        const whereConditions = [
            or(
                ilike(blogPosts.title, `%${query}%`),
                ilike(blogPosts.content, `%${query}%`),
                ilike(blogPosts.author, `%${query}%`),
                ilike(blogPosts.category, `%${query}%`),
            ),
        ]

        const postsResult = await db
            .select()
            .from(blogPosts)
            .where(and(...whereConditions))
            .orderBy(desc(blogPosts.createdAt))
            .limit(limit)
            .offset(offset)

        const totalResult = await db
            .select({ count: count() })
            .from(blogPosts)
            .where(and(...whereConditions))

        return {
            posts: postsResult,
            total: totalResult[0].count,
            totalPages: Math.ceil(totalResult[0].count / limit),
            currentPage: page,
        }
    } catch (error) {
        console.error("Error searching blog posts:", error)
        return {
            posts: [],
            total: 0,
            totalPages: 0,
            currentPage: page,
        }
    }
}

// ============================================================================
// BLOG SEARCH ACTION
// ============================================================================

type SearchResult = {
    posts: any[]
    total: number
    totalPages: number
    currentPage: number
}

async function searchBlogActionHandler(data: BlogSearchParams): Promise<ActionState<SearchResult | void>> {
    try {
        const result = await searchBlogPosts(data.query || "", data.page, data.limit)

        return createSuccessResponse(
            result,
            `Se encontraron ${result.total} artículos`
        )
    } catch (error) {
        console.error('Search blog posts action error:', error)
        throw handleError(error);
    }
}

export const searchBlogPostsAction = createValidatedAction(BlogSearchSchema, searchBlogActionHandler)

// ============================================================================
// BLOG STATUS ACTIONS
// ============================================================================

// Publish blog post schema
const publishBlogSchema = z.object({
    id: z.number().min(1, "ID de artículo requerido")
})

async function publishBlogAction(data: z.infer<typeof publishBlogSchema>): Promise<ActionState> {
    try {
        await db
            .update(blogPosts)
            .set({
                status: "published",
                updatedAt: new Date()
            })
            .where(eq(blogPosts.id, data.id))

        revalidatePath("/dashboard/blog")
        return createSuccessResponse(undefined, "Artículo publicado exitosamente!")
    } catch (error) {
        console.error("Error publishing blog post:", error)
        if (error instanceof Error && error.message.includes('database')) {
            throw createDatabaseError("Error al publicar el artículo", "UPDATE", error);
        }
        throw handleError(error);
    }
}

export const publishBlogPost = createValidatedAction(publishBlogSchema, publishBlogAction)

// Archive blog post schema
const archiveBlogSchema = z.object({
    id: z.number().min(1, "ID de artículo requerido")
})

async function archiveBlogAction(data: z.infer<typeof archiveBlogSchema>): Promise<ActionState> {
    try {
        await db
            .update(blogPosts)
            .set({
                status: "archived",
                updatedAt: new Date()
            })
            .where(eq(blogPosts.id, data.id))

        revalidatePath("/dashboard/blog")
        return createSuccessResponse(undefined, "Artículo archivado exitosamente!")
    } catch (error) {
        console.error("Error archiving blog post:", error)
        if (error instanceof Error && error.message.includes('database')) {
            throw createDatabaseError("Error al archivar el artículo", "UPDATE", error);
        }
        throw handleError(error);
    }
}

export const archiveBlogPost = createValidatedAction(archiveBlogSchema, archiveBlogAction)