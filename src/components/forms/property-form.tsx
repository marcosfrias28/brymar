"use client";

import { UnifiedForm, FormConfig } from "./unified-form";
import {
  createProperty,
  updateProperty,
} from "@/presentation/server-actions/property-actions";

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
  const handleSubmit = async (formData: FormData) => {
    // If onSubmit prop is provided (wizard context), use it
    if (onSubmit) {
      return await onSubmit(formData);
    }

    // Otherwise, use default behavior (form context)
    let result;
    if (isEditing) {
      result = await updateProperty(formData);
    } else {
      result = await createProperty(formData);
    }

    // Adapt ActionState to expected return type
    return {
      success: result.success ?? false,
      message: result.message,
      error: result.error,
    };
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
