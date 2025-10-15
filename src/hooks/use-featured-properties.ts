'use client'

import { useState, useEffect } from 'react'
import { getFeaturedProperties } from '@/lib/actions/property-actions';
import { PropertySearchResult } from '@/presentation/hooks/use-properties'

export interface UseFeaturedPropertiesReturn {
    properties: PropertySearchResult[]
    loading: boolean
    error: string | null
    refreshFeaturedProperties: () => Promise<void>
}

export const useFeaturedProperties = (limit = 6): UseFeaturedPropertiesReturn => {
    const [properties, setProperties] = useState<PropertySearchResult[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchFeaturedProperties = async () => {
        try {
            setLoading(true)
            setError(null)

            const result = await getFeaturedProperties(limit)
            setProperties(result as unknown as PropertySearchResult[])
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error loading featured properties'
            setError(errorMessage)
            console.error('Error fetching featured properties:', err)
        } finally {
            setLoading(false)
        }
    }

    const refreshFeaturedProperties = async () => {
        await fetchFeaturedProperties()
    }

    useEffect(() => {
        fetchFeaturedProperties()
    }, [limit])

    return {
        properties,
        loading,
        error,
        refreshFeaturedProperties,
    }
}