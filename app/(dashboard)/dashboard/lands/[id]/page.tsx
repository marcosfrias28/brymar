"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit3, Save, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
// import { ImageUpload } from "@/components/properties/image-upload" // Unused

import { useLand } from "@/hooks/use-lands"
import Link from "next/link"

type Land = {
  id: number
  name: string
  type: string
  price: number
  location: string
  area: number
  description: string
  images: string[]
  createdAt: Date
  updatedAt: Date | null
}

export default function LandDetailPage() {
  const params = useParams()
  const router = useRouter()

  // Sempre chiamare gli hooks prima di qualsiasi early return
  const { land, isLoading, error, updateLand, deleteLand } = useLand(Number(params?.id))
  const [isEditing, setIsEditing] = useState(false)
  const [editedLand, setEditedLand] = useState<Land | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (land) {
      setEditedLand(land)
    }
  }, [land])

  // Verificar que params y params.id existan dopo gli hooks
  if (!params || !params.id) {
    return <div>Error: ID de terreno no encontrado</div>
  }

  const handleSave = async () => {
    if (!editedLand) return
    
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', editedLand.name)
      formData.append('type', editedLand.type)
      formData.append('price', editedLand.price.toString())
      formData.append('location', editedLand.location)
      formData.append('area', editedLand.area.toString())
      formData.append('description', editedLand.description)
      
      await updateLand(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating land:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedLand(land)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!land) return
    
    setIsDeleting(true)
    try {
      await deleteLand()
      router.push('/dashboard/lands')
    } catch (error) {
      console.error('Error deleting land:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !land) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">No se pudo cargar el terreno</p>
          <Button onClick={() => router.push('/dashboard/lands')}>Volver a Terrenos</Button>
        </div>
      </div>
    )
  }

  const currentData = isEditing ? editedLand : land
  const pricePerM2 = currentData?.area ? (currentData.price / currentData.area) : 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/lands">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-arsenic">{currentData?.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{currentData?.type}</Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Imágenes del Terreno</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Edición de imágenes disponible en el formulario principal
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {editedLand?.images?.map((image, index) => (
                      <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {currentData?.images?.map((image, index) => (
                    <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                      <img
                        src={image}
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
                    <Label htmlFor="area">Superficie (m²)</Label>
                    <Input
                      id="area"
                      type="number"
                      value={editedLand?.area || 0}
                      onChange={(e) => {
                        if (editedLand) {
                          setEditedLand({ ...editedLand, area: Number(e.target.value) })
                        }
                      }}
                    />
                  </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Superficie</Label>
                    <p className="text-lg font-semibold text-arsenic">{currentData?.area?.toLocaleString() || 0} m²</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Hectáreas</Label>
                    <p className="text-lg font-semibold text-arsenic">{((currentData?.area || 0) / 10000).toFixed(2)} ha</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Tareas</Label>
                    <p className="text-lg font-semibold text-arsenic">
                      {((currentData?.area || 0) / 628).toFixed(1)} tareas
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
                  <p className="text-blackCoral">{currentData?.createdAt ? new Date(currentData.createdAt).toLocaleDateString() : ''}</p>
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