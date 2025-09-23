'use client';

import useSWR from 'swr';
import { getPageSections } from '@/lib/actions/sections-actions';
import { useHydration } from './use-hydration';
import type { PageSection } from '@/lib/db/schema';

// SWR fetcher function
const fetcher = (page: string) => getPageSections(page);

// Hook para obtener todas las secciones de una página
export function useSections(page: string) {
    const isHydrated = useHydration();

    const { data: sections, error, isLoading, mutate } = useSWR(
        isHydrated ? `sections-${page}` : null, // Only fetch when hydrated
        () => fetcher(page),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 300000, // 5 minutes deduplication
        }
    );

    // Don't render anything until hydrated to avoid hydration mismatch
    if (!isHydrated) {
        return {
            sections: [],
            loading: true,
            error: null,
            refetch: () => Promise.resolve(),
        };
    }

    return {
        sections: sections || [],
        loading: isLoading,
        error: error?.message || null,
        refetch: () => mutate(),
    };
}

// Hook para obtener una sección específica
export function useSection(page: string, sectionName: string) {
    const { sections, loading, error, refetch } = useSections(page);

    const section = sections.find(s => s.section === sectionName) || null;

    return {
        section,
        loading,
        error,
        refetch,
    };
}

// Hook para invalidar cache cuando se actualiza una sección
export function useSectionMutations() {
    const { mutate } = useSWR(`sections-home`, null, { revalidateOnMount: false });

    return {
        invalidatePageCache: (page: string) => {
            // Invalidate SWR cache for this page
            mutate(`sections-${page}`);
        },
        clearAllCache: () => {
            // Clear all SWR cache
            mutate(() => true);
        },
        clearPageCache: (page: string) => {
            // Clear specific page cache
            mutate(`sections-${page}`, undefined);
        },
    };
}

// Funciones helper (mantienen la misma API que antes)
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