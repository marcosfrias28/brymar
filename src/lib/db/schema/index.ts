/**
 * Consolidated database schema exports
 * This replaces the scattered domain entities across the application
 */

export * from "./activities";
export { userActivities } from "./activities";
export * from "./blog";
export {
	blogCategories,
	blogPosts,
} from "./blog";
export * from "./comments";
export { blogComments } from "./comments";
export * from "./lands";
export { lands } from "./lands";
// Feature-specific schemas
export * from "./properties";
export {
	properties,
	propertyInquiries,
	propertyViews,
} from "./properties";
export * from "./user-profiles";
export { userProfiles } from "./user-profiles";
// User and authentication schemas
export * from "./users";
// Re-export commonly used tables for convenience
export {
	accounts,
	sessions,
	users,
	verificationTokens,
} from "./users";

// Note: Removed wizard table exports since tables were removed
