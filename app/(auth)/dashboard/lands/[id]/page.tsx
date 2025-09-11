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
import { useLand } from "@/hooks/use-lands"
import Link from "next/link"



export default function LandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { language } = useLangStore()
  const t = translations[language]

  const [isEditing, setIsEditing] = useState(false)
  const [editedLand, setEditedLand] = useState<any>(null)

  const { 
    land, 
    loading, 
    error, 
    updateLand, 
    deleteLand,
    updateState,
    isUpdating
  } = useLand(params.id as string)

  useEffect(() => {
    if (land) {
      setEditedLand({ ...land })
    }
  }, [land])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-arsenic mb-2">Cargando...</h2>
          <p className="text-blackCoral mb-4">Cargando información del terreno.</p>
        </div>
      </div>
    )
  }

  if (error || !land) {
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
    if (editedLand && land) {
      const formData = new FormData()
      Object.entries(editedLand).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString())
        }
      })
      updateLand(formData)
    }
  }

  // Handle successful update
  useEffect(() => {
    if (updateState.success) {
      setIsEditing(false)
    }
  }, [updateState.success])

  const handleCancel = () => {
    setEditedLand({ ...land })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar este terreno?")) {
      try {
        await deleteLand()
        router.push("/dashboard/lands")
      } catch (error) {
        console.error("Error deleting land:", error)
      }
    }
  }



  const currentData = isEditing ? editedLand : land
  const pricePerM2 = (currentData?.price || 0) / (currentData?.surface || 1)

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
              {isEditing ? "Editando Terreno" : currentData?.name || "Terreno"}
            </h1>
            <Badge variant="outline" className="mt-1">
              {currentData?.type === "commercial"
                ? "Comercial"
                : currentData?.type === "residential"
                  ? "Residencial"
                  : currentData?.type === "agricultural"
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
              <Button 
                size="sm" 
                onClick={handleSave} 
                disabled={isUpdating}
                className="bg-arsenic hover:bg-blackCoral"
              >
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? 'Guardando...' : 'Guardar'}
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
                  images={[]}
                  onImagesChange={(images) => {
                    if (editedLand) {
                      setEditedLand({ ...editedLand, images: images.map(f => f.name) })
                    }
                  }}
                  maxImages={10}
                />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {currentData?.images?.map((image: string, index: number) => (
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
                  content={editedLand?.description || ''}
                  onChange={(content) => {
                    if (editedLand) {
                      setEditedLand({ ...editedLand, description: content })
                    }
                  }}
                  placeholder="Describe el terreno en detalle..."
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="text-blackCoral leading-relaxed">{currentData?.description || ''}</p>
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
                      value={editedLand?.name || ''}
                      onChange={(e) => {
                        if (editedLand) {
                          setEditedLand({ ...editedLand, name: e.target.value })
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo de Terreno</Label>
                    <Select
                      value={editedLand?.type || ''}
                      onValueChange={(value) => {
                        if (editedLand) {
                          setEditedLand({ ...editedLand, type: value })
                        }
                      }}
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
                      value={editedLand?.price || 0}
                      onChange={(e) => {
                        if (editedLand) {
                          setEditedLand({ ...editedLand, price: Number(e.target.value) })
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={editedLand?.location || ''}
                      onChange={(e) => {
                        if (editedLand) {
                          setEditedLand({ ...editedLand, location: e.target.value })
                        }
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Precio Total</Label>
                    <p className="text-2xl font-bold text-arsenic">${currentData?.price?.toLocaleString() || 0} USD</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Precio por m²</Label>
                    <p className="text-lg font-semibold text-blackCoral">${pricePerM2.toFixed(2)} USD/m²</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Ubicación</Label>
                    <p className="text-blackCoral">{currentData?.location || ''}</p>
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
                    value={editedLand?.surface || 0}
                    onChange={(e) => {
                      if (editedLand) {
                        setEditedLand({ ...editedLand, surface: Number(e.target.value) })
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Superficie</Label>
                    <p className="text-lg font-semibold text-arsenic">{currentData?.surface?.toLocaleString() || 0} m²</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Hectáreas</Label>
                    <p className="text-lg font-semibold text-arsenic">{((currentData?.surface || 0) / 10000).toFixed(2)} ha</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Tareas</Label>
                    <p className="text-lg font-semibold text-arsenic">
                      {((currentData?.surface || 0) / 628).toFixed(1)} tareas
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
                  <p className="text-blackCoral">{currentData?.createdAt || ''}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-blackCoral">ID de Terreno</Label>
                  <p className="text-blackCoral font-mono">{currentData?.id || ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
