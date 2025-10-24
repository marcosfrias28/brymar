"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import db from "@/lib/db/drizzle";
import {
	propertyCharacteristics,
	propertyDraftCharacteristics,
	propertyDrafts,
} from "@/lib/db/schema";
import type { PropertyCharacteristic, PropertyType } from "@/types/wizard";

/**
 * Get all available characteristics, optionally filtered by property type
 */
export async function getCharacteristics(
	propertyType?: PropertyType,
): Promise<PropertyCharacteristic[]> {
	try {
		const query = db
			.select({
				id: propertyCharacteristics.id,
				name: propertyCharacteristics.name,
				category: propertyCharacteristics.category,
				propertyType: propertyCharacteristics.propertyType,
			})
			.from(propertyCharacteristics)
			.where(eq(propertyCharacteristics.isActive, true));

		const results = await query.orderBy(propertyCharacteristics.order);

		// Filter by property type if specified
		const filteredResults = propertyType
			? results.filter((char) => {
					const charPropertyTypes = char.propertyType?.split(",") || [];
					return (
						charPropertyTypes.length === 0 ||
						charPropertyTypes.includes(propertyType)
					);
				})
			: results;

		return filteredResults.map((char) => ({
			id: char.id,
			name: char.name,
			category: char.category as "amenity" | "feature" | "location",
			selected: false,
		}));
	} catch (error) {
		console.error("Error fetching characteristics:", error);
		throw new Error("Failed to fetch characteristics");
	}
}

/**
 * Get characteristics for a specific draft
 */
export async function getDraftCharacteristics(
	draftId: string,
): Promise<PropertyCharacteristic[]> {
	try {
		const results = await db
			.select({
				id: propertyCharacteristics.id,
				name: propertyCharacteristics.name,
				category: propertyCharacteristics.category,
				selected: propertyDraftCharacteristics.selected,
			})
			.from(propertyDraftCharacteristics)
			.innerJoin(
				propertyCharacteristics,
				eq(
					propertyDraftCharacteristics.characteristicId,
					propertyCharacteristics.id,
				),
			)
			.where(eq(propertyDraftCharacteristics.draftId, draftId));

		return results.map((char) => ({
			id: char.id,
			name: char.name,
			category: char.category as "amenity" | "feature" | "location",
			selected: char.selected || false,
		}));
	} catch (error) {
		console.error("Error fetching draft characteristics:", error);
		throw new Error("Failed to fetch draft characteristics");
	}
}

/**
 * Save characteristics for a draft
 */
export async function saveDraftCharacteristics(
	draftId: string,
	characteristics: PropertyCharacteristic[],
): Promise<void> {
	try {
		const { headers } = await import("next/headers");
		const sessionData = (await auth.api.getSession({
			headers: await headers(),
		})) as unknown as { user: { id: string } | null };

		if (!sessionData?.user?.id) {
			throw new Error("Unauthorized");
		}

		// Verify draft ownership
		const draft = await db
			.select()
			.from(propertyDrafts)
			.where(eq(propertyDrafts.id, draftId))
			.limit(1);

		if (!draft.length || draft[0].userId !== sessionData.user.id) {
			throw new Error("Draft not found or unauthorized");
		}

		// Remove existing characteristics for this draft
		await db
			.delete(propertyDraftCharacteristics)
			.where(eq(propertyDraftCharacteristics.draftId, draftId));

		// Insert selected characteristics
		const selectedCharacteristics = characteristics.filter(
			(char) => char.selected,
		);

		if (selectedCharacteristics.length > 0) {
			// Ensure all characteristics exist in the database
			for (const char of selectedCharacteristics) {
				if (char.id.startsWith("custom_")) {
					// Create custom characteristic if it doesn't exist
					await db
						.insert(propertyCharacteristics)
						.values({
							id: char.id,
							name: char.name,
							category: char.category,
							propertyType: null,
							isDefault: false,
							isActive: true,
							order: 999,
							createdBy: sessionData.user.id,
						})
						.onConflictDoNothing();
				}
			}

			// Insert draft characteristics
			const draftCharacteristics = selectedCharacteristics.map((char) => ({
				draftId,
				characteristicId: char.id,
				selected: true,
			}));

			await db
				.insert(propertyDraftCharacteristics)
				.values(draftCharacteristics);
		}

		revalidatePath("/dashboard/properties/new");
	} catch (error) {
		console.error("Error saving draft characteristics:", error);
		throw new Error("Failed to save draft characteristics");
	}
}

