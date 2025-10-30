"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MapPin, Plus, Sparkles, Trash2, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { EnhancedImageUpload } from "@/components/wizard/shared/enhanced-image-upload";
import { generateAllPropertyContent } from "@/lib/actions/ai-actions";
import { PropertyType } from "@/types/wizard";
import type { ImageMetadata, PropertyCharacteristic, PropertyWizardData } from "@/types/property-wizard";

// Schema de validación basado en el esquema de la base de datos
const propertyFormSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  price: z.number().min(1, "El precio debe ser mayor a 0"),
  currency: z.string().default("USD"),
  surface: z.number().min(1, "La superficie debe ser mayor a 0"),
  propertyType: z.nativeEnum(PropertyType),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  address: z.object({
    street: z.string().min(1, "La dirección es requerida"),
    city: z.string().min(1, "La ciudad es requerida"),
    province: z.string().min(1, "La provincia es requerida"),
    postalCode: z.string().optional(),
    country: z.string().default("República Dominicana"),
    formattedAddress: z.string(),
  }),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  characteristics: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.enum(["amenity", "feature", "location"]),
    selected: z.boolean(),
  })),
  images: z.array(z.object({
    id: z.string(),
    url: z.string(),
    filename: z.string(),
    size: z.number(),
    contentType: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
    displayOrder: z.number(),
  })),
  language: z.enum(["es", "en"]).default("es"),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published", "sold", "rented", "archived"]).default("draft"),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
  initialData?: Partial<PropertyWizardData>;
  onSubmit: (data: PropertyFormData) => Promise<void>;
  onSaveDraft?: (data: Partial<PropertyFormData>) => Promise<void>;
  isLoading?: boolean;
}

// Características predefinidas
const defaultCharacteristics: PropertyCharacteristic[] = [
  // Amenidades
  { id: "pool", name: "Piscina", category: "amenity", selected: false },
  { id: "gym", name: "Gimnasio", category: "amenity", selected: false },
  { id: "parking", name: "Estacionamiento", category: "amenity", selected: false },
  { id: "security", name: "Seguridad 24/7", category: "amenity", selected: false },
  { id: "elevator", name: "Ascensor", category: "amenity", selected: false },
  { id: "garden", name: "Jardín", category: "amenity", selected: false },
  
  // Características
  { id: "furnished", name: "Amueblado", category: "feature", selected: false },
  { id: "ac", name: "Aire Acondicionado", category: "feature", selected: false },
  { id: "balcony", name: "Balcón", category: "feature", selected: false },
  { id: "terrace", name: "Terraza", category: "feature", selected: false },
  { id: "laundry", name: "Área de Lavado", category: "feature", selected: false },
  { id: "storage", name: "Depósito", category: "feature", selected: false },
  
  // Ubicación
  { id: "beach", name: "Cerca de la Playa", category: "location", selected: false },
  { id: "downtown", name: "Centro de la Ciudad", category: "location", selected: false },
  { id: "shopping", name: "Cerca de Centros Comerciales", category: "location", selected: false },
  { id: "schools", name: "Cerca de Escuelas", category: "location", selected: false },
  { id: "transport", name: "Transporte Público", category: "location", selected: false },
  { id: "hospital", name: "Cerca de Hospitales", category: "location", selected: false },
];

