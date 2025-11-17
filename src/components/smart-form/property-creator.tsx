"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Switch } from "@/components/ui/switch";
import { SmartFormProvider } from "@/components/smart-form/SmartFormContext";
import { GeoField } from "@/components/smart-form/GeoField";
import { ImageDropzone } from "@/components/smart-form/image-dropzone";
import { SmartRichEditor } from "@/components/smart-form/SmartRichEditor";
import { SeoPreview } from "@/components/smart-form/SeoPreview";
import { useActionState } from "react";
import { usePropertyCreatorStore } from "@/stores/creator/propertyCreatorStore";
import { Save, Home, DollarSign, Maximize2, Bed, Bath, MapPin, Sparkles, Tag, FileText, Loader2, Plus, X, ImageIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export const PropertyCreatorSchema = z.object({
  title: z.string().min(2, "Título requerido"),
  description: z.string().min(10, "Descripción mínima de 10 caracteres"),
  price: z.coerce.number().nonnegative("Precio inválido"),
  surface: z.coerce.number().nonnegative("Superficie inválida"),
  propertyType: z.string().optional(),
  bedrooms: z.coerce.number().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  amenities: z.string().optional(),
  features: z.string().optional(),
  tags: z.string().optional(),
  status: z.string().optional(),
  location: z.string().optional(),
  images: z.array(z.object({ url: z.string().url() })).optional(),
});

type FormValues = z.infer<typeof PropertyCreatorSchema>;
type PropertyCreatorProps = { initialValues?: Partial<FormValues> };

const SPECIAL_FEATURES = [
  "Vista panorámica",
  "Balcón amplio",
  "Terraza privada",
  "Jardín",
  "Piscina privada",
  "Cocina equipada",
  "Acabados de lujo",
  "Pisos de mármol",
  "Ventanas grandes",
  "Iluminación natural",
  "Sistema de seguridad",
  "Domótica",
  "Energía solar",
  "Chimenea",
  "Walking closet"
];

const COMMON_AMENITIES = [
  "Piscina",
  "Gimnasio",
  "Seguridad 24/7",
  "Parque infantil",
  "Salón de eventos",
  "BBQ area",
  "Cancha deportiva",
  "Lobby",
  "Ascensor",
  "Estacionamiento",
  "Portería",
  "Zona verde",
  "Pet friendly",
  "Coworking",
  "Terraza común"
];

export function PropertyCreator({ initialValues }: PropertyCreatorProps) {
  const [state, action] = useActionState(async (_prev: any, formData: FormData) => {
    const mod = await import("@/lib/actions/creator-actions");
    return mod.savePropertyDraft(_prev, formData);
  }, {} as any);
  
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { form, setField } = usePropertyCreatorStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState("");
  const [customFeature, setCustomFeature] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(PropertyCreatorSchema),
    defaultValues: initialValues ?? {
      title: (form.title as unknown as string) || "",
      description: (form.description as unknown as string) || "",
      price: (form.price as unknown as number) || 0,
      surface: (form.surface as unknown as number) || 0,
      propertyType: (form.propertyType as unknown as string) || "",
      bedrooms: (form.bedrooms as unknown as number) || undefined,
      bathrooms: (form.bathrooms as unknown as number) || undefined,
      amenities: (form.amenities as unknown as string) || "",
      features: (form.features as unknown as string) || "",
      tags: (form.tags as unknown as string) || "",
      status: (form.status as unknown as string) || "draft",
      location: (form.location as unknown as string) || "",
      images: (form.images as unknown as Array<{ url: string }>) || [],
    },
  });

  const onSave = async (payload: Record<string, any>) => {
    if (inputRef.current && formRef.current) {
      inputRef.current.value = JSON.stringify(payload);
      formRef.current.requestSubmit();
    }
  };

  const generateAIContent = async (field: "title" | "description" | "tags") => {
    setIsGenerating(true);
    try {
      const values = getValues();
      const contextData = {
        type: values.propertyType || "propiedad",
        location: values.location || "ubicación exclusiva",
        bedrooms: values.bedrooms || 0,
        bathrooms: values.bathrooms || 0,
        surface: values.surface || 0,
        price: values.price || 0,
        amenities: selectedAmenities.join(", "),
        features: selectedFeatures.join(", "),
      };

      const contextPrompt = `Propiedad tipo ${contextData.type} en ${contextData.location}. ${contextData.bedrooms} habitaciones, ${contextData.bathrooms} baños, ${contextData.surface}m². Amenidades: ${contextData.amenities || "excelentes"}. Características: ${contextData.features || "modernas"}. Precio: $${contextData.price.toLocaleString()}.`;

      let prompt = "";
      let maxLength = 100;

      if (field === "title") {
        prompt = `Crea un título atractivo, profesional y llamativo para esta propiedad inmobiliaria. Máximo 80 caracteres. ${contextPrompt}`;
        maxLength = 80;
      } else if (field === "description") {
        prompt = `Escribe una descripción detallada, atractiva y profesional para esta propiedad inmobiliaria. Resalta los beneficios y características únicas. Entre 150-300 caracteres. ${contextPrompt}`;
        maxLength = 300;
      } else if (field === "tags") {
        prompt = `Genera 5-8 etiquetas SEO relevantes para esta propiedad, separadas por comas. Usa términos que la gente buscaría en Google. ${contextPrompt}`;
        maxLength = 120;
      }

      const response = await fetch("/api/generate-ai-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, maxLength }),
      });

      const { text } = await response.json();
      setValue(field, text);
      setField(field, text);
    } catch (error) {
      console.error("Error generando contenido con IA:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !selectedAmenities.includes(customAmenity.trim())) {
      setSelectedAmenities(prev => [...prev, customAmenity.trim()]);
      setCustomAmenity("");
    }
  };

  const addCustomFeature = () => {
    if (customFeature.trim() && !selectedFeatures.includes(customFeature.trim())) {
      setSelectedFeatures(prev => [...prev, customFeature.trim()]);
      setCustomFeature("");
    }
  };

  const tagsArray = watch("tags")?.split(",").map(t => t.trim()).filter(Boolean) || [];

  return (
    <SmartFormProvider onSave={onSave}>
      <div className="mx-auto max-w-7xl space-y-8 p-6">
        <div className="space-y-2">
          <h1 className="text-balance text-4xl font-bold tracking-tight">
            Crea tu Propiedad
          </h1>
          <p className="text-pretty text-lg text-muted-foreground">
            Completa la información básica y deja que la IA optimice tu listado automáticamente
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Columna izquierda - Información básica y características (2/3 del ancho) */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="price" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Precio
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <InputGroupText>$</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput 
                        id="price" 
                        type="number" 
                        placeholder="250000"
                        aria-invalid={!!errors.price} 
                        {...register("price", { valueAsNumber: true, onChange: (e) => setField("price", Number(e.target.value)) })} 
                      />
                    </InputGroup>
                    <FieldError errors={errors.price ? [{ message: errors.price.message }] : undefined} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="surface" className="flex items-center gap-2">
                      <Maximize2 className="h-4 w-4" />
                      Superficie
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput 
                        id="surface" 
                        type="number" 
                        placeholder="120"
                        aria-invalid={!!errors.surface} 
                        {...register("surface", { valueAsNumber: true, onChange: (e) => setField("surface", Number(e.target.value)) })} 
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>m²</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldError errors={errors.surface ? [{ message: errors.surface.message }] : undefined} />
                  </Field>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <Field>
                    <FieldLabel htmlFor="propertyType">Tipo de Propiedad</FieldLabel>
                    <Select 
                      value={watch("propertyType")} 
                      onValueChange={(v) => { setValue("propertyType", v); setField("propertyType", v); }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartamento">Apartamento</SelectItem>
                        <SelectItem value="casa">Casa</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                        <SelectItem value="terreno">Terreno</SelectItem>
                        <SelectItem value="oficina">Oficina</SelectItem>
                        <SelectItem value="local">Local Comercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="bedrooms" className="flex items-center gap-2">
                      <Bed className="h-4 w-4" />
                      Habitaciones
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput 
                        id="bedrooms" 
                        type="number" 
                        placeholder="3"
                        {...register("bedrooms", { valueAsNumber: true, onChange: (e) => setField("bedrooms", Number(e.target.value)) })} 
                      />
                      <InputGroupAddon align="inline-end">
                        <Bed className="h-4 w-4" />
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="bathrooms" className="flex items-center gap-2">
                      <Bath className="h-4 w-4" />
                      Baños
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput 
                        id="bathrooms" 
                        type="number" 
                        placeholder="2"
                        {...register("bathrooms", { valueAsNumber: true, onChange: (e) => setField("bathrooms", Number(e.target.value)) })} 
                      />
                      <InputGroupAddon align="inline-end">
                        <Bath className="h-4 w-4" />
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ubicación
                  </FieldLabel>
                  <FieldDescription>Ingresa la dirección o zona de la propiedad</FieldDescription>
                  <GeoField 
                    name="location" 
                    label="" 
                    value={watch("location") || ""} 
                    onChange={(v) => { setValue("location", v as any); setField("location", v); }} 
                  />
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Amenidades</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Selecciona las amenidades disponibles haciendo clic en cada badge
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {COMMON_AMENITIES.map((amenity) => {
                      const isSelected = selectedAmenities.includes(amenity);
                      return (
                        <Badge
                          key={amenity}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                            isSelected 
                              ? "shadow-sm" 
                              : "hover:border-primary/50"
                          }`}
                          onClick={() => toggleAmenity(amenity)}
                        >
                          {amenity}
                        </Badge>
                      );
                    })}
                  </div>

                  {selectedAmenities.length > 0 && (
                    <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                      <p className="text-sm font-medium">Seleccionadas ({selectedAmenities.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedAmenities.map((amenity) => (
                          <Badge key={amenity} className="gap-1.5 pr-1">
                            {amenity}
                            <button
                              type="button"
                              onClick={() => toggleAmenity(amenity)}
                              className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 space-y-2">
                    <FieldLabel className="text-sm">Agregar amenidad personalizada</FieldLabel>
                    <InputGroup>
                      <InputGroupInput 
                        value={customAmenity}
                        onChange={(e) => setCustomAmenity(e.target.value)}
                        placeholder="Ej: Cine en casa, Bodega, Spa"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomAmenity();
                          }
                        }}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton size="icon-sm" onClick={addCustomAmenity}>
                          <Plus className="h-4 w-4" />
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Características Especiales</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Destaca las características únicas de esta propiedad
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {SPECIAL_FEATURES.map((feature) => {
                      const isSelected = selectedFeatures.includes(feature);
                      return (
                        <Badge
                          key={feature}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                            isSelected 
                              ? "shadow-sm" 
                              : "hover:border-primary/50"
                          }`}
                          onClick={() => toggleFeature(feature)}
                        >
                          {feature}
                        </Badge>
                      );
                    })}
                  </div>

                  {selectedFeatures.length > 0 && (
                    <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                      <p className="text-sm font-medium">Seleccionadas ({selectedFeatures.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedFeatures.map((feature) => (
                          <Badge key={feature} className="gap-1.5 pr-1">
                            {feature}
                            <button
                              type="button"
                              onClick={() => toggleFeature(feature)}
                              className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 space-y-2">
                    <FieldLabel className="text-sm">Agregar característica personalizada</FieldLabel>
                    <InputGroup>
                      <InputGroupInput 
                        value={customFeature}
                        onChange={(e) => setCustomFeature(e.target.value)}
                        placeholder="Ej: Techo alto, Piso radiante, Smart home"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomFeature();
                          }
                        }}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton size="icon-sm" onClick={addCustomFeature}>
                          <Plus className="h-4 w-4" />
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha - Imágenes y acciones rápidas (1/3 del ancho) */}
          <div className="space-y-6">
            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Galería
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageDropzone 
                  value={watch("images") as any}
                  onChange={(imgs) => { setValue("images", imgs as any); setField("images", imgs); }} 
                />
              </CardContent>
            </Card>

            <Card className="lg:sticky lg:top-6">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <FieldLabel htmlFor="status">Estado</FieldLabel>
                      <FieldDescription className="text-xs">Borrador o publicar</FieldDescription>
                    </div>
                    <Switch 
                      id="status"
                      checked={watch("status") === "published"}
                      onCheckedChange={(checked) => {
                        setValue("status", checked ? "published" : "draft");
                        setField("status", checked ? "published" : "draft");
                      }}
                    />
                  </div>

                  <Button
                    size="lg"
                    className="w-full gap-2"
                    disabled={state?.success === true || isGenerating}
                    onClick={handleSubmit(async () => {
                      const values = getValues();
                      await onSave({
                        ...values,
                        amenities: selectedAmenities.join(", "),
                        features: selectedFeatures.join(", "),
                        coordinates: undefined,
                      });
                    })}
                  >
                    <Save className="h-5 w-5" />
                    {watch("status") === "published" ? "Publicar" : "Guardar"}
                  </Button>
                  
                  {state?.success && (
                    <div className="flex items-center gap-2 text-sm font-medium text-primary justify-center">
                      <div className="rounded-full bg-primary/10 p-1">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Guardado</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary p-2">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle>Optimización con IA</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Genera contenido profesional basado en las características que ingresaste
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Field>
              <FieldLabel htmlFor="title" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Título de la Propiedad
              </FieldLabel>
              <FieldDescription>Un título atractivo aumenta las visitas en un 40%</FieldDescription>
              <InputGroup>
                <InputGroupInput 
                  id="title" 
                  placeholder="Ej: Hermoso apartamento con vista al mar" 
                  aria-invalid={!!errors.title} 
                  {...register("title", { onChange: (e) => setField("title", e.target.value) })} 
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton 
                    size="sm"
                    onClick={() => generateAIContent("title")}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        IA
                      </>
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={errors.title ? [{ message: errors.title.message }] : undefined} />
            </Field>

            <Field>
              <FieldLabel htmlFor="description" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Descripción Detallada
              </FieldLabel>
              <FieldDescription>Una buena descripción convence al 65% de los visitantes</FieldDescription>
              <div className="space-y-2">
                <SmartRichEditor 
                  value={watch("description") || ""} 
                  onChange={(v) => { setValue("description", v); setField("description", v); }} 
                  placeholder="Describe todos los detalles que hacen especial a esta propiedad..." 
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => generateAIContent("description")}
                  disabled={isGenerating}
                  className="w-full sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generar descripción con IA
                    </>
                  )}
                </Button>
              </div>
              <FieldError errors={errors.description ? [{ message: errors.description.message }] : undefined} />
            </Field>

            <Field>
              <FieldLabel htmlFor="tags" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Etiquetas SEO
              </FieldLabel>
              <FieldDescription>Las etiquetas correctas aumentan tu visibilidad en Google</FieldDescription>
              <InputGroup>
                <InputGroupInput 
                  id="tags" 
                  placeholder="moderno, lujo, céntrico, inversión" 
                  {...register("tags", { onChange: (e) => setField("tags", e.target.value) })} 
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton 
                    size="sm"
                    onClick={() => generateAIContent("tags")}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        IA
                      </>
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              
              {tagsArray.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-3 bg-muted/50 rounded-lg border">
                  {tagsArray.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-sm">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </Field>

            <div className="pt-4">
              <FieldLabel>Vista Previa en Buscadores</FieldLabel>
              <FieldDescription className="mb-3">Así se verá tu propiedad en Google</FieldDescription>
              <SeoPreview 
                title={watch("title") || "Tu título aquí"} 
                description={watch("description") || "Tu descripción aquí"} 
                url="https://brymar.com/propiedades/tu-propiedad" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <form ref={formRef} action={action as any} className="hidden">
        <input ref={inputRef} type="hidden" name="payload" />
      </form>
    </SmartFormProvider>
  );
}
