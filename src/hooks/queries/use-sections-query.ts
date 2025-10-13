'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useBaseQuery, useStaticQuery } from './use-base-query';
import { queryKeys } from '@/lib/query/keys';
import { getPageSections, getPageSection } from '@/lib/actions/sections-actions';
import type { PageSection } from '@/lib/db/schema';

/**
 * Hook to fetch all sections for a specific page
 */
export function useSections(page: string, options?: {
    enabled?: boolean;
    showErrorToast?: boolean;
}) {
    return useStaticQuery(
        queryKeys.sections.page(page),
        () => getPageSections(page),
        {
            enabled: options?.enabled !== false && !!page,
            showErrorToast: options?.showErrorToast ?? false, // Don't show error toast for sections by default
            errorMessage: `Error al cargar las secciones de la página ${page}`,
        }
    );
}

/**
 * Hook to fetch a specific section from a page
 */
export function useSection(page: string, sectionName: string, options?: {
    enabled?: boolean;
    showErrorToast?: boolean;
}) {
    return useStaticQuery(
        queryKeys.sections.section(page, sectionName),
        () => getPageSection(page, sectionName),
        {
            enabled: options?.enabled !== false && !!page && !!sectionName,
            showErrorToast: options?.showErrorToast ?? false,
            errorMessage: `Error al cargar la sección ${sectionName}`,
        }
    );
}

/**
 * Hook to get all sections and find a specific one
 * This is more efficient when you need multiple sections from the same page
 */
export function useSectionFromPage(page: string, sectionName: string, options?: {
    enabled?: boolean;
    showErrorToast?: boolean;
}) {
    const { data: sections, ...query } = useSections(page, options);

    const section = sections?.find(s => s.section === sectionName) || null;

    return {
        ...query,
        data: section,
        section, // Alias for backward compatibility
    };
}

/**
 * Hook to get multiple specific sections from a page
 */
export function useMultipleSections(page: string, sectionNames: string[], options?: {
    enabled?: boolean;
    showErrorToast?: boolean;
}) {
    const { data: allSections, ...query } = useSections(page, options);

    const sections = sectionNames.reduce((acc, name) => {
        const section = allSections?.find(s => s.section === name) || null;
        acc[name] = section;
        return acc;
    }, {} as Record<string, PageSection | null>);

    return {
        ...query,
        data: sections,
        sections, // Alias for backward compatibility
    };
}

// Helper functions (maintaining backward compatibility)
export function getSectionContent(
    section: PageSection | null,
    field: 'title' | 'subtitle' | 'description',
    fallback: string = ''
): string {
    if (!section || section.isActive === false) {
        return fallback;
    }

    const value = section[field];
    return (typeof value === 'string' && value.trim() !== '') ? value : fallback;
}

export function getSectionSetting(
    section: PageSection | null,
    key: string,
    fallback: any = null
): any {
    if (!section || section.isActive === false || !section.settings) {
        return fallback;
    }

    const settings = section.settings as Record<string, any>;
    return settings[key] ?? fallback;
}

export function getSectionCustomContent(
    section: PageSection | null,
    key: string,
    fallback: any = null
): any {
    if (!section || section.isActive === false || !section.content) {
        return fallback;
    }

    const content = section.content as Record<string, any>;
    return content[key] ?? fallback;
}

/**
 * Hook for prefetching sections (useful for navigation)
 */
export function usePrefetchSections() {
    const queryClient = useQueryClient();

    const prefetchPageSections = async (page: string) => {
        await queryClient.prefetchQuery({
            queryKey: queryKeys.sections.page(page),
            queryFn: () => getPageSections(page),
            staleTime: 15 * 60 * 1000, // 15 minutes
        });
    };

    return { prefetchPageSections };
}

// Re-export for backward compatibility
export { useSections as usePageSections };
export { useSection as usePageSection };