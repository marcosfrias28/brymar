"use server";

import { revalidatePath } from "next/cache";
import * as logger from "@/lib/logger";
import { SaveWizardDraftInput } from "@/application/dto/wizard/SaveWizardDraftInput";
import { LoadWizardDraftInput } from "@/application/dto/wizard/LoadWizardDraftInput";
import { PublishWizardInput } from "@/application/dto/wizard/PublishWizardInput";
import { GenerateAIContentInput } from "@/application/dto/wizard/GenerateAIContentInput";
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
import { container } from "@/infrastructure/container/Container";
import { initializeContainer } from "@/infrastructure/container/ServiceRegistration";

// Initialize container if not already done
if (!container.has('SaveWizardDraftUseCase')) {
    initializeContainer();
}

export async function saveWizardDraft(formData: FormData): Promise<ActionState<any>> {
    const type = formData.get("type") as string;
    const step = formData.get("step") as string;

    try {
        const input = SaveWizardDraftInput.fromFormData(formData);
        const saveWizardDraftUseCase = container.get<SaveWizardDraftUseCase>('SaveWizardDraftUseCase');

        const result = await saveWizardDraftUseCase.execute(input);

        return createSuccessResponse(result, "Draft saved successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        await logger.error("Failed to save wizard draft", error, { type, step });
        return createErrorResponse("Failed to save draft");
    }
}

export async function loadWizardDraft(draftId: string, userId: string): Promise<ActionState<any>> {
    try {
        const input = LoadWizardDraftInput.create({ draftId, userId });
        const loadWizardDraftUseCase = container.get<LoadWizardDraftUseCase>('LoadWizardDraftUseCase');

        const result = await loadWizardDraftUseCase.execute(input);

        return createSuccessResponse(result, "Draft loaded successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        await logger.error("Failed to load wizard draft", error, { userId });
        return createErrorResponse("Failed to load draft");
    }
}

export async function publishWizard(formData: FormData): Promise<ActionState<any>> {
    const draftId = formData.get("draftId") as string;
    const userId = formData.get("userId") as string;
    const type = formData.get("type") as string;

    try {
        if (!draftId) {
            return createErrorResponse("Draft ID is required");
        }
        if (!userId) {
            return createErrorResponse("User ID is required");
        }

        const input = PublishWizardInput.create({ draftId, userId });
        const publishWizardUseCase = container.get<PublishWizardUseCase>('PublishWizardUseCase');

        const result = await publishWizardUseCase.execute(input);

        revalidatePath("/dashboard");

        return createSuccessResponse(result, "Content published successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        await logger.error("Failed to publish wizard content", error, { type, userId });
        return createErrorResponse("Failed to publish content");
    }
}

export async function generateAIContent(formData: FormData): Promise<ActionState<any>> {
    const type = formData.get("type") as string;
    const prompt = formData.get("prompt") as string;

    try {
        const input = GenerateAIContentInput.fromFormData(formData);
        const generateAIContentUseCase = container.get<GenerateAIContentUseCase>('GenerateAIContentUseCase');
        const result = await generateAIContentUseCase.execute(input);

        return createSuccessResponse(result, "AI content generated successfully");
    } catch (error) {
        if (error instanceof DomainError) {
            return createErrorResponse(error.message);
        }
        if (error instanceof ApplicationError) {
            return createErrorResponse(error.message);
        }

        await logger.error("Failed to generate AI content", error, { type, prompt });
        return createErrorResponse("Failed to generate AI content");
    }
}