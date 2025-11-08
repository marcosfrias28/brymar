"use server";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { BlogWizardSchema } from "@/lib/schemas/blog-wizard-schemas";
import type { ActionResult } from "@/lib/types/shared";
import type { BlogWizardData } from "@/types/blog-wizard";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper function to generate slug from title
function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}

// Helper function to calculate reading time
function calculateReadTime(content: string): number {
	const wordsPerMinute = 200;
	const words = content.split(/\s+/).length;
	return Math.ceil(words / wordsPerMinute);
}

/**
 * Load a blog draft by ID
 */
export async function loadBlogDraft(
	draftId: string,
	userId: string
): Promise<ActionResult<Partial<BlogWizardData> | null>> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id || session.user.id !== userId) {
			return { success: false, error: "Unauthorized" };
		}

		const [draft] = await db
			.select()
			.from(blogPosts)
			.where(
				and(
					eq(blogPosts.id, draftId),
					eq(blogPosts.authorId, userId),
					eq(blogPosts.status, "draft")
				)
			)
			.limit(1);

		if (!draft) {
			return { success: true, data: null };
		}

		// Convert database record to wizard data format
		const wizardData: Partial<BlogWizardData> = {
			title: draft.title,
			description: draft.excerpt || "",
			content: draft.content,
			category: draft.category as any, // Type assertion needed
			status: draft.status as "draft" | "published",
			excerpt: draft.excerpt || undefined,
			coverImage:
				typeof draft.coverImage === "object" && draft.coverImage
					? (draft.coverImage as any).url
					: undefined,
			tags: Array.isArray(draft.tags) ? (draft.tags as string[]) : [],
			images: [], // No images field in DB schema, start with empty array
			videos: [],
			slug: draft.slug,
		};

		return { success: true, data: wizardData };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to load draft",
		};
	}
}

/**
 * Save a blog draft
 */
export async function saveBlogDraft(
	data: BlogWizardData
): Promise<ActionResult<{ id: string }>> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		// Generate slug if not provided
		const slug = data.slug || generateSlug(data.title);
		const readTime = calculateReadTime(data.content);

		const [draft] = await db
			.insert(blogPosts)
			.values({
				id: crypto.randomUUID(),
				title: data.title,
				content: data.content,
				excerpt: data.excerpt || data.description,
				slug,
				category: data.category,
				tags: data.tags || [],
				coverImage: data.coverImage ? { url: data.coverImage } : null,
				authorId: session.user.id,
				status: "draft",
				readTime,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning({ id: blogPosts.id });

		revalidatePath("/dashboard/blog");

		return { success: true, data: { id: draft.id } };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to save draft",
		};
	}
}

/**
 * Create a blog post from wizard data
 */
export async function createBlogFromWizard(
	data: BlogWizardData
): Promise<ActionResult<{ id: string }>> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		// Validate data
		const validation = BlogWizardSchema.safeParse(data);
		if (!validation.success) {
			return {
				success: false,
				error: "Invalid data",
				errors: validation.error.flatten().fieldErrors,
			};
		}

		// Generate slug if not provided
		const slug = data.slug || generateSlug(data.title);
		const readTime = calculateReadTime(data.content);

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
			};
		}

		const [blogPost] = await db
			.insert(blogPosts)
			.values({
				id: crypto.randomUUID(),
				title: data.title,
				content: data.content,
				excerpt: data.excerpt || data.description,
				slug,
				category: data.category,
				tags: data.tags || [],
				coverImage: data.coverImage ? { url: data.coverImage } : null,
				authorId: session.user.id,
				status: data.status,
				readTime,
				publishedAt: data.status === "published" ? new Date() : null,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning({ id: blogPosts.id });

		revalidatePath("/dashboard/blog");
		revalidatePath("/blog");

		return { success: true, data: { id: blogPost.id } };
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to create blog post",
		};
	}
}

/**
 * Update a blog post from wizard data
 */
export async function updateBlogFromWizard(
	id: string,
	data: BlogWizardData
): Promise<ActionResult<{ id: string }>> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		// Validate data
		const validation = BlogWizardSchema.safeParse(data);
		if (!validation.success) {
			return {
				success: false,
				error: "Invalid data",
				errors: validation.error.flatten().fieldErrors,
			};
		}

		// Generate slug if not provided
		const slug = data.slug || generateSlug(data.title);
		const readTime = calculateReadTime(data.content);

		// Check if slug already exists (excluding current post)
		const existingPost = await db
			.select({ id: blogPosts.id })
			.from(blogPosts)
			.where(eq(blogPosts.slug, slug))
			.limit(1);

		if (existingPost.length > 0 && existingPost[0].id !== id) {
			return {
				success: false,
				error: "A blog post with this slug already exists",
			};
		}

		const [blogPost] = await db
			.update(blogPosts)
			.set({
				title: data.title,
				content: data.content,
				excerpt: data.excerpt || data.description,
				slug,
				category: data.category,
				tags: data.tags || [],
				coverImage: data.coverImage ? { url: data.coverImage } : null,
				status: data.status,
				readTime,
				publishedAt: data.status === "published" ? new Date() : null,
				updatedAt: new Date(),
			})
			.where(eq(blogPosts.id, id))
			.returning({ id: blogPosts.id });

		revalidatePath("/dashboard/blog");
		revalidatePath("/blog");

		return { success: true, data: { id: blogPost.id } };
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to update blog post",
		};
	}
}
