// Land Wizard Configuration for New Framework

import { WizardConfig } from '@/types/wizard-core';
import { LandWizardData } from '@/types/land-wizard';
import {
    LandStep1Schema,
    LandStep2Schema,
    LandStep3Schema,
    LandStep4Schema,
    LandFormDataSchema
} from '@/lib/schemas/land-wizard-schemas';

// Import step components
import { LandGeneralStep } from '@/components/wizard/land/steps/land-general-step';
import { LandLocationStep } from '@/components/wizard/land/steps/land-location-step';
import { LandMediaStep } from '@/components/wizard/land/steps/land-media-step';
import { LandPreviewStep } from '@/components/wizard/land/steps/land-preview-step';

export const landWizardConfig: WizardConfig<LandWizardData> = {
    id: "land-wizard",
    type: "land",
    title: "Crear Terreno",
    description: "Asistente para crear listados de terrenos",
    steps: [
        {
            id: "general",
            title: "Información General",
            description: "Datos básicos del terreno",
            component: LandGeneralStep,
            validation: LandStep1Schema,
        },
        {
            id: "location",
            title: "Ubicación",
            description: "Localización y accesos",
            component: LandLocationStep,
            validation: LandStep2Schema,
        },
        {
            id: "media",
            title: "Imágenes",
            description: "Fotos y documentos",
            component: LandMediaStep,
            validation: LandStep3Schema,
        },
        {
            id: "preview",
            title: "Vista Previa",
            description: "Revisar y publicar",
            component: LandPreviewStep,
            validation: LandStep4Schema,
            isOptional: true,
        },
    ],
    validation: {
        stepSchemas: {
            general: LandStep1Schema,
            location: LandStep2Schema,
            media: LandStep3Schema,
            preview: LandStep4Schema,
        },
        finalSchema: LandFormDataSchema,
    },
    persistence: {
        autoSave: true,
        autoSaveInterval: 30000,
        storageKey: "land-wizard",
    },
    navigation: {
        allowSkipSteps: false,
        showProgress: true,
        showStepNumbers: true,
    },
};