/**
 * Create a custom characteristic
 */
export async function createCustomCharacteristic(
	name: string,
	category: "amenity" | "feature" | "location",
): Promise<PropertyCharacteristic> {
	try {
		const { headers } = await import("next/headers");
		const sessionData = (await auth.api.getSession({
			headers: await headers(),
		})) as unknown as { user: { id: string } | null };

		if (!sessionData?.user?.id) {
			throw new Error("Unauthorized");
		}

		const customId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		await db.insert(propertyCharacteristics).values({
			id: customId,
			name: name.trim(),
			category,
			propertyType: null,
			isDefault: false,
			isActive: true,
			order: 999,
			createdBy: sessionData.user.id,
		});

		return {
			id: customId,
			name: name.trim(),
			category,
			selected: false,
		};
	} catch (error) {
		console.error("Error creating custom characteristic:", error);
		throw new Error("Failed to create custom characteristic");
	}
}

/**
 * Delete a custom characteristic (only if created by current user)
 */
export async function deleteCustomCharacteristic(
	characteristicId: string,
): Promise<void> {
	try {
		const { headers } = await import("next/headers");
		const sessionData = (await auth.api.getSession({
			headers: await headers(),
		})) as unknown as { user: { id: string } | null };

		if (!sessionData?.user?.id) {
			throw new Error("Unauthorized");
		}

		if (!characteristicId.startsWith("custom_")) {
			throw new Error("Cannot delete default characteristics");
		}

		// Delete the characteristic (only if created by current user)
		await db
			.delete(propertyCharacteristics)
			.where(
				and(
					eq(propertyCharacteristics.id, characteristicId),
					eq(propertyCharacteristics.createdBy, sessionData.user.id),
				),
			);

		revalidatePath("/dashboard/properties/new");
	} catch (error) {
		console.error("Error deleting custom characteristic:", error);
		throw new Error("Failed to delete custom characteristic");
	}
}

/**
 * Get characteristics statistics
 */
export async function getCharacteristicsStats(): Promise<{
	total: number;
	byCategory: Record<string, number>;
	byPropertyType: Record<string, number>;
}> {
	try {
		const characteristics = await db
			.select({
				category: propertyCharacteristics.category,
				propertyType: propertyCharacteristics.propertyType,
			})
			.from(propertyCharacteristics)
			.where(eq(propertyCharacteristics.isActive, true));

		const total = characteristics.length;

		const byCategory = characteristics.reduce(
			(acc, char) => {
				acc[char.category] = (acc[char.category] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		const byPropertyType = characteristics.reduce(
			(acc, char) => {
				if (char.propertyType) {
					const types = char.propertyType.split(",");
					types.forEach((type) => {
						acc[type] = (acc[type] || 0) + 1;
					});
				} else {
					acc.all = (acc.all || 0) + 1;
				}
				return acc;
			},
			{} as Record<string, number>,
		);

		return { total, byCategory, byPropertyType };
	} catch (error) {
		console.error("Error fetching characteristics stats:", error);
		throw new Error("Failed to fetch characteristics statistics");
	}
}

/**
 * Search characteristics by name
 */
export async function searchCharacteristics(
	query: string,
	propertyType?: PropertyType,
	category?: "amenity" | "feature" | "location",
): Promise<PropertyCharacteristic[]> {
	try {
		const dbQuery = db
			.select({
				id: propertyCharacteristics.id,
				name: propertyCharacteristics.name,
				category: propertyCharacteristics.category,
				propertyType: propertyCharacteristics.propertyType,
			})
			.from(propertyCharacteristics)
			.where(
				and(
					eq(propertyCharacteristics.isActive, true),
					sql`LOWER(${propertyCharacteristics.name}) LIKE LOWER(${`%${query}%`})`,
					category ? eq(propertyCharacteristics.category, category) : undefined,
				),
			);

		const results = await dbQuery.orderBy(propertyCharacteristics.order);

		// Filter by property type if specified
		const filteredResults = propertyType
			? results.filter((char) => {
					const charPropertyTypes = char.propertyType?.split(",") || [];
					return (
						charPropertyTypes.length === 0 ||
						charPropertyTypes.includes(propertyType)
					);
				})
			: results;

		return filteredResults.map((char) => ({
			id: char.id,
			name: char.name,
			category: char.category as "amenity" | "feature" | "location",
			selected: false,
		}));
	} catch (error) {
		console.error("Error searching characteristics:", error);
		throw new Error("Failed to search characteristics");
	}
}
