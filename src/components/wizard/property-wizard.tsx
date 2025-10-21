"use client";

import { UnifiedWizard, WizardStep } from "./unified-wizard";
import { PropertyForm } from "../forms/property-form";
import { createProperty } from "@/lib/actions/properties";
import { useSaveWizardDraft, useCreateWizardDraft } from "@/hooks/use-wizard";

interface PropertyWizardData {
  title?: string;
  price?: number;
  location?: string;
  [key: string]: unknown;
}

interface StepProps {
  data: PropertyWizardData;
  onChange: (data: PropertyWizardData) => void;
  errors?: Record<string, string>;
}

// Property wizard step components
const PropertyBasicInfoStep = ({ data, onChange, errors }: StepProps) => {
  return (
    <div className="space-y-4">
      <PropertyForm
        initialData={data}
        onSubmit={async (formData) => {
          const formObject = Object.fromEntries(formData.entries());
          onChange(formObject);
          return { success: true };
        }}
      />
    </div>
  );
};

const propertyWizardSteps: WizardStep[] = [
  {
    id: "basic-info",
    title: "Información Básica",
    description: "Datos principales de la propiedad",
    component: PropertyBasicInfoStep,
    validation: (data: PropertyWizardData) => {
      const errors: Record<string, string> = {};
      if (!data.title) errors.title = "El título es requerido";
      if (!data.price) errors.price = "El precio es requerido";
      if (!data.location) errors.location = "La ubicación es requerida";
      return Object.keys(errors).length > 0 ? errors : null;
    },
  },
];

interface PropertyWizardProps {
  draftId?: string;
  initialData?: PropertyWizardData;
  onComplete?: () => void;
}

export function PropertyWizard({
  draftId,
  initialData,
  onComplete,
}: PropertyWizardProps) {
  const createDraft = useCreateWizardDraft();
  const saveDraft = useSaveWizardDraft();

  const handleComplete = async (data: PropertyWizardData) => {
    try {
      const result = await createProperty(data);

      if (result.success) {
        onComplete?.();
        return { success: true, message: "Propiedad creada exitosamente" };
      } else {
        return {
          success: false,
          error: result.error || "Error al crear la propiedad",
        };
      }
    } catch (error) {
      return { success: false, error: "Error inesperado" };
    }
  };

  const handleSaveDraft = async (data: PropertyWizardData) => {
    if (draftId) {
      await saveDraft.mutateAsync({
        id: draftId,
        data,
      });
    } else {
      await createDraft.mutateAsync({
        type: "property",
        title: data.title || "Nueva Propiedad",
        initialData: data,
      });
    }
  };

  return (
    <UnifiedWizard
      title="Crear Nueva Propiedad"
      description="Completa la información para agregar una nueva propiedad"
      steps={propertyWizardSteps}
      initialData={initialData}
      onComplete={handleComplete}
      onSaveDraft={handleSaveDraft}
      showDraftOption={true}
    />
  );
}
