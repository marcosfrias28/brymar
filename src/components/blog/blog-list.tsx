"use client";

import { useRouter } from "next/navigation";
import type { BlogPost } from "@/lib/types/blog";
import { type FilterOption, UnifiedList } from "../lists/unified-list";
import { BlogCard } from "./blog-card";

type BlogListProps = {
	posts: BlogPost[];
	isLoading?: boolean;
	error?: string;
    showActions?: boolean;
	onSearch?: (query: string) => void;
	onFilter?: (filters: Record<string, any>) => void;
};

const blogFilters: FilterOption[] = [
	{
		key: "category",
		label: "Categoría",
		type: "select",
		placeholder: "Todas las categorías",
		options: [
			{ value: "property-news", label: "Noticias de Propiedades" },
			{ value: "market-analysis", label: "Análisis de Mercado" },
			{ value: "investment-tips", label: "Consejos de Inversión" },
			{ value: "legal-advice", label: "Asesoría Legal" },
			{ value: "home-improvement", label: "Mejoras del Hogar" },
			{ value: "general", label: "General" },
		],
	},
	{
		key: "status",
		label: "Estado",
		type: "select",
		placeholder: "Todos los estados",
		options: [
			{ value: "published", label: "Publicado" },
			{ value: "draft", label: "Borrador" },
			{ value: "archived", label: "Archivado" },
		],
	},
];

export function BlogList({
    posts,
    isLoading,
    error,
    showActions = false,
    onSearch,
    onFilter,
}: BlogListProps) {
	const router = useRouter();

    const handleEdit = (_id: string) => {};

	const handleView = (id: string) => {
		router.push(`/dashboard/blog/${id}`);
	};

	const handleDelete = (_id: string) => {};

    const handleAdd = () => {};

	return (
        <UnifiedList
            addButtonText=""
			emptyDescription="Intenta ajustar los filtros o agrega un nuevo post"
			emptyMessage="No se encontraron posts"
			error={error}
			filters={blogFilters}
			isLoading={isLoading}
			items={posts}
            onAdd={undefined}
			onFilter={onFilter}
			onSearch={onSearch}
			renderItem={(post) => (
				<BlogCard
					key={post.id}
					onDelete={handleDelete}
            onEdit={undefined}
					onView={handleView}
					post={post}
					showActions={showActions}
				/>
			)}
			searchPlaceholder="Buscar posts..."
            showAddButton={false}
			title="Posts del Blog"
		/>
	);
}
