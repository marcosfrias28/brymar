// Property General Information Step for New Framework

"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WizardStepProps } from '@/types/wizard-core';
import {
  PropertyWizardData,
  PropertyType,
  PropertyCharacteristic,
  PropertyBasicInfo,
} from '@/types/property-wizard';
import { PropertyGeneralSchema } from '@/lib/schemas/property-wizard-schemas';
import { useMobileFormOptimization } from '@/hooks/use-mobile-responsive';
import { mobileClasses } from '@/lib/utils/mobile-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedAIDescription } from '@/components/wizard/shared/enhanced-ai-description';
import {
  WizardStepLayout,
  WizardFormSection,
  WizardFormField,
  WizardSelectionGrid,
} from '@/components/wizard/shared/consistent-navigation';
import {
  ChevronRight,
  Home,
  Building,
  TreePine,
  Store,
  Castle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from '@/lib/utils';
import { z } from "zod";
import { useAIGeneration } from '@/hooks/use-ai-generation';

type GeneralFormData = z.infer<typeof PropertyGeneralSchema>;

// Property type configurations with icons
const PROPERTY_TYPE_ICONS = {
  [PropertyType.HOUSE]: Home,
  [PropertyType.APARTMENT]: Building,
  [PropertyType.VILLA]: Castle,
  [PropertyType.LAND]: TreePine,
  [PropertyType.COMMERCIAL]: Store,
};

export function PropertyGeneralStep({
  data,
  onUpdate,
  onNext,
  isLoading,
  isMobile = false,
}: WizardStepProps<PropertyWizardData>) {
  // Static Spanish text instead of translations - memoized to prevent re-renders
  const propertyTypes = useMemo(
    () => ({
      house: {
        label: "Casa",
        description: "Casa unifamiliar independiente",
      },
      apartment: {
        label: "Apartamento",
        description: "Apartamento en edificio residencial",
      },
      villa: {
        label: "Villa",
        description: "Villa de lujo con jardín",
      },
      land: {
        label: "Terreno",
        description: "Terreno para construcción",
      },
      commercial: {
        label: "Comercial",
        description: "Propiedad comercial o de oficinas",
      },
    }),
    []
  );

  const characteristicTranslations = useMemo(
    () => ({
      pool: "Piscina",
      gym: "Gimnasio",
      parking: "Estacionamiento",
      garden: "Jardín",
      terrace: "Terraza",
      balcony: "Balcón",
      garage: "Garaje",
      security: "Seguridad",
      furnished: "Amueblado",
      air_conditioning: "Aire Acondicionado",
      heating: "Calefacción",
      fireplace: "Chimenea",
      walk_in_closet: "Vestidor",
      laundry_room: "Cuarto de Lavado",
      storage: "Almacenamiento",
      elevator: "Ascensor",
      ocean_view: "Vista al Mar",
      mountain_view: "Vista a la Montaña",
      city_view: "Vista a la Ciudad",
      beach_access: "Acceso a la Playa",
      golf_course: "Campo de Golf",
      shopping_center: "Centro Comercial",
    }),
    []
  );

  // Mobile form optimization
  const { getInputProps } = useMobileFormOptimization();

  const [characteristics, setCharacteristics] = useState<
    PropertyCharacteristic[]
  >(data.characteristics || []);
  const [characteristicsValid, setCharacteristicsValid] = useState(true);

  // AI Generation hook for title only
  const {
    isGenerating,
    error: aiError,
    generateTitle,
  } = useAIGeneration({
    language: "es",
    onSuccess: (type, content) => {
      if (type === "title" && typeof content === "string") {
        setValue("title", content);
        trigger("title");
      }
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    trigger,
  } = useForm<GeneralFormData>({
    resolver: zodResolver(PropertyGeneralSchema),
    mode: "onChange",
    defaultValues: {
      title: data.title || "",
      description: data.description || "",
      price: data.price || undefined,
      surface: data.surface || undefined,
      propertyType: data.propertyType || undefined,
      bedrooms: data.bedrooms || undefined,
      bathrooms: data.bathrooms || undefined,
      characteristics: characteristics,
    },
  });

  const watchedValues = watch();

  // Memoize form data to prevent unnecessary re-renders
  const formData = useMemo(
    () => ({
      ...watchedValues,
      characteristics,
    }),
    [watchedValues, characteristics]
  );

  // Update parent component when form data changes - use a ref to prevent infinite loops
  const previousFormDataRef = useRef<string>("");
  const onUpdateRef = useRef(onUpdate);

  // Update the ref when onUpdate changes
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const currentFormDataString = JSON.stringify(formData);
    // Only update if the data has actually changed
    if (previousFormDataRef.current !== currentFormDataString) {
      previousFormDataRef.current = currentFormDataString;
      onUpdateRef.current(formData);
    }
  }, [formData]);

  // Update characteristics in form when they change
  useEffect(() => {
    setValue("characteristics", characteristics, { shouldValidate: true });
  }, [characteristics, setValue]);

  // Helper function to build property data for AI generation - memoized
  const buildPropertyBasicInfo = useMemo((): PropertyBasicInfo | null => {
    if (
      !watchedValues.propertyType ||
      !watchedValues.price ||
      !watchedValues.surface
    ) {
      return null;
    }

    const selectedChars = characteristics
      .filter((char) => char.selected)
      .map((char) => char.name);

    return {
      type:
        propertyTypes[watchedValues.propertyType]?.label ||
        watchedValues.propertyType,
      location: "República Dominicana", // Default location, will be updated in step 2
      price: watchedValues.price,
      surface: watchedValues.surface,
      characteristics: selectedChars,
      bedrooms: watchedValues.bedrooms,
      bathrooms: watchedValues.bathrooms,
    };
  }, [watchedValues, characteristics, propertyTypes]);

  // AI Generation handlers
  const handleGenerateTitle = useCallback(async () => {
    if (buildPropertyBasicInfo) {
      await generateTitle(buildPropertyBasicInfo);
    }
  }, [buildPropertyBasicInfo, generateTitle]);

  const canGenerateAI = useCallback(() => {
    return !!watchedValues.propertyType;
  }, [watchedValues]);

  const onSubmit = (formData: GeneralFormData) => {
    if (isValid && characteristicsValid) {
      onNext();
    }
  };

  return (
    <WizardStepLayout
      title="Información General"
      description="Proporciona los detalles básicos de tu propiedad"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información General */}
        <WizardFormSection
          title="Información General"
          icon={<Home className="h-5 w-5" />}
        >
          <div
            className={cn(
              "gap-4",
              isMobile
                ? "grid grid-cols-1 space-y-4"
                : "grid grid-cols-1 md:grid-cols-2"
            )}
          >
            {/* Property Type Selection - Moved up */}
            <WizardFormSection title="Tipo de Propiedad *">
              <WizardSelectionGrid columns={2}>
                {Object.entries(PropertyType).map(([key, type]) => {
                  const Icon = PROPERTY_TYPE_ICONS[type];
                  const typeConfig =
                    propertyTypes[type as keyof typeof propertyTypes];
                  const isSelected = watchedValues.propertyType === type;

                  return (
                    <Button
                      key={type}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "h-auto p-4 flex flex-col items-center gap-2 text-center",
                        isSelected &&
                          "border-primary bg-primary text-primary-foreground",
                        errors.propertyType && "border-destructive"
                      )}
                      onClick={() => {
                        setValue("propertyType", type as PropertyType);
                        trigger("propertyType");
                      }}
                    >
                      <Icon className="h-6 w-6" />
                      <div>
                        <div className="font-medium">{typeConfig.label}</div>
                        <div className="text-xs opacity-70">
                          {typeConfig.description}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </WizardSelectionGrid>
              {errors.propertyType && (
                <p className="text-sm text-destructive mt-2">
                  {errors.propertyType.message}
                </p>
              )}
            </WizardFormSection>
            <WizardFormField
              label="Título de la Propiedad *"
              error={errors.title?.message}
              className={cn(isMobile ? "col-span-1" : "md:col-span-2")}
            >
              <Input
                id="title"
                {...register("title")}
                {...getInputProps("text")}
                placeholder="Ej: Hermosa casa con jardín en zona residencial"
                className={cn(
                  errors.title && "border-destructive",
                  isMobile && mobileClasses.mobileInput
                )}
              />
            </WizardFormField>

            {/* AI Title Generation - Moved here */}
            <div
              className={cn(isMobile ? "col-span-1" : "md:col-span-2", "mt-2")}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  onClick={handleGenerateTitle}
                  disabled={!canGenerateAI() || isGenerating}
                  variant="outline"
                  size="sm"
                  className={cn("flex-1", isMobile && "min-h-[40px] text-sm")}
                >
                  {isGenerating ? (
                    <Loader2
                      className={cn(
                        "animate-spin mr-2",
                        isMobile ? "w-4 h-4" : "w-3 h-3"
                      )}
                    />
                  ) : (
                    <Sparkles
                      className={cn("mr-2", isMobile ? "w-4 h-4" : "w-3 h-3")}
                    />
                  )}
                  {isGenerating ? "Generando..." : "Generar Título con IA"}
                </Button>
              </div>

              {!canGenerateAI() && (
                <p
                  className={cn(
                    "text-muted-foreground text-center mt-1",
                    isMobile ? "text-xs px-2" : "text-xs"
                  )}
                >
                  Selecciona el tipo de propiedad para usar la IA
                </p>
              )}

              {aiError && (
                <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md mt-2">
                  <p className="text-xs text-destructive">{aiError}</p>
                </div>
              )}
            </div>

            <WizardFormField label="Precio *" error={errors.price?.message}>
              <Input
                id="price"
                type="number"
                {...register("price", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number(value) || undefined,
                })}
                {...getInputProps("number")}
                placeholder="150000"
                className={cn(
                  errors.price && "border-destructive",
                  isMobile && mobileClasses.mobileInput
                )}
              />
            </WizardFormField>

            <WizardFormField
              label="Superficie *"
              error={errors.surface?.message}
            >
              <Input
                id="surface"
                type="number"
                {...register("surface", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number(value) || undefined,
                })}
                {...getInputProps("number")}
                placeholder="200"
                className={cn(
                  errors.surface && "border-destructive",
                  isMobile && mobileClasses.mobileInput
                )}
              />
            </WizardFormField>

            <WizardFormField
              label="Habitaciones"
              error={errors.bedrooms?.message}
            >
              <Input
                id="bedrooms"
                type="number"
                {...register("bedrooms", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number(value) || undefined,
                })}
                {...getInputProps("number")}
                placeholder="3"
                min="0"
                max="50"
                className={cn(isMobile && mobileClasses.mobileInput)}
              />
            </WizardFormField>

            <WizardFormField label="Baños" error={errors.bathrooms?.message}>
              <Input
                id="bathrooms"
                type="number"
                {...register("bathrooms", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number(value) || undefined,
                })}
                {...getInputProps("number")}
                placeholder="2"
                min="0"
                max="50"
                className={cn(isMobile && mobileClasses.mobileInput)}
              />
            </WizardFormField>
          </div>
        </WizardFormSection>

        {/* Property Characteristics - Moved up */}
        <WizardFormSection title="Características de la Propiedad *">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Selecciona las características que mejor describan tu propiedad:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(characteristicTranslations)
                .slice(0, 12)
                .map(([key, label]) => {
                  const isSelected = characteristics.some(
                    (char) => char.name === label && char.selected
                  );
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        const newCharacteristics = [...characteristics];
                        const existingIndex = newCharacteristics.findIndex(
                          (char) => char.name === label
                        );

                        if (existingIndex >= 0) {
                          newCharacteristics[existingIndex].selected =
                            !newCharacteristics[existingIndex].selected;
                        } else {
                          newCharacteristics.push({
                            id: key,
                            name: label,
                            category: "feature" as const,
                            selected: true,
                          });
                        }

                        setCharacteristics(newCharacteristics);
                        setCharacteristicsValid(
                          newCharacteristics.some((char) => char.selected)
                        );
                      }}
                      className={cn(
                        "p-2 text-xs border rounded-md transition-colors text-left",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted border-border"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
            </div>
            {!characteristicsValid && (
              <p className="text-sm text-destructive">
                Selecciona al menos una característica
              </p>
            )}
          </div>
        </WizardFormSection>

        {/* Enhanced AI Description Component - Now at the end */}
        <WizardFormField
          label="Descripción"
          error={errors.description?.message}
        >
          <EnhancedAIDescription
            value={watchedValues.description || ""}
            onChange={(value) => {
              setValue("description", value);
              trigger("description");
            }}
            propertyData={buildPropertyBasicInfo}
            placeholder="Describe las características principales de la propiedad, ubicación, comodidades y cualquier detalle relevante..."
            isMobile={isMobile}
            disabled={isLoading}
          />
        </WizardFormField>

        {/* Navigation */}
        <div
          className={cn(
            "flex",
            isMobile ? "justify-center pt-4" : "justify-end"
          )}
        >
          <Button
            type="submit"
            disabled={!isValid || !characteristicsValid || isLoading}
            className={cn(
              isMobile ? "w-full min-h-[48px] text-base" : "min-w-[120px]",
              isMobile && mobileClasses.touchButton
            )}
          >
            {isLoading ? "Validando..." : "Siguiente"}
            <ChevronRight
              className={cn("ml-2", isMobile ? "w-5 h-5" : "w-4 h-4")}
            />
          </Button>
        </div>
      </form>
    </WizardStepLayout>
  );
}