export function PropertyForm({ initialData, onSubmit, onSaveDraft, isLoading }: PropertyFormProps) {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      currency: "USD",
      surface: initialData?.surface || 0,
      propertyType: initialData?.propertyType || PropertyType.APARTMENT,
      bedrooms: initialData?.bedrooms || undefined,
      bathrooms: initialData?.bathrooms || undefined,
      address: initialData?.address || {
        street: "",
        city: "",
        province: "",
        postalCode: "",
        country: "República Dominicana",
        formattedAddress: "",
      },
      coordinates: initialData?.coordinates,
      characteristics: initialData?.characteristics || defaultCharacteristics,
      images: initialData?.images || [],
      language: initialData?.language || "es",
      featured: false,
      status: initialData?.status || "draft",
    },
  });

  const watchedTitle = form.watch("title");
  const watchedPropertyType = form.watch("propertyType");
  const watchedAddress = form.watch("address");
  const watchedPrice = form.watch("price");
  const watchedSurface = form.watch("surface");
  const watchedBedrooms = form.watch("bedrooms");
  const watchedBathrooms = form.watch("bathrooms");

  // Generar contenido con AI cuando el título cambie
  const handleAIGeneration = useCallback(async () => {
    if (!watchedTitle || watchedTitle.length < 3) {
      toast.error("Ingresa un título para generar contenido con AI");
      return;
    }

    setIsGeneratingAI(true);
    try {
      const propertyData = {
        type: watchedPropertyType,
        location: watchedAddress?.city || "Santo Domingo",
        price: watchedPrice || 100000,
        surface: watchedSurface || 100,
        characteristics: form.getValues("characteristics")
          .filter(c => c.selected)
          .map(c => c.name),
        bedrooms: watchedBedrooms,
        bathrooms: watchedBathrooms,
      };

      const result = await generateAllPropertyContent(propertyData, {
        language: form.getValues("language"),
        maxLength: 500,
      });

      if (result.success && result.data) {
        form.setValue("title", result.data.title);
        form.setValue("description", result.data.description);
        toast.success("Contenido generado con AI exitosamente");
      } else {
        toast.error(result.error || "Error al generar contenido con AI");
      }
    } catch (error) {
      console.error("Error generating AI content:", error);
      toast.error("Error inesperado al generar contenido");
    } finally {
      setIsGeneratingAI(false);
    }
  }, [watchedTitle, watchedPropertyType, watchedAddress?.city, watchedPrice, watchedSurface, watchedBedrooms, watchedBathrooms, form]);

  // Manejar cambio de características
  const handleCharacteristicChange = useCallback((characteristicId: string, checked: boolean) => {
    const currentCharacteristics = form.getValues("characteristics");
    const updatedCharacteristics = currentCharacteristics.map(char =>
      char.id === characteristicId ? { ...char, selected: checked } : char
    );
    form.setValue("characteristics", updatedCharacteristics);
  }, [form]);

  const handleFormSubmit = async (data: PropertyFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error al guardar la propiedad");
    }
  };

  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      try {
        const data = form.getValues();
        await onSaveDraft(data);
        toast.success("Borrador guardado");
      } catch (error) {
        console.error("Error saving draft:", error);
        toast.error("Error al guardar borrador");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nueva Propiedad</h1>
          <p className="text-muted-foreground">
            Crea una nueva propiedad con generación automática de contenido AI
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAIGeneration}
          disabled={isGeneratingAI || !watchedTitle}
          className="flex items-center gap-2"
        >
          {isGeneratingAI ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generar con AI
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  placeholder="Ej: Apartamento moderno en Piantini"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">Tipo de Propiedad *</Label>
                <Select
                  value={form.watch("propertyType")}
                  onValueChange={(value) => form.setValue("propertyType", value as PropertyType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PropertyType.APARTMENT}>Apartamento</SelectItem>
                    <SelectItem value={PropertyType.HOUSE}>Casa</SelectItem>
                    <SelectItem value={PropertyType.VILLA}>Villa</SelectItem>
                    <SelectItem value={PropertyType.COMMERCIAL}>Comercial</SelectItem>
                    <SelectItem value={PropertyType.LAND}>Terreno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                placeholder="Describe la propiedad en detalle..."
                rows={4}
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="100000"
                  {...form.register("price", { valueAsNumber: true })}
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="surface">Superficie (m²) *</Label>
                <Input
                  id="surface"
                  type="number"
                  placeholder="100"
                  {...form.register("surface", { valueAsNumber: true })}
                />
                {form.formState.errors.surface && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.surface.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">Habitaciones</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  placeholder="3"
                  {...form.register("bedrooms", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Baños</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  placeholder="2"
                  {...form.register("bathrooms", { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle>Ubicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Dirección *</Label>
                <Input
                  id="street"
                  placeholder="Calle Principal #123"
                  {...form.register("address.street")}
                />
                {form.formState.errors.address?.street && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.address.street.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  placeholder="Santo Domingo"
                  {...form.register("address.city")}
                />
                {form.formState.errors.address?.city && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.address.city.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Provincia *</Label>
                <Input
                  id="province"
                  placeholder="Distrito Nacional"
                  {...form.register("address.province")}
                />
                {form.formState.errors.address?.province && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.address.province.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Código Postal</Label>
                <Input
                  id="postalCode"
                  placeholder="10101"
                  {...form.register("address.postalCode")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Características */}
        <Card>
          <CardHeader>
            <CardTitle>Características</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {["amenity", "feature", "location"].map((category) => (
                <div key={category} className="space-y-3">
                  <h4 className="font-medium capitalize">
                    {category === "amenity" && "Amenidades"}
                    {category === "feature" && "Características"}
                    {category === "location" && "Ubicación"}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {form.watch("characteristics")
                      .filter((char) => char.category === category)
                      .map((characteristic) => (
                        <div key={characteristic.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={characteristic.id}
                            checked={characteristic.selected}
                            onCheckedChange={(checked) =>
                              handleCharacteristicChange(characteristic.id, !!checked)
                            }
                          />
                          <Label
                            htmlFor={characteristic.id}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {characteristic.name}
                          </Label>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Imágenes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Imágenes de la Propiedad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedImageUpload
              images={form.watch("images")}
              onImagesChange={(images) => form.setValue("images", images)}
              maxImages={10}
              maxFileSize={5 * 1024 * 1024} // 5MB
            />
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={form.watch("featured")}
                onCheckedChange={(checked) => form.setValue("featured", !!checked)}
              />
              <Label htmlFor="featured" className="text-sm font-normal cursor-pointer">
                Propiedad destacada
              </Label>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {onSaveDraft && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isLoading}
              >
                Guardar Borrador
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || isGeneratingAI}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Crear Propiedad"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
