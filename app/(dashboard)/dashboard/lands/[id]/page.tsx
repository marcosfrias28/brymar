"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Save, X, Trash2 } from "lucide-react";
import Link from "next/link";

import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useLand } from "@/hooks/use-lands";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { cn } from "@/lib/utils";
import {
  secondaryColorClasses,
  badgeVariants,
  interactiveClasses,
} from "@/lib/utils/secondary-colors";

type Land = {
  id: number;
  name: string;
  type: string;
  price: number;
  location: string;
  area: number;
  description: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date | null;
};

export default function LandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const breadcrumbs = useBreadcrumbs();

  // Always call hooks before any early returns
  const { land, isLoading, error, updateLand, deleteLand } = useLand(
    Number(params?.id)
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedLand, setEditedLand] = useState<Land | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (land) {
      setEditedLand(land);
    }
  }, [land]);

  // Verify that params and params.id exist after hooks
  if (!params || !params.id) {
    return (
      <DashboardPageLayout
        title="Error"
        description="ID de terreno no encontrado"
        breadcrumbs={breadcrumbs}
      >
        <div className="text-center">
          <p className="text-red-600 mb-4">ID de terreno no encontrado</p>
          <Button onClick={() => router.push("/dashboard/lands")}>
            Volver a Terrenos
          </Button>
        </div>
      </DashboardPageLayout>
    );
  }

  const handleSave = async () => {
    if (!editedLand) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", editedLand.name);
      formData.append("type", editedLand.type);
      formData.append("price", editedLand.price.toString());
      formData.append("location", editedLand.location);
      formData.append("area", editedLand.area.toString());
      formData.append("description", editedLand.description);

      await updateLand(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating land:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedLand(land);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!land) return;

    setIsDeleting(true);
    try {
      await deleteLand();
      router.push("/dashboard/lands");
    } catch (error) {
      console.error("Error deleting land:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardPageLayout
        title="Cargando..."
        description="Cargando información del terreno"
        breadcrumbs={breadcrumbs}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-64" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DashboardPageLayout>
    );
  }

  if (error || !land) {
    return (
      <DashboardPageLayout
        title="Error"
        description="No se pudo cargar el terreno"
        breadcrumbs={breadcrumbs}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">No se pudo cargar el terreno</p>
          <Button onClick={() => router.push("/dashboard/lands")}>
            Volver a Terrenos
          </Button>
        </div>
      </DashboardPageLayout>
    );
  }

  const currentData = isEditing ? editedLand : land;
  const pricePerM2 = currentData?.area
    ? currentData.price / currentData.area
    : 0;

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        asChild
        className={cn(
          "border-blackCoral text-blackCoral hover:bg-blackCoral hover:text-white",
          secondaryColorClasses.focusRing
        )}
      >
        <Link href="/dashboard/lands">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Link>
      </Button>

      {isEditing ? (
        <>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className={cn(interactiveClasses.button)}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "bg-arsenic hover:bg-blackCoral",
              secondaryColorClasses.focusRing
            )}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className={cn(interactiveClasses.button)}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className={cn(secondaryColorClasses.focusRing)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </>
      )}
    </div>
  );

  return (
    <DashboardPageLayout
      title={currentData?.name || "Terreno"}
      description={`Detalles del terreno ${currentData?.type || ""}`}
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Land Type Badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(badgeVariants.secondarySubtle)}
          >
            {currentData?.type}
          </Badge>
          <Badge variant="outline" className={badgeVariants.secondaryOutline}>
            ID: {currentData?.id}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card
              className={cn(
                "transition-all duration-200",
                secondaryColorClasses.cardHover
              )}
            >
              <CardHeader>
                <CardTitle className="text-lg text-arsenic">
                  Imágenes del Terreno
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Edición de imágenes disponible en el formulario principal
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {editedLand?.images?.map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square relative rounded-lg overflow-hidden border border-secondary/20"
                        >
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
                      <div
                        key={index}
                        className="aspect-square relative rounded-lg overflow-hidden border border-secondary/20 hover:border-secondary/40 transition-colors"
                      >
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
            <Card
              className={cn(
                "transition-all duration-200",
                secondaryColorClasses.cardHover
              )}
            >
              <CardHeader>
                <CardTitle className="text-lg text-arsenic">
                  Descripción del Terreno
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <RichTextEditor
                    content={editedLand?.description || ""}
                    onChange={(content) => {
                      if (editedLand) {
                        setEditedLand({ ...editedLand, description: content });
                      }
                    }}
                    placeholder="Describe el terreno en detalle..."
                    className={cn(interactiveClasses.textarea)}
                  />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-blackCoral leading-relaxed">
                      {currentData?.description || "Sin descripción disponible"}
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
                "transition-all duration-200",
                secondaryColorClasses.cardHover
              )}
            >
              <CardHeader>
                <CardTitle className="text-lg text-arsenic">
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="name" className="text-arsenic">
                        Nombre del Terreno
                      </Label>
                      <Input
                        id="name"
                        value={editedLand?.name || ""}
                        onChange={(e) => {
                          if (editedLand) {
                            setEditedLand({
                              ...editedLand,
                              name: e.target.value,
                            });
                          }
                        }}
                        className={cn(interactiveClasses.input)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="type" className="text-arsenic">
                        Tipo de Terreno
                      </Label>
                      <Select
                        value={editedLand?.type || ""}
                        onValueChange={(value) => {
                          if (editedLand) {
                            setEditedLand({ ...editedLand, type: value });
                          }
                        }}
                      >
                        <SelectTrigger
                          className={cn(interactiveClasses.select)}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="commercial">Comercial</SelectItem>
                          <SelectItem value="residential">
                            Residencial
                          </SelectItem>
                          <SelectItem value="agricultural">Agrícola</SelectItem>
                          <SelectItem value="beachfront">
                            Frente al Mar
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="price" className="text-arsenic">
                        Precio (USD)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={editedLand?.price || 0}
                        onChange={(e) => {
                          if (editedLand) {
                            setEditedLand({
                              ...editedLand,
                              price: Number(e.target.value),
                            });
                          }
                        }}
                        className={cn(interactiveClasses.input)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-arsenic">
                        Ubicación
                      </Label>
                      <Input
                        id="location"
                        value={editedLand?.location || ""}
                        onChange={(e) => {
                          if (editedLand) {
                            setEditedLand({
                              ...editedLand,
                              location: e.target.value,
                            });
                          }
                        }}
                        className={cn(interactiveClasses.input)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-sm font-medium text-blackCoral">
                        Precio Total
                      </Label>
                      <p className="text-2xl font-bold text-arsenic">
                        ${currentData?.price?.toLocaleString() || 0} USD
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blackCoral">
                        Precio por m²
                      </Label>
                      <p className="text-lg font-semibold text-blackCoral">
                        ${pricePerM2.toFixed(2)} USD/m²
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blackCoral">
                        Ubicación
                      </Label>
                      <p className="text-blackCoral">
                        {currentData?.location || "No especificada"}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Land Details */}
            <Card
              className={cn(
                "transition-all duration-200",
                secondaryColorClasses.cardHover
              )}
            >
              <CardHeader>
                <CardTitle className="text-lg text-arsenic">
                  Detalles del Terreno
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div>
                    <Label htmlFor="area" className="text-arsenic">
                      Superficie (m²)
                    </Label>
                    <Input
                      id="area"
                      type="number"
                      value={editedLand?.area || 0}
                      onChange={(e) => {
                        if (editedLand) {
                          setEditedLand({
                            ...editedLand,
                            area: Number(e.target.value),
                          });
                        }
                      }}
                      className={cn(interactiveClasses.input)}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-blackCoral">
                        Superficie
                      </Label>
                      <p className="text-lg font-semibold text-arsenic">
                        {currentData?.area?.toLocaleString() || 0} m²
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blackCoral">
                        Hectáreas
                      </Label>
                      <p className="text-lg font-semibold text-arsenic">
                        {((currentData?.area || 0) / 10000).toFixed(2)} ha
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blackCoral">
                        Tareas
                      </Label>
                      <p className="text-lg font-semibold text-arsenic">
                        {((currentData?.area || 0) / 628).toFixed(1)} tareas
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card
              className={cn(
                "transition-all duration-200",
                secondaryColorClasses.cardHover
              )}
            >
              <CardHeader>
                <CardTitle className="text-lg text-arsenic">
                  Información Adicional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">
                      Fecha de Creación
                    </Label>
                    <p className="text-blackCoral">
                      {currentData?.createdAt
                        ? new Date(currentData.createdAt).toLocaleDateString()
                        : "No disponible"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blackCoral">
                      ID de Terreno
                    </Label>
                    <p className="text-blackCoral font-mono">
                      {currentData?.id || "N/A"}
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
