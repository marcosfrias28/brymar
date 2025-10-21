/**
 * Consolidated database schema exports
 * This replaces the scattered domain entities across the application
 */

// User and authentication schemas
export * from "./users";

// Feature-specific schemas
export * from "./properties";
export * from "./lands";
export * from "./blog";
export * from "./wizard";

// Re-export commonly used tables for convenience
export {
    users,
    sessions,
    accounts,
    verificationTokens,
    notifications,
} from "./users";

export {
    properties,
    propertyFavorites,
    propertyViews,
    propertyInquiries,
} from "./properties";

export {
    lands,
    landFavorites,
    landViews,
    landInquiries,
} from "./lands";

export {
    blogPosts,
    blogCategories,
    blogPostViews,
    blogPostComments,
} from "./blog";

export {
    wizardDrafts,
    wizardTemplates,
    aiGenerations,
    wizardMedia,
    wizardAnalytics,
} from "./wizard";