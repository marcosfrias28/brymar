"use client";

import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Error handler for queries
function handleQueryError(_error: Error) {
	// Don't show toast for every query error, let components handle it
}

// Error handler for mutations
function handleMutationError(_error: Error) {
	toast.error("Ocurrió un error. Por favor, inténtalo de nuevo.");
}

// Success handler for mutations
function handleMutationSuccess(_data: any, _variables: any, _context: any) {
	// Let individual mutations handle their own success messages
	// Removed debug console.log for production
}

// Retry function for queries
function shouldRetryQuery(failureCount: number, error: Error): boolean {
	// Don't retry on 4xx errors (client errors)
	if (error.message.includes("4")) {
		return false;
	}

	// Retry up to 3 times for network errors
	return failureCount < 3;
}

// Create QueryClient with optimized configuration for Next.js
export function createQueryClient() {
	return new QueryClient({
		queryCache: new QueryCache({
			onError: handleQueryError,
		}),
		mutationCache: new MutationCache({
			onError: handleMutationError,
			onSuccess: handleMutationSuccess,
		}),
		defaultOptions: {
			queries: {
				// Stale time: 5 minutes - data is considered fresh for 5 minutes
				staleTime: 5 * 60 * 1000,
				// Cache time: 10 minutes - data stays in cache for 10 minutes after component unmount
				gcTime: 10 * 60 * 1000,
				// Retry configuration
				retry: shouldRetryQuery,
				// Don't refetch on window focus by default (can be overridden per query)
				refetchOnWindowFocus: false,
				// Refetch on reconnect
				refetchOnReconnect: true,
				// Refetch on mount if data is stale
				refetchOnMount: true,
			},
			mutations: {
				// Retry mutations once on network errors
				retry: (failureCount, error) => {
					if (error.message.includes("4")) {
						return false;
					}
					return failureCount < 1;
				},
				// Network timeout for mutations
				networkMode: "online",
			},
		},
	});
}

// Singleton QueryClient for client-side
let clientQueryClient: QueryClient | undefined;

export function getQueryClient() {
	if (typeof window === "undefined") {
		// Server: always make a new query client
		return createQueryClient();
	}
	// Browser: make a new query client if we don't already have one
	if (!clientQueryClient) {
		clientQueryClient = createQueryClient();
	}
	return clientQueryClient;
}
