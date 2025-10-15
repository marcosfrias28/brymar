"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Save, X, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";
import { cn } from "@/lib/utils";

import {
  useProperty,
  type GetPropertyByIdOutput,
} from "@/presentation/hooks/use-properties";
import { updateProperty as updatePropertyAction } from "@/presentation/server-actions/property-actions";
import { toast } from "sonner";
import Link from "next/link";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Sempre chiamare gli hooks prima di qualsiasi early return
  const [isEditing, setIsEditing] = useState(false);
  const [editedProperty, setEditedProperty] =
    useState<Partial<GetPropertyByIdOutput> | null>(null);

  const { property, loading, error, refetch } = useProperty(Number(params?.id));

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateState, setUpdateState] = useState<{ success?: boolean } | null>(
    null
  );

  useEffect(() => {
    if (property) {
      setEditedProperty({ ...property });
    }
  }, [property]);

  useEffect(() => {
    if (updateState?.success) {
      setIsEditing(false);
    }
  }, [updateState]);

  // Verificar que params y params.id existan dopo gli hooks
  if (!params || !params.id) {
    return <div>Error: ID de propiedad no encontrado</div>;
  }

  if (loading) {
    return (
      <DashboardPageLayout
        title="Cargando Propiedad"
        description="Cargando información de la propiedad"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Cargando...</h2>
            <p className="text-muted-foreground mb-4">
              Cargando información de la propiedad.
            </p>
          </div>
        </div>
      </DashboardPageLayout>
    );
  }

  if (error || !property) {
    return (
      <DashboardPageLayout
        title="Propiedad no encontrada"
        description="La propiedad solicitada no existe"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Propiedad no encontrada
            </h2>
            <p className="text-muted-foreground mb-4">
              La propiedad que buscas no existe o ha sido eliminada.
            </p>
            <Button asChild>
              <Link href="/dashboard/properties">Volver a Propiedades</Link>
            </Button>
          </div>
        </div>
      </DashboardPageLayout>
    );
  }

  const handleSave = async () => {
    if (editedProperty && property) {
      setIsUpdating(true);
      try {
        const formData = new FormData();
        formData.append("id", property.getId().value);
        formData.append(
          "title",
          editedProperty.title || property.getTitle().value
        );
        formData.append(
          "description",
          editedProperty.description || property.description
        );
        formData.append(
          "price",
          (editedProperty.price || property.getPrice().value).toString()
        );
        formData.append(
          "type",
          editedProperty.propertyType || property.getType().value
        );
        // Note: bedrooms, bathrooms, area, and location are not available in current DTO
        // These would need to be added to GetPropertyByIdOutput if required
        formData.append(
          "status",
          (editedProperty.status || property.getStatus().value) as string
        );

        const result = await updatePropertyAction(formData);

        if (result.success) {
          setUpdateState({ success: true });
          toast.success("Propiedad actualizada exitosamente");
          await refetch();
        } else {
          toast.error(result.message || "Error al actualizar la propiedad");
        }
      } catch (error) {
        console.error("Error updating property:", error);
        toast.error("Error inesperado al actualizar la propiedad");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // useEffect duplicato rimosso

  const handleCancel = () => {
    setEditedProperty({ ...property });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar esta propiedad?")) {
      // TODO: Implement delete property action
      toast.error("Función de eliminación no implementada aún");
    }
  };

  const currentData = isEditing ? editedProperty : property;
  if (!currentData) return null;

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Propiedades", href: "/dashboard/properties" },
    {
      label:
        (currentData && "getTitle" in currentData && currentData.getTitle
          ? currentData.getTitle().value
          : currentData?.title) || "Propiedad",
    },
  ];

  return (
    <DashboardPageLayout
      title={currentData.title || "Propiedad"}
      description="Detalles de la propiedad"
      breadcrumbs={breadcrumbs}
    >
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
              <h1 className="text-3xl font-bold font-serif">
                {isEditing
                  ? "Editando Propiedad"
                  : currentData &&
                    "getTitle" in currentData &&
                    currentData.getTitle
                  ? currentData.getTitle().value
                  : currentData?.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className={cn(
                    (currentData &&
                    "getType" in currentData &&
                    currentData.getType
                      ? currentData.getType().value
                      : currentData?.propertyType) === "sale"
                      ? "bg-green-500 text-white"
                      : "bg-blue-500 text-white",
                    secondaryColorClasses.badge
                  )}
                >
                  {(currentData &&
                  "getType" in currentData &&
                  currentData.getType
                    ? currentData.getType().value
                    : currentData?.propertyType) === "sale"
                    ? "En Venta"
                    : "En Alquiler"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className={cn(secondaryColorClasses.interactive)}
                >
                  <Link href={`/dashboard/properties/${params.id}/edit`}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar con Asistente
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className={cn(secondaryColorClasses.interactive)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edición Rápida
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(secondaryColorClasses.interactive)}
                >
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className={cn(secondaryColorClasses.interactive)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isUpdating}
                  className={cn(
                    "bg-primary hover:bg-primary/90",
                    secondaryColorClasses.focusRing
                  )}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? "Guardando..." : "Guardar"}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card
              className={cn(
                "border shadow-sm transition-all duration-200",
                secondaryColorClasses.cardHover
              )}
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Imágenes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Gestión de imágenes disponible en modo de edición
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {(currentData.images || []).map((image, index) => (
                        <div
                          key={index}
                          className="aspect-video rounded-lg overflow-hidden"
                        >
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
                      <div
                        key={index}
                        className="aspect-video rounded-lg overflow-hidden"
                      >
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
            <Card
              className={cn(
                "border shadow-sm transition-all duration-200",
                secondaryColorClasses.cardHover
              )}
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Descripción
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <RichTextEditor
                    content={editedProperty?.description || ""}
                    onChange={(content) =>
                      editedProperty &&
                      setEditedProperty({
                        ...editedProperty,
                        description: content,
                      })
                    }
                    placeholder="Describe la propiedad en detalle..."
                  />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground leading-relaxed">
                      {currentData.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card
              className={cn(
                "border shadow-sm transition-all duration-200",
                secondaryColorClasses.cardHover
              )}
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={editedProperty?.title || ""}
                        onChange={(e) =>
                          editedProperty &&
                          setEditedProperty({
                            ...editedProperty,
                            title: e.target.value,
                          })
                        }
                        className={cn(secondaryColorClasses.inputFocus)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Tipo</Label>
                      <Select
                        value={editedProperty?.propertyType || "sale"}
                        onValueChange={(value: "sale" | "rent") =>
                          editedProperty &&
                          setEditedProperty({
                            ...editedProperty,
                            propertyType: value,
                          })
                        }
                      >
                        <SelectTrigger
                          className={cn(secondaryColorClasses.selectFocus)}
                        >
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
                        onChange={(e) =>
                          editedProperty &&
                          setEditedProperty({
                            ...editedProperty,
                            price: Number(e.target.value),
                          })
                        }
                        className={cn(secondaryColorClasses.inputFocus)}
                      />
                    </div>
                    {/* Location field not available in current DTO */}
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Precio
                      </Label>
                      <p className="text-2xl font-bold text-foreground">
                        $
                        {(currentData &&
                        "getPrice" in currentData &&
                        currentData.getPrice
                          ? currentData.getPrice().value
                          : currentData?.price
                        )?.toLocaleString() || 0}{" "}
                        USD
                      </p>
                    </div>
                    {/* Location not available in current DTO */}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card
              className={cn(
                "border shadow-sm transition-all duration-200",
                secondaryColorClasses.cardHover
              )}
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Detalles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    {/* Bedrooms, bathrooms, and area fields not available in current DTO */}
                  </>
                ) : (
                  <>
                    {/* Property details (bedrooms, bathrooms, area) not available in current DTO */}
                    <p className="text-muted-foreground text-sm">
                      Detalles adicionales no disponibles en la estructura
                      actual de datos.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card
              className={cn(
                "border shadow-sm transition-all duration-200",
                secondaryColorClasses.cardHover
              )}
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Información Adicional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Fecha de Creación
                    </Label>
                    <p className="text-foreground">
                      {currentData.createdAt
                        ? new Date(currentData.createdAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      ID de Propiedad
                    </Label>
                    <p className="text-foreground font-mono">
                      {currentData &&
                      "getId" in currentData &&
                      currentData.getId
                        ? currentData.getId().value
                        : currentData?.id}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
