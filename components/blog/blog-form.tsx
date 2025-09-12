"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { X, FileText, Eye, Upload } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface BlogFormData {
  title: string
  content: string
  author: string
  category: string
  excerpt: string
  coverImage: File | null
  status: "draft" | "published"
  readTime: string
}

interface BlogFormProps {
  initialData?: Partial<BlogFormData>
  isEditing?: boolean
}

export function BlogForm({ initialData, isEditing = false }: BlogFormProps) {
  const router = useRouter()


  const [formData, setFormData] = useState<BlogFormData>({
    title: initialData?.title || "",
    content: initialData?.content || "",
    author: initialData?.author || "",
    category: initialData?.category || "",
    excerpt: initialData?.excerpt || "",
    coverImage: initialData?.coverImage || null,
    status: initialData?.status || "draft",
    readTime: initialData?.readTime || "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)

  const handleInputChange = (field: keyof BlogFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("La imagen es demasiado grande (máx. 5MB)")
        return
      }

      setFormData((prev) => ({ ...prev, coverImage: file }))

      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const calculateReadTime = () => {
    const wordsPerMinute = 200
    const wordCount = formData.content.replace(/<[^>]*>/g, "").split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  const handleSubmit = async (e: React.FormEvent, saveAs: "draft" | "published") => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validación básica
      if (!formData.title || !formData.content || !formData.author) {
        toast.error("Por favor completa todos los campos obligatorios")
        return
      }

      // Actualizar estado y tiempo de lectura
      const updatedData = {
        ...formData,
        status: saveAs,
        readTime: calculateReadTime().toString(),
      }

      // Simular guardado (en una app real sería una llamada a API)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const action = isEditing ? "actualizado" : "creado"
      const statusText = saveAs === "published" ? "y publicado" : "como borrador"
      toast.success(`Post ${action} ${statusText} exitosamente`)

      router.push("/dashboard/blog")
    } catch (error) {
      toast.error("Error al guardar el post")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-blackCoral shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-arsenic text-lg">Información del Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-arsenic text-sm font-medium">
                  Título del Post *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ej: Guía para Invertir en Bienes Raíces 2024"
                  className="mt-1 border-blackCoral focus:ring-arsenic text-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="author" className="text-arsenic text-sm font-medium">
                    Autor *
                  </Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => handleInputChange("author", e.target.value)}
                    placeholder="Nombre del autor"
                    className="mt-1 border-blackCoral focus:ring-arsenic"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-arsenic text-sm font-medium">
                    Categoría
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className="mt-1 border-blackCoral">
                      <SelectValue placeholder="Categoría" />
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

                <div>
                  <Label className="text-arsenic text-sm font-medium">Tiempo de Lectura</Label>
                  <div className="h-10 px-3 py-2 mt-1 border border-blackCoral rounded-md bg-muted flex items-center text-blackCoral text-sm">
                    {calculateReadTime()} min
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt" className="text-arsenic text-sm font-medium">
                  Resumen
                </Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange("excerpt", e.target.value)}
                  placeholder="Breve descripción del contenido del post..."
                  rows={3}
                  className="mt-1 border-blackCoral focus:ring-arsenic"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blackCoral shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-arsenic text-lg">Contenido del Post</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => handleInputChange("content", content)}
                placeholder="Escribe el contenido completo del post aquí..."
                className="min-h-[400px]"
              />
              <p className="text-sm text-blackCoral/70 mt-2">
                Palabras:{" "}
                {
                  formData.content
                    .replace(/<[^>]*>/g, "")
                    .split(/\s+/)
                    .filter((word) => word.length > 0).length
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Image & Actions */}
        <div className="space-y-6">
          <Card className="border-blackCoral shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-arsenic text-lg">Imagen de Portada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coverImage" className="text-arsenic text-sm font-medium">
                  Seleccionar Imagen
                </Label>
                <div className="relative">
                  <Input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="border-blackCoral focus:ring-arsenic"
                  />
                  <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blackCoral pointer-events-none" />
                </div>
                <p className="text-xs text-blackCoral/70">1200x600px, máx. 5MB</p>
              </div>

              {coverImagePreview && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-blackCoral">
                  <Image
                    src={coverImagePreview || "/placeholder.svg"}
                    alt="Vista previa"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-blackCoral shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-arsenic text-lg">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, "published")}
                disabled={isLoading}
                className="w-full bg-arsenic hover:bg-blackCoral text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                {isLoading ? "Publicando..." : "Publicar"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, "draft")}
                disabled={isLoading}
                className="w-full border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isLoading ? "Guardando..." : "Guardar Borrador"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full border-blackCoral text-blackCoral hover:bg-blackCoral hover:text-white"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
