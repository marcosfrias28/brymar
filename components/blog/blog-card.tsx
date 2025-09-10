"use client"

import { Calendar, User, Clock, Eye, Edit, Trash2 } from "lucide-react"
import { useLangStore } from "@/utils/store/lang-store"
import { translations } from "@/lib/translations"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface BlogPost {
  id: string
  title: string
  content: string
  author: string
  coverImage: string
  publishedDate: string
  status: "published" | "draft"
  category: string
  readTime: number
  excerpt: string
}

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  const { language } = useLangStore()
  const t = translations[language]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusLabel = (status: string) => {
    return status === "published" ? "Publicado" : "Borrador"
  }

  const getStatusBadgeColor = (status: string) => {
    return status === "published"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-yellow-100 text-yellow-800 border-yellow-200"
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      inversiones: "Inversiones",
      mercado: "Mercado",
      consejos: "Consejos",
      desarrollos: "Desarrollos",
      noticias: "Noticias",
    }
    return labels[category as keyof typeof labels] || category
  }

  return (
    <Card className="border-black-coral shadow-lg hover:shadow-xl transition-all duration-300 group">
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <Image
          src={post.coverImage || "/placeholder.svg"}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={getStatusBadgeColor(post.status)}>{getStatusLabel(post.status)}</Badge>
          <Badge className="bg-arsenic text-white">{getCategoryLabel(post.category)}</Badge>
        </div>
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white text-arsenic">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-black-coral">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/blog/${post.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  {t.blogForm.view}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/blog/${post.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t.blogForm.edit}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                {t.blogForm.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-arsenic text-lg mb-2 line-clamp-2 leading-tight">{post.title}</h3>

        {/* Excerpt */}
        <p className="text-black-coral/70 text-sm mb-3 line-clamp-3">{post.excerpt}</p>

        {/* Meta Information */}
        <div className="space-y-2 text-sm text-black-coral">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{post.readTime} min</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.publishedDate)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full bg-arsenic hover:bg-black-coral text-white">
          <Link href={`/dashboard/blog/${post.id}`}>Leer Más</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
