"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GeneralInfoStepProps,
  PropertyType,
  PropertyCharacteristic,
  PropertyBasicInfo,
} from "@/types/wizard";
import { useMobileFormOptimization } from "@/hooks/use-mobile-responsive";
import { mobileClasses } from "@/lib/utils/mobile-utils";
import { Step1Schema } from "@/lib/schemas/wizard-schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CharacteristicsSelector } from "@/components/wizard/characteristics-selector";
import {
  ChevronRight,
  Home,
  Building,
  TreePine,
  Store,
  Castle,
  Sparkles,
  Wand2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useAIGeneration } from "@/hooks/use-ai-generation";
// Removed translations import

type Step1FormData = z.infer<typeof Step1Schema>;

// Property type configurations with icons
const PROPERTY_TYPE_ICONS = {
  [PropertyType.HOUSE]: Home,
  [PropertyType.APARTMENT]: Building,
  [PropertyType.VILLA]: Castle,
  [PropertyType.LAND]: TreePine,
  [PropertyType.COMMERCIAL]: Store,
};

export function GeneralInfoStep({
  data,
  onUpdate,
  onNext,
  isLoading,
  isMobile = false,
}: GeneralInfoStepProps & { isMobile?: boolean }) {
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
  const { getInputProps, getTextareaProps } = useMobileFormOptimization();

  // Memoized translations object to prevent infinite re-renders
  const characteristicsSelectorTranslations = useMemo(
    () => ({
      characteristicsTitle: "Características de la Propiedad",
      selectedCharacteristics: "Características Seleccionadas",
      selectRecommended: "Seleccionar Recomendadas",
      clearAll: "Limpiar Todo",
      searchCharacteristics: "Buscar características...",
      allCategories: "Todas las Categorías",
      allCharacteristics: "Todas las Características",
      byCategory: "Por Categoría",
      noCharacteristicsFound: "No se encontraron características",
      noCharacteristicsAvailable: "No hay características disponibles",
      customCharacteristics: "Características Personalizadas",
      addCustom: "Agregar Personalizada",
      customCharacteristicPlaceholder: "Ej: Vista panorámica",
      add: "Agregar",
      cancel: "Cancelar",
      minCharacteristicsRequired: "Selecciona al menos una característica",
      maxCharacteristicsReached: "Máximo de características alcanzado",
      invalidCharacteristics: "Características inválidas",
      amenities: "Comodidades",
      features: "Características",
      location: "Ubicación",
      ...characteristicTranslations,
    }),
    [characteristicTranslations]
  );

  const [characteristics, setCharacteristics] = useState<
    PropertyCharacteristic[]
  >(data.characteristics || []);
  const [characteristicsValid, setCharacteristicsValid] = useState(true);

  // AI Generation hook
  const {
    isGenerating,
    error: aiError,
    generateTitle,
    generateDescription,
    generateAll,
    clearState: clearAIState,
  } = useAIGeneration({
    language: "es",
    onSuccess: (type, content) => {
      if (type === "title" && typeof content === "string") {
        setValue("title", content);
        trigger("title");
      } else if (type === "description" && typeof content === "string") {
        setValue("description", content);
        trigger("description");
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
  } = useForm<Step1FormData>({
    resolver: zodResolver(Step1Schema),
    mode: "onChange",
    defaultValues: {
      title: data.title || "",
      description: data.description || "",
      price: data.price || 0,
      surface: data.surface || 0,
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

  useEffect(() => {
    const currentFormDataString = JSON.stringify(formData);
    // Only update if the data has actually changed
    if (previousFormDataRef.current !== currentFormDataString) {
      previousFormDataRef.current = currentFormDataString;
      onUpdate(formData);
    }
  }, [formData, onUpdate]);

  // Update characteristics in form when they change
  useEffect(() => {
    setValue("characteristics", characteristics, { shouldValidate: true });
  }, [characteristics, setValue]);

  const handleCharacteristicsChange = useCallback(
    (newCharacteristics: PropertyCharacteristic[]) => {
      setCharacteristics(newCharacteristics);
    },
    []
  );

  const handleCharacteristicsValidationChange = useCallback(
    (isValid: boolean) => {
      setCharacteristicsValid(isValid);
    },
    []
  );

  // Helper function to build property data for AI generation
  const buildPropertyBasicInfo = useCallback((): PropertyBasicInfo | null => {
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
    const propertyData = buildPropertyBasicInfo();
    if (propertyData) {
      await generateTitle(propertyData);
    }
  }, [buildPropertyBasicInfo, generateTitle]);

  const handleGenerateDescription = useCallback(async () => {
    const propertyData = buildPropertyBasicInfo();
    if (propertyData) {
      await generateDescription(propertyData);
    }
  }, [buildPropertyBasicInfo, generateDescription]);

  const handleGenerateAll = useCallback(async () => {
    const propertyData = buildPropertyBasicInfo();
    if (propertyData) {
      await generateAll(propertyData);
    }
  }, [buildPropertyBasicInfo, generateAll]);

  const canGenerateAI = useCallback(() => {
    return !!(
      watchedValues.propertyType &&
      watchedValues.price &&
      watchedValues.surface
    );
  }, [watchedValues]);

  const onSubmit = (formData: Step1FormData) => {
    if (isValid && characteristicsValid) {
      onNext();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(isMobile ? mobileClasses.mobileForm : "space-y-6")}
    >
      {/* Basic Information */}
      <Card className={cn(isMobile && "border-0 shadow-none bg-transparent")}>
        <CardHeader className={cn(isMobile ? "px-0 pb-3" : "")}>
          <CardTitle
            className={cn(
              "flex items-center gap-2",
              isMobile ? "text-base" : "text-lg"
            )}
          >
            <Home className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")} />
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent className={cn(isMobile ? "px-0 space-y-3" : "space-y-4")}>
          <div
            className={cn(
              "gap-4",
              isMobile
                ? "grid grid-cols-1 space-y-4"
                : "grid grid-cols-1 md:grid-cols-2"
            )}
          >
            <div className={cn(isMobile ? "col-span-1" : "md:col-span-2")}>
              <Label
                htmlFor="title"
                className={cn(isMobile ? "text-sm font-medium" : "")}
              >
                Título de la Propiedad *
              </Label>
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
              {errors.title && (
                <p
                  className={cn(
                    "text-destructive mt-1",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="price"
                className={cn(isMobile ? "text-sm font-medium" : "")}
              >
                Precio *
              </Label>
              <Input
                id="price"
                type="number"
                {...register("price", { valueAsNumber: true })}
                {...getInputProps("number")}
                placeholder="150000"
                className={cn(
                  errors.price && "border-destructive",
                  isMobile && mobileClasses.mobileInput
                )}
              />
              {errors.price && (
                <p
                  className={cn(
                    "text-destructive mt-1",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="surface"
                className={cn(isMobile ? "text-sm font-medium" : "")}
              >
                Superficie *
              </Label>
              <Input
                id="surface"
                type="number"
                {...register("surface", { valueAsNumber: true })}
                {...getInputProps("number")}
                placeholder="200"
                className={cn(
                  errors.surface && "border-destructive",
                  isMobile && mobileClasses.mobileInput
                )}
              />
              {errors.surface && (
                <p
                  className={cn(
                    "text-destructive mt-1",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  {errors.surface.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="bedrooms"
                className={cn(isMobile ? "text-sm font-medium" : "")}
              >
                Habitaciones
              </Label>
              <Input
                id="bedrooms"
                type="number"
                {...register("bedrooms", { valueAsNumber: true })}
                {...getInputProps("number")}
                placeholder="3"
                min="0"
                max="50"
                className={cn(isMobile && mobileClasses.mobileInput)}
              />
              {errors.bedrooms && (
                <p
                  className={cn(
                    "text-destructive mt-1",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  {errors.bedrooms.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="bathrooms"
                className={cn(isMobile ? "text-sm font-medium" : "")}
              >
                Baños
              </Label>
              <Input
                id="bathrooms"
                type="number"
                {...register("bathrooms", { valueAsNumber: true })}
                {...getInputProps("number")}
                placeholder="2"
                min="0"
                max="50"
                className={cn(isMobile && mobileClasses.mobileInput)}
              />
              {errors.bathrooms && (
                <p
                  className={cn(
                    "text-destructive mt-1",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  {errors.bathrooms.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label
              htmlFor="description"
              className={cn(isMobile ? "text-sm font-medium" : "")}
            >
              Descripción *
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              {...getTextareaProps()}
              placeholder="Describe las características principales de la propiedad, ubicación, comodidades y cualquier detalle relevante..."
              rows={isMobile ? 3 : 4}
              className={cn(
                errors.description && "border-destructive",
                isMobile && "text-base"
              )}
            />
            {errors.description && (
              <p
                className={cn(
                  "text-destructive mt-1",
                  isMobile ? "text-xs" : "text-sm"
                )}
              >
                {errors.description.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Property Type Selection */}
      <Card className={cn(isMobile && "border-0 shadow-none bg-transparent")}>
        <CardHeader className={cn(isMobile ? "px-0 pb-3" : "")}>
          <CardTitle className={cn(isMobile ? "text-base" : "text-lg")}>
            Tipo de Propiedad *
          </CardTitle>
        </CardHeader>
        <CardContent className={cn(isMobile ? "px-0" : "")}>
          <div
            className={cn(
              "gap-3",
              isMobile
                ? "grid grid-cols-1 space-y-2"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {Object.entries(PropertyType).map(([key, type]) => {
              const Icon = PROPERTY_TYPE_ICONS[type];
              const isSelected = watchedValues.propertyType === type;
              const typeConfig =
                propertyTypes[type as keyof typeof propertyTypes];

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setValue("propertyType", type as PropertyType);
                    trigger("propertyType");
                  }}
                  className={cn(
                    "border-2 rounded-lg text-left transition-all hover:border-primary/50",
                    isMobile ? "p-3 min-h-[60px] active:scale-95" : "p-4",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/30",
                    isMobile && mobileClasses.touchButton
                  )}
                >
                  <div
                    className={cn(
                      "flex items-start",
                      isMobile ? "gap-2" : "gap-3"
                    )}
                  >
                    <Icon
                      className={cn(
                        "mt-0.5",
                        isMobile ? "w-5 h-5" : "w-6 h-6",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <div>
                      <h3
                        className={cn(
                          "font-medium",
                          isMobile ? "text-sm" : "text-base",
                          isSelected ? "text-primary" : "text-foreground"
                        )}
                      >
                        {typeConfig.label}
                      </h3>
                      <p
                        className={cn(
                          "text-muted-foreground",
                          isMobile ? "text-xs" : "text-sm"
                        )}
                      >
                        {typeConfig.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {errors.propertyType && (
            <p
              className={cn(
                "text-destructive mt-2",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              {errors.propertyType.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Property Characteristics - Temporarily simplified to prevent infinite loops */}
      <Card className={cn(isMobile && "border-0 shadow-none bg-transparent")}>
        <CardHeader className={cn(isMobile ? "px-0 pb-3" : "")}>
          <CardTitle className={cn(isMobile ? "text-base" : "text-lg")}>
            Características de la Propiedad *
          </CardTitle>
        </CardHeader>
        <CardContent className={cn(isMobile ? "px-0" : "")}>
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
        </CardContent>
      </Card>

      {/* AI Generation */}
      <Card
        className={cn(
          "border-dashed border-primary/20 bg-primary/5",
          isMobile && "border-0 shadow-none"
        )}
      >
        <CardHeader className={cn(isMobile ? "px-0 pb-3" : "")}>
          <CardTitle
            className={cn(
              "flex items-center gap-2",
              isMobile ? "text-base" : "text-lg"
            )}
          >
            <Wand2
              className={cn("text-primary", isMobile ? "w-4 h-4" : "w-5 h-5")}
            />
            Asistente de IA
          </CardTitle>
          <p
            className={cn(
              "text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}
          >
            Genera contenido automáticamente usando inteligencia artificial
          </p>
        </CardHeader>
        <CardContent className={cn(isMobile ? "px-0 space-y-3" : "space-y-4")}>
          {aiError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{aiError}</p>
            </div>
          )}

          <div
            className={cn(
              "gap-3",
              isMobile
                ? "grid grid-cols-1 space-y-2"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            )}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateTitle}
              disabled={!canGenerateAI() || isGenerating}
              className={cn(
                "h-auto flex flex-col items-start gap-1",
                isMobile ? "p-2 min-h-[60px] text-xs w-full" : "p-3",
                isMobile && mobileClasses.touchButton
              )}
            >
              {isGenerating ? (
                <Loader2
                  className={cn(
                    "animate-spin",
                    isMobile ? "w-3 h-3" : "w-4 h-4"
                  )}
                />
              ) : (
                <Sparkles className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
              )}
              <span
                className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}
              >
                Generar Título
              </span>
              <span
                className={cn(
                  "text-muted-foreground",
                  isMobile ? "text-xs leading-tight" : "text-xs"
                )}
              >
                Crea un título atractivo automáticamente
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateDescription}
              disabled={!canGenerateAI() || isGenerating}
              className={cn(
                "h-auto flex flex-col items-start gap-1",
                isMobile ? "p-2 min-h-[60px] text-xs w-full" : "p-3",
                isMobile && mobileClasses.touchButton
              )}
            >
              {isGenerating ? (
                <Loader2
                  className={cn(
                    "animate-spin",
                    isMobile ? "w-3 h-3" : "w-4 h-4"
                  )}
                />
              ) : (
                <Sparkles className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
              )}
              <span
                className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}
              >
                Generar Descripción
              </span>
              <span
                className={cn(
                  "text-muted-foreground",
                  isMobile ? "text-xs leading-tight" : "text-xs"
                )}
              >
                Crea una descripción detallada automáticamente
              </span>
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleGenerateAll}
              disabled={!canGenerateAI() || isGenerating}
              className={cn(
                "h-auto flex flex-col items-start gap-1",
                isMobile
                  ? "p-2 min-h-[60px] text-xs w-full col-span-1"
                  : "p-3 sm:col-span-2 lg:col-span-1",
                isMobile && mobileClasses.touchButton
              )}
            >
              {isGenerating ? (
                <Loader2
                  className={cn(
                    "animate-spin",
                    isMobile ? "w-3 h-3" : "w-4 h-4"
                  )}
                />
              ) : (
                <Wand2 className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
              )}
              <span
                className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}
              >
                Generar Todo
              </span>
              <span
                className={cn(
                  isMobile
                    ? "text-xs text-primary-foreground/90 leading-tight"
                    : "text-xs text-primary-foreground/80"
                )}
              >
                Genera título y descripción completos
              </span>
            </Button>
          </div>

          {!canGenerateAI() && (
            <p
              className={cn(
                "text-muted-foreground text-center",
                isMobile ? "text-xs px-2" : "text-xs"
              )}
            >
              Completa el tipo de propiedad, precio y superficie para usar la IA
            </p>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div
        className={cn("flex", isMobile ? "justify-center pt-4" : "justify-end")}
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
  );
}
