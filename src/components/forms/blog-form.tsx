"use client";

import { UnifiedForm, FormConfig } from "./unified-form";
import {
  createBlogPost,
  updateBlogPost,
} from "@/presentation/server-actions/blog-actions";

const blogFormConfig: FormConfig = {
  title: "Información del Post",
  description: "Complete la información del post de blog",
  showDraftOption: true,
  fields: [
    {
      name: "title",
      label: "Título del Post",
      type: "text",
      required: true,
      placeholder: "Ej: Guía para Invertir en Bienes Raíces 2024",
    },
    {
      name: "author",
      label: "Autor",
      type: "text",
      required: true,
      placeholder: "Nombre del autor",
    },
    {
      name: "category",
      label: "Categoría",
      type: "select",
      placeholder: "Seleccionar categoría",
      options: [
        { value: "market-analysis", label: "Análisis de Mercado" },
        { value: "investment-tips", label: "Consejos de Inversión" },
        { value: "property-news", label: "Noticias de Propiedades" },
        { value: "legal-advice", label: "Asesoría Legal" },
        { value: "lifestyle", label: "Estilo de Vida" },
      ],
    },
    {
      name: "excerpt",
      label: "Resumen",
      type: "textarea",
      rows: 3,
      placeholder: "Breve descripción del contenido del post...",
    },
    {
      name: "coverImage",
      label: "Imagen de Portada",
      type: "file",
      accept: "image/*",
    },
    {
      name: "content",
      label: "Contenido del Post",
      type: "rich-text",
      required: true,
      placeholder: "Escribe el contenido completo del post aquí...",
    },
  ],
  submitText: "Publicar Post",
};

interface BlogFormProps {
  initialData?: any;
  isEditing?: boolean;
  onCancel?: () => void;
  onSubmit?: (
    data: FormData,
    action?: "draft" | "publish"
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export function BlogForm({
  initialData,
  isEditing = false,
  onCancel,
  onSubmit,
}: BlogFormProps) {
  const handleSubmit = async (
    formData: FormData,
    action?: "draft" | "publish"
  ) => {
    // If onSubmit prop is provided (wizard context), use it
    if (onSubmit) {
      return await onSubmit(formData, action);
    }

    // Otherwise, use default behavior (form context)
    // Add status based on action
    formData.append("status", action === "draft" ? "draft" : "published");

    let result;
    if (isEditing) {
      result = await updateBlogPost(formData);
    } else {
      result = await createBlogPost(formData);
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
      config={blogFormConfig}
      initialData={initialData}
      isEditing={isEditing}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}
