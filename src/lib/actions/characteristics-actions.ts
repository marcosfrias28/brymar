"use server";

import {
	CharacteristicsService,
	DEFAULT_CHARACTERISTICS,
} from "@/lib/services/characteristics-service";
import type { PropertyCharacteristic, PropertyType } from "@/types/wizard";

/**
 * Get all available characteristics, optionally filtered by property type
 */
export async function getCharacteristics(
	propertyType?: PropertyType
): Promise<PropertyCharacteristic[]> {
	try {
		const service = new CharacteristicsService();
		return service.getCharacteristics({ propertyType });
	} catch (_error) {
		throw new Error("Failed to fetch characteristics");
	}
}

/**
 * Get characteristics for a specific draft
 */
export async function getDraftCharacteristics(
	draftId: string
): Promise<PropertyCharacteristic[]> {
	try {
		// Persistencia de borradores deshabilitada temporalmente
		// Devolvemos una lista vacía indicando que no hay selecciones guardadas
		void draftId;
		return [];
	} catch (_error) {
		throw new Error("Failed to fetch draft characteristics");
	}
}

/**
 * Save characteristics for a draft
 */
export async function saveDraftCharacteristics(
	draftId: string,
	characteristics: PropertyCharacteristic[]
): Promise<void> {
	try {
		// Persistencia de borradores deshabilitada temporalmente
		// No-op para permitir compilación y flujos existentes
		void draftId;
		void characteristics;
		return;
	} catch (_error) {
		throw new Error("Failed to save draft characteristics");
	}
}

/**
 * Create a custom characteristic
 */
export async function createCustomCharacteristic(
	name: string,
	category: "amenity" | "feature" | "location"
): Promise<PropertyCharacteristic> {
	try {
		const customId = `custom_${Date.now()}_${Math.random()
			.toString(36)
			.substr(2, 9)}`;
		return {
			id: customId,
			name: name.trim(),
			category,
			selected: true,
		};
	} catch (_error) {
		throw new Error("Failed to create custom characteristic");
	}
}

/**
 * Delete a custom characteristic (only if created by current user)
 */
export async function deleteCustomCharacteristic(
	characteristicId: string
): Promise<void> {
	try {
		// Sin almacenamiento persistente, no-op
		void characteristicId;
		return;
	} catch (_error) {
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
		const total = DEFAULT_CHARACTERISTICS.length;

		const byCategory = DEFAULT_CHARACTERISTICS.reduce(
			(acc, def) => {
				acc[def.category] = (acc[def.category] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		const byPropertyType = DEFAULT_CHARACTERISTICS.reduce(
			(acc, def) => {
				if (def.propertyTypes && def.propertyTypes.length > 0) {
					def.propertyTypes.forEach((type) => {
						acc[type] = (acc[type] || 0) + 1;
					});
				} else {
					acc.all = (acc.all || 0) + 1;
				}
				return acc;
			},
			{} as Record<string, number>
		);

		return { total, byCategory, byPropertyType };
	} catch (_error) {
		throw new Error("Failed to fetch characteristics statistics");
	}
}

/**
 * Search characteristics by name
 */
export async function searchCharacteristics(
	query: string,
	propertyType?: PropertyType,
	category?: "amenity" | "feature" | "location"
): Promise<PropertyCharacteristic[]> {
	try {
		const service = new CharacteristicsService();
		return service.getCharacteristics({
			propertyType,
			category,
			search: query,
		});
	} catch (_error) {
		throw new Error("Failed to search characteristics");
	}
}
