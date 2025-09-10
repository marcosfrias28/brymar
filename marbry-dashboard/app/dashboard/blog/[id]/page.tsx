"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit3, Save, X, Eye, Trash2, Calendar, User, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { useLangStore } from "@/utils/store/lang-store"
import { translations } from "@/lib/translations"
import Link from "next/link"

// Mock data generator (same as in blog page)
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
      content: `<h2>Introducción</h2><p>Contenido detallado sobre ${category} inmobiliario en República Dominicana. Este artículo explora las últimas tendencias, oportunidades de inversión y consejos prácticos para el mercado actual.</p><h3>Puntos Clave</h3><ul><li>Análisis del mercado actual</li><li>Oportunidades de inversión</li><li>Consejos para compradores</li><li>Tendencias futuras</li></ul><p>El mercado inmobiliario dominicano continúa mostrando signos de crecimiento sostenido, especialmente en las zonas turísticas y urbanas principales.</p>`,
      author,
      coverImage: `/placeholder.svg?height=400&width=800&query=real-estate-${category}-${i}`,
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

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { language } = useLangStore()
  const t = translations[language]

  const [isEditing, setIsEditing] = useState(false)
  const [post, setPost] = useState(null)
  const [editedPost, setEditedPost] = useState(null)

  useEffect(() => {
    const foundPost = mockPosts.find((p) => p.id === params.id)
    if (foundPost) {
      setPost(foundPost)
      setEditedPost({ ...foundPost })
    }
  }, [params.id])

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-arsenic mb-2">Post no encontrado</h2>
          <p className="text-blackCoral mb-4">El post que buscas no existe o ha sido eliminado.</p>
          <Button asChild>
            <Link href="/dashboard/blog">Volver al Blog</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    setPost({ ...editedPost })
    setIsEditing(false)
    console.log("[v0] Saving post:", editedPost)
  }

  const handleCancel = () => {
    setEditedPost({ ...post })
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm("¿Estás seguro de que quieres eliminar este post?")) {
      console.log("[v0] Deleting post:", post.id)
      router.push("/dashboard/blog")
    }
  }

  const currentData = isEditing ? editedPost : post

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Blog
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-arsenic font-serif">
              {isEditing ? "Editando Post" : currentData.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={currentData.status === "published" ? "default" : "secondary"}>
                {currentData.status === "published" ? "Publicado" : "Borrador"}
              </Badge>
              <Badge variant="outline">{currentData.category}</Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-arsenic hover:bg-blackCoral">
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Imagen de Portada</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="coverImage">URL de Imagen</Label>
                    <Input
                      id="coverImage"
                      value={editedPost.coverImage}
                      onChange={(e) => setEditedPost({ ...editedPost, coverImage: e.target.value })}
                      placeholder="URL de la imagen de portada"
                    />
                  </div>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={editedPost.coverImage || "/placeholder.svg"}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={currentData.coverImage || "/placeholder.svg"}
                    alt={currentData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contenido del Post</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <RichTextEditor
                  content={editedPost.content}
                  onChange={(content) => setEditedPost({ ...editedPost, content })}
                  placeholder="Escribe el contenido del post..."
                />
              ) : (
                <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: currentData.content }} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={editedPost.title}
                      onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="excerpt">Extracto</Label>
                    <Input
                      id="excerpt"
                      value={editedPost.excerpt}
                      onChange={(e) => setEditedPost({ ...editedPost, excerpt: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={editedPost.status}
                      onValueChange={(value) => setEditedPost({ ...editedPost, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={editedPost.category}
                      onValueChange={(value) => setEditedPost({ ...editedPost, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inversiones">Inversiones</SelectItem>
                        <SelectItem value="mercado">Mercado</SelectItem>
                        <SelectItem value="consejos">Consejos</SelectItem>
                        <SelectItem value="desarrollos">Desarrollos</SelectItem>
                        <SelectItem value="noticias">Noticias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-blackCoral">
                    <User className="h-4 w-4" />
                    <span>{currentData.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blackCoral">
                    <Calendar className="h-4 w-4" />
                    <span>{currentData.publishedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blackCoral">
                    <Clock className="h-4 w-4" />
                    <span>{currentData.readTime} min de lectura</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Author & Publishing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Publicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="author">Autor</Label>
                    <Input
                      id="author"
                      value={editedPost.author}
                      onChange={(e) => setEditedPost({ ...editedPost, author: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="publishedDate">Fecha de Publicación</Label>
                    <Input
                      id="publishedDate"
                      type="date"
                      value={editedPost.publishedDate}
                      onChange={(e) => setEditedPost({ ...editedPost, publishedDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="readTime">Tiempo de Lectura (min)</Label>
                    <Input
                      id="readTime"
                      type="number"
                      value={editedPost.readTime}
                      onChange={(e) => setEditedPost({ ...editedPost, readTime: Number(e.target.value) })}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Extracto</Label>
                    <p className="text-sm text-blackCoral leading-relaxed">{currentData.excerpt}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Adicional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-medium text-blackCoral">ID del Post</Label>
                  <p className="text-blackCoral font-mono">{currentData.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
