/**
 * User helper functions and utilities
 * Provides helper functions for working with User objects from the database schema
 */

import type { User } from "@/lib/db/schema";

/**
 * User preferences interface
 * Since the database User type doesn't include preferences,
 * this interface defines the structure for user preferences
 */
export type UserPreferences = {
	notifications?: {
		email: boolean;
		push: boolean;
		marketing: boolean;
	};
	privacy?: {
		profileVisible: boolean;
		showEmail: boolean;
		showPhone: boolean;
	};
	display?: {
		theme: "light" | "dark" | "system";
		language: string;
		currency: string;
	};
};

/**
 * Default user preferences
 */
const DEFAULT_PREFERENCES: UserPreferences = {
	notifications: {
		email: true,
		push: true,
		marketing: false,
	},
	privacy: {
		profileVisible: true,
		showEmail: false,
		showPhone: false,
	},
	display: {
		theme: "system",
		language: "es",
		currency: "USD",
	},
};

/**
 * Get user preferences
 * Returns default preferences since the User schema doesn't store preferences yet
 *
 * @param _user - User object (any type) - not actually used, just for interface compatibility
 * @returns UserPreferences object with default values
 *
 * @example
 * ```typescript
 * const user = await getUser(userId);
 * const preferences = getUserPreferences(user);
 * console.log(preferences.display.theme); // 'system'
 * ```
 */
export function getUserPreferences(_user: any): UserPreferences {
	// TODO: When preferences are added to the User schema,
	// parse and return actual user preferences from the database
	// For now, return default preferences
	return DEFAULT_PREFERENCES;
}

/**
 * Get user display name
 * Returns the best available name for display purposes
 *
 * @param user - User object from database
 * @returns Display name (firstName + lastName, name, or email)
 *
 * @example
 * ```typescript
 * const user = await getUser(userId);
 * const displayName = getUserDisplayName(user);
 * console.log(displayName); // "John Doe" or "john@example.com"
 * ```
 */
export function getUserDisplayName(user: User): string {
	if (user.firstName && user.lastName) {
		return `${user.firstName} ${user.lastName}`.trim();
	}

	if (user.name) {
		return user.name;
	}

	return user.email;
}

/**
 * Get user initials for avatar fallback
 *
 * @param user - User object from database
 * @returns User initials (up to 2 characters)
 *
 * @example
 * ```typescript
 * const user = await getUser(userId);
 * const initials = getUserInitials(user);
 * console.log(initials); // "JD" or "J" or "U"
 * ```
 */
export function getUserInitials(user: User): string {
	if (user.firstName && user.lastName) {
		return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
	}

	if (user.name) {
		const parts = user.name.split(" ");
		if (parts.length >= 2) {
			return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
		}
		return user.name[0].toUpperCase();
	}

	return user.email[0].toUpperCase();
}

/**
 * Check if user has a specific role
 *
 * @param user - User object from database
 * @param role - Role to check
 * @returns True if user has the specified role
 *
 * @example
 * ```typescript
 * const user = await getUser(userId);
 * if (hasRole(user, 'admin')) {
 *   // User is an admin
 * }
 * ```
 */
export function hasRole(user: User, role: string): boolean {
	return user.role === role;
}

/**
 * Check if user is an admin (admin or super_admin)
 *
 * @param user - User object from database
 * @returns True if user is an admin
 *
 * @example
 * ```typescript
 * const user = await getUser(userId);
 * if (isAdmin(user)) {
 *   // User has admin privileges
 * }
 * ```
 */
export function isAdmin(user: User): boolean {
	return user.role === "admin" || user.role === "super_admin";
}

/**
 * Get user full name or fallback to email
 *
 * @param user - User object from database
 * @returns Full name or email
 */
export function getUserFullName(user: User): string {
	return getUserDisplayName(user);
}
