"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLangStore } from "@/utils/store/lang-store"
import { translations } from "@/lib/translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/properties/image-upload"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Save, X } from "lucide-react"
import { toast } from "sonner"
import { useProperties } from "@/hooks/use-properties"

interface PropertyFormData {
  title: string
  type: string
  price: string
  bedrooms: string
  bathrooms: string
  area: string
  location: string
  description: string
  images: File[]
}

interface PropertyFormProps {
  initialData?: Partial<PropertyFormData>
  isEditing?: boolean
}

export function PropertyForm({ initialData, isEditing = false }: PropertyFormProps) {
  const router = useRouter()
  const { language } = useLangStore()
  const t = translations[language]

  const [formData, setFormData] = useState<PropertyFormData>({
    title: initialData?.title || "",
    type: initialData?.type || "",
    price: initialData?.price || "",
    bedrooms: initialData?.bedrooms || "",
    bathrooms: initialData?.bathrooms || "",
    area: initialData?.area || "",
    location: initialData?.location || "",
    description: initialData?.description || "",
    images: initialData?.images || [],
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImagesChange = (images: File[]) => {
    setFormData((prev) => ({ ...prev, images }))
  }

  const { createProperty, createState } = useProperties()

  // Handle successful creation
  useEffect(() => {
    if (createState.success) {
      router.push("/dashboard/properties")
    }
  }, [createState.success, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validación básica
      if (!formData.title || !formData.type || !formData.price) {
        toast.error("Por favor completa todos los campos obligatorios")
        return
      }

      // Crear FormData para enviar al servidor
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('type', formData.type)
      submitData.append('price', formData.price)
      submitData.append('bedrooms', formData.bedrooms)
      submitData.append('bathrooms', formData.bathrooms)
      submitData.append('area', formData.area)
      submitData.append('location', formData.location)
      submitData.append('description', formData.description)
      submitData.append('status', formData.type === 'rent' ? 'rent' : 'sale')
      
      // Agregar imágenes si existen
      formData.images.forEach((image, index) => {
        submitData.append(`image_${index}`, image)
      })

      createProperty(submitData)
    } catch (error) {
      toast.error("Error al guardar la propiedad")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-blackCoral shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-arsenic text-lg">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="title" className="text-arsenic text-sm font-medium">
                      {t.propertyForm.propertyTitle} *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Ej: Casa moderna en Punta Cana"
                      className="mt-1 border-blackCoral focus:ring-arsenic"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="type" className="text-arsenic text-sm font-medium">
                      {t.propertyType} *
                    </Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger className="mt-1 border-blackCoral">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">{t.propertyForm.forSale}</SelectItem>
                        <SelectItem value="rent">{t.propertyForm.forRent}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-arsenic text-sm font-medium">
                      Ubicación *
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="Punta Cana, La Altagracia"
                      className="mt-1 border-blackCoral focus:ring-arsenic"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor="price" className="text-arsenic text-sm font-medium">
                      {t.propertyForm.price} (USD) *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="450000"
                      className="mt-1 border-blackCoral focus:ring-arsenic"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="bedrooms" className="text-arsenic text-sm font-medium">
                      Habitaciones
                    </Label>
                    <Select value={formData.bedrooms} onValueChange={(value) => handleInputChange("bedrooms", value)}>
                      <SelectTrigger className="mt-1 border-blackCoral">
                        <SelectValue placeholder="Hab." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="6">6+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bathrooms" className="text-arsenic text-sm font-medium">
                      Baños
                    </Label>
                    <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange("bathrooms", value)}>
                      <SelectTrigger className="mt-1 border-blackCoral">
                        <SelectValue placeholder="Baños" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="area" className="text-arsenic text-sm font-medium">
                      Área (m²)
                    </Label>
                    <Input
                      id="area"
                      type="number"
                      value={formData.area}
                      onChange={(e) => handleInputChange("area", e.target.value)}
                      placeholder="280"
                      className="mt-1 border-blackCoral focus:ring-arsenic"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blackCoral shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-arsenic text-lg">Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={formData.description}
                  onChange={(content) => handleInputChange("description", content)}
                  placeholder="Describe las características principales de la propiedad..."
                  className="min-h-[200px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Images & Actions */}
          <div className="space-y-6">
            <Card className="border-blackCoral shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-arsenic text-lg">Imágenes</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload images={formData.images} onImagesChange={handleImagesChange} maxImages={10} />
              </CardContent>
            </Card>

            <Card className="border-blackCoral shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-arsenic text-lg">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button type="submit" disabled={isLoading} className="w-full bg-arsenic hover:bg-blackCoral text-white">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Guardando..." : "Guardar"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full border-blackCoral text-blackCoral hover:bg-blackCoral hover:text-white"
                >
                  <X className="h-4 w-4 mr-2" />
                  {t.cancel}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
