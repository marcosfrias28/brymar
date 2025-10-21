"use client";

import { UnifiedWizard, WizardStep } from "./unified-wizard";
import { BlogForm } from "../blog/blog-form";
import { createBlogPost } from "@/lib/actions/blog";
import { useSaveWizardDraft, useCreateWizardDraft } from "@/hooks/use-wizard";

interface BlogWizardData {
  title?: string;
  content?: string;
  author?: string;
  status?: string;
  [key: string]: unknown;
}

interface BlogStepProps {
  data: BlogWizardData;
  onChange: (data: BlogWizardData) => void;
  errors?: Record<string, string>;
}

// Blog wizard step components
const BlogBasicInfoStep = ({ data, onChange, errors }: BlogStepProps) => {
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
    validation: (data: BlogWizardData) => {
      const errors: Record<string, string> = {};
      if (!data.title) errors.title = "El título es requerido";
      if (!data.content) errors.content = "El contenido es requerido";
      if (!data.author) errors.author = "El autor es requerido";
      return Object.keys(errors).length > 0 ? errors : null;
    },
  },
];

interface BlogWizardProps {
  draftId?: string;
  initialData?: BlogWizardData;
  onComplete?: () => void;
}

export function BlogWizard({
  draftId,
  initialData,
  onComplete,
}: BlogWizardProps) {
  const createDraft = useCreateWizardDraft();
  const saveDraft = useSaveWizardDraft();

  const handleComplete = async (data: BlogWizardData) => {
    try {
      const result = await createBlogPost(data);

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

  const handleSaveDraft = async (data: BlogWizardData) => {
    if (draftId) {
      await saveDraft.mutateAsync({
        id: draftId,
        data,
      });
    } else {
      await createDraft.mutateAsync({
        type: "blog",
        title: data.title || "Nuevo Post",
        initialData: data,
      });
    }
  };

  return (
    <UnifiedWizard
      title="Crear Nuevo Post"
      description="Completa la información para agregar un nuevo artículo al blog"
      steps={blogWizardSteps}
      initialData={initialData}
      onComplete={handleComplete}
      onSaveDraft={handleSaveDraft}
      showDraftOption={true}
    />
  );
}
