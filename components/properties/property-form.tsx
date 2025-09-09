"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLangStore } from "@/utils/store/lang-store"
import { translations } from "@/lib/translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/properties/image-upload"
import { Save, X } from "lucide-react"
import { toast } from "sonner"

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validación básica
      if (!formData.title || !formData.type || !formData.price) {
        toast.error("Por favor completa todos los campos obligatorios")
        return
      }

      // Simular guardado (en una app real sería una llamada a API)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success(isEditing ? "Propiedad actualizada exitosamente" : "Propiedad creada exitosamente")
      router.push("/dashboard/properties")
    } catch (error) {
      toast.error("Error al guardar la propiedad")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="border-black-coral shadow-lg">
        <CardHeader>
          <CardTitle className="text-arsenic">Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-arsenic">
                {t.title} *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ej: Casa moderna en Punta Cana"
                className="border-black-coral focus:ring-arsenic"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-arsenic">
                {t.propertyType} *
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger className="border-black-coral">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">{t.forSale}</SelectItem>
                  <SelectItem value="rent">{t.forRent}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 smartphone:grid-cols-2 tablet:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-arsenic">
                {t.price} (USD) *
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="450000"
                className="border-black-coral focus:ring-arsenic"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bedrooms" className="text-arsenic">
                {t.bedrooms}
              </Label>
              <Select value={formData.bedrooms} onValueChange={(value) => handleInputChange("bedrooms", value)}>
                <SelectTrigger className="border-black-coral">
                  <SelectValue placeholder="Habitaciones" />
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

            <div className="space-y-2">
              <Label htmlFor="bathrooms" className="text-arsenic">
                {t.bathrooms}
              </Label>
              <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange("bathrooms", value)}>
                <SelectTrigger className="border-black-coral">
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

            <div className="space-y-2">
              <Label htmlFor="area" className="text-arsenic">
                {t.area}
              </Label>
              <Input
                id="area"
                type="number"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
                placeholder="280"
                className="border-black-coral focus:ring-arsenic"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-arsenic">
              {t.location}
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Ej: Punta Cana, La Altagracia"
              className="border-black-coral focus:ring-arsenic"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-arsenic">
              {t.description}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe las características principales de la propiedad..."
              rows={4}
              className="border-black-coral focus:ring-arsenic"
            />
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card className="border-black-coral shadow-lg">
        <CardHeader>
          <CardTitle className="text-arsenic">Imágenes</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload images={formData.images} onImagesChange={handleImagesChange} maxImages={10} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-black-coral text-black-coral hover:bg-black-coral hover:text-white"
        >
          <X className="h-4 w-4 mr-2" />
          {t.cancel}
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-arsenic hover:bg-black-coral text-white">
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? t.loading : t.save}
        </Button>
      </div>
    </form>
  )
}
