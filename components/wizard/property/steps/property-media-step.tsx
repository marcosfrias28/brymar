// Property Media Upload Step for New Framework

"use client";

import { useState, useCallback, useEffect } from "react";
import { WizardStepProps } from "@/types/wizard-core";
import { PropertyWizardData, ImageMetadata } from "@/types/property-wizard";
import {
  WizardStepLayout,
  WizardFormSection,
} from "@/components/wizard/shared/consistent-navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { EnhancedImageUpload } from "@/components/wizard/shared/enhanced-image-upload";
import { PropertyMediaSchema } from "@/lib/schemas/property-wizard-schemas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { mobileClasses } from "@/lib/utils/mobile-utils";

export function PropertyMediaStep({
  data,
  onUpdate,
  onNext,
  onPrevious,
  isLoading,
  isMobile = false,
}: WizardStepProps<PropertyWizardData>) {
  const [images, setImages] = useState<ImageMetadata[]>(data.images || []);
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  // Validate step whenever images change
  useEffect(() => {
    const stepData = { images };

    try {
      PropertyMediaSchema.parse(stepData);
      setIsValid(true);
      setValidationErrors({});
    } catch (error: any) {
      setIsValid(false);
      if (error.flatten) {
        setValidationErrors(error.flatten().fieldErrors || {});
      }
    }

    // Update parent component with current data
    onUpdate({ images });
  }, [images, onUpdate]);

  // Handle images change from upload component
  const handleImagesChange = useCallback((newImages: ImageMetadata[]) => {
    setImages(newImages);
  }, []);

  // Handle next step
  const handleNext = useCallback(() => {
    if (!isValid) {
      toast.error("Por favor sube al menos una imagen antes de continuar");
      return;
    }
    onNext();
  }, [isValid, onNext]);

  // Calculate upload statistics
  const totalSize = images.reduce((sum, img) => sum + img.size, 0);
  const averageSize = images.length > 0 ? totalSize / images.length : 0;

  return (
    <WizardStepLayout
      title="Fotos y Videos"
      description="Sube imágenes de alta calidad para mostrar tu propiedad de la mejor manera. La primera imagen será la imagen principal."
    >
      {/* Validation Status */}
      {isValid && (
        <div className="flex items-center gap-2 mb-4">
          <Badge
            variant="outline"
            className={cn(
              "text-green-600 border-green-600",
              isMobile && "text-xs"
            )}
          >
            <CheckCircle2
              className={cn("mr-1", isMobile ? "h-2 w-2" : "h-3 w-3")}
            />
            Válido
          </Badge>
        </div>
      )}

      {/* Validation Errors */}
      {!isValid && Object.keys(validationErrors).length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(validationErrors).map(([field, errors]) => (
                <li key={field}>
                  {Array.isArray(errors) ? errors.join(", ") : errors}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Guidelines */}
      <WizardFormSection
        title="Consejos para mejores fotos"
        icon={<Info className="h-4 w-4" />}
      >
        <div
          className={cn(
            "gap-4",
            isMobile
              ? "grid grid-cols-1 space-y-3 text-xs"
              : "grid md:grid-cols-2 text-sm"
          )}
        >
          <div>
            <h4
              className={cn(
                "font-medium mb-2",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              Recomendaciones técnicas:
            </h4>
            <ul
              className={cn(
                "text-muted-foreground",
                isMobile ? "space-y-0.5 text-xs" : "space-y-1"
              )}
            >
              <li>• Resolución mínima: 1024x768 píxeles</li>
              <li>• Formato: JPEG, PNG o WebP</li>
              <li>• Tamaño máximo: 10MB por imagen</li>
              <li>• Máximo 20 imágenes por propiedad</li>
            </ul>
          </div>
          <div>
            <h4
              className={cn(
                "font-medium mb-2",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              Mejores prácticas:
            </h4>
            <ul
              className={cn(
                "text-muted-foreground",
                isMobile ? "space-y-0.5 text-xs" : "space-y-1"
              )}
            >
              <li>• Usa luz natural cuando sea posible</li>
              <li>• Incluye fotos de todas las habitaciones</li>
              <li>• Muestra características especiales</li>
              <li>• Evita fotos borrosas o mal iluminadas</li>
            </ul>
          </div>
        </div>
      </WizardFormSection>

      {/* Image Upload Component */}
      <WizardFormSection
        title="Imágenes de la Propiedad"
        icon={<ImageIcon className="h-4 w-4" />}
      >
        <EnhancedImageUpload
          images={images}
          onImagesChange={handleImagesChange}
          maxImages={20}
          maxFileSize={10 * 1024 * 1024} // 10MB
          allowedTypes={["image/jpeg", "image/jpg", "image/png", "image/webp"]}
          disabled={isLoading}
        />
      </WizardFormSection>

      {/* Upload Statistics */}
      {images.length > 0 && (
        <WizardFormSection
          title="Estadísticas de Imágenes"
          icon={<CheckCircle2 className="h-4 w-4" />}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {images.length}
              </div>
              <div className="text-sm text-muted-foreground">Imágenes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {(totalSize / 1024 / 1024).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">MB Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {(averageSize / 1024 / 1024).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">MB Promedio</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {Math.round((images.length / 20) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Capacidad</div>
            </div>
          </div>
        </WizardFormSection>
      )}

      {/* Future: Video Upload Section */}
      <WizardFormSection
        title="Videos (Próximamente)"
        icon={<ImageIcon className="h-4 w-4" />}
        optional
      >
        <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
          <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Videos (Próximamente)</h3>
          <p className="text-muted-foreground text-sm">
            La funcionalidad de subida de videos estará disponible en una futura
            actualización.
          </p>
        </div>
      </WizardFormSection>

      <Separator />

      {/* Navigation */}
      <div
        className={cn(
          isMobile
            ? "flex flex-col space-y-3 pt-4"
            : "flex justify-between items-center"
        )}
      >
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isLoading}
          className={cn(
            "flex items-center gap-2",
            isMobile &&
              `${mobileClasses.touchButton} w-full min-h-[48px] text-base order-2`
          )}
        >
          <ChevronLeft className={cn(isMobile ? "w-5 h-5" : "w-4 h-4")} />
          Anterior
        </Button>

        <div
          className={cn(
            "flex items-center gap-2 text-muted-foreground",
            isMobile ? "text-xs justify-center order-3" : "text-sm"
          )}
        >
          <span>Paso 3 de 4</span>
          {isValid && (
            <Badge
              variant="outline"
              className={cn(
                "text-green-600 border-green-600",
                isMobile && "text-xs"
              )}
            >
              Completado
            </Badge>
          )}
        </div>

        <Button
          onClick={handleNext}
          disabled={isLoading || !isValid}
          className={cn(
            "flex items-center gap-2",
            isMobile &&
              `${mobileClasses.touchButton} w-full min-h-[48px] text-base order-1`
          )}
        >
          Siguiente
          <ChevronRight className={cn(isMobile ? "w-5 h-5" : "w-4 h-4")} />
        </Button>
      </div>

      {/* Help Text */}
      {!isValid && images.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Sube al menos una imagen para continuar al siguiente paso. Las
            imágenes de alta calidad ayudan a atraer más compradores
            potenciales.
          </AlertDescription>
        </Alert>
      )}
    </WizardStepLayout>
  );
}
