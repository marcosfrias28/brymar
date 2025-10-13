import { z } from "zod";

export class SaveWizardDraftInput {
    constructor(
        public readonly draftId: string | undefined,
        public readonly userId: string,
        public readonly wizardType: string,
        public readonly wizardConfigId: string,
        public readonly formData: Record<string, any>,
        public readonly currentStep: string,
        public readonly title?: string,
        public readonly description?: string
    ) { }

    static create(data: {
        draftId?: string;
        userId: string;
        wizardType: string;
        wizardConfigId: string;
        formData: Record<string, any>;
        currentStep: string;
        title?: string;
        description?: string;
    }): SaveWizardDraftInput {
        const validated = SaveWizardDraftInputSchema.parse(data);

        return new SaveWizardDraftInput(
            validated.draftId,
            validated.userId,
            validated.wizardType,
            validated.wizardConfigId,
            validated.formData,
            validated.currentStep,
            validated.title,
            validated.description
        );
    }

    static fromFormData(formData: FormData): SaveWizardDraftInput {
        const data = {
            draftId: formData.get("draftId")?.toString(),
            userId: formData.get("userId")?.toString() || "",
            wizardType: formData.get("wizardType")?.toString() || "",
            wizardConfigId: formData.get("wizardConfigId")?.toString() || "",
            formData: JSON.parse(formData.get("formData")?.toString() || "{}"),
            currentStep: formData.get("currentStep")?.toString() || "",
            title: formData.get("title")?.toString(),
            description: formData.get("description")?.toString(),
        };

        return SaveWizardDraftInput.create(data);
    }
}

const SaveWizardDraftInputSchema = z.object({
    draftId: z.string().uuid().optional(),
    userId: z.string().uuid("User ID must be a valid UUID"),
    wizardType: z.enum(["property", "land", "blog"], {
        errorMap: () => ({ message: "Wizard type must be property, land, or blog" }),
    }),
    wizardConfigId: z.string().min(1, "Wizard config ID is required"),
    formData: z.record(z.any(), "Form data must be a valid object"),
    currentStep: z.string().min(1, "Current step is required"),
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(500).optional(),
});