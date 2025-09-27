'use client';

import { useStaticQuery } from './use-base-query';
import { queryKeys } from '@/lib/query/keys';
import { getContactInfo, getContactInfoById } from '@/lib/actions/sections-actions';
import type { ContactInfo } from '@/lib/db/schema';

/**
 * Hook to fetch all contact information
 */
export function useContactInfo(options?: {
    enabled?: boolean;
    showErrorToast?: boolean;
}) {
    return useStaticQuery(
        queryKeys.contactInfo.list(),
        () => getContactInfo(),
        {
            enabled: options?.enabled !== false,
            showErrorToast: options?.showErrorToast ?? false,
            errorMessage: 'Error al cargar la información de contacto',
        }
    );
}

/**
 * Hook to fetch contact info by type
 */
export function useContactInfoByType(type: string, options?: {
    enabled?: boolean;
    showErrorToast?: boolean;
}) {
    const { data: allContactInfo, ...query } = useContactInfo(options);

    const contactInfo = allContactInfo?.filter(info => info.type === type) || [];

    return {
        ...query,
        data: contactInfo,
        contactInfo, // Alias for backward compatibility
    };
}

/**
 * Hook to fetch a specific contact info by ID
 */
export function useContactInfoById(id: number, options?: {
    enabled?: boolean;
    showErrorToast?: boolean;
}) {
    return useStaticQuery(
        queryKeys.contactInfo.detail(id),
        () => getContactInfoById(id),
        {
            enabled: options?.enabled !== false && !!id,
            showErrorToast: options?.showErrorToast ?? false,
            errorMessage: `Error al cargar la información de contacto con ID ${id}`,
        }
    );
}

/**
 * Hook to get contact info value by type (convenience method)
 */
export function useContactInfoValue(type: string, fallback: string = '') {
    const { data: contactInfo } = useContactInfoByType(type);

    const info = contactInfo?.[0]; // Get first item of this type
    return info?.value || fallback;
}

/**
 * Hook to get multiple contact info values
 */
export function useContactInfoValues(types: string[]) {
    const { data: allContactInfo, ...query } = useContactInfo();

    const values = types.reduce((acc, type) => {
        const info = allContactInfo?.find(item => item.type === type);
        acc[type] = info?.value || '';
        return acc;
    }, {} as Record<string, string>);

    return {
        ...query,
        data: values,
        values, // Alias for backward compatibility
    };
}

// Helper functions (maintaining backward compatibility)
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