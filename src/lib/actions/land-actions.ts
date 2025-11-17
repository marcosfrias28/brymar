"use server";

import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { lands } from "@/lib/db/schema";
import { extractValidationErrors, type FormState } from "@/lib/types/forms";



/**
 * Search lands action for useActionState
 */
export async function searchLandsAction(
    _prevState: FormState<{ lands: any[]; total: number }>,
    formData: FormData
): Promise<FormState<{ lands: any[]; total: number }>> {
	try {
		const _filters = {
			location: formData.get("location") as string,
			minPrice: formData.get("minPrice")
				? Number.parseFloat(formData.get("minPrice") as string)
				: undefined,
			maxPrice: formData.get("maxPrice")
				? Number.parseFloat(formData.get("maxPrice") as string)
				: undefined,
			landType: formData.get("landType") as string,
			minSurface: formData.get("minSurface")
				? Number.parseFloat(formData.get("minSurface") as string)
				: undefined,
			maxSurface: formData.get("maxSurface")
				? Number.parseFloat(formData.get("maxSurface") as string)
				: undefined,
			page: formData.get("page") ? Number.parseInt(formData.get("page") as string, 10) : 1,
			limit: formData.get("limit") ? Number.parseInt(formData.get("limit") as string, 10) : 20,
		};

		let base = db.select().from(lands).where(eq(lands.status, "available"));
		const page = Math.max(_filters.page || 1, 1);
		const limit = Math.min(Math.max(_filters.limit || 20, 1), 100);
		const offset = (page - 1) * limit;

		const totalRows = await db
			.select({ count: sql<number>`count(*)` })
			.from(lands)
			.where(eq(lands.status, "available"));
		const total = Number(totalRows[0]?.count || 0);

		const results = await base.orderBy(desc(lands.createdAt)).limit(limit).offset(offset);

		return {
			success: true,
			data: { lands: results, total },
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "Failed to search lands",
		};
	}
}
