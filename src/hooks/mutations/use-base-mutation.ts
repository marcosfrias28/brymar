"use client";

import {
	type UseMutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useNotificationContext } from "@/components/providers/notification-provider";
import {
	type InvalidationAction,
	type InvalidationContext,
	invalidateQueries,
} from "@/lib/query/invalidation";
import { createMutationOptions } from "@/lib/query/utils";

/**
 * Base Mutation Hook Options
 */
export interface BaseMutationOptions<TData, TError, TVariables, TContext>
	extends Omit<
		UseMutationOptions<TData, TError, TVariables, TContext>,
		"onSuccess" | "onError" | "onMutate"
	> {
	// Notification options
	showLoadingToast?: boolean;
	loadingMessage?: string;
	showSuccessToast?: boolean;
	successMessage?: string | ((data: TData, variables: TVariables) => string);
	showErrorToast?: boolean;
	errorMessage?: string | ((error: TError, variables: TVariables) => string);

	// Cache invalidation
	invalidateOn?: InvalidationAction;
	invalidationContext?: (
		variables: TVariables,
		data?: TData,
	) => InvalidationContext;

	// Optimistic updates
	optimisticUpdate?: (variables: TVariables) => void;
	rollbackUpdate?: (context: TContext) => void;

	// Custom callbacks (will be called after built-in handling)
	onSuccess?: (data: TData, variables: TVariables, context: TContext) => void;
	onError?: (error: TError, variables: TVariables, context: TContext) => void;
	onMutate?: (variables: TVariables) => Promise<TContext> | TContext;
}

/**
 * Enhanced Mutation Result
 */
export interface BaseMutationResult<TData, TError, TVariables, _TContext> {
	// All properties from UseMutationResult
	data: TData | undefined;
	error: TError | null;
	isError: boolean;
	isIdle: boolean;
	isPending: boolean;
	isSuccess: boolean;
	failureCount: number;
	failureReason: TError | null;
	isPaused: boolean;
	status: "idle" | "pending" | "error" | "success";
	variables: TVariables | undefined;
	mutate: (variables: TVariables, options?: any) => void;
	mutateAsync: (variables: TVariables, options?: any) => Promise<TData>;
	reset: () => void;

	// Additional convenience methods
	mutateWithToast: (variables: TVariables) => void;
	mutateAsyncWithToast: (variables: TVariables) => Promise<TData>;
}

/**
 * Base Mutation Hook with enhanced features
 */
export function useBaseMutation<
	TData = unknown,
	TError = Error,
	TVariables = void,
	TContext = unknown,
>(
	mutationFn: (variables: TVariables) => Promise<TData>,
	options: BaseMutationOptions<TData, TError, TVariables, TContext> = {},
): BaseMutationResult<TData, TError, TVariables, TContext> {
	const queryClient = useQueryClient();
	const {
		notifyMutationStart,
		notifyMutationSuccess,
		notifyMutationError,
		notifyError,
		notifySuccess,
	} = useNotificationContext();

	const {
		showLoadingToast = true,
		loadingMessage,
		showSuccessToast = true,
		successMessage,
		showErrorToast = true,
		errorMessage,
		invalidateOn,
		invalidationContext,
		optimisticUpdate,
		rollbackUpdate,
		onSuccess: customOnSuccess,
		onError: customOnError,
		onMutate: customOnMutate,
		...mutationOptions
	} = options;

	// Create mutation with default options
	const defaultOptions = createMutationOptions(mutationOptions);

	const mutation = useMutation({
		mutationFn,
		...defaultOptions,

		onMutate: async (variables: TVariables) => {
			let loadingToastId: string | undefined;
			let context: TContext | undefined;

			// Show loading toast
			if (showLoadingToast) {
				const _message = loadingMessage || "Procesando...";
				loadingToastId = notifyMutationStart("save");
			}

			// Handle optimistic updates
			if (optimisticUpdate) {
				optimisticUpdate(variables);
			}

			// Call custom onMutate
			if (customOnMutate) {
				context = await customOnMutate(variables);
			}

			return { loadingToastId, context } as TContext;
		},

		onSuccess: async (
			data: TData,
			variables: TVariables,
			context: TContext | undefined,
		) => {
			const ctx = context as any;

			// Dismiss loading toast and show success
			if (showSuccessToast) {
				const _message =
					typeof successMessage === "function"
						? successMessage(data, variables)
						: successMessage || "Operación completada exitosamente";

				notifyMutationSuccess("save", ctx?.loadingToastId);
			}

			// Handle cache invalidation
			if (invalidateOn) {
				const invalidationCtx = invalidationContext
					? invalidationContext(variables, data)
					: {};

				await invalidateQueries(queryClient, invalidateOn, invalidationCtx);
			}

			// Call custom onSuccess
			if (customOnSuccess && context) {
				customOnSuccess(data, variables, context);
			}
		},

		onError: (
			error: TError,
			variables: TVariables,
			context: TContext | undefined,
		) => {
			const ctx = context as any;

			// Handle rollback
			if (rollbackUpdate && context) {
				rollbackUpdate(context);
			}

			// Show error toast
			if (showErrorToast) {
				const message =
					typeof errorMessage === "function"
						? errorMessage(error, variables)
						: errorMessage || "Error en la operación";

				notifyMutationError("save", message, ctx?.loadingToastId);
			}

			// Call custom onError
			if (customOnError && context) {
				customOnError(error, variables, context);
			}
		},
	});

	// Enhanced mutate methods with toast handling
	const mutateWithToast = (variables: TVariables) => {
		mutation.mutate(variables);
	};

	const mutateAsyncWithToast = async (
		variables: TVariables,
	): Promise<TData> => {
		return mutation.mutateAsync(variables);
	};

	return {
		...mutation,
		mutateWithToast,
		mutateAsyncWithToast,
	};
}

/**
 * Hook for create mutations
 */
export function useCreateMutation<
	TData = unknown,
	TError = Error,
	TVariables = void,
	TContext = unknown,
>(
	mutationFn: (variables: TVariables) => Promise<TData>,
	options: BaseMutationOptions<TData, TError, TVariables, TContext> = {},
): BaseMutationResult<TData, TError, TVariables, TContext> {
	return useBaseMutation(mutationFn, {
		loadingMessage: "Creando...",
		successMessage: "Creado exitosamente",
		errorMessage: "Error al crear",
		...options,
	});
}

/**
 * Hook for update mutations
 */
export function useUpdateMutation<
	TData = unknown,
	TError = Error,
	TVariables = void,
	TContext = unknown,
>(
	mutationFn: (variables: TVariables) => Promise<TData>,
	options: BaseMutationOptions<TData, TError, TVariables, TContext> = {},
): BaseMutationResult<TData, TError, TVariables, TContext> {
	return useBaseMutation(mutationFn, {
		loadingMessage: "Actualizando...",
		successMessage: "Actualizado exitosamente",
		errorMessage: "Error al actualizar",
		...options,
	});
}

/**
 * Hook for delete mutations
 */
export function useDeleteMutation<
	TData = unknown,
	TError = Error,
	TVariables = void,
	TContext = unknown,
>(
	mutationFn: (variables: TVariables) => Promise<TData>,
	options: BaseMutationOptions<TData, TError, TVariables, TContext> = {},
): BaseMutationResult<TData, TError, TVariables, TContext> {
	return useBaseMutation(mutationFn, {
		loadingMessage: "Eliminando...",
		successMessage: "Eliminado exitosamente",
		errorMessage: "Error al eliminar",
		...options,
	});
}
