"use server"

import { revalidatePath } from "next/cache"
import { put } from '@vercel/blob';
import db from "@/lib/db/drizzle";
import { lands } from '@/lib/db/schema';

export async function addLand(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const area = parseInt(formData.get("area") as string)
  const price = parseInt(formData.get("price") as string)

  const imageUrls = []
  for (let i = 0; i < 10; i++) {
    const image = formData.get(`image${i}`) as File
    if (image) {
      const { url } = await put(`lands/${Date.now()}-${image.name}`, image, {
        access: 'public',
      });
      imageUrls.push(url)
    }
  }

  await db.insert(lands).values({
    name,
    description,
    area,
    price,
    images: imageUrls
  });

  revalidatePath("/dashboard/lands")

  return { message: "Land added successfully!" }
}

