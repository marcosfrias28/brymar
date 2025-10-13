import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';

/**
 * Cache Invalidation System
 * 
 * This file defines invalidation strategies for different mutation types.
 * It provides a centralized way to manage cache invalidation across the app.
 */

// Invalidation action types
export type InvalidationAction =
    | 'section.create'
    | 'section.update'
    | 'section.delete'
    | 'contact.create'
    | 'contact.update'
    | 'contact.delete'
    | 'property.create'
    | 'property.update'
    | 'property.delete'
    | 'land.create'
    | 'land.update'
    | 'land.delete'
    | 'blog.create'
    | 'blog.update'
    | 'blog.delete'
    | 'user.update'
    | 'user.activity';

// Context for invalidation (provides additional data for smart invalidation)
export interface InvalidationContext {
    page?: string;
    sectionName?: string;
    contactType?: string;
    propertyId?: number;
    landId?: number;
    blogId?: number;
    userId?: number;
    [key: string]: any;
}

/**
 * Get query keys to invalidate based on action and context
 */
export function getInvalidationKeys(
    action: InvalidationAction,
    context: InvalidationContext = {}
): Array<readonly unknown[]> {
    switch (action) {
        // Section invalidations
        case 'section.create':
        case 'section.update':
            if (context.page) {
                return [
                    queryKeys.sections.page(context.page),
                    queryKeys.sections.all,
                ];
            }
            return [queryKeys.sections.all];

        case 'section.delete':
            if (context.page) {
                return [
                    queryKeys.sections.page(context.page),
                    queryKeys.sections.all,
                ];
            }
            return [queryKeys.sections.all];

        // Contact info invalidations
        case 'contact.create':
        case 'contact.update':
            if (context.contactType) {
                return [
                    queryKeys.contactInfo.type(context.contactType),
                    queryKeys.contactInfo.list(),
                    queryKeys.contactInfo.all,
                ];
            }
            return [
                queryKeys.contactInfo.list(),
                queryKeys.contactInfo.all,
            ];

        case 'contact.delete':
            return [
                queryKeys.contactInfo.list(),
                queryKeys.contactInfo.all,
            ];

        // Property invalidations
        case 'property.create':
            return [
                queryKeys.properties.lists(),
                queryKeys.properties.featured(),
                queryKeys.properties.all,
            ];

        case 'property.update':
            if (context.propertyId) {
                return [
                    queryKeys.properties.detail(context.propertyId),
                    queryKeys.properties.lists(),
                    queryKeys.properties.featured(),
                    queryKeys.properties.all,
                ];
            }
            return [
                queryKeys.properties.lists(),
                queryKeys.properties.featured(),
                queryKeys.properties.all,
            ];

        case 'property.delete':
            return [
                queryKeys.properties.lists(),
                queryKeys.properties.featured(),
                queryKeys.properties.all,
            ];

        // Land invalidations
        case 'land.create':
            return [
                queryKeys.lands.lists(),
                queryKeys.lands.all,
            ];

        case 'land.update':
            if (context.landId) {
                return [
                    queryKeys.lands.detail(context.landId),
                    queryKeys.lands.lists(),
                    queryKeys.lands.all,
                ];
            }
            return [
                queryKeys.lands.lists(),
                queryKeys.lands.all,
            ];

        case 'land.delete':
            return [
                queryKeys.lands.lists(),
                queryKeys.lands.all,
            ];

        // Blog invalidations
        case 'blog.create':
            return [
                queryKeys.blog.lists(),
                queryKeys.blog.published(),
                queryKeys.blog.all,
            ];

        case 'blog.update':
            if (context.blogId) {
                return [
                    queryKeys.blog.detail(context.blogId),
                    queryKeys.blog.lists(),
                    queryKeys.blog.published(),
                    queryKeys.blog.all,
                ];
            }
            return [
                queryKeys.blog.lists(),
                queryKeys.blog.published(),
                queryKeys.blog.all,
            ];

        case 'blog.delete':
            return [
                queryKeys.blog.lists(),
                queryKeys.blog.published(),
                queryKeys.blog.all,
            ];

        // User invalidations
        case 'user.update':
            if (context.userId) {
                return [
                    queryKeys.user.profile(context.userId),
                    queryKeys.user.current(),
                ];
            }
            return [queryKeys.user.current()];

        case 'user.activity':
            if (context.userId) {
                return [
                    queryKeys.user.activities(context.userId),
                    queryKeys.user.notifications(context.userId),
                ];
            }
            return [];

        default:
            console.warn(`Unknown invalidation action: ${action}`);
            return [];
    }
}

/**
 * Invalidate cache based on action and context
 */
export async function invalidateQueries(
    queryClient: QueryClient,
    action: InvalidationAction,
    context: InvalidationContext = {}
): Promise<void> {
    const keysToInvalidate = getInvalidationKeys(action, context);

    // Invalidate all relevant queries
    const promises = keysToInvalidate.map(queryKey =>
        queryClient.invalidateQueries({ queryKey })
    );

    await Promise.all(promises);
}

/**
 * Remove specific queries from cache
 */
export function removeQueries(
    queryClient: QueryClient,
    action: InvalidationAction,
    context: InvalidationContext = {}
): void {
    const keysToRemove = getInvalidationKeys(action, context);

    keysToRemove.forEach(queryKey => {
        queryClient.removeQueries({ queryKey });
    });
}

/**
 * Optimistically update cache for mutations
 */
export function optimisticUpdate<T>(
    queryClient: QueryClient,
    queryKey: readonly unknown[],
    updater: (oldData: T | undefined) => T
): T | undefined {
    const previousData = queryClient.getQueryData<T>(queryKey);

    queryClient.setQueryData<T>(queryKey, updater);

    return previousData;
}

/**
 * Rollback optimistic update
 */
export function rollbackOptimisticUpdate<T>(
    queryClient: QueryClient,
    queryKey: readonly unknown[],
    previousData: T | undefined
): void {
    queryClient.setQueryData<T>(queryKey, previousData);
}

/**
 * Prefetch related queries after successful mutation
 */
export async function prefetchRelatedQueries(
    queryClient: QueryClient,
    action: InvalidationAction,
    context: InvalidationContext = {}
): Promise<void> {
    // This can be extended to prefetch specific queries that are likely to be needed
    // after certain mutations

    switch (action) {
        case 'property.create':
            // Prefetch the properties list to show the new property immediately
            await queryClient.prefetchQuery({
                queryKey: queryKeys.properties.list(),
                staleTime: 0, // Force fresh data
            });
            break;

        case 'section.update':
            if (context.page) {
                // Prefetch the updated page sections
                await queryClient.prefetchQuery({
                    queryKey: queryKeys.sections.page(context.page),
                    staleTime: 0,
                });
            }
            break;

        // Add more prefetch strategies as needed
    }
}