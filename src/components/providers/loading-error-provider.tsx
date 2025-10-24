"use client";

import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";
import { toast } from "sonner";

interface LoadingState {
	[key: string]: boolean;
}

interface ErrorState {
	[key: string]: Error | string | null;
}

interface LoadingErrorContextType {
	// Loading state management
	loadingStates: LoadingState;
	setLoading: (key: string, loading: boolean) => void;
	isLoading: (key: string) => boolean;
	isAnyLoading: () => boolean;

	// Error state management
	errorStates: ErrorState;
	setError: (key: string, error: Error | string | null) => void;
	getError: (key: string) => Error | string | null;
	clearError: (key: string) => void;
	clearAllErrors: () => void;

	// Combined operations
	executeWithLoading: <T>(
		key: string,
		operation: () => Promise<T>,
		options?: {
			successMessage?: string;
			errorMessage?: string;
			showToast?: boolean;
		},
	) => Promise<T | null>;
}

const LoadingErrorContext = createContext<LoadingErrorContextType | undefined>(
	undefined,
);

export function LoadingErrorProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [loadingStates, setLoadingStates] = useState<LoadingState>({});
	const [errorStates, setErrorStates] = useState<ErrorState>({});

	const setLoading = useCallback((key: string, loading: boolean) => {
		setLoadingStates((prev) => ({
			...prev,
			[key]: loading,
		}));

		// Clear error when starting to load
		if (loading) {
			setErrorStates((prev) => ({
				...prev,
				[key]: null,
			}));
		}
	}, []);

	const isLoading = useCallback(
		(key: string) => {
			return loadingStates[key] || false;
		},
		[loadingStates],
	);

	const isAnyLoading = useCallback(() => {
		return Object.values(loadingStates).some((loading) => loading);
	}, [loadingStates]);

	const setError = useCallback((key: string, error: Error | string | null) => {
		setErrorStates((prev) => ({
			...prev,
			[key]: error,
		}));

		// Clear loading when error occurs
		if (error) {
			setLoadingStates((prev) => ({
				...prev,
				[key]: false,
			}));
		}
	}, []);

	const getError = useCallback(
		(key: string) => {
			return errorStates[key] || null;
		},
		[errorStates],
	);

	const clearError = useCallback((key: string) => {
		setErrorStates((prev) => ({
			...prev,
			[key]: null,
		}));
	}, []);

	const clearAllErrors = useCallback(() => {
		setErrorStates({});
	}, []);

	const executeWithLoading = useCallback(
		async <T,>(
			key: string,
			operation: () => Promise<T>,
			options: {
				successMessage?: string;
				errorMessage?: string;
				showToast?: boolean;
			} = {},
		): Promise<T | null> => {
			const { successMessage, errorMessage, showToast = true } = options;

			try {
				setLoading(key, true);
				const result = await operation();

				if (showToast && successMessage) {
					toast.success(successMessage);
				}

				return result;
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : String(error);
				setError(key, error instanceof Error ? error : new Error(errorMsg));

				if (showToast) {
					toast.error(errorMessage || errorMsg || "Ha ocurrido un error");
				}

				return null;
			} finally {
				setLoading(key, false);
			}
		},
		[setLoading, setError],
	);

	const value: LoadingErrorContextType = {
		loadingStates,
		setLoading,
		isLoading,
		isAnyLoading,
		errorStates,
		setError,
		getError,
		clearError,
		clearAllErrors,
		executeWithLoading,
	};

	return (
		<LoadingErrorContext.Provider value={value}>
			{children}
		</LoadingErrorContext.Provider>
	);
}

export function useLoadingError() {
	const context = useContext(LoadingErrorContext);
	if (context === undefined) {
		throw new Error(
			"useLoadingError must be used within a LoadingErrorProvider",
		);
	}
	return context;
}

/**
 * Hook for managing loading state of a specific operation
 */
export function useOperationState(key: string) {
	const {
		isLoading,
		setLoading,
		getError,
		setError,
		clearError,
		executeWithLoading,
	} = useLoadingError();

	return {
		loading: isLoading(key),
		error: getError(key),
		setLoading: (loading: boolean) => setLoading(key, loading),
		setError: (error: Error | string | null) => setError(key, error),
		clearError: () => clearError(key),
		execute: <T,>(
			operation: () => Promise<T>,
			options?: {
				successMessage?: string;
				errorMessage?: string;
				showToast?: boolean;
			},
		) => executeWithLoading(key, operation, options),
	};
}

/**
 * Hook for form submission states
 */
export function useFormState(formName: string) {
	const operation = useOperationState(`form-${formName}`);

	return {
		...operation,
		isSubmitting: operation.loading,
		submitError: operation.error,
		submit: operation.execute,
	};
}

/**
 * Hook for data fetching states
 */
export function useDataState(dataKey: string) {
	const operation = useOperationState(`data-${dataKey}`);

	return {
		...operation,
		isFetching: operation.loading,
		fetchError: operation.error,
		fetch: operation.execute,
	};
}
