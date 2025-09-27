/**
 * Query Keys Factory
 * 
 * This file defines all query keys used throughout the application.
 * Following a hierarchical structure for efficient cache invalidation.
 * 
 * Pattern: [entity, ...identifiers, filters?]
 * Example: ['sections', 'page', 'home'] or ['properties', 'list', { category: 'villa' }]
 */

// Base query key types
export type QueryKey = readonly unknown[];

// Sections query keys
export const sectionsKeys = {
    // All sections queries
    all: ['sections'] as const,

    // Sections by page
    pages: () => [...sectionsKeys.all, 'pages'] as const,
    page: (page: string) => [...sectionsKeys.pages(), page] as const,

    // Individual section
    sections: (page: string) => [...sectionsKeys.page(page), 'sections'] as const,
    section: (page: string, section: string) =>
        [...sectionsKeys.sections(page), section] as const,
} as const;

// Contact Info query keys
export const contactInfoKeys = {
    // All contact info queries
    all: ['contact-info'] as const,

    // Contact info lists
    lists: () => [...contactInfoKeys.all, 'lists'] as const,
    list: () => [...contactInfoKeys.lists()] as const,

    // Contact info by type
    types: () => [...contactInfoKeys.all, 'types'] as const,
    type: (type: string) => [...contactInfoKeys.types(), type] as const,

    // Individual contact info
    details: () => [...contactInfoKeys.all, 'details'] as const,
    detail: (id: number) => [...contactInfoKeys.details(), id] as const,
} as const;

// Properties query keys
export const propertiesKeys = {
    // All properties queries
    all: ['properties'] as const,

    // Properties lists
    lists: () => [...propertiesKeys.all, 'lists'] as const,
    list: (filters?: Record<string, any>) =>
        [...propertiesKeys.lists(), filters] as const,

    // Individual property
    details: () => [...propertiesKeys.all, 'details'] as const,
    detail: (id: number) => [...propertiesKeys.details(), id] as const,

    // Featured properties
    featured: () => [...propertiesKeys.all, 'featured'] as const,
} as const;

// Lands query keys
export const landsKeys = {
    // All lands queries
    all: ['lands'] as const,

    // Lands lists
    lists: () => [...landsKeys.all, 'lists'] as const,
    list: (filters?: Record<string, any>) =>
        [...landsKeys.lists(), filters] as const,

    // Individual land
    details: () => [...landsKeys.all, 'details'] as const,
    detail: (id: number) => [...landsKeys.details(), id] as const,
} as const;

// Blog query keys
export const blogKeys = {
    // All blog queries
    all: ['blog'] as const,

    // Blog posts lists
    lists: () => [...blogKeys.all, 'lists'] as const,
    list: (filters?: Record<string, any>) =>
        [...blogKeys.lists(), filters] as const,

    // Individual blog post
    details: () => [...blogKeys.all, 'details'] as const,
    detail: (id: number) => [...blogKeys.details(), id] as const,

    // Published posts
    published: () => [...blogKeys.all, 'published'] as const,
} as const;

// Categories query keys
export const categoriesKeys = {
    // All categories queries
    all: ['categories'] as const,

    // Categories lists
    lists: () => [...categoriesKeys.all, 'lists'] as const,
    list: () => [...categoriesKeys.lists()] as const,

    // Individual category
    details: () => [...categoriesKeys.all, 'details'] as const,
    detail: (id: number) => [...categoriesKeys.details(), id] as const,
} as const;

// User/Profile query keys
export const userKeys = {
    // All user queries
    all: ['user'] as const,

    // Current user
    current: () => [...userKeys.all, 'current'] as const,

    // User profile
    profile: (userId?: number) =>
        [...userKeys.all, 'profile', userId] as const,

    // User activities
    activities: (userId?: number) =>
        [...userKeys.all, 'activities', userId] as const,

    // User favorites
    favorites: (userId?: number) =>
        [...userKeys.all, 'favorites', userId] as const,

    // User messages
    messages: (userId?: number) =>
        [...userKeys.all, 'messages', userId] as const,

    // User notifications
    notifications: (userId?: number) =>
        [...userKeys.all, 'notifications', userId] as const,
} as const;

// Aggregate all query keys for easy access
export const queryKeys = {
    sections: sectionsKeys,
    contactInfo: contactInfoKeys,
    properties: propertiesKeys,
    lands: landsKeys,
    blog: blogKeys,
    categories: categoriesKeys,
    user: userKeys,
} as const;

// Type helpers for query keys (simplified)
export type QueryKeyType = readonly unknown[];

// Union type of all possible query keys
export type AppQueryKey = QueryKeyType;