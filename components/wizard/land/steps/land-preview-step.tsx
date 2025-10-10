"use client";

import React from "react";
import { WizardStepProps } from "@/types/wizard-core";
import { LandWizardData } from "@/types/land-wizard";
import {
  WizardStepLayout,
  WizardFormSection,
} from "@/components/wizard/shared/consistent-navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Ruler,
  Tag,
  Camera,
  Edit,
  Eye,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function LandPreviewStep({
  data,
  onUpdate,
  onNext,
  errors,
  isLoading,
}: WizardStepProps<LandWizardData>) {
  const handleStatusChange = (status: "draft" | "published") => {
    onUpdate({ status });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatSurface = (surface: number) => {
    return new Intl.NumberFormat("es-DO").format(surface);
  };

  const getLandTypeLabel = (type: string) => {
    const labels = {
      residential: "Residencial",
      commercial: "Comercial",
      agricultural: "Agrícola",
      beachfront: "Frente al Mar",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const totalImages =
    (data.images?.length || 0) +
    (data.aerialImages?.length || 0) +
    (data.documentImages?.length || 0);

  const isComplete =
    data.name &&
    data.description &&
    data.price &&
    data.surface &&
    data.location &&
    totalImages > 0;

  return (
    <WizardStepLayout
      title="Vista Previa del Terreno"
      description="Revisa toda la información antes de publicar"
    >
      <div className="space-y-8">
        {/* Status Selection */}
        <WizardFormSection
          title="Estado de Publicación"
          description="Elige si quieres guardar como borrador o publicar inmediatamente"
          icon={<Edit className="h-5 w-5" />}
        >
          <div className="flex gap-4">
            <Button
              variant={data.status === "draft" ? "default" : "outline"}
              onClick={() => handleStatusChange("draft")}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Guardar como Borrador
            </Button>
            <Button
              variant={data.status === "published" ? "default" : "outline"}
              onClick={() => handleStatusChange("published")}
              className="flex-1"
              disabled={!isComplete}
            >
              <Eye className="h-4 w-4 mr-2" />
              Publicar Ahora
            </Button>
          </div>
          {!isComplete && (
            <p className="text-sm text-muted-foreground mt-2">
              Completa toda la información requerida para poder publicar
            </p>
          )}
        </WizardFormSection>

        {/* Preview Card */}
        <WizardFormSection
          title="Vista Previa del Listado"
          description="Así se verá tu terreno en los resultados de búsqueda"
          icon={<Eye className="h-5 w-5" />}
        >
          {/* Land Card Preview */}
          <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-background">
            {/* Image */}
            <div className="aspect-video bg-muted relative">
              {data.images && data.images.length > 0 ? (
                <img
                  src={data.images[0].url}
                  alt={data.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                </div>
              )}

              {/* Image Count Badge */}
              {totalImages > 0 && (
                <Badge className="absolute top-2 right-2">
                  <Camera className="h-3 w-3 mr-1" />
                  {totalImages}
                </Badge>
              )}

              {/* Land Type Badge */}
              <Badge variant="secondary" className="absolute top-2 left-2">
                {getLandTypeLabel(data.landType || "")}
              </Badge>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg line-clamp-1">
                  {data.name || "Nombre del terreno"}
                </h3>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(data.price || 0)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground mb-3">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                  {data.location || "Ubicación no especificada"}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {data.description || "Descripción no disponible"}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Ruler className="h-4 w-4" />
                    <span>{formatSurface(data.surface || 0)} m²</span>
                  </div>
                </div>

                <Badge variant="outline">
                  {data.status === "published" ? "Publicado" : "Borrador"}
                </Badge>
              </div>

              {/* Characteristics */}
              {data.characteristics && data.characteristics.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex flex-wrap gap-1">
                    {data.characteristics.slice(0, 3).map((char) => (
                      <Badge
                        key={char.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {char.name}
                      </Badge>
                    ))}
                    {data.characteristics.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{data.characteristics.length - 3} más
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </WizardFormSection>

        {/* Summary Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Information */}
          <WizardFormSection
            title="Información Básica"
            icon={<Tag className="h-5 w-5" />}
          >
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Nombre:</span>
                <span className="font-medium">
                  {data.name || "No especificado"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium">
                  {getLandTypeLabel(data.landType || "")}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Precio:</span>
                <span className="font-medium">
                  {formatPrice(data.price || 0)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Superficie:</span>
                <span className="font-medium">
                  {formatSurface(data.surface || 0)} m²
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Características:</span>
                <span className="font-medium">
                  {data.characteristics?.length || 0}
                </span>
              </div>
            </div>
          </WizardFormSection>

          {/* Location & Media */}
          <WizardFormSection
            title="Ubicación y Multimedia"
            icon={<MapPin className="h-5 w-5" />}
          >
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Ubicación:</span>
                <span className="font-medium text-right max-w-[200px] truncate">
                  {data.location || "No especificada"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Coordenadas:</span>
                <span className="font-medium">
                  {data.coordinates ? "Sí" : "No"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Fotos generales:</span>
                <span className="font-medium">{data.images?.length || 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Fotos aéreas:</span>
                <span className="font-medium">
                  {data.aerialImages?.length || 0}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Documentos:</span>
                <span className="font-medium">
                  {data.documentImages?.length || 0}
                </span>
              </div>
            </div>
          </WizardFormSection>
        </div>

        {/* Validation Status */}
        <WizardFormSection
          title="Estado de Validación"
          description="Verifica que toda la información esté completa"
          icon={<CheckCircle className="h-5 w-5" />}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span>Información básica completa</span>
              <Badge
                variant={
                  data.name && data.description && data.price && data.surface
                    ? "default"
                    : "destructive"
                }
              >
                {data.name && data.description && data.price && data.surface
                  ? "Completo"
                  : "Incompleto"}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Ubicación especificada</span>
              <Badge variant={data.location ? "default" : "destructive"}>
                {data.location ? "Completo" : "Incompleto"}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Al menos una imagen</span>
              <Badge variant={totalImages > 0 ? "default" : "destructive"}>
                {totalImages > 0 ? "Completo" : "Incompleto"}
              </Badge>
            </div>
          </div>
        </WizardFormSection>
      </div>
    </WizardStepLayout>
  );
}
