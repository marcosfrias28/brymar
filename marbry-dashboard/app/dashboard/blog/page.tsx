"use client"

import { useState } from "react"
import { FileText, Calendar, User, PenTool } from "lucide-react"
import { useLangStore } from "@/utils/store/lang-store"
import { translations } from "@/lib/translations"
import { UnifiedPageLayout } from "@/components/shared/unified-page-layout"

const generateMockPosts = () => {
  const categories = ["inversiones", "mercado", "consejos", "desarrollos", "noticias"]
  const authors = [
    "María González",
    "Carlos Rodríguez",
    "Ana Martínez",
    "Roberto Pérez",
    "Sofia López",
    "Diego Herrera",
  ]
  const statuses = ["published", "draft"]

  const posts = []

  for (let i = 1; i <= 89; i++) {
    const category = categories[i % categories.length]
    const author = authors[i % authors.length]
    const status = i % 4 === 0 ? "draft" : "published"

    posts.push({
      id: i.toString(),
      title: `${category === "inversiones" ? "Inversión" : category === "mercado" ? "Mercado" : category === "consejos" ? "Consejos" : category === "desarrollos" ? "Desarrollo" : "Noticia"} Inmobiliaria ${i}: Tendencias y Oportunidades`,
      content: `Contenido detallado sobre ${category} inmobiliario en República Dominicana. Este artículo explora las últimas tendencias, oportunidades de inversión y consejos prácticos para el mercado actual...`,
      author,
      coverImage: `/placeholder.svg?height=300&width=500&query=real-estate-${category}-${i}`,
      publishedDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        .toISOString()
        .split("T")[0],
      status,
      category,
      readTime: Math.floor(Math.random() * 10) + 3,
      excerpt: `Descubre las últimas tendencias en ${category} inmobiliario y cómo aprovechar las oportunidades del mercado dominicano.`,
    })
  }

  return posts
}

const mockPosts = generateMockPosts()

export default function BlogPage() {
  const { language } = useLangStore()
  const t = translations[language]

  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all")

  const filteredByStatus = statusFilter === "all" ? mockPosts : mockPosts.filter((p) => p.status === statusFilter)

  const stats = [
    {
      label: "Total Posts",
      value: mockPosts.length,
      icon: <FileText className="h-5 w-5" />,
      color: "text-arsenic",
    },
    {
      label: "Publicados",
      value: mockPosts.filter((p) => p.status === "published").length,
      icon: <Calendar className="h-5 w-5" />,
      color: "text-green-600",
    },
    {
      label: "Borradores",
      value: mockPosts.filter((p) => p.status === "draft").length,
      icon: <PenTool className="h-5 w-5" />,
      color: "text-orange-600",
    },
    {
      label: "Autores",
      value: new Set(mockPosts.map((p) => p.author)).size,
      icon: <User className="h-5 w-5" />,
      color: "text-blue-600",
    },
  ]

  const quickFilters = [
    {
      label: "Inversiones",
      count: mockPosts.filter((p) => p.category === "inversiones").length,
      active: false,
      onClick: () => {},
    },
    {
      label: "Mercado",
      count: mockPosts.filter((p) => p.category === "mercado").length,
      active: false,
      onClick: () => {},
    },
    {
      label: "Consejos",
      count: mockPosts.filter((p) => p.category === "consejos").length,
      active: false,
      onClick: () => {},
    },
    {
      label: "Desarrollos",
      count: mockPosts.filter((p) => p.category === "desarrollos").length,
      active: false,
      onClick: () => {},
    },
  ]

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

  return (
    <UnifiedPageLayout
      title={t.blog}
      stats={stats}
      items={filteredByStatus}
      itemType="blog"
      searchPlaceholder={`${t.search} posts...`}
      addNewHref="/dashboard/blog/new"
      addNewLabel={t.addPost}
      quickFilters={quickFilters}
      statusFilters={statusFilters}
    />
  )
}
