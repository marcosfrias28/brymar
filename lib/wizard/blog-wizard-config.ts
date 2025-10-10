// Blog Wizard Configuration for New Framework

import { WizardConfig } from "@/types/wizard-core";
import { BlogWizardData } from "@/types/blog-wizard";
import {
    BlogContentStepSchema,
    BlogMediaStepSchema,
    BlogSEOStepSchema,
    BlogWizardSchema
} from "@/lib/schemas/blog-wizard-schemas";

// Import step components
import { BlogContentStep } from "@/components/wizard/blog/steps/blog-content-step";
import { BlogMediaStep } from "@/components/wizard/blog/steps/blog-media-step";
import { BlogSEOStep } from "@/components/wizard/blog/steps/blog-seo-step";
import { BlogPreviewStep } from "@/components/wizard/blog/steps/blog-preview-step";

export const blogWizardConfig: WizardConfig<BlogWizardData> = {
    id: "blog-wizard",
    type: "blog",
    title: "Crear Artículo",
    description: "Asistente para crear artículos de blog",
    steps: [
        {
            id: "content",
            title: "Contenido",
            description: "Información básica y contenido del artículo",
            component: BlogContentStep,
            validation: BlogContentStepSchema,
        },
        {
            id: "media",
            title: "Multimedia",
            description: "Imágenes y videos para el artículo",
            component: BlogMediaStep,
            validation: BlogMediaStepSchema,
        },
        {
            id: "seo",
            title: "SEO",
            description: "Optimización para motores de búsqueda",
            component: BlogSEOStep,
            validation: BlogSEOStepSchema,
        },
        {
            id: "preview",
            title: "Vista Previa",
            description: "Revisa cómo se verá tu artículo",
            component: BlogPreviewStep,
            isOptional: true,
        },
    ],
    validation: {
        stepSchemas: {
            content: BlogContentStepSchema,
            media: BlogMediaStepSchema,
            seo: BlogSEOStepSchema,
        },
        finalSchema: BlogWizardSchema,
    },
    persistence: {
        autoSave: true,
        autoSaveInterval: 30000,
        storageKey: "blog-wizard",
    },
    navigation: {
        allowSkipSteps: false,
        showProgress: true,
        showStepNumbers: true,
    },
};