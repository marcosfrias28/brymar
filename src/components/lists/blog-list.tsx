"use client";

import { UnifiedList, FilterOption } from "./unified-list";
import { BlogCard } from "../cards/blog-card";
import { useRouter } from "next/navigation";

interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  author: string;
  category: string;
  publishedAt?: string;
  readTime?: number;
  coverImage?: string;
  status?: string;
}

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
      { value: "market-analysis", label: "Análisis de Mercado" },
      { value: "investment-tips", label: "Consejos de Inversión" },
      { value: "property-news", label: "Noticias de Propiedades" },
      { value: "legal-advice", label: "Asesoría Legal" },
      { value: "lifestyle", label: "Estilo de Vida" },
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
    ],
  },
  {
    key: "author",
    label: "Autor",
    type: "search",
    placeholder: "Buscar por autor",
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
