/**
 * Examples of how to integrate activity logging into your components
 * Copy these patterns into your existing components
 */

import { ActivityLogger } from "./activity-logger";

// Example 1: Log property views in property detail page
export async function logPropertyView(
	propertyId: string,
	propertyTitle: string
) {
	try {
		await ActivityLogger.logPropertyView(propertyId, propertyTitle);
	} catch (_error) {}
}

// Example 2: Log favorites in property card component
export async function logPropertyFavorite(
	propertyId: string,
	propertyTitle: string,
	isFavorite: boolean
) {
	try {
		await ActivityLogger.logPropertyFavorite(
			propertyId,
			propertyTitle,
			isFavorite ? "add" : "remove"
		);
	} catch (_error) {}
}

// Example 3: Log searches in search component
export async function logSearchActivity(searchParams: {
	query?: string;
	location?: string;
	priceMin?: number;
	priceMax?: number;
	rooms?: number;
	resultsCount: number;
}) {
	try {
		const searchTerm = [
			searchParams.query,
			searchParams.location,
			searchParams.rooms ? `${searchParams.rooms} camere` : null,
			searchParams.priceMin || searchParams.priceMax
				? `€${searchParams.priceMin || 0}-${searchParams.priceMax || "∞"}`
				: null,
		]
			.filter(Boolean)
			.join(" ");

		await ActivityLogger.logSearch(
			searchTerm,
			searchParams,
			searchParams.resultsCount
		);
	} catch (_error) {}
}

// Example 4: Log contact inquiries
export async function logContactInquiry(
	propertyId: string,
	propertyTitle: string,
	contactType: "inquiry" | "call" | "email"
) {
	try {
		await ActivityLogger.logContact(propertyId, propertyTitle, contactType);
	} catch (_error) {}
}

// Example 5: Log profile updates
export async function logProfileUpdate(updatedFields: string[]) {
	try {
		await ActivityLogger.logProfileUpdate(updatedFields);
	} catch (_error) {}
}

// Example 6: Log settings changes
export async function logSettingsChange(
	settingName: string,
	oldValue: any,
	newValue: any
) {
	try {
		await ActivityLogger.logSettingsChange(settingName, oldValue, newValue);
	} catch (_error) {}
}

// Example 7: Log custom activities
export async function logCustomActivity(
	type:
		| "view"
		| "favorite"
		| "search"
		| "contact"
		| "message"
		| "login"
		| "profile"
		| "favorites"
		| "settings",
	title: string,
	description: string,
	details?: string,
	metadata?: Record<string, any>
) {
	try {
		await ActivityLogger.logCustom({
			type,
			title,
			description,
			details,
			metadata,
		});
	} catch (_error) {}
}
