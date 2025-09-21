"use client"

import { useState, useMemo } from "react"
import { FileText, Calendar, User, PenTool } from "lucide-react"

import { UnifiedPageLayout } from "@/components/shared/unified-page-layout"
import { useBlogPosts } from "@/hooks/use-blog"
import { RouteGuard } from "@/components/auth/route-guard"


export default function BlogPage() {
  const { blogPosts, loading, error, refreshBlogPosts } = useBlogPosts()

  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all")

  const filteredByStatus = useMemo(() => {
    if (!blogPosts) return []
    return statusFilter === "all" ? blogPosts : blogPosts.filter((p: any) => p.status === statusFilter)
  }, [blogPosts, statusFilter])

  const stats = useMemo(() => {
    if (!blogPosts) return []
    return [
      {
        label: "Total Posts",
        value: blogPosts.length,
        icon: <FileText className="h-5 w-5" />,
        color: "text-arsenic",
      },
      {
        label: "Publicados",
        value: blogPosts.filter((p: any) => p.status === "published").length,
        icon: <Calendar className="h-5 w-5" />,
        color: "text-green-600",
      },
      {
        label: "Borradores",
        value: blogPosts.filter((p: any) => p.status === "draft").length,
        icon: <PenTool className="h-5 w-5" />,
        color: "text-orange-600",
      },
      {
        label: "Autores",
        value: new Set(blogPosts.map((p: any) => p.author)).size,
        icon: <User className="h-5 w-5" />,
        color: "text-blue-600",
      },
    ]
  }, [blogPosts])

  const quickFilters = useMemo(() => {
    if (!blogPosts) return []
    return [
      {
        label: "Inversiones",
        count: blogPosts.filter((p: any) => p.category === "investment-tips").length,
        active: false,
        onClick: () => {},
      },
      {
        label: "Mercado",
        count: blogPosts.filter((p: any) => p.category === "market-analysis").length,
        active: false,
        onClick: () => {},
      },
      {
        label: "Consejos",
        count: blogPosts.filter((p: any) => p.category === "legal-advice").length,
        active: false,
        onClick: () => {},
      },
      {
        label: "Noticias",
        count: blogPosts.filter((p: any) => p.category === "property-news").length,
        active: false,
        onClick: () => {},
      },
    ]
  }, [blogPosts])

  const statusFilters = [
    { label: "Todos", value: "all", active: statusFilter === "all", onClick: () => setStatusFilter("all") },
    {
      label: "Publicados",
      value: "published",
      active: statusFilter === "published",
      onClick: () => setStatusFilter("published"),
    },
    { label: "Borradores", value: "draft", active: statusFilter === "draft", onClick: () => setStatusFilter("draft") },
  ]

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-600">Error al cargar los posts: {error}</p>
        <button
          onClick={refreshBlogPosts}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <RouteGuard requiredPermission="blog.manage">
      <UnifiedPageLayout
        title="Gestión del Blog"
        stats={stats}
        items={filteredByStatus}
        itemType="blog"
        searchPlaceholder="Buscar posts..."
        addNewHref="/dashboard/blog/new"
        addNewLabel="Agregar Post"
        quickFilters={quickFilters}
        statusFilters={statusFilters}
      />
    </RouteGuard>
  )
}