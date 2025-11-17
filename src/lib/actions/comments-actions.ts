"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { blogComments, blogPosts } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { extractValidationErrors, type FormState } from "@/lib/types/forms";

const CommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(3),
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export async function createCommentAction(
  _prev: FormState<{ id: string }>,
  formData: FormData
): Promise<FormState<{ id: string }>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const data = {
      postId: formData.get("postId") as string,
      content: formData.get("content") as string,
      name: (formData.get("name") as string) || undefined,
      email: (formData.get("email") as string) || undefined,
    };
    const parsed = CommentSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, errors: extractValidationErrors(parsed.error) };
    }

    const postExists = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.id, parsed.data.postId))
      .limit(1);
    if (postExists.length === 0) {
      return { success: false, message: "Post not found" };
    }

    const [comment] = await db
      .insert(blogComments)
      .values({
        id: crypto.randomUUID(),
        postId: parsed.data.postId,
        userId: session?.user?.id || null,
        name: parsed.data.name || null,
        email: parsed.data.email || null,
        content: parsed.data.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath(`/blog/${postExists[0].id}`);
    return { success: true, data: { id: comment.id } };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create comment",
    };
  }
}

export async function listCommentsByPost(postId: string) {
  try {
    const rows = await db
      .select()
      .from(blogComments)
      .where(eq(blogComments.postId, postId))
      .orderBy(desc(blogComments.createdAt));
    return rows;
  } catch (_e) {
    return [];
  }
}

