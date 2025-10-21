"use client";

import { UnifiedList, FilterOption } from "../lists/unified-list";
import { BlogCard } from "./blog-card";
import { useRouter } from "next/navigation";
import { BlogPost } from "@/lib/types/blog";

interface BlogListProps {
  posts: BlogPost[];
  isLoading?: boolean;
  error?: string;
  showActions?: boolean;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
}

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
  showActions = true,
  onSearch,
  onFilter,
}: BlogListProps) {
  const router = useRouter();

  const handleEdit = (id: string) => {
    router.push(`/dashboard/blog/${id}/edit`);
  };

  const handleView = (id: string) => {
    router.push(`/dashboard/blog/${id}`);
  };

  const handleDelete = (id: string) => {
    // The deletion is handled by the BlogCard component
    console.log("Blog post deleted:", id);
  };

  const handleAdd = () => {
    router.push("/dashboard/blog/new");
  };

  return (
    <UnifiedList
      title="Posts del Blog"
      items={posts}
      renderItem={(post) => (
        <BlogCard
          key={post.id}
          post={post}
          showActions={showActions}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      )}
      isLoading={isLoading}
      error={error}
      filters={blogFilters}
      searchPlaceholder="Buscar posts..."
      showAddButton={showActions}
      addButtonText="Nuevo Post"
      onAdd={handleAdd}
      onSearch={onSearch}
      onFilter={onFilter}
      emptyMessage="No se encontraron posts"
      emptyDescription="Intenta ajustar los filtros o agrega un nuevo post"
    />
  );
}
