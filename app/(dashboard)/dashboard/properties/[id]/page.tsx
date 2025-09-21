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
// import { ImageUpload } from "@/components/properties/image-upload" // Unused

import { useProperty, type Property } from "@/hooks/use-properties"
import Link from "next/link"



export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()

  // Sempre chiamare gli hooks prima di qualsiasi early return
  const [isEditing, setIsEditing] = useState(false)
  const [editedProperty, setEditedProperty] = useState<Partial<Property> | null>(null)

  const { 
    property, 
    loading, 
    error, 
    updateProperty, 
    deleteProperty,
    updateState,
    isUpdating
  } = useProperty(Number(params?.id))

  useEffect(() => {
    if (property) {
      setEditedProperty({ ...property })
    }
  }, [property])

  useEffect(() => {
    if (updateState?.success) {
      setIsEditing(false)
    }
  }, [updateState])

  // Verificar que params y params.id existan dopo gli hooks
  if (!params || !params.id) {
    return <div>Error: ID de propiedad no encontrado</div>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-arsenic mb-2">Cargando...</h2>
          <p className="text-blackCoral mb-4">Cargando información de la propiedad.</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
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
    if (editedProperty && property) {
      const formData = new FormData()
      formData.append('title', editedProperty.title || property.title)
      formData.append('description', editedProperty.description || property.description)
      formData.append('price', (editedProperty.price || property.price).toString())
      formData.append('type', editedProperty.type || property.type)
      formData.append('bedrooms', (editedProperty.bedrooms || property.bedrooms).toString())
      formData.append('bathrooms', (editedProperty.bathrooms || property.bathrooms).toString())
      formData.append('area', (editedProperty.area || property.area).toString())
      formData.append('location', editedProperty.location || property.location)
      formData.append('status', (editedProperty.status || property.status) as string)
      
      updateProperty(formData)
    }
  }

  // useEffect duplicato rimosso

  const handleCancel = () => {
    setEditedProperty({ ...property })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar esta propiedad?")) {
      try {
        await deleteProperty()
        router.push("/dashboard/properties")
      } catch (error) {
        console.error("Error deleting property:", error)
      }
    }
  }

  const currentData = isEditing ? editedProperty : property
  if (!currentData) return null

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
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Gestión de imágenes disponible en modo de edición</p>
                  <div className="grid grid-cols-2 gap-4">
                    {(currentData.images || []).map((image, index) => (
                      <div key={index} className="aspect-video rounded-lg overflow-hidden">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {(currentData.images || []).map((image, index) => (
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
                  content={editedProperty?.description || ''}
                  onChange={(content) => editedProperty && setEditedProperty({ ...editedProperty, description: content })}
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
                      value={editedProperty?.title || ''}
                      onChange={(e) => editedProperty && setEditedProperty({ ...editedProperty, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={editedProperty?.type || 'sale'}
                      onValueChange={(value: 'sale' | 'rent') => editedProperty && setEditedProperty({ ...editedProperty, type: value })}
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
                      value={editedProperty?.price || 0}
                      onChange={(e) => editedProperty && setEditedProperty({ ...editedProperty, price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={editedProperty?.location || ''}
                      onChange={(e) => editedProperty && setEditedProperty({ ...editedProperty, location: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">Precio</Label>
                    <p className="text-2xl font-bold text-arsenic">${currentData.price?.toLocaleString() || 0} USD</p>
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
                      value={editedProperty?.bedrooms || 0}
                      onChange={(e) => editedProperty && setEditedProperty({ ...editedProperty, bedrooms: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Baños</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={editedProperty?.bathrooms || 0}
                      onChange={(e) => editedProperty && setEditedProperty({ ...editedProperty, bathrooms: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="area">Área (m²)</Label>
                    <Input
                      id="area"
                      type="number"
                      value={editedProperty?.area || 0}
                      onChange={(e) => editedProperty && setEditedProperty({ ...editedProperty, area: Number(e.target.value) })}
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
                  <p className="text-blackCoral">{currentData.createdAt ? new Date(currentData.createdAt).toLocaleDateString() : ''}</p>
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