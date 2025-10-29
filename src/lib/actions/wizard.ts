"use server";

// TEMP: Safe fallbacks while wizard persistence is being rebuilt

type WizardFallbackResult<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

export async function saveWizardDraft(): Promise<WizardFallbackResult<{ draftId?: string }>> {
    return { success: false, error: "Wizard draft save not available" };
}

export async function createWizardDraft(): Promise<WizardFallbackResult<{ draftId?: string }>> {
    return { success: false, error: "Wizard draft creation not available" };
}

export async function getWizardDraft(): Promise<WizardFallbackResult<{ draft?: Record<string, any> }>> {
    return { success: false, error: "Wizard draft not found" };
}

export async function deleteWizardDraft(): Promise<WizardFallbackResult<void>> {
    return { success: false, error: "Wizard draft deletion not available" };
}

export async function publishWizard(): Promise<WizardFallbackResult<{ id?: string }>> {
    return { success: false, error: "Wizard publish not available" };
}

export async function generateAIContent(): Promise<WizardFallbackResult<{ content?: string }>> {
    return { success: false, error: "AI generation not available" };
}

export async function getWizardDrafts(): Promise<WizardFallbackResult<{ drafts: any[] }>> {
    // Return empty list to keep dashboard working without 500
    return { success: true, data: { drafts: [] } };
}

export async function loadWizardDraft(): Promise<WizardFallbackResult<{ draft?: Record<string, any> }>> {
    return { success: false, error: "No draft available" };
}