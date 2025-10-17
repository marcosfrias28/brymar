"use client";

import { UnifiedWizard, WizardStep } from "./unified-wizard";
import { LandForm } from "../forms/land-form";
import { createLand } from "@/presentation/server-actions/land-actions";

// Simple step components for land wizard
const LandBasicInfoStep = ({ data, onChange, errors }: any) => {
  return (
    <div className="space-y-4">
      <LandForm
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

const landWizardSteps: WizardStep[] = [
  {
    id: "basic-info",
    title: "Información Básica",
    description: "Datos principales del terreno",
    component: LandBasicInfoStep,
    validation: (data) => {
      const errors: Record<string, string> = {};
      if (!data.name) errors.name = "El nombre es requerido";
      if (!data.price) errors.price = "El precio es requerido";
      if (!data.area) errors.area = "El área es requerida";
      return Object.keys(errors).length > 0 ? errors : null;
    },
  },
];

interface LandWizardProps {
  initialData?: any;
  onComplete?: () => void;
}

export function LandWizard({ initialData, onComplete }: LandWizardProps) {
  const handleComplete = async (data: any) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });

      const result = await createLand(formData);

      if (result.success) {
        onComplete?.();
        return { success: true, message: "Terreno creado exitosamente" };
      } else {
        return {
          success: false,
          error: result.error || "Error al crear el terreno",
        };
      }
    } catch (error) {
      return { success: false, error: "Error inesperado" };
    }
  };

  return (
    <UnifiedWizard
      title="Crear Nuevo Terreno"
      description="Completa la información para agregar un nuevo terreno"
      steps={landWizardSteps}
      initialData={initialData}
      onComplete={handleComplete}
      showDraftOption={true}
    />
  );
}
