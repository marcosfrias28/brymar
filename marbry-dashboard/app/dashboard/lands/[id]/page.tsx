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

// Mock data generator (same as in lands page)
const generateMockLands = () => {
  const types = ["commercial", "residential", "agricultural", "beachfront"]
  const locations = [
    "Bávaro, Punta Cana",
    "La Romana, La Romana",
    "Santiago, Santiago",
    "Las Terrenas, Samaná",
    "Puerto Plata, Puerto Plata",
    "Cap Cana, La Altagracia",
    "Jarabacoa, La Vega",
    "Sosúa, Puerto Plata",
  ]

  const lands = []

  for (let i = 1; i <= 156; i++) {
    const type = types[i % types.length]
    const location = locations[i % locations.length]

    lands.push({
      id: i.toString(),
      name: `Terreno ${type === "commercial" ? "Comercial" : type === "residential" ? "Residencial" : type === "agricultural" ? "Agrícola" : "Frente al Mar"} ${i}`,
      surface: Math.floor(Math.random() * 15000) + 500,
      price: Math.floor(Math.random() * 500000) + 50000,
      location,
      description: `Excelente terreno ${type} en ${location.split(",")[0]} con características únicas para desarrollo. Este terreno ofrece una ubicación estratégica con acceso a servicios básicos y gran potencial de valorización. Ideal para proyectos de desarrollo inmobiliario o inversión a largo plazo.`,
      images: [
        `/placeholder.svg?height=400&width=600&query=land-${type}-${i}-main`,
        `/placeholder.svg?height=300&width=400&query=land-${type}-${i}-aerial`,
        `/placeholder.svg?height=300&width=400&query=land-${type}-${i}-access`,
      ],
      createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        .toISOString()
        .split("T")[0],
      type,
    })
  }

  return lands
}

const mockLands = generateMockLands()

export default function LandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { language } = useLangStore()
  const t = translations[language]

  const [isEditing, setIsEditing] = useState(false)
  const [land, setLand] = useState(null)
  const [editedLand, setEditedLand] = useState(null)

  useEffect(() => {
    const foundLand = mockLands.find((l) => l.id === params.id)
    if (foundLand) {
      setLand(foundLand)
      setEditedLand({ ...foundLand })
    }
  }, [params.id])

  if (!land) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-arsenic mb-2">Terreno no encontrado</h2>
          <p className="text-blackCoral mb-4">El terreno que buscas no existe o ha sido eliminado.</p>
          <Button asChild>
            <Link href="/dashboard/lands">Volver a Terrenos</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    setLand({ ...editedLand })
    setIsEditing(false)
    console.log("[v0] Saving land:", editedLand)
  }

  const handleCancel = () => {
    setEditedLand({ ...land })
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm("¿Estás seguro de que quieres eliminar este terreno?")) {
      console.log("[v0] Deleting land:", land.id)
      router.push("/dashboard/lands")
    }
  }

  const currentData = isEditing ? editedLand : land
  const pricePerM2 = currentData.price / currentData.surface

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/lands">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Terrenos
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-arsenic font-serif">
              {isEditing ? "Editando Terreno" : currentData.name}
            </h1>
            <Badge variant="outline" className="mt-1">
              {currentData.type === "commercial"
                ? "Comercial"
                : currentData.type === "residential"
                  ? "Residencial"
                  : currentData.type === "agricultural"
                    ? "Agrícola"
                    : "Frente al Mar"}
            </Badge>
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
              <CardTitle className="text-lg">Imágenes del Terreno</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <ImageUpload
                  images={editedLand.images}
                  onImagesChange={(images) => setEditedLand({ ...editedLand, images })}
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
              <CardTitle className="text-lg">Descripción del Terreno</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <RichTextEditor
                  content={editedLand.description}
                  onChange={(content) => setEditedLand({ ...editedLand, description: content })}
                  placeholder="Describe el terreno en detalle..."
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
                    <Label htmlFor="name">Nombre del Terreno</Label>
                    <Input
                      id="name"
                      value={editedLand.name}
                      onChange={(e) => setEditedLand({ ...editedLand, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo de Terreno</Label>
                    <Select
                      value={editedLand.type}
                      onValueChange={(value) => setEditedLand({ ...editedLand, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="commercial">Comercial</SelectItem>
                        <SelectItem value="residential">Residencial</SelectItem>
                        <SelectItem value="agricultural">Agrícola</SelectItem>
                        <SelectItem value="beachfront">Frente al Mar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="price">Precio (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={editedLand.price}
                      onChange={(e) => setEditedLand({ ...editedLand, price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={editedLand.location}
                      onChange={(e) => setEditedLand({ ...editedLand, location: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Precio Total</Label>
                    <p className="text-2xl font-bold text-arsenic">${currentData.price.toLocaleString()} USD</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Precio por m²</Label>
                    <p className="text-lg font-semibold text-blackCoral">${pricePerM2.toFixed(2)} USD/m²</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Ubicación</Label>
                    <p className="text-blackCoral">{currentData.location}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Land Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles del Terreno</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div>
                  <Label htmlFor="surface">Superficie (m²)</Label>
                  <Input
                    id="surface"
                    type="number"
                    value={editedLand.surface}
                    onChange={(e) => setEditedLand({ ...editedLand, surface: Number(e.target.value) })}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Superficie</Label>
                    <p className="text-lg font-semibold text-arsenic">{currentData.surface.toLocaleString()} m²</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Hectáreas</Label>
                    <p className="text-lg font-semibold text-arsenic">{(currentData.surface / 10000).toFixed(2)} ha</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Tareas</Label>
                    <p className="text-lg font-semibold text-arsenic">
                      {(currentData.surface / 628).toFixed(1)} tareas
                    </p>
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
                  <Label className="text-sm font-medium text-blackCoral">ID de Terreno</Label>
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
