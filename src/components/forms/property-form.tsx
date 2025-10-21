"use client";

import { UnifiedForm, FormConfig } from "./unified-form";
import { useCreateProperty, useUpdateProperty } from "@/hooks/use-properties";
import {
  CreatePropertyInput,
  UpdatePropertyInput,
} from "@/lib/types/properties";

const propertyFormConfig: FormConfig = {
  title: "Información de la Propiedad",
  description: "Complete la información de la propiedad que desea agregar",
  showImageUpload: true,
  maxImages: 10,
  fields: [
    {
      name: "title",
      label: "Título de la Propiedad",
      type: "text",
      required: true,
      placeholder: "Ej: Villa de Lujo en Punta Cana",
    },
    {
      name: "price",
      label: "Precio (USD)",
      type: "number",
      required: true,
      placeholder: "450000",
    },
    {
      name: "bedrooms",
      label: "Habitaciones",
      type: "number",
      required: true,
      placeholder: "3",
    },
    {
      name: "bathrooms",
      label: "Baños",
      type: "number",
      required: true,
      placeholder: "2",
    },
    {
      name: "area",
      label: "Área (m²)",
      type: "number",
      required: true,
      placeholder: "150",
    },
    {
      name: "location",
      label: "Ubicación",
      type: "text",
      required: true,
      placeholder: "Bávaro, Punta Cana",
    },
    {
      name: "type",
      label: "Tipo de Propiedad",
      type: "select",
      required: true,
      placeholder: "Seleccionar tipo",
      options: [
        { value: "house", label: "Casa" },
        { value: "apartment", label: "Apartamento" },
        { value: "villa", label: "Villa" },
        { value: "condo", label: "Condominio" },
        { value: "penthouse", label: "Penthouse" },
      ],
    },
    {
      name: "description",
      label: "Descripción",
      type: "rich-text",
      placeholder:
        "Describe las características principales de la propiedad...",
    },
  ],
  submitText: "Guardar Propiedad",
};

interface PropertyFormProps {
  initialData?: any;
  isEditing?: boolean;
  onCancel?: () => void;
  onSubmit?: (
    data: FormData,
    action?: "draft" | "publish"
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export function PropertyForm({
  initialData,
  isEditing = false,
  onCancel,
  onSubmit,
}: PropertyFormProps) {
  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();

  const handleSubmit = async (formData: FormData) => {
    // If onSubmit prop is provided (wizard context), use it
    if (onSubmit) {
      return await onSubmit(formData);
    }

    // Convert FormData to proper input type
    const propertyData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      currency: "USD" as const,
      type: formData.get("type") as any,
      address: {
        street: "",
        city: formData.get("location") as string,
        state: "",
        country: "Dominican Republic",
      },
      features: {
        bedrooms: Number(formData.get("bedrooms")),
        bathrooms: Number(formData.get("bathrooms")),
        area: Number(formData.get("area")),
        amenities: [],
        features: [],
      },
      images: [], // Handle images separately
      featured: false,
    };

    try {
      let result;
      if (isEditing && initialData?.id) {
        const updateData: UpdatePropertyInput = {
          id: initialData.id,
          ...propertyData,
        };
        result = await updateMutation.mutateAsync(updateData);
      } else {
        result = await createMutation.mutateAsync(
          propertyData as CreatePropertyInput
        );
      }

      return {
        success: result.success,
        message: result.success ? "Property saved successfully" : undefined,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to save property",
      };
    }
  };

  return (
    <UnifiedForm
      config={propertyFormConfig}
      initialData={initialData}
      isEditing={isEditing}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}
