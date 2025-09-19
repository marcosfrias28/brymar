"use server"

import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"
import { z } from "zod"
import { eq, desc, count, and } from "drizzle-orm"
import db from "../../lib/db/drizzle"
import { BlogPost, blogPosts } from "../../lib/db/schema"
import { type ActionState, validatedAction } from "../../lib/validations"

const blogPostSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(50).max(10000),
  author: z.string().min(2).max(100),
  category: z
    .enum(["market-analysis", "investment-tips", "property-news", "legal-advice", "lifestyle"])
    .default("property-news"),
  status: z.enum(["draft", "published"]).default("draft"),
})

export const addBlogPost = validatedAction(
  blogPostSchema,
  async (formData: FormData): Promise<ActionState> => {
    const title = formData?.get('title') as string;
    const content = formData?.get('content') as string;
    const author = formData?.get('author') as string;
    const category = formData?.get('category') as string;
    const status = formData?.get('status') as string;
    const data = {
      title,
      content,
      author,
      category,
      status,
    }
    try {
      let imageUrl = ""

      const image = formData.get("image") as File

      if (image && image.size > 0 && image.type.startsWith('image/')
      ) {
        try {
          const { url } = await put(`blog/${Date.now()}-${image.name}`, image, {
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

      await db.insert(blogPosts).values({
        title: data.title,
        content: data.content,
        author: data.author,
        category: data.category,
        status: data.status,
        image: imageUrl,
        readingTime: readingTime,
        createdAt: new Date(),
      })

      revalidatePath("/dashboard/blog")
      return { success: true, message: "Post de blog agregado exitosamente!" }
    } catch (error) {
      console.error("Error adding blog post:", error)
      return { error: "Error al agregar el post de blog" }
    }
  },
)

export const updateBlogPost = validatedAction(
  blogPostSchema.extend({ id: z.string() }),
  async (formData: FormData): Promise<ActionState> => {
    const id = formData?.get('id') as string;
    const title = formData?.get('title') as string;
    const content = formData?.get('content') as string;
    const author = formData?.get('author') as string;
    const category = formData?.get('category') as string;
    const status = formData?.get('status') as string;
    const data = {
      id,
      title,
      content,
      author,
      category,
      status,
    }

    try {
      let imageUrl = ""

      const image = formData.get("image") as File
      if (image && image.size > 0 && image.type.startsWith('image/')) {
        try {
          const { url } = await put(`blog/${Date.now()}-${image.name}`, image, {
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

      await db.update(blogPosts)
        .set(updateData)
        .where(eq(blogPosts.id, parseInt(data.id)))

      revalidatePath("/dashboard/blog")
      revalidatePath(`/blog/${id}`)
      return { success: true, message: "Post de blog actualizado exitosamente!" }
    } catch (error) {
      console.error("Error updating blog post:", error)
      return { error: "Error al actualizar el post de blog" }
    }
  },
)

export const deleteBlogPost = validatedAction(
  z.object({ id: z.string() }),
  async (formData: FormData): Promise<ActionState> => {
    const id = formData?.get('id') as string;
    try {
      await db.delete(blogPosts).where(eq(blogPosts.id, parseInt(id)))
      revalidatePath("/dashboard/blog")
      revalidatePath(`/blog/${id}`)
      return { success: true, message: "Post de blog eliminado exitosamente!" }
    } catch (error) {
      console.error("Error deleting blog post:", error)
      return { error: "Error al eliminar el post de blog" }
    }
  },
)

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

export const getBlogPostById = validatedAction(
  z.object({ id: z.string() }),
  async (formData: FormData): Promise<BlogPost | null> => {
    const id = formData?.get('id') as string;
    try {
      const result = await db.select().from(blogPosts).where(eq(blogPosts.id, parseInt(id)))
      return result[0] || null
    } catch (error) {
      console.error("Error fetching blog post:", error)
      return null
    }
  })
