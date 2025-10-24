"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
	createContactInfo,
	deleteContactInfo,
	updateContactInfo,
} from "@/lib/actions/sections-actions";
import type { ContactInfo } from "@/lib/db/schema";
import { queryKeys } from "@/lib/query/keys";
import {
	useCreateMutation,
	useDeleteMutation,
	useUpdateMutation,
} from "./use-base-mutation";

// Types for contact info mutations
export interface CreateContactInfoData {
	type: string;
	label: string;
	value: string;
	icon?: string;
	isActive?: boolean;
	order?: number;
}

export interface UpdateContactInfoData extends CreateContactInfoData {
	id: number;
}

/**
 * Hook for creating contact info
 */
export function useCreateContactInfo() {
	return useCreateMutation(
		async (data: CreateContactInfoData) => {
			const formData = new FormData();
			Object.entries(data).forEach(([key, value]) => {
				if (value !== undefined) {
					formData.append(key, String(value));
				}
			});

			const result = await createContactInfo(formData);
			if (!result.success) {
				throw new Error(
					result.error || "Error al crear la información de contacto",
				);
			}
			return result.data;
		},
		{
			invalidateOn: "contact.create",
			invalidationContext: (variables) => ({
				contactType: variables.type,
			}),
			successMessage: "Información de contacto creada exitosamente",
			errorMessage: "Error al crear la información de contacto",
		},
	);
}

/**
 * Hook for updating contact info
 */
export function useUpdateContactInfo() {
	const queryClient = useQueryClient();

	return useUpdateMutation(
		async (data: UpdateContactInfoData) => {
			const formData = new FormData();
			Object.entries(data).forEach(([key, value]) => {
				if (value !== undefined) {
					formData.append(key, String(value));
				}
			});

			const result = await updateContactInfo(formData);
			if (!result.success) {
				throw new Error(
					result.error || "Error al actualizar la información de contacto",
				);
			}
			return result.data;
		},
		{
			// Optimistic update
			onMutate: async (variables) => {
				const listQueryKey = queryKeys.contactInfo.list();
				const detailQueryKey = queryKeys.contactInfo.detail(variables.id);

				// Cancel outgoing refetches
				await queryClient.cancelQueries({ queryKey: listQueryKey });
				await queryClient.cancelQueries({ queryKey: detailQueryKey });

				// Snapshot previous values
				const previousList =
					queryClient.getQueryData<ContactInfo[]>(listQueryKey);
				const previousDetail =
					queryClient.getQueryData<ContactInfo>(detailQueryKey);

				// Optimistically update list
				if (previousList) {
					const updatedList = previousList.map((item) =>
						item.id === variables.id
							? { ...item, ...variables, updatedAt: new Date() }
							: item,
					);
					queryClient.setQueryData(listQueryKey, updatedList);
				}

				// Optimistically update detail
				if (previousDetail) {
					queryClient.setQueryData(detailQueryKey, {
						...previousDetail,
						...variables,
						updatedAt: new Date(),
					});
				}

				return { previousList, previousDetail, listQueryKey, detailQueryKey };
			},

			// Rollback on error
			onError: (_error, _variables, context) => {
				if (context?.previousList && context?.listQueryKey) {
					queryClient.setQueryData(context.listQueryKey, context.previousList);
				}
				if (context?.previousDetail && context?.detailQueryKey) {
					queryClient.setQueryData(
						context.detailQueryKey,
						context.previousDetail,
					);
				}
			},

			invalidateOn: "contact.update",
			invalidationContext: (variables) => ({
				contactType: variables.type,
			}),
			successMessage: "Información de contacto actualizada exitosamente",
			errorMessage: "Error al actualizar la información de contacto",
		},
	);
}

/**
 * Hook for deleting contact info
 */
export function useDeleteContactInfo() {
	const queryClient = useQueryClient();

	return useDeleteMutation(
		async (data: { id: number }) => {
			const formData = new FormData();
			formData.append("id", String(data.id));

			const result = await deleteContactInfo(formData);
			if (!result.success) {
				throw new Error(
					result.error || "Error al eliminar la información de contacto",
				);
			}
			return result.data;
		},
		{
			// Optimistic update
			onMutate: async (variables) => {
				const listQueryKey = queryKeys.contactInfo.list();

				// Cancel outgoing refetches
				await queryClient.cancelQueries({ queryKey: listQueryKey });

				// Snapshot previous value
				const previousList =
					queryClient.getQueryData<ContactInfo[]>(listQueryKey);

				// Optimistically remove the item
				if (previousList) {
					const updatedList = previousList.filter(
						(item) => item.id !== variables.id,
					);
					queryClient.setQueryData(listQueryKey, updatedList);
				}

				return { previousList, listQueryKey };
			},

			// Rollback on error
			onError: (_error, _variables, context) => {
				if (context?.previousList && context?.listQueryKey) {
					queryClient.setQueryData(context.listQueryKey, context.previousList);
				}
			},

			invalidateOn: "contact.delete",
			successMessage: "Información de contacto eliminada exitosamente",
			errorMessage: "Error al eliminar la información de contacto",
		},
	);
}

/**
 * Combined hook for all contact info mutations
 */
export function useContactInfoMutations() {
	const createContactInfo = useCreateContactInfo();
	const updateContactInfo = useUpdateContactInfo();
	const deleteContactInfo = useDeleteContactInfo();

	return {
		createContactInfo,
		updateContactInfo,
		deleteContactInfo,

		// Convenience methods
		isLoading:
			createContactInfo.isPending ||
			updateContactInfo.isPending ||
			deleteContactInfo.isPending,
		isError:
			createContactInfo.isError ||
			updateContactInfo.isError ||
			deleteContactInfo.isError,
		error:
			createContactInfo.error ||
			updateContactInfo.error ||
			deleteContactInfo.error,

		// Legacy method names for backward compatibility
		invalidateContactInfo: () => {
			// This is now handled automatically by the mutations
		},
		clearContactInfoCache: () => {
			// This is now handled automatically by the mutations
		},
	};
}
