"use client";

import { UnifiedWizard, WizardStep } from "./unified-wizard";
import { BlogForm } from "../forms/blog-form";
import { createBlogPost } from "@/presentation/server-actions/blog-actions";

// Simple step components for blog wizard
const BlogBasicInfoStep = ({ data, onChange, errors }: any) => {
  return (
    <div className="space-y-4">
      <BlogForm
        initialData={data}
        onSubmit={async (formData, action) => {
          const formObject = Object.fromEntries(formData.entries());
          formObject.status = action === "draft" ? "draft" : "published";
          onChange(formObject);
          return { success: true };
        }}
      />
    </div>
  );
};

const blogWizardSteps: WizardStep[] = [
  {
    id: "basic-info",
    title: "Información del Post",
    description: "Datos principales del artículo",
    component: BlogBasicInfoStep,
    validation: (data) => {
      const errors: Record<string, string> = {};
      if (!data.title) errors.title = "El título es requerido";
      if (!data.content) errors.content = "El contenido es requerido";
      if (!data.author) errors.author = "El autor es requerido";
      return Object.keys(errors).length > 0 ? errors : null;
    },
  },
];

interface BlogWizardProps {
  initialData?: any;
  onComplete?: () => void;
}

export function BlogWizard({ initialData, onComplete }: BlogWizardProps) {
  const handleComplete = async (data: any) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "coverImage" && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value as string);
          }
        }
      });

      const result = await createBlogPost(formData);

      if (result.success) {
        onComplete?.();
        return { success: true, message: "Post creado exitosamente" };
      } else {
        return {
          success: false,
          error: result.error || "Error al crear el post",
        };
      }
    } catch (error) {
      return { success: false, error: "Error inesperado" };
    }
  };

  return (
    <UnifiedWizard
      title="Crear Nuevo Post"
      description="Completa la información para agregar un nuevo artículo al blog"
      steps={blogWizardSteps}
      initialData={initialData}
      onComplete={handleComplete}
      showDraftOption={true}
    />
  );
}
