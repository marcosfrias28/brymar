"use client";

import { UnifiedWizard, WizardStep } from "./unified-wizard";
import { PropertyForm } from "../forms/property-form";
import { createProperty } from "@/presentation/server-actions/property-actions";

// Simple step components for property wizard
const PropertyBasicInfoStep = ({ data, onChange, errors }: any) => {
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
    validation: (data) => {
      const errors: Record<string, string> = {};
      if (!data.title) errors.title = "El título es requerido";
      if (!data.price) errors.price = "El precio es requerido";
      if (!data.location) errors.location = "La ubicación es requerida";
      return Object.keys(errors).length > 0 ? errors : null;
    },
  },
];

interface PropertyWizardProps {
  initialData?: any;
  onComplete?: () => void;
}

export function PropertyWizard({
  initialData,
  onComplete,
}: PropertyWizardProps) {
  const handleComplete = async (data: any) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });

      const result = await createProperty(formData);

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

  return (
    <UnifiedWizard
      title="Crear Nueva Propiedad"
      description="Completa la información para agregar una nueva propiedad"
      steps={propertyWizardSteps}
      initialData={initialData}
      onComplete={handleComplete}
      showDraftOption={true}
    />
  );
}
