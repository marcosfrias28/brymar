"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateLand, useUpdateLand } from "@/hooks/use-lands";
import { CreateLandInput, UpdateLandInput, Land } from "@/lib/types";
import { cn } from "@/lib/utils";

const landFormSchema = z.object({
  name: z.string().min(1, "El nombre del terreno es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  area: z.number().min(1, "El área debe ser mayor a 0"),
  price: z.number().min(1, "El precio debe ser mayor a 0"),
  currency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD"]).default("USD"),
  location: z.string().min(1, "La ubicación es requerida"),
  type: z.enum([
    "residential",
    "commercial",
    "agricultural",
    "industrial",
    "recreational",
    "mixed-use",
    "vacant",
  ]),
});

type LandFormData = z.infer<typeof landFormSchema>;

interface LandFormProps {
  initialData?: Land;
  isEditing?: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
  className?: string;
}

export function LandForm({
  initialData,
  isEditing = false,
  onCancel,
  onSuccess,
  className,
}: LandFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createLandMutation = useCreateLand();
  const updateLandMutation = useUpdateLand();

  const form = useForm<LandFormData>({
    resolver: zodResolver(landFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      area: initialData?.area || 0,
      price: initialData?.price || 0,
      currency: initialData?.currency || "USD",
      location: initialData?.location || "",
      type: initialData?.type || "residential",
    },
  });

  const onSubmit = async (data: LandFormData) => {
    setIsSubmitting(true);
    try {
      let result;
      if (isEditing && initialData?.id) {
        const updateData: UpdateLandInput = {
          id: initialData.id,
          ...data,
          features: initialData.features || {
            utilities: [],
            access: [],
            zoning: "",
          },
          images: initialData.images || [],
        };
        result = await updateLandMutation.mutateAsync(updateData);
      } else {
        const createData: CreateLandInput = {
          ...data,
          features: {
            utilities: [],
            access: [],
            zoning: "",
          },
          images: [],
        };
        result = await createLandMutation.mutateAsync(createData);
      }

      if (result.success) {
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error submitting land form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const landTypes = [
    { value: "residential", label: "Residencial" },
    { value: "commercial", label: "Comercial" },
    { value: "agricultural", label: "Agrícola" },
    { value: "industrial", label: "Industrial" },
    { value: "recreational", label: "Recreativo" },
    { value: "mixed-use", label: "Uso Mixto" },
    { value: "vacant", label: "Vacante" },
  ];

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Terreno" : "Nuevo Terreno"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Terreno *</Label>
            <Input
              id="name"
              placeholder="Ej: Terreno Comercial Bávaro"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Terreno *</Label>
            <Select
              value={form.watch("type")}
              onValueChange={(value) =>
                form.setValue("type", value as any, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {landTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-sm text-red-600">
                {form.formState.errors.type.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación *</Label>
            <Input
              id="location"
              placeholder="Bávaro, Punta Cana"
              {...form.register("location")}
            />
            {form.formState.errors.location && (
              <p className="text-sm text-red-600">
                {form.formState.errors.location.message}
              </p>
            )}
          </div>

          {/* Area and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Superficie (m²) *</Label>
              <Input
                id="area"
                type="number"
                placeholder="2500"
                {...form.register("area", { valueAsNumber: true })}
              />
              {form.formState.errors.area && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.area.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio (USD) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="180000"
                {...form.register("price", { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              placeholder="Describe las características principales del terreno..."
              rows={4}
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting
                ? "Guardando..."
                : isEditing
                ? "Actualizar Terreno"
                : "Crear Terreno"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
