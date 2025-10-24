/**
 * Consolidated database schema exports
 * This replaces the scattered domain entities across the application
 */

export * from "./blog";
export {
	blogCategories,
	blogPosts,
} from "./blog";
export * from "./lands";
export {
	lands,
} from "./lands";
// Feature-specific schemas
export * from "./properties";
export {
	properties,
	propertyInquiries,
	propertyViews,
} from "./properties";
// User and authentication schemas
export * from "./users";
export * from "./activities";
export * from "./user-profiles";
// Re-export commonly used tables for convenience
export {
	accounts,
	sessions,
	users,
	verificationTokens,
} from "./users";
export {
	userActivities,
} from "./activities";
export {
	userProfiles,
} from "./user-profiles";

// Note: Removed wizard table exports since tables were removed
