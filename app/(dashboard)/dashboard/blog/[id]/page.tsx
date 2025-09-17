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

import { useBlogPost, BlogPost } from "@/hooks/use-blog"
import Link from "next/link"


export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()

  // Verificar que params y params.id existan
  if (!params || !params.id) {
    return <div>Error: ID de blog no encontrado</div>
  }

  const { blogPost, loading, error, updateBlogPost, deleteBlogPost, updateState, isUpdating } = useBlogPost(params.id as string)

  const [isEditing, setIsEditing] = useState(false)
  const [editedPost, setEditedPost] = useState<Partial<BlogPost> | null>(null)

  useEffect(() => {
    if (blogPost) {
      setEditedPost({ ...blogPost })
    }
  }, [blogPost])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-arsenic mb-2">Cargando...</h2>
        </div>
      </div>
    )
  }

  if (error || !blogPost) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-arsenic mb-2">Post no encontrado</h2>
          <p className="text-blackCoral mb-4">{error || "El post que buscas no existe o ha sido eliminado."}</p>
          <Button asChild>
            <Link href="/dashboard/blog">Volver al Blog</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    if (editedPost && blogPost) {
      const formData = new FormData()
      formData.append('title', editedPost.title || blogPost.title)
      formData.append('content', editedPost.content || blogPost.content)
      formData.append('author', editedPost.author || blogPost.author)
      formData.append('status', (editedPost.status || blogPost.status) as string)
      formData.append('category', (editedPost.category || blogPost.category) as string)
      
      updateBlogPost(formData)
    }
  }

  useEffect(() => {
    if (updateState?.success) {
      setIsEditing(false)
    }
  }, [updateState])

  const handleCancel = () => {
    setEditedPost({ ...blogPost })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar este post?")) {
      const success = await deleteBlogPost()
      if (success) {
        router.push('/dashboard/blog')
      }
    }
  }

  const currentData = isEditing ? editedPost : blogPost

  if (!currentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Cargando...</h2>
        </div>
      </div>
    )
  }

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
              <Button size="sm" onClick={handleSave} disabled={isUpdating} className="bg-arsenic hover:bg-blackCoral">
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? 'Guardando...' : 'Guardar'}
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
                      value={editedPost?.image || ''}
                      onChange={(e) => editedPost && setEditedPost({ ...editedPost, image: e.target.value })}
                      placeholder="URL de la imagen de portada"
                    />
                  </div>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={editedPost?.image || "/placeholder.svg"}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={currentData.image || "/placeholder.svg"}
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
                  content={editedPost?.content || ''}
                  onChange={(content) => editedPost && setEditedPost({ ...editedPost, content })}
                  placeholder="Escribe el contenido del post..."
                />
              ) : (
                <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: currentData.content || '' }} />
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
                      value={editedPost?.title || ''}
                      onChange={(e) => editedPost && setEditedPost({ ...editedPost, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select
                       value={editedPost?.status || ''}
                       onValueChange={(value: 'draft' | 'published') => editedPost && setEditedPost({ ...editedPost, status: value })}
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
                       value={editedPost?.category || ''}
                       onValueChange={(value: 'market-analysis' | 'investment-tips' | 'property-news' | 'legal-advice' | 'lifestyle') => editedPost && setEditedPost({ ...editedPost, category: value })}
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
                    <span>{new Date(currentData.createdAt || '').toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blackCoral">
                    <Clock className="h-4 w-4" />
                    <span>{currentData.readingTime} min de lectura</span>
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
                      value={editedPost?.author || ''}
                      onChange={(e) => editedPost && setEditedPost({ ...editedPost, author: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="publishedDate">Fecha de Publicación</Label>
                    <Input
                      id="publishedDate"
                      type="date"
                      value={editedPost?.createdAt ? new Date(editedPost.createdAt).toISOString().split('T')[0] : ''}
                  onChange={(e) => editedPost && setEditedPost({ ...editedPost, createdAt: new Date(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="readTime">Tiempo de Lectura (min)</Label>
                    <Input
                      id="readTime"
                      type="number"
                      value={editedPost?.readingTime || 0}
                  onChange={(e) => editedPost && setEditedPost({ ...editedPost, readingTime: Number(e.target.value) })}
                    />
                  </div>
                </>
              ) : (
<div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Fecha de creación</Label>
                    <p className="text-sm text-blackCoral leading-relaxed">{new Date(currentData.createdAt || '').toLocaleDateString()}</p>
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