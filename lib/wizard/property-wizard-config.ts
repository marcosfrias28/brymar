// Property Wizard Configuration for New Framework

import { WizardConfig } from "@/types/wizard-core";
import { PropertyWizardData } from "@/types/property-wizard";
import {
    PropertyGeneralSchema,
    PropertyLocationSchema,
    PropertyMediaSchema,
    PropertyCompleteSchema
} from "@/lib/schemas/property-wizard-schemas";

// Import step components
import { PropertyGeneralStep } from "@/components/wizard/property/steps/property-general-step";
import { PropertyLocationStep } from "@/components/wizard/property/steps/property-location-step";
import { PropertyMediaStep } from "@/components/wizard/property/steps/property-media-step";
import { PropertyPreviewStep } from "@/components/wizard/property/steps/property-preview-step";

export const propertyWizardConfig: WizardConfig<PropertyWizardData> = {
    id: "property-wizard",
    type: "property",
    title: "Crear Propiedad",
    description: "Asistente para crear listados de propiedades",
    steps: [
        {
            id: "general",
            title: "Detalles Básicos",
            description: "Título, precio, superficie y tipo de propiedad",
            component: PropertyGeneralStep,
            validation: PropertyGeneralSchema,
        },
        {
            id: "location",
            title: "Ubicación",
            description: "Dirección y coordenadas",
            component: PropertyLocationStep,
            validation: PropertyLocationSchema,
        },
        {
            id: "media",
            title: "Fotos y Videos",
            description: "Imágenes y contenido multimedia",
            component: PropertyMediaStep,
            validation: PropertyMediaSchema,
        },
        {
            id: "preview",
            title: "Vista Previa",
            description: "Revisar antes de publicar",
            component: PropertyPreviewStep,
            isOptional: true,
        },
    ],
    validation: {
        stepSchemas: {
            general: PropertyGeneralSchema,
            location: PropertyLocationSchema,
            media: PropertyMediaSchema,
        },
        finalSchema: PropertyCompleteSchema,
    },
    persistence: {
        autoSave: true,
        autoSaveInterval: 30000,
        storageKey: "property-wizard",
    },
    navigation: {
        allowSkipSteps: false,
        showProgress: true,
        showStepNumbers: true,
    },
};