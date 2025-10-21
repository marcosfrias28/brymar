"use server";

import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq, and, or, like, desc, asc, count, sql } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
    CreateBlogPostInput,
    UpdateBlogPostInput,
    PublishBlogPostInput,
    BlogSearchFilters,
    ActionResult,
    BlogPost,
    BlogSearchResult
} from "@/lib/types/blog";
import { generateSlug, calculateReadTime } from "@/lib/utils";

/**
 * Create a new blog post
 */
export async function createBlogPost(input: CreateBlogPostInput): Promise<ActionResult<BlogPost>> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Generate slug if not provided
        const slug = input.slug || generateSlug(input.title);

        // Check if slug already exists
        const existingPost = await db
            .select({ id: blogPosts.id })
            .from(blogPosts)
            .where(eq(blogPosts.slug, slug))
            .limit(1);

        if (existingPost.length > 0) {
            return {
                success: false,
                error: "A blog post with this slug already exists",
                errors: { slug: ["Slug must be unique"] }
            };
        }

        // Calculate reading time
        const readTime = calculateReadTime(input.content);

        const [blogPost] = await db
            .insert(blogPosts)
            .values({
                id: crypto.randomUUID(),
                title: input.title,
                content: input.content,
                excerpt: input.excerpt,
                slug,
                category: input.category,
                tags: input.tags || [],
                coverImage: input.coverImage || null,
                authorId: session.user.id,
                readTime,
                status: "draft",
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        revalidatePath("/dashboard/blog");
        revalidatePath("/blog");

        return { success: true, data: blogPost };
    } catch (error) {
        console.error("Error creating blog post:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create blog post"
        };
    }
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(input: UpdateBlogPostInput): Promise<ActionResult<BlogPost>> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Check if blog post exists and user owns it
        const existingPost = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.id, input.id))
            .limit(1);

        if (existingPost.length === 0) {
            return { success: false, error: "Blog post not found" };
        }

        if (existingPost[0].authorId !== session.user.id) {
            return { success: false, error: "Unauthorized to update this blog post" };
        }

        // Check slug uniqueness if slug is being updated
        if (input.slug && input.slug !== existingPost[0].slug) {
            const slugExists = await db
                .select({ id: blogPosts.id })
                .from(blogPosts)
                .where(and(
                    eq(blogPosts.slug, input.slug),
                    sql`${blogPosts.id} != ${input.id}`
                ))
                .limit(1);

            if (slugExists.length > 0) {
                return {
                    success: false,
                    error: "A blog post with this slug already exists",
                    errors: { slug: ["Slug must be unique"] }
                };
            }
        }

        // Prepare update data
        const updateData: any = {
            updatedAt: new Date(),
        };

        if (input.title !== undefined) {
            updateData.title = input.title;
        }
        if (input.content !== undefined) {
            updateData.content = input.content;
            updateData.readTime = calculateReadTime(input.content);
        }
        if (input.excerpt !== undefined) {
            updateData.excerpt = input.excerpt;
        }
        if (input.slug !== undefined) {
            updateData.slug = input.slug;
        }
        if (input.category !== undefined) {
            updateData.category = input.category;
        }
        if (input.tags !== undefined) {
            updateData.tags = input.tags;
        }
        if (input.coverImage !== undefined) {
            updateData.coverImage = input.coverImage;
        }

        const [updatedPost] = await db
            .update(blogPosts)
            .set(updateData)
            .where(eq(blogPosts.id, input.id))
            .returning();

        revalidatePath("/dashboard/blog");
        revalidatePath("/blog");
        revalidatePath(`/blog/${updatedPost.slug}`);

        return { success: true, data: updatedPost };
    } catch (error) {
        console.error("Error updating blog post:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update blog post"
        };
    }
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(id: string): Promise<ActionResult<{ id: string }>> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Check if blog post exists and user owns it
        const existingPost = await db
            .select({ authorId: blogPosts.authorId, slug: blogPosts.slug })
            .from(blogPosts)
            .where(eq(blogPosts.id, id))
            .limit(1);

        if (existingPost.length === 0) {
            return { success: false, error: "Blog post not found" };
        }

        if (existingPost[0].authorId !== session.user.id) {
            return { success: false, error: "Unauthorized to delete this blog post" };
        }

        await db.delete(blogPosts).where(eq(blogPosts.id, id));

        revalidatePath("/dashboard/blog");
        revalidatePath("/blog");
        revalidatePath(`/blog/${existingPost[0].slug}`);

        return { success: true, data: { id } };
    } catch (error) {
        console.error("Error deleting blog post:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete blog post"
        };
    }
}

/**
 * Get a blog post by ID
 */
export async function getBlogPostById(id: string): Promise<ActionResult<BlogPost>> {
    try {
        const [blogPost] = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.id, id))
            .limit(1);

        if (!blogPost) {
            return { success: false, error: "Blog post not found" };
        }

        return { success: true, data: blogPost };
    } catch (error) {
        console.error("Error getting blog post:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get blog post"
        };
    }
}

/**
 * Get a blog post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<ActionResult<BlogPost>> {
    try {
        const [blogPost] = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.slug, slug))
            .limit(1);

        if (!blogPost) {
            return { success: false, error: "Blog post not found" };
        }

        return { success: true, data: blogPost };
    } catch (error) {
        console.error("Error getting blog post by slug:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get blog post"
        };
    }
}

/**
 * Search blog posts with filters and pagination
 */
