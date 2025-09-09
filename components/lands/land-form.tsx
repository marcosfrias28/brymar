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

interface LandFormData {
  name: string
  type: string
  price: string
  surface: string
  location: string
  description: string
  images: File[]
}

interface LandFormProps {
  initialData?: Partial<LandFormData>
  isEditing?: boolean
}

export function LandForm({ initialData, isEditing = false }: LandFormProps) {
  const router = useRouter()
  const { language } = useLangStore()
  const t = translations[language]

  const [formData, setFormData] = useState<LandFormData>({
    name: initialData?.name || "",
    type: initialData?.type || "",
    price: initialData?.price || "",
    surface: initialData?.surface || "",
    location: initialData?.location || "",
    description: initialData?.description || "",
    images: initialData?.images || [],
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: keyof LandFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImagesChange = (images: File[]) => {
    setFormData((prev) => ({ ...prev, images }))
  }

  const calculatePricePerM2 = () => {
    if (formData.price && formData.surface) {
      const price = Number.parseFloat(formData.price)
      const surface = Number.parseFloat(formData.surface)
      if (price > 0 && surface > 0) {
        return Math.round(price / surface)
      }
    }
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validación básica
      if (!formData.name || !formData.type || !formData.price || !formData.surface) {
        toast.error("Por favor completa todos los campos obligatorios")
        return
      }

      // Simular guardado (en una app real sería una llamada a API)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success(isEditing ? "Terreno actualizado exitosamente" : "Terreno creado exitosamente")
      router.push("/dashboard/lands")
    } catch (error) {
      toast.error("Error al guardar el terreno")
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
              <Label htmlFor="name" className="text-arsenic">
                {t.landName} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ej: Terreno Comercial Bávaro"
                className="border-black-coral focus:ring-arsenic"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-arsenic">
                Tipo de Terreno *
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger className="border-black-coral">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Comercial</SelectItem>
                  <SelectItem value="residential">Residencial</SelectItem>
                  <SelectItem value="agricultural">Agrícola</SelectItem>
                  <SelectItem value="beachfront">Frente al Mar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 smartphone:grid-cols-2 tablet:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-arsenic">
                {t.price} (USD) *
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="180000"
                className="border-black-coral focus:ring-arsenic"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surface" className="text-arsenic">
                {t.surface} *
              </Label>
              <Input
                id="surface"
                type="number"
                value={formData.surface}
                onChange={(e) => handleInputChange("surface", e.target.value)}
                placeholder="2500"
                className="border-black-coral focus:ring-arsenic"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-arsenic">Precio por m²</Label>
              <div className="h-10 px-3 py-2 border border-black-coral rounded-md bg-muted flex items-center text-black-coral">
                ${calculatePricePerM2().toLocaleString()}
              </div>
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
              placeholder="Ej: Bávaro, Punta Cana"
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
              placeholder="Describe las características principales del terreno..."
              rows={4}
              className="border-black-coral focus:ring-arsenic"
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="border-black-coral shadow-lg">
        <CardHeader>
          <CardTitle className="text-arsenic">Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 smartphone:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-arsenic">Superficie en Hectáreas</Label>
              <div className="h-10 px-3 py-2 border border-black-coral rounded-md bg-muted flex items-center text-black-coral">
                {formData.surface ? (Number.parseFloat(formData.surface) / 10000).toFixed(4) : "0"} ha
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-arsenic">Superficie en Tareas</Label>
              <div className="h-10 px-3 py-2 border border-black-coral rounded-md bg-muted flex items-center text-black-coral">
                {formData.surface ? (Number.parseFloat(formData.surface) / 629).toFixed(2) : "0"} tareas
              </div>
            </div>
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
