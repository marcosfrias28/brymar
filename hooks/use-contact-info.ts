'use client';

import useSWR from 'swr';
import { getContactInfo } from '@/lib/actions/sections-actions';
import { useHydration } from './use-hydration';
import type { ContactInfo } from '@/lib/db/schema';

// SWR fetcher function
const fetcher = () => getContactInfo();

// Hook para obtener información de contacto
export function useContactInfo() {
    const isHydrated = useHydration();

    const { data: contactInfo, error, isLoading, mutate } = useSWR(
        isHydrated ? 'contact-info' : null, // Only fetch when hydrated
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 300000, // 5 minutes deduplication
        }
    );

    // Don't render anything until hydrated to avoid hydration mismatch
    if (!isHydrated) {
        return {
            contactInfo: [],
            loading: true,
            error: null,
            refetch: () => Promise.resolve(),
        };
    }

    return {
        contactInfo: contactInfo || [],
        loading: isLoading,
        error: error?.message || null,
        refetch: () => mutate(),
    };
}

// Hook para obtener información de contacto por tipo
export function useContactInfoByType(type: string) {
    const { contactInfo, loading, error, refetch } = useContactInfo();

    const filteredInfo = contactInfo.filter(info => info.type === type);

    return {
        contactInfo: filteredInfo,
        loading,
        error,
        refetch,
    };
}

// Hook para invalidar cache de información de contacto
export function useContactInfoMutations() {
    const { mutate } = useSWR('contact-info', null, { revalidateOnMount: false });

    return {
        invalidateContactInfo: () => {
            mutate('contact-info');
        },
        clearContactInfoCache: () => {
            mutate('contact-info', undefined);
        },
    };
}

// Funciones helper para obtener información específica
export function getContactInfoByType(
    contactInfo: ContactInfo[],
    type: string
): ContactInfo[] {
    return contactInfo.filter(info => info.type === type && info.isActive !== false);
}

export function getContactInfoValue(
    contactInfo: ContactInfo[],
    type: string,
    fallback: string = ''
): string {
    const info = contactInfo.find(info => info.type === type && info.isActive !== false);
    return info?.value || fallback;
}