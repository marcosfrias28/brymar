"use server";

import { revalidatePath } from "next/cache";
import { SaveWizardDraftInput } from "@/application/dto/wizard/SaveWizardDraftInput";
import { SaveWizardDraftUseCase } from "@/application/use-cases/wizard/SaveWizardDraftUseCase";
import { LoadWizardDraftUseCase } from "@/application/use-cases/wizard/LoadWizardDraftUseCase";
import { PublishWizardUseCase } from "@/application/use-cases/wizard/PublishWizardUseCase";
import { GenerateAIContentUseCase } from "@/application/use-cases/wizard/GenerateAIContentUseCase";
import {
    createSuccessResponse,
    createErrorResponse,
    type ActionState
} from "@/lib/validations";
import { DomainError } from "@/domain/shared/errors/DomainError";
import { ApplicationError } from "@/application/errors/ApplicationError";

export async function saveWizardDraft(formData: FormData): Promise<ActionState> {
    try {
        const input = SaveWizardDraftInput.fromFormData(formData);
        const saveWizardDraftUseCase = new SaveWizardDraftUseCase(/* dependencies */);

        const result = await saveWizardDraftUseCase.execute(input);

        return createSuccessResponse(result, "Draft saved successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        console.error("Save wizard draft error:", error);
        return createErrorResponse("Failed to save draft");
    }
}

export async function loadWizardDraft(draftId: string): Promise<ActionState> {
    try {
        const loadWizardDraftUseCase = new LoadWizardDraftUseCase(/* dependencies */);

        const result = await loadWizardDraftUseCase.execute({ draftId });

        return createSuccessResponse(result, "Draft loaded successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        console.error("Load wizard draft error:", error);
        return createErrorResponse("Failed to load draft");
    }
}

export async function publishWizard(formData: FormData): Promise<ActionState> {
    try {
        const draftId = formData.get("draftId") as string;
        if (!draftId) {
            return createErrorResponse("Draft ID is required");
        }

        const publishWizardUseCase = new PublishWizardUseCase(/* dependencies */);

        const result = await publishWizardUseCase.execute({ draftId });

        revalidatePath("/dashboard");

        return createSuccessResponse(result, "Content published successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        console.error("Publish wizard error:", error);
        return createErrorResponse("Failed to publish content");
    }
}

export async function generateAIContent(formData: FormData): Promise<ActionState> {
    try {
        const contentType = formData.get("contentType") as string;
        const prompt = formData.get("prompt") as string;

        if (!contentType || !prompt) {
            return createErrorResponse("Content type and prompt are required");
        }

        const generateAIContentUseCase = new GenerateAIContentUseCase(/* dependencies */);

        const result = await generateAIContentUseCase.execute({ contentType, prompt });

        return createSuccessResponse(result, "AI content generated successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        console.error("Generate AI content error:", error);
        return createErrorResponse("Failed to generate AI content");
    }
}