export async function searchBlogPosts(filters: BlogSearchFilters = {}): Promise<ActionResult<BlogSearchResult>> {
    try {
        const {
            query,
            category,
            status,
            authorId,
            tags,
            page = 1,
            limit = 12,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = filters;

        // Build where conditions
        const conditions = [];

        if (query) {
            conditions.push(
                or(
                    like(blogPosts.title, `%${query}%`),
                    like(blogPosts.content, `%${query}%`),
                    like(blogPosts.excerpt, `%${query}%`)
                )
            );
        }

        if (category) {
            conditions.push(eq(blogPosts.category, category));
        }

        if (status) {
            conditions.push(eq(blogPosts.status, status));
        }

        if (authorId) {
            conditions.push(eq(blogPosts.authorId, authorId));
        }

        if (tags && tags.length > 0) {
            // Search for posts that contain any of the specified tags
            conditions.push(
                sql`${blogPosts.tags} ?| ${tags}`
            );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Build order by clause
        const getOrderByColumn = (field: string) => {
            switch (field) {
                case "createdAt": return blogPosts.createdAt;
                case "updatedAt": return blogPosts.updatedAt;
                case "title": return blogPosts.title;
                case "publishedAt": return blogPosts.publishedAt;
                case "views": return blogPosts.views;
                default: return blogPosts.createdAt;
            }
        };

        const orderByColumn = getOrderByColumn(sortBy);
        const orderByClause = sortOrder === "desc" ? desc(orderByColumn) : asc(orderByColumn);

        // Get total count
        const [{ total }] = await db
            .select({ total: count() })
            .from(blogPosts)
            .where(whereClause);

        // Get paginated results
        const offset = (page - 1) * limit;
        const posts = await db
            .select()
            .from(blogPosts)
            .where(whereClause)
            .orderBy(orderByClause)
            .limit(limit)
            .offset(offset);

        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;

        return {
            success: true,
            data: {
                posts,
                total,
                page,
                totalPages,
                hasMore,
            },
        };
    } catch (error) {
        console.error("Error searching blog posts:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to search blog posts"
        };
    }
}

/**
 * Publish a blog post
 */
export async function publishBlogPost(input: PublishBlogPostInput): Promise<ActionResult<BlogPost>> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Check if blog post exists and user owns it
        const existingPost = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.id, input.id))
            .limit(1);

        if (existingPost.length === 0) {
            return { success: false, error: "Blog post not found" };
        }

        if (existingPost[0].authorId !== session.user.id) {
            return { success: false, error: "Unauthorized to publish this blog post" };
        }

        if (existingPost[0].status === "published") {
            return { success: false, error: "Blog post is already published" };
        }

        // Validate required fields for publishing
        if (!existingPost[0].title || !existingPost[0].content) {
            return {
                success: false,
                error: "Blog post must have title and content to be published"
            };
        }

        const publishedAt = input.publishedAt || new Date();

        const [publishedPost] = await db
            .update(blogPosts)
            .set({
                status: "published",
                publishedAt,
                updatedAt: new Date(),
            })
            .where(eq(blogPosts.id, input.id))
            .returning();

        revalidatePath("/dashboard/blog");
        revalidatePath("/blog");
        revalidatePath(`/blog/${publishedPost.slug}`);

        return { success: true, data: publishedPost };
    } catch (error) {
        console.error("Error publishing blog post:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to publish blog post"
        };
    }
}

/**
 * Unpublish a blog post (set back to draft)
 */
export async function unpublishBlogPost(id: string): Promise<ActionResult<BlogPost>> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Check if blog post exists and user owns it
        const existingPost = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.id, id))
            .limit(1);

        if (existingPost.length === 0) {
            return { success: false, error: "Blog post not found" };
        }

        if (existingPost[0].authorId !== session.user.id) {
            return { success: false, error: "Unauthorized to unpublish this blog post" };
        }

        const [unpublishedPost] = await db
            .update(blogPosts)
            .set({
                status: "draft",
                publishedAt: null,
                updatedAt: new Date(),
            })
            .where(eq(blogPosts.id, id))
            .returning();

        revalidatePath("/dashboard/blog");
        revalidatePath("/blog");
        revalidatePath(`/blog/${unpublishedPost.slug}`);

        return { success: true, data: unpublishedPost };
    } catch (error) {
        console.error("Error unpublishing blog post:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to unpublish blog post"
        };
    }
}

/**
 * Get blog posts by category
 */
export async function getBlogPostsByCategory(
    category: string,
    page: number = 1,
    limit: number = 12
): Promise<ActionResult<BlogSearchResult>> {
    return searchBlogPosts({
        category,
        status: "published",
        page,
        limit,
        sortBy: "publishedAt",
        sortOrder: "desc",
    });
}

/**
 * Get recent blog posts
 */
export async function getRecentBlogPosts(limit: number = 5): Promise<ActionResult<BlogPost[]>> {
    try {
        const posts = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.status, "published"))
            .orderBy(desc(blogPosts.publishedAt))
            .limit(limit);

        return { success: true, data: posts };
    } catch (error) {
        console.error("Error getting recent blog posts:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get recent blog posts"
        };
    }
}

/**
 * Get featured blog posts
 */
export async function getFeaturedBlogPosts(limit: number = 3): Promise<ActionResult<BlogPost[]>> {
    try {
        const posts = await db
            .select()
            .from(blogPosts)
            .where(and(
                eq(blogPosts.status, "published"),
                sql`${blogPosts.tags} ? 'featured'`
            ))
            .orderBy(desc(blogPosts.publishedAt))
            .limit(limit);

        return { success: true, data: posts };
    } catch (error) {
        console.error("Error getting featured blog posts:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get featured blog posts"
        };
    }
}