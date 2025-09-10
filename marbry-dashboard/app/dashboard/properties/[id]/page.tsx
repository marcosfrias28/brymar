"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit3, Save, X, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { ImageUpload } from "@/components/properties/image-upload"
import { useLangStore } from "@/utils/store/lang-store"
import { translations } from "@/lib/translations"
import Link from "next/link"

// Mock data generator (same as in properties page)
const generateMockProperties = () => {
  const types = ["sale", "rent"]
  const locations = [
    "Punta Cana, La Altagracia",
    "Santo Domingo, DN",
    "Cap Cana, La Altagracia",
    "Bávaro, La Altagracia",
    "Santiago, Santiago",
    "Puerto Plata, Puerto Plata",
    "La Romana, La Romana",
    "Samaná, Samaná",
    "Jarabacoa, La Vega",
  ]
  const properties = []

  for (let i = 1; i <= 247; i++) {
    properties.push({
      id: i.toString(),
      title: `Propiedad ${i} - ${locations[i % locations.length].split(",")[0]}`,
      type: types[i % 2],
      price: Math.floor(Math.random() * 2000000) + 100000,
      bedrooms: Math.floor(Math.random() * 6) + 1,
      bathrooms: Math.floor(Math.random() * 4) + 1,
      area: Math.floor(Math.random() * 400) + 80,
      location: locations[i % locations.length],
      description: `Hermosa propiedad en ${locations[i % locations.length]} con excelentes acabados y ubicación privilegiada. Esta propiedad cuenta con amplios espacios, diseño moderno y todas las comodidades necesarias para una vida confortable. Perfecta para familias que buscan calidad de vida en una ubicación estratégica.`,
      images: [
        `/placeholder.svg?height=400&width=600&query=property-${i}-main`,
        `/placeholder.svg?height=300&width=400&query=property-${i}-bedroom`,
        `/placeholder.svg?height=300&width=400&query=property-${i}-kitchen`,
        `/placeholder.svg?height=300&width=400&query=property-${i}-bathroom`,
      ],
      createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        .toISOString()
        .split("T")[0],
      featured: i % 7 === 0,
    })
  }
  return properties
}

const mockProperties = generateMockProperties()

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { language } = useLangStore()
  const t = translations[language]

  const [isEditing, setIsEditing] = useState(false)
  const [property, setProperty] = useState(null)
  const [editedProperty, setEditedProperty] = useState(null)

  useEffect(() => {
    const foundProperty = mockProperties.find((p) => p.id === params.id)
    if (foundProperty) {
      setProperty(foundProperty)
      setEditedProperty({ ...foundProperty })
    }
  }, [params.id])

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-arsenic mb-2">Propiedad no encontrada</h2>
          <p className="text-blackCoral mb-4">La propiedad que buscas no existe o ha sido eliminada.</p>
          <Button asChild>
            <Link href="/dashboard/properties">Volver a Propiedades</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    // Here you would save to your backend
    setProperty({ ...editedProperty })
    setIsEditing(false)
    console.log("[v0] Saving property:", editedProperty)
  }

  const handleCancel = () => {
    setEditedProperty({ ...property })
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm("¿Estás seguro de que quieres eliminar esta propiedad?")) {
      console.log("[v0] Deleting property:", property.id)
      router.push("/dashboard/properties")
    }
  }

  const currentData = isEditing ? editedProperty : property

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/properties">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Propiedades
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-arsenic font-serif">
              {isEditing ? "Editando Propiedad" : currentData.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={currentData.type === "sale" ? "default" : "secondary"}>
                {currentData.type === "sale" ? "En Venta" : "En Alquiler"}
              </Badge>
              {currentData.featured && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                  Destacada
                </Badge>
              )}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Imágenes</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <ImageUpload
                  images={editedProperty.images}
                  onImagesChange={(images) => setEditedProperty({ ...editedProperty, images })}
                  maxImages={10}
                />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {currentData.images.map((image, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <RichTextEditor
                  content={editedProperty.description}
                  onChange={(content) => setEditedProperty({ ...editedProperty, description: content })}
                  placeholder="Describe la propiedad en detalle..."
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="text-blackCoral leading-relaxed">{currentData.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={editedProperty.title}
                      onChange={(e) => setEditedProperty({ ...editedProperty, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={editedProperty.type}
                      onValueChange={(value) => setEditedProperty({ ...editedProperty, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">En Venta</SelectItem>
                        <SelectItem value="rent">En Alquiler</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="price">Precio (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={editedProperty.price}
                      onChange={(e) => setEditedProperty({ ...editedProperty, price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={editedProperty.location}
                      onChange={(e) => setEditedProperty({ ...editedProperty, location: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Precio</Label>
                    <p className="text-2xl font-bold text-arsenic">${currentData.price.toLocaleString()} USD</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Ubicación</Label>
                    <p className="text-blackCoral">{currentData.location}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="bedrooms">Habitaciones</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={editedProperty.bedrooms}
                      onChange={(e) => setEditedProperty({ ...editedProperty, bedrooms: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Baños</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={editedProperty.bathrooms}
                      onChange={(e) => setEditedProperty({ ...editedProperty, bathrooms: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="area">Área (m²)</Label>
                    <Input
                      id="area"
                      type="number"
                      value={editedProperty.area}
                      onChange={(e) => setEditedProperty({ ...editedProperty, area: Number(e.target.value) })}
                    />
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Habitaciones</Label>
                    <p className="text-lg font-semibold text-arsenic">{currentData.bedrooms}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Baños</Label>
                    <p className="text-lg font-semibold text-arsenic">{currentData.bathrooms}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-blackCoral">Área</Label>
                    <p className="text-lg font-semibold text-arsenic">{currentData.area} m²</p>
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
                  <Label className="text-sm font-medium text-blackCoral">Fecha de Creación</Label>
                  <p className="text-blackCoral">{currentData.createdAt}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-blackCoral">ID de Propiedad</Label>
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
