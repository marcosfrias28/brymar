'use client';

import { useCreateMutation, useUpdateMutation, useDeleteMutation } from './use-base-mutation';
import {
    createPageSection,
    updatePageSection,
    deletePageSection
} from '@/lib/actions/sections-actions';
import { queryKeys } from '@/lib/query/keys';
import { optimisticUpdate, rollbackOptimisticUpdate } from '@/lib/query/invalidation';
import { useQueryClient } from '@tanstack/react-query';
import type { PageSection } from '@/lib/db/schema';

// Types for section mutations
export interface CreateSectionData {
    page: string;
    section: string;
    title?: string;
    subtitle?: string;
    description?: string;
    content?: Record<string, any>;
    images?: string[];
    settings?: Record<string, any>;
    isActive?: boolean;
    order?: number;
}

export interface UpdateSectionData extends CreateSectionData {
    id: number;
}

/**
 * Hook for creating page sections
 */
export function useCreateSection() {
    return useCreateMutation(
        async (data: CreateSectionData) => {
            console.log('Creating section with data:', data);

            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (key === 'content' || key === 'settings') {
                        // These should be objects, stringify them
                        formData.append(key, JSON.stringify(value));
                    } else if (key === 'images' && Array.isArray(value)) {
                        // Images should be an array, stringify it
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });

            console.log('FormData entries:');
            for (const [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            const result = await createPageSection(formData);
            console.log('Create result:', result);

            if (!result.success) {
                throw new Error(result.error || 'Error al crear la sección');
            }
            return result.data;
        },
        {
            invalidateOn: 'section.create',
            invalidationContext: (variables) => ({
                page: variables.page,
            }),
            successMessage: 'Sección creada exitosamente',
            errorMessage: 'Error al crear la sección',
        }
    );
}

/**
 * Hook for updating page sections
 */
export function useUpdateSection() {
    const queryClient = useQueryClient();

    return useUpdateMutation(
        async (data: UpdateSectionData) => {
            console.log('Updating section with data:', data);

            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (key === 'content' || key === 'settings') {
                        // These should be objects, stringify them
                        formData.append(key, JSON.stringify(value));
                    } else if (key === 'images' && Array.isArray(value)) {
                        // Images should be an array, stringify it
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });

            console.log('FormData entries:');
            for (const [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            const result = await updatePageSection(formData);
            console.log('Update result:', result);

            if (!result.success) {
                throw new Error(result.error || 'Error al actualizar la sección');
            }
            return result.data;
        },
        {
            // Optimistic update
            onMutate: async (variables) => {
                const queryKey = queryKeys.sections.page(variables.page);

                // Cancel outgoing refetches
                await queryClient.cancelQueries({ queryKey });

                // Snapshot previous value
                const previousSections = queryClient.getQueryData<PageSection[]>(queryKey);

                // Optimistically update
                if (previousSections) {
                    const updatedSections = previousSections.map(section =>
                        section.id === variables.id
                            ? { ...section, ...variables, updatedAt: new Date() }
                            : section
                    );
                    queryClient.setQueryData(queryKey, updatedSections);
                }

                return { previousSections, queryKey };
            },

            // Rollback on error
            onError: (error, variables, context) => {
                if (context?.previousSections && context?.queryKey) {
                    queryClient.setQueryData(context.queryKey, context.previousSections);
                }
            },

            invalidateOn: 'section.update',
            invalidationContext: (variables) => ({
                page: variables.page,
                sectionName: variables.section,
            }),
            successMessage: 'Sección actualizada exitosamente',
            errorMessage: 'Error al actualizar la sección',
        }
    );
}

/**
 * Hook for deleting page sections
 */
export function useDeleteSection() {
    const queryClient = useQueryClient();

    return useDeleteMutation(
        async (data: { id: number; page: string }) => {
            const formData = new FormData();
            formData.append('id', String(data.id));

            const result = await deletePageSection(formData);
            if (!result.success) {
                throw new Error(result.error || 'Error al eliminar la sección');
            }
            return result.data;
        },
        {
            // Optimistic update
            onMutate: async (variables) => {
                const queryKey = queryKeys.sections.page(variables.page);

                // Cancel outgoing refetches
                await queryClient.cancelQueries({ queryKey });

                // Snapshot previous value
                const previousSections = queryClient.getQueryData<PageSection[]>(queryKey);

                // Optimistically remove the section
                if (previousSections) {
                    const updatedSections = previousSections.filter(
                        section => section.id !== variables.id
                    );
                    queryClient.setQueryData(queryKey, updatedSections);
                }

                return { previousSections, queryKey };
            },

            // Rollback on error
            onError: (error, variables, context) => {
                if (context?.previousSections && context?.queryKey) {
                    queryClient.setQueryData(context.queryKey, context.previousSections);
                }
            },

            invalidateOn: 'section.delete',
            invalidationContext: (variables) => ({
                page: variables.page,
            }),
            successMessage: 'Sección eliminada exitosamente',
            errorMessage: 'Error al eliminar la sección',
        }
    );
}

/**
 * Combined hook for all section mutations
 */
export function useSectionMutations() {
    const createSection = useCreateSection();
    const updateSection = useUpdateSection();
    const deleteSection = useDeleteSection();

    return {
        createSection,
        updateSection,
        deleteSection,

        // Convenience methods
        isLoading: createSection.isPending || updateSection.isPending || deleteSection.isPending,
        isError: createSection.isError || updateSection.isError || deleteSection.isError,
        error: createSection.error || updateSection.error || deleteSection.error,
    };
}

/**
 * Hook for batch section operations
 */
export function useBatchSectionMutations() {
    const queryClient = useQueryClient();

    const batchUpdateSections = useUpdateMutation(
        async (data: { page: string; sections: UpdateSectionData[] }) => {
            const results = await Promise.all(
                data.sections.map(async (section) => {
                    const formData = new FormData();
                    Object.entries(section).forEach(([key, value]) => {
                        if (value !== undefined) {
                            if (typeof value === 'object') {
                                formData.append(key, JSON.stringify(value));
                            } else {
                                formData.append(key, String(value));
                            }
                        }
                    });

                    const result = await updatePageSection(formData);
                    if (!result.success) {
                        throw new Error(result.error || `Error al actualizar la sección ${section.section}`);
                    }
                    return result.data;
                })
            );

            return results;
        },
        {
            invalidateOn: 'section.update',
            invalidationContext: (variables) => ({
                page: variables.page,
            }),
            successMessage: (data, variables) =>
                `${variables.sections.length} secciones actualizadas exitosamente`,
            errorMessage: 'Error al actualizar las secciones',
        }
    );

    return {
        batchUpdateSections,
    };
}