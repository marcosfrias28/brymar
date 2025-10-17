"use client";

import { UnifiedForm, FormConfig } from "./unified-form";
import {
  createLand,
  updateLand,
} from "@/presentation/server-actions/land-actions";

const landFormConfig: FormConfig = {
  title: "Información del Terreno",
  description: "Complete la información del terreno que desea agregar",
  showImageUpload: true,
  maxImages: 10,
  fields: [
    {
      name: "name",
      label: "Nombre del Terreno",
      type: "text",
      required: true,
      placeholder: "Ej: Terreno Comercial Bávaro",
    },
    {
      name: "type",
      label: "Tipo de Terreno",
      type: "select",
      required: true,
      placeholder: "Seleccionar tipo",
      options: [
        { value: "commercial", label: "Comercial" },
        { value: "residential", label: "Residencial" },
        { value: "agricultural", label: "Agrícola" },
        { value: "beachfront", label: "Frente al Mar" },
      ],
    },
    {
      name: "price",
      label: "Precio (USD)",
      type: "number",
      required: true,
      placeholder: "180000",
    },
    {
      name: "area",
      label: "Superficie (m²)",
      type: "number",
      required: true,
      placeholder: "2500",
    },
    {
      name: "location",
      label: "Ubicación",
      type: "text",
      placeholder: "Bávaro, Punta Cana",
    },
    {
      name: "description",
      label: "Descripción",
      type: "rich-text",
      placeholder: "Describe las características principales del terreno...",
    },
  ],
  submitText: "Guardar Terreno",
};

interface LandFormProps {
  initialData?: any;
  isEditing?: boolean;
  onCancel?: () => void;
  onSubmit?: (
    data: FormData,
    action?: "draft" | "publish"
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export function LandForm({
  initialData,
  isEditing = false,
  onCancel,
  onSubmit,
}: LandFormProps) {
  const handleSubmit = async (formData: FormData) => {
    // If onSubmit prop is provided (wizard context), use it
    if (onSubmit) {
      return await onSubmit(formData);
    }

    // Otherwise, use default behavior (form context)
    let result;
    if (isEditing) {
      result = await updateLand(formData);
    } else {
      result = await createLand(formData);
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
      config={landFormConfig}
      initialData={initialData}
      isEditing={isEditing}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}
