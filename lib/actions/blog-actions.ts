"use server"

import { revalidatePath } from "next/cache"
import { put } from '@vercel/blob';
import { blogPosts } from '@/lib/db/schema';
import db from "@/lib/db/drizzle";

export async function addBlogPost(prevState: any, formData: FormData) {
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const author = formData.get("author") as string
  const image = formData.get("image") as File

  let imageUrl = ''
  if (image) {
    const { url } = await put(`blog/${Date.now()}-${image.name}`, image, {
      access: 'public',
    });
    imageUrl = url
  }

  await db.insert(blogPosts).values({
    title,
    content,
    author,
    image: imageUrl
  });

  revalidatePath("/dashboard/blog")

  return { message: "Blog post published successfully!" }
}

