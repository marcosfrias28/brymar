// Property Preview Step for New Framework

"use client";

import { useState } from "react";
import { WizardStepProps } from "@/types/wizard-core";
import { PropertyWizardData, PropertyType } from "@/types/property-wizard";
import {
  WizardStepLayout,
  WizardFormSection,
} from "@/components/wizard/shared/consistent-navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  Save,
  Edit,
  MapPin,
  Home,
  Bed,
  Bath,
  Square,
  DollarSign,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mobileClasses } from "@/lib/utils/mobile-utils";

const PROPERTY_TYPE_LABELS = {
  [PropertyType.HOUSE]: "Casa",
  [PropertyType.APARTMENT]: "Apartamento",
  [PropertyType.LAND]: "Terreno",
  [PropertyType.COMMERCIAL]: "Comercial",
  [PropertyType.VILLA]: "Villa",
};

interface PropertyPreviewStepProps extends WizardStepProps<PropertyWizardData> {
  onPublish?: () => Promise<void>;
  onSaveDraft?: () => Promise<void>;
  onEdit?: (step: number) => void;
}

export function PropertyPreviewStep({
  data,
  onUpdate,
  onNext,
  onPrevious,
  isLoading,
  isMobile = false,
  onPublish,
  onSaveDraft,
  onEdit,
}: PropertyPreviewStepProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Validate data for publication
  const validateForPublication = () => {
    const errors: string[] = [];

    if (!data.title) errors.push("Título es requerido");
    if (!data.description) errors.push("Descripción es requerida");
    if (!data.price) errors.push("Precio es requerido");
    if (!data.surface) errors.push("Superficie es requerida");
    if (!data.propertyType) errors.push("Tipo de propiedad es requerido");
    if (!data.characteristics?.length)
      errors.push("Al menos una característica es requerida");
    if (!data.images?.length) errors.push("Al menos una imagen es requerida");

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const validation = validateForPublication();
  const canPublish = validation.isValid;

  // Handle publish with validation
  const handlePublish = async () => {
    if (!canPublish || !onPublish) return;

    setIsPublishing(true);
    try {
      await onPublish();
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle save draft
  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    setIsSaving(true);
    try {
      await onSaveDraft();
    } finally {
      setIsSaving(false);
    }
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format surface area
  const formatSurface = (surface: number) => {
    return `${surface.toLocaleString()} m²`;
  };

  return (
    <WizardStepLayout
      title="Vista Previa de la Propiedad"
      description="Revisa toda la información antes de publicar tu propiedad. Puedes editar cualquier sección si es necesario."
    >
      {/* Validation Errors */}
      {!canPublish && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">
                Completa los siguientes campos para publicar:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success indicator */}
      {canPublish && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ¡Tu propiedad está lista para publicar! Revisa la información y
            confirma la publicación.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Information */}
          <WizardFormSection
            title={data.title || "Título de la propiedad"}
            icon={<Home className="h-4 w-4" />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {data.address?.formattedAddress ||
                      "Ubicación no especificada"}
                  </span>
                </div>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(1)}
                    disabled={isLoading}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>

              {/* Property Type and Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {data.propertyType
                      ? PROPERTY_TYPE_LABELS[data.propertyType]
                      : "Tipo no especificado"}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {data.price ? formatPrice(data.price) : "$0"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Precio de venta
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-semibold">
                    {data.bedrooms || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Habitaciones
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Bath className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-semibold">
                    {data.bathrooms || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Baños</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Square className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-semibold">
                    {data.surface ? formatSurface(data.surface) : "0 m²"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Superficie
                  </div>
                </div>
              </div>
            </div>
          </WizardFormSection>

          {/* Description */}
          <WizardFormSection
            title="Descripción"
            icon={<Edit className="h-4 w-4" />}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="prose prose-sm max-w-none flex-1">
                  <p className="text-muted-foreground leading-relaxed">
                    {data.description || "No hay descripción disponible"}
                  </p>
                </div>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(1)}
                    disabled={isLoading}
                    className="ml-4"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
              {data.aiGenerated?.description && (
                <Badge variant="outline" className="mt-3">
                  Generado con IA
                </Badge>
              )}
            </div>
          </WizardFormSection>

          {/* Characteristics */}
          {data.characteristics && data.characteristics.length > 0 && (
            <WizardFormSection
              title="Características"
              icon={<CheckCircle className="h-4 w-4" />}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1">
                    {data.characteristics
                      .filter((char) => char.selected)
                      .map((characteristic) => (
                        <div
                          key={characteristic.id}
                          className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{characteristic.name}</span>
                        </div>
                      ))}
                  </div>
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(1)}
                      disabled={isLoading}
                      className="ml-4"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>
              </div>
            </WizardFormSection>
          )}

          {/* Images */}
          <WizardFormSection
            title={`Imágenes (${data.images?.length || 0})`}
            icon={<ImageIcon className="h-4 w-4" />}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {data.images && data.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {data.images
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .slice(0, 6)
                        .map((image, index) => (
                          <div
                            key={image.id}
                            className="relative aspect-video bg-muted rounded-lg overflow-hidden"
                          >
                            <img
                              src={image.url}
                              alt={`Imagen ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {index === 0 && (
                              <Badge className="absolute top-2 left-2 text-xs">
                                Principal
                              </Badge>
                            )}
                          </div>
                        ))}
                      {data.images.length > 6 && (
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              +{data.images.length - 6} más
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay imágenes cargadas</p>
                    </div>
                  )}
                </div>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(3)}
                    disabled={isLoading}
                    className="ml-4"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </div>
          </WizardFormSection>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location */}
          <WizardFormSection
            title="Ubicación"
            icon={<MapPin className="h-4 w-4" />}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {data.address ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium">Dirección</div>
                        <div className="text-sm text-muted-foreground">
                          {data.address.street}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Ciudad</div>
                        <div className="text-sm text-muted-foreground">
                          {data.address.city}, {data.address.province}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">País</div>
                        <div className="text-sm text-muted-foreground">
                          {data.address.country}
                        </div>
                      </div>
                      {data.coordinates && (
                        <div>
                          <div className="text-sm font-medium">Coordenadas</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {data.coordinates.latitude.toFixed(6)},{" "}
                            {data.coordinates.longitude.toFixed(6)}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Ubicación no especificada</p>
                    </div>
                  )}
                </div>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(2)}
                    disabled={isLoading}
                    className="ml-4"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </div>
          </WizardFormSection>

          {/* Publication Status */}
          <WizardFormSection
            title="Estado de Publicación"
            icon={<Eye className="h-4 w-4" />}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Estado actual:</span>
                <Badge
                  variant={
                    data.status === "published" ? "default" : "secondary"
                  }
                >
                  {data.status === "published" ? "Publicado" : "Borrador"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Idioma:</span>
                <Badge variant="outline">
                  {data.language === "es" ? "Español" : "English"}
                </Badge>
              </div>
              {data.aiGenerated && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    Contenido generado con IA:
                  </div>
                  <div className="space-y-1">
                    {data.aiGenerated.title && (
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Título</span>
                      </div>
                    )}
                    {data.aiGenerated.description && (
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Descripción</span>
                      </div>
                    )}
                    {data.aiGenerated.tags && (
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Etiquetas</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </WizardFormSection>

          {/* Quick Actions */}
          {onEdit && (
            <WizardFormSection
              title="Acciones Rápidas"
              icon={<Edit className="h-4 w-4" />}
            >
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onEdit(1)}
                  disabled={isLoading}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Información General
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onEdit(2)}
                  disabled={isLoading}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Cambiar Ubicación
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onEdit(3)}
                  disabled={isLoading}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Gestionar Imágenes
                </Button>
              </div>
            </WizardFormSection>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <WizardFormSection
        title="Publicación"
        icon={<Eye className="h-4 w-4" />}
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-3">
            {onSaveDraft && (
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isLoading || isSaving}
                className="min-w-[140px]"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Guardando..." : "Guardar Borrador"}
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  `/properties/preview?data=${encodeURIComponent(
                    JSON.stringify(data)
                  )}`,
                  "_blank"
                )
              }
              disabled={isLoading}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Vista Previa Externa
            </Button>
            {onPublish && (
              <Button
                onClick={handlePublish}
                disabled={!canPublish || isLoading || isPublishing}
                className={cn(
                  "min-w-[140px]",
                  canPublish
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <Eye className="w-4 h-4 mr-2" />
                {isPublishing ? "Publicando..." : "Publicar Propiedad"}
              </Button>
            )}
          </div>
        </div>

        {!canPublish && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Completa todos los campos requeridos para habilitar la
              publicación.
            </p>
          </div>
        )}
      </WizardFormSection>
    </WizardStepLayout>
  );
}
