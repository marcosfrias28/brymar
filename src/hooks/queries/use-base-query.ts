"use client";

import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNotificationContext } from "@/components/providers/notification-provider";
import { createQueryOptions } from "@/lib/query/utils";

/**
 * Base Query Hook Options
 */
export interface BaseQueryOptions<T>
	extends Omit<UseQueryOptions<T>, "queryKey" | "queryFn"> {
	// Notification options
	showErrorToast?: boolean;
	errorMessage?: string;

	// Loading state options
	showLoadingToast?: boolean;
	loadingMessage?: string;

	// Success options
	showSuccessToast?: boolean;
	successMessage?: string;

	// Query type for default options
	queryType?: "realtime" | "dynamic" | "static" | "critical";
}

/**
 * Enhanced Query Result
 */
export type BaseQueryResult<T> = {
	// All properties from UseQueryResult
	data: T | undefined;
	error: Error | null;
	isError: boolean;
	isLoading: boolean;
	isSuccess: boolean;
	status: "pending" | "error" | "success";
	isFetching: boolean;
	isRefetching: boolean;
	refetch: () => void;

	// Additional convenience properties
	isEmpty: boolean;
	hasData: boolean;
	isFirstLoading: boolean;
	isRefetchError: boolean;
};

/**
 * Hydration-safe hook to prevent SSR mismatches
 */
function useHydration() {
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setHydrated(true);
	}, []);

	return hydrated;
}

/**
 * Base Query Hook with enhanced features
 */
export function useBaseQuery<T>(
	queryKey: readonly unknown[],
	queryFn: () => Promise<T>,
	options: BaseQueryOptions<T> = {}
): BaseQueryResult<T> {
	const isHydrated = useHydration();
	const { notifyError, notifyLoading, notifySuccess, dismiss } =
		useNotificationContext();

	const {
		showErrorToast = true,
		errorMessage,
		showLoadingToast = false,
		loadingMessage = "Cargando...",
		showSuccessToast = false,
		successMessage = "Datos cargados",
		queryType = "dynamic",
		...queryOptions
	} = options;

	// Create query options with defaults based on type
	const defaultOptions = createQueryOptions(queryType, queryOptions);

	// Don't run query until hydrated to prevent SSR issues
	const query = useQuery({
		...defaultOptions,
		queryKey,
		queryFn,
		enabled: isHydrated && queryOptions.enabled !== false,
	});

	// Handle loading toast
	useEffect(() => {
		let loadingToastId: string | undefined;

		if (showLoadingToast && query.isLoading && !query.isRefetching) {
			loadingToastId = notifyLoading(loadingMessage);
		}

		return () => {
			if (loadingToastId) {
				dismiss(loadingToastId);
			}
		};
	}, [
		query.isLoading,
		query.isRefetching,
		showLoadingToast,
		loadingMessage,
		notifyLoading,
		dismiss,
	]);

	// Handle error notifications
	useEffect(() => {
		if (showErrorToast && query.isError && query.error) {
			const message = errorMessage || "Error al cargar los datos";
			notifyError(message, query.error.message);
		}
	}, [query.isError, query.error, showErrorToast, errorMessage, notifyError]);

	// Handle success notifications (mainly for refetch)
	useEffect(() => {
		if (
			showSuccessToast &&
			query.isSuccess &&
			query.isRefetching === false &&
			query.data
		) {
			notifySuccess(successMessage);
		}
	}, [
		query.isSuccess,
		query.isRefetching,
		query.data,
		showSuccessToast,
		successMessage,
		notifySuccess,
	]);

	// Return enhanced result
	return {
		...query,
		isEmpty: Array.isArray(query.data) ? query.data.length === 0 : !query.data,
		hasData: Boolean(query.data),
		isFirstLoading: query.isLoading && !query.isRefetching,
		isRefetchError: query.isError && query.isRefetching,
	} as BaseQueryResult<T>;
}

/**
 * Hook for queries that should show loading states immediately
 */
export function useBaseQueryWithLoading<T>(
	queryKey: readonly unknown[],
	queryFn: () => Promise<T>,
	options: BaseQueryOptions<T> = {}
): BaseQueryResult<T> {
	return useBaseQuery(queryKey, queryFn, {
		showLoadingToast: true,
		...options,
	});
}

/**
 * Hook for critical queries that should always be fresh
 */
export function useCriticalQuery<T>(
	queryKey: readonly unknown[],
	queryFn: () => Promise<T>,
	options: BaseQueryOptions<T> = {}
): BaseQueryResult<T> {
	return useBaseQuery(queryKey, queryFn, {
		queryType: "critical",
		showErrorToast: true,
		...options,
	});
}

/**
 * Hook for static data that rarely changes
 */
export function useStaticQuery<T>(
	queryKey: readonly unknown[],
	queryFn: () => Promise<T>,
	options: BaseQueryOptions<T> = {}
): BaseQueryResult<T> {
	return useBaseQuery(queryKey, queryFn, {
		queryType: "static",
		showErrorToast: false, // Static data errors are usually not critical
		...options,
	});
}

/**
 * Hook for realtime data that changes frequently
 */
export function useRealtimeQuery<T>(
	queryKey: readonly unknown[],
	queryFn: () => Promise<T>,
	options: BaseQueryOptions<T> = {}
): BaseQueryResult<T> {
	return useBaseQuery(queryKey, queryFn, {
		queryType: "realtime",
		showErrorToast: true,
		...options,
	});
}
