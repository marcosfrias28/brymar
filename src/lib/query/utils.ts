import type { QueryClient } from "@tanstack/react-query";

/**
 * Query and Mutation Utilities
 *
 * This file provides utility functions for common query and mutation patterns.
 */

// Default query options for different types of queries
export const defaultQueryOptions = {
	// Fast-changing data (user activities, notifications)
	realtime: {
		staleTime: 30 * 1000, // 30 seconds
		gcTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 60 * 1000, // 1 minute
	},

	// Moderately changing data (properties, blog posts)
	dynamic: {
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		refetchOnWindowFocus: false,
	},

	// Rarely changing data (sections, contact info, categories)
	static: {
		staleTime: 15 * 60 * 1000, // 15 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	},

	// Critical data that should always be fresh
	critical: {
		staleTime: 0, // Always stale
		gcTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	},
} as const;

/**
 * Create query options with defaults
 */
export function createQueryOptions<_T>(
	type: keyof typeof defaultQueryOptions,
	overrides?: any
): any {
	return {
		...defaultQueryOptions[type],
		...overrides,
	};
}

/**
 * Create mutation options with common patterns
 */
export function createMutationOptions<_TData, _TError, _TVariables, _TContext>(
	overrides?: any
): any {
	return {
		retry: (failureCount: any, error: any) => {
			// Don't retry on client errors (4xx)
			if (
				error &&
				"status" in error &&
				typeof error.status === "number" &&
				error.status >= 400 &&
				error.status < 500
			) {
				return false;
			}

			// Retry up to 2 times for server errors
			return failureCount < 2;
		},
		...overrides,
	};
}

/**
 * Check if query data exists in cache
 */
export function hasQueryData(
	queryClient: QueryClient,
	queryKey: readonly unknown[]
): boolean {
	return queryClient.getQueryData(queryKey) !== undefined;
}

/**
 * Get cached query data with type safety
 */
export function getCachedData<T>(
	queryClient: QueryClient,
	queryKey: readonly unknown[]
): T | undefined {
	return queryClient.getQueryData<T>(queryKey);
}

/**
 * Set query data in cache with type safety
 */
export function setCachedData<T>(
	queryClient: QueryClient,
	queryKey: readonly unknown[],
	data: T | ((oldData: T | undefined) => T)
): void {
	queryClient.setQueryData<T>(queryKey, data);
}

/**
 * Ensure query data exists, fetch if not
 */
export async function ensureQueryData<T>(
	queryClient: QueryClient,
	queryKey: readonly unknown[],
	queryFn: () => Promise<T>,
	options?: { staleTime?: number }
): Promise<T> {
	return queryClient.ensureQueryData({
		queryKey,
		queryFn,
		staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes default
	});
}

/**
 * Batch invalidate multiple query patterns
 */
export async function batchInvalidate(
	queryClient: QueryClient,
	patterns: Array<readonly unknown[]>
): Promise<void> {
	const promises = patterns.map((pattern) =>
		queryClient.invalidateQueries({ queryKey: pattern })
	);

	await Promise.all(promises);
}

/**
 * Clear all cache data (useful for logout)
 */
export function clearAllCache(queryClient: QueryClient): void {
	queryClient.clear();
}

/**
 * Get query state information
 */
export function getQueryState(
	queryClient: QueryClient,
	queryKey: readonly unknown[]
) {
	const query = queryClient.getQueryCache().find({ queryKey });

	return {
		exists: Boolean(query),
		isStale: query?.isStale() ?? true,
		isFetching: query?.state.fetchStatus === "fetching",
		isError: query?.state.status === "error",
		isSuccess: query?.state.status === "success",
		lastUpdated: query?.state.dataUpdatedAt,
		error: query?.state.error,
	};
}

/**
 * Prefetch query with error handling
 */
export async function safePrefetch<T>(
	queryClient: QueryClient,
	queryKey: readonly unknown[],
	queryFn: () => Promise<T>,
	options?: { staleTime?: number }
): Promise<boolean> {
	try {
		await queryClient.prefetchQuery({
			queryKey,
			queryFn,
			staleTime: options?.staleTime || 5 * 60 * 1000,
		});
		return true;
	} catch (_error) {
		return false;
	}
}

/**
 * Cancel outgoing queries for a specific key pattern
 */
export async function cancelQueries(
	queryClient: QueryClient,
	queryKey: readonly unknown[]
): Promise<void> {
	await queryClient.cancelQueries({ queryKey });
}

/**
 * Reset query to initial state
 */
export async function resetQuery(
	queryClient: QueryClient,
	queryKey: readonly unknown[]
): Promise<void> {
	await queryClient.resetQueries({ queryKey });
}

/**
 * Utility to create a query key matcher function
 */
export function createQueryMatcher(pattern: readonly unknown[]) {
	return (queryKey: readonly unknown[]) => {
		if (queryKey.length < pattern.length) {
			return false;
		}

		return pattern.every((part, index) => {
			if (part === undefined) {
				return true; // Wildcard
			}
			return queryKey[index] === part;
		});
	};
}

/**
 * Debug utility to log all cached queries
 */
export function debugCache(queryClient: QueryClient): void {
	if (process.env.NODE_ENV === "development") {
		const cache = queryClient.getQueryCache();
		const queries = cache.getAll();

		// Debug logging removed for production
		queries.forEach((_query) => {
			// Query debug info available in development tools
			// Removed debug logging for production
		});
	}
}
