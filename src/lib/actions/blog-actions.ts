"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { BlogWizardSchema } from "@/lib/schemas/blog-wizard-schemas";
import { extractValidationErrors, type FormState } from "@/lib/types/forms";
import { calculateReadTime, generateSlug } from "@/lib/utils";

/**
 * Create a new blog post using FormState pattern
 */
export async function createBlogPostAction(
	_prevState: FormState<{ id: string }>,
	formData: FormData
): Promise<FormState<{ id: string }>> {
	try {
		// Check authentication
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return {
				success: false,
				message: "You must be logged in to create a blog post",
			};
		}

		// Parse form data
		const data = {
			title: formData.get("title") as string,
			content: formData.get("content") as string,
			excerpt: formData.get("excerpt") as string,
			author: formData.get("author") as string,
			category: formData.get("category") as string,
			coverImage: formData.get("coverImage") as string,
			tags: formData.get("tags")
				? JSON.parse(formData.get("tags") as string)
				: [],
			slug: formData.get("slug") as string,
			seoTitle: formData.get("seoTitle") as string,
			seoDescription: formData.get("seoDescription") as string,
			featured: formData.get("featured") === "true",
			status: (formData.get("status") as string) || "draft",
			description: formData.get("description") as string,
			images: formData.get("images")
				? JSON.parse(formData.get("images") as string)
				: [],
			videos: formData.get("videos")
				? JSON.parse(formData.get("videos") as string)
				: [],
		};

		// Validate with Zod schema
		const validation = BlogWizardSchema.safeParse(data);

		if (!validation.success) {
			return {
				success: false,
				errors: extractValidationErrors(validation.error),
			};
		}

		// Generate slug if not provided
		const slug = validation.data.slug || generateSlug(validation.data.title);

		// Check if slug already exists
		const existingPost = await db
			.select({ id: blogPosts.id })
			.from(blogPosts)
			.where(eq(blogPosts.slug, slug))
			.limit(1);

		if (existingPost.length > 0) {
			return {
				success: false,
				errors: {
					slug: ["A blog post with this slug already exists"],
				},
			};
		}

		// Calculate reading time
		const readTime = calculateReadTime(validation.data.content);

		// Create blog post
		const [blogPost] = await db
			.insert(blogPosts)
			.values({
				id: crypto.randomUUID(),
				title: validation.data.title,
				content: validation.data.content,
				excerpt: validation.data.excerpt,
				slug,
				category: validation.data.category,
				tags: validation.data.tags || [],
				coverImage: validation.data.coverImage || null,
				authorId: session.user.id,
				readTime,
				status: validation.data.status,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		revalidatePath("/dashboard/blog");
		revalidatePath("/blog");

		// Redirect to the blog post edit page
		redirect(`/dashboard/blog/${blogPost.id}/edit`);
	} catch (error) {
		if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
			throw error; // Re-throw redirect errors
		}

		return {
			success: false,
			message:
				error instanceof Error ? error.message : "Failed to create blog post",
		};
	}
}

/**
 * Update an existing blog post using FormState pattern
 */
export async function updateBlogPostAction(
	_prevState: FormState<{ id: string }>,
	formData: FormData
): Promise<FormState<{ id: string }>> {
	try {
		// Check authentication
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return {
				success: false,
				message: "You must be logged in to update a blog post",
			};
		}

		const id = formData.get("id") as string;

		if (!id) {
			return {
				success: false,
				errors: {
					id: ["Blog post ID is required"],
				},
			};
		}

		// Check if blog post exists and user owns it
		const existingPost = await db
			.select()
			.from(blogPosts)
			.where(eq(blogPosts.id, id))
			.limit(1);

		if (existingPost.length === 0) {
			return {
				success: false,
				message: "Blog post not found",
			};
		}

		if (existingPost[0].authorId !== session.user.id) {
			return {
				success: false,
				message: "You are not authorized to update this blog post",
			};
		}

		// Parse form data
		const data = {
			title: formData.get("title") as string,
			content: formData.get("content") as string,
			excerpt: formData.get("excerpt") as string,
			author: formData.get("author") as string,
			category: formData.get("category") as string,
			coverImage: formData.get("coverImage") as string,
			tags: formData.get("tags")
				? JSON.parse(formData.get("tags") as string)
				: [],
			slug: formData.get("slug") as string,
			seoTitle: formData.get("seoTitle") as string,
			seoDescription: formData.get("seoDescription") as string,
			featured: formData.get("featured") === "true",
			status: (formData.get("status") as string) || "draft",
			description: formData.get("description") as string,
			images: formData.get("images")
				? JSON.parse(formData.get("images") as string)
				: [],
			videos: formData.get("videos")
				? JSON.parse(formData.get("videos") as string)
				: [],
		};

		// Validate with Zod schema
		const validation = BlogWizardSchema.safeParse(data);

		if (!validation.success) {
			return {
				success: false,
				errors: extractValidationErrors(validation.error),
			};
		}

		// Check slug uniqueness if slug is being updated
		if (validation.data.slug && validation.data.slug !== existingPost[0].slug) {
			const slugExists = await db
				.select({ id: blogPosts.id })
				.from(blogPosts)
				.where(
					sql`${blogPosts.slug} = ${validation.data.slug} AND ${blogPosts.id} != ${id}`
				)
				.limit(1);

			if (slugExists.length > 0) {
				return {
					success: false,
					errors: {
						slug: ["A blog post with this slug already exists"],
					},
				};
			}
		}

		// Calculate reading time
		const readTime = calculateReadTime(validation.data.content);

		// Update blog post
		const [updatedPost] = await db
			.update(blogPosts)
			.set({
				title: validation.data.title,
				content: validation.data.content,
				excerpt: validation.data.excerpt,
				slug: validation.data.slug || existingPost[0].slug,
				category: validation.data.category,
				tags: validation.data.tags || [],
				coverImage: validation.data.coverImage || null,
				readTime,
				status: validation.data.status,
				updatedAt: new Date(),
			})
			.where(eq(blogPosts.id, id))
			.returning();

		revalidatePath("/dashboard/blog");
		revalidatePath("/blog");
		revalidatePath(`/blog/${updatedPost.slug}`);

		return {
			success: true,
			message: "Blog post updated successfully",
			data: { id: updatedPost.id },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "Failed to update blog post",
		};
	}
}
