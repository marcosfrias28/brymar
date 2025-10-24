"use client";

import { useEffect, useState } from "react";

// Static blog categories
export interface StaticCategory {
	id: string;
	name: string;
	slug: string;
	description: string;
	isActive: boolean;
}

const STATIC_CATEGORIES: StaticCategory[] = [
	{
		id: "property-news",
		name: "Noticias Inmobiliarias",
		slug: "property-news",
		description: "Últimas noticias del mercado inmobiliario",
		isActive: true,
	},
	{
		id: "market-analysis",
		name: "Análisis de Mercado",
		slug: "market-analysis",
		description: "Análisis profundo del mercado inmobiliario",
		isActive: true,
	},
	{
		id: "investment-tips",
		name: "Consejos de Inversión",
		slug: "investment-tips",
		description: "Tips para invertir en bienes raíces",
		isActive: true,
	},
	{
		id: "legal-advice",
		name: "Asesoría Legal",
		slug: "legal-advice",
		description: "Consejos legales para transacciones inmobiliarias",
		isActive: true,
	},
	{
		id: "home-improvement",
		name: "Mejoras del Hogar",
		slug: "home-improvement",
		description: "Ideas para mejorar y valorizar tu propiedad",
		isActive: true,
	},
	{
		id: "general",
		name: "General",
		slug: "general",
		description: "Artículos generales sobre bienes raíces",
		isActive: true,
	},
];

interface UseCategoriesReturn {
	categories: StaticCategory[];
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
	const [categories, setCategories] = useState<StaticCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchCategories = async () => {
		try {
			setLoading(true);
			setError(null);

			// Simulate async loading for consistency
			await new Promise((resolve) => setTimeout(resolve, 100));

			setCategories(STATIC_CATEGORIES.filter((cat) => cat.isActive));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error desconocido");
			console.error("Error al cargar las categorías:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	const refetch = async () => {
		await fetchCategories();
	};

	return {
		categories,
		loading,
		error,
		refetch,
	};
}

// Helper functions
export function getCategoryBySlug(slug: string): StaticCategory | undefined {
	return STATIC_CATEGORIES.find((cat) => cat.slug === slug && cat.isActive);
}

export function getCategoryById(id: string): StaticCategory | undefined {
	return STATIC_CATEGORIES.find((cat) => cat.id === id && cat.isActive);
}

export function getAllCategories(): StaticCategory[] {
	return STATIC_CATEGORIES.filter((cat) => cat.isActive);
}

export default useCategories;
