"use server"

import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"
import { z } from "zod"
import { eq, desc, count, and } from "drizzle-orm"
import db from '@/lib/db/drizzle';
import { BlogPost, blogPosts } from '@/lib/db/schema';
import { 
  type ActionState, 
  createValidatedAction, 
  handleAPIError, 
  createSuccessResponse
} from '@/lib/validations';

const blogPostSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(50).max(10000),
  author: z.string().min(2).max(100),
  category: z
    .enum(["market-analysis", "investment-tips", "property-news", "legal-advice", "lifestyle"])
    .default("property-news"),
  status: z.enum(["draft", "published"]).default("draft"),
})

export const addBlogPost = createValidatedAction(
  blogPostSchema.extend({ image: z.instanceof(File).optional() }),
  async (data): Promise<ActionState<{ blogPost: BlogPost }>> => {
    try {
      let imageUrl = ""

      // Handle image upload if present
      if (data.image && data.image.size > 0 && data.image.type.startsWith('image/')) {
        try {
          const { url } = await put(`blog/${Date.now()}-${data.image.name}`, data.image, {
            access: "public",
          })
          imageUrl = url
        } catch (error) {
          console.error("Error uploading image:", error)
        }
      }
      
      const wordsPerMinute = 200
      const wordCount = data.content.split(" ").length
      const readingTime = Math.ceil(wordCount / wordsPerMinute)

      const [newBlogPost] = await db.insert(blogPosts).values({
        title: data.title,
        content: data.content,
        author: data.author,
        category: data.category,
        status: data.status,
        image: imageUrl,
        readingTime: readingTime,
        createdAt: new Date(),
      }).returning()

      revalidatePath("/dashboard/blog")
      return createSuccessResponse(
        { blogPost: newBlogPost },
        "Post de blog agregado exitosamente!"
      )
    } catch (error) {
      console.error("Error adding blog post:", error)
      return handleAPIError(error, "Error al agregar el post de blog")
    }
  }
)

export const updateBlogPost = createValidatedAction(
  blogPostSchema.extend({ 
    id: z.string(),
    image: z.instanceof(File).optional()
  }),
  async (data): Promise<ActionState<{ blogPost: BlogPost }>> => {
    try {
      let imageUrl = ""

      // Handle image upload if present
      if (data.image && data.image.size > 0 && data.image.type.startsWith('image/')) {
        try {
          const { url } = await put(`blog/${Date.now()}-${data.image.name}`, data.image, {
            access: "public",
          })
          imageUrl = url
        } catch (error) {
          console.error("Error uploading image:", error)
        }
      }

      const wordsPerMinute = 200
      const wordCount = data.content.split(" ").length
      const readingTime = Math.ceil(wordCount / wordsPerMinute)

      const updateData = {
        title: data.title,
        content: data.content,
        author: data.author,
        category: data.category,
        status: data.status,
        readingTime: readingTime,
        updatedAt: new Date(),
        ...(imageUrl && { image: imageUrl }),
      }

      const [updatedBlogPost] = await db.update(blogPosts)
        .set(updateData)
        .where(eq(blogPosts.id, parseInt(data.id)))
        .returning()

      revalidatePath("/dashboard/blog")
      revalidatePath(`/blog/${data.id}`)
      return createSuccessResponse(
        { blogPost: updatedBlogPost },
        "Post de blog actualizado exitosamente!"
      )
    } catch (error) {
      console.error("Error updating blog post:", error)
      return handleAPIError(error, "Error al actualizar el post de blog")
    }
  }
)

export const deleteBlogPost = createValidatedAction(
  z.object({ id: z.string() }),
  async (data): Promise<ActionState> => {
    try {
      await db.delete(blogPosts).where(eq(blogPosts.id, parseInt(data.id)))
      revalidatePath("/dashboard/blog")
      revalidatePath(`/blog/${data.id}`)
      return createSuccessResponse(
        undefined,
        "Post de blog eliminado exitosamente!"
      )
    } catch (error) {
      console.error("Error deleting blog post:", error)
      return handleAPIError(error, "Error al eliminar el post de blog")
    }
  }
)

// Helper function for direct ID-based deletion (for backward compatibility)
export const deleteBlogPostById = async (id: string): Promise<ActionState> => {
  const formData = new FormData()
  formData.append('id', id)
  return await deleteBlogPost(formData)
}

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

    // Get blog posts with pagination
    const blogPostsQuery = db.select().from(blogPosts)
    if (whereConditions.length > 0) {
      blogPostsQuery.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))
    }
    const blogPostsResult = await blogPostsQuery
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
      blogPosts: blogPostsResult,
      total: totalResult[0].count,
      totalPages: Math.ceil(totalResult[0].count / limit),
    }
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return { blogPosts: [], total: 0, totalPages: 0 }
  }
}

export const getBlogPostById = createValidatedAction(
  z.object({ id: z.string() }),
  async (data): Promise<ActionState<{ blogPost: BlogPost | null }>> => {
    try {
      const result = await db.select().from(blogPosts).where(eq(blogPosts.id, parseInt(data.id)))
      return createSuccessResponse({ blogPost: result[0] || null })
    } catch (error) {
      console.error("Error fetching blog post:", error)
      return handleAPIError(error, "Error al obtener el post de blog")
    }
  }
)

// Helper function for direct ID-based fetching (for backward compatibility)
export const getBlogPostByIdDirect = async (id: string): Promise<BlogPost | null> => {
  const formData = new FormData()
  formData.append('id', id)
  const result = await getBlogPostById(formData)
  return result.data?.blogPost || null
}
