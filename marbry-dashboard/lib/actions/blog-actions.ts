"use server"

import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"
import { z } from "zod"
import { neon } from "@neondatabase/serverless"
import { type ActionState, validatedAction } from "../validations"

const sql = neon(process.env.DATABASE_URL!)

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
  async (data: any, formData: FormData): Promise<ActionState> => {
    try {
      let imageUrl = ""

      const image = formData.get("image") as File
      if (image && image.size > 0) {
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

      await sql`
      INSERT INTO blog_posts (title, content, author, category, status, image, reading_time, created_at)
      VALUES (${data.title}, ${data.content}, ${data.author}, ${data.category}, ${data.status}, ${imageUrl}, ${readingTime}, NOW())
    `

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
  async (data: any, formData: FormData): Promise<ActionState> => {
    try {
      let imageUrl = ""

      const image = formData.get("image") as File
      if (image && image.size > 0) {
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

      const updateQuery = imageUrl
        ? sql`
          UPDATE blog_posts 
          SET title = ${data.title}, content = ${data.content}, author = ${data.author}, 
              category = ${data.category}, status = ${data.status}, image = ${imageUrl}, 
              reading_time = ${readingTime}, updated_at = NOW()
          WHERE id = ${data.id}
        `
        : sql`
          UPDATE blog_posts 
          SET title = ${data.title}, content = ${data.content}, author = ${data.author}, 
              category = ${data.category}, status = ${data.status}, reading_time = ${readingTime}, 
              updated_at = NOW()
          WHERE id = ${data.id}
        `

      await updateQuery

      revalidatePath("/dashboard/blog")
      return { success: true, message: "Post de blog actualizado exitosamente!" }
    } catch (error) {
      console.error("Error updating blog post:", error)
      return { error: "Error al actualizar el post de blog" }
    }
  },
)

export const deleteBlogPost = async (id: string): Promise<ActionState> => {
  try {
    await sql`DELETE FROM blog_posts WHERE id = ${id}`
    revalidatePath("/dashboard/blog")
    return { success: true, message: "Post de blog eliminado exitosamente!" }
  } catch (error) {
    console.error("Error deleting blog post:", error)
    return { error: "Error al eliminar el post de blog" }
  }
}

export const getBlogPosts = async (page = 1, limit = 12, filters?: any) => {
  try {
    const offset = (page - 1) * limit

    let whereClause = ""
    const params: any[] = []

    if (filters?.status && filters.status !== "all") {
      whereClause += " WHERE status = $" + (params.length + 1)
      params.push(filters.status)
    }

    if (filters?.category && filters.category !== "all") {
      whereClause += (whereClause ? " AND" : " WHERE") + " category = $" + (params.length + 1)
      params.push(filters.category)
    }

    const blogPosts = await sql`
      SELECT * FROM blog_posts 
      ${whereClause ? sql.unsafe(whereClause) : sql``}
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `

    const totalResult = await sql`
      SELECT COUNT(*) as count FROM blog_posts 
      ${whereClause ? sql.unsafe(whereClause) : sql``}
    `

    return {
      blogPosts,
      total: Number.parseInt(totalResult[0].count),
      totalPages: Math.ceil(Number.parseInt(totalResult[0].count) / limit),
    }
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return { blogPosts: [], total: 0, totalPages: 0 }
  }
}

export const getBlogPostById = async (id: string) => {
  try {
    const result = await sql`SELECT * FROM blog_posts WHERE id = ${id}`
    return result[0] || null
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return null
  }
}
