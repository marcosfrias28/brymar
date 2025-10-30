"use client";

import { useCallback, useEffect, useState } from "react";
import { getFeaturedProperties } from "@/lib/actions/property-actions";

// Use the database schema type instead of the domain type to avoid casting issues
type DatabaseProperty = {
	id: string;
	title: string;
	description: string;
	price: number;
	currency: string;
	address: any;
	type: string;
	features: any;
	images: any;
	status: string;
	featured: boolean | null;
	userId: string;
	publishedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
};

export type UseFeaturedPropertiesReturn = {
	properties: DatabaseProperty[];
	loading: boolean;
	error: string | null;
	refreshFeaturedProperties: () => Promise<void>;
};

export const useFeaturedProperties = (
	limit = 6
): UseFeaturedPropertiesReturn => {
	const [properties, setProperties] = useState<DatabaseProperty[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchFeaturedProperties = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const result = await getFeaturedProperties(limit);
			setProperties(result);
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Error loading featured properties";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	}, [limit]);

	const refreshFeaturedProperties = useCallback(async () => {
		await fetchFeaturedProperties();
	}, [fetchFeaturedProperties]);

	useEffect(() => {
		fetchFeaturedProperties();
	}, [fetchFeaturedProperties]);

	return {
		properties,
		loading,
		error,
		refreshFeaturedProperties,
	};
};
