import type { WizardType } from "@/lib/types";

// Temporary minimal implementations to fix build errors
// These will be properly refactored later

export function useWizardDrafts(_type?: WizardType) {
	// Return empty implementation
	return {
		data: [],
		isLoading: false,
		error: null,
	};
}

export function useWizardDraft(draftId: string | null) {
	return {
		data: draftId
			? {
					id: draftId,
					type: "property" as const,
					title: "Mock Draft",
					data: {},
					currentStep: 1,
					status: "draft" as const,
					userId: "mock-user",
				}
			: null,
		isLoading: false,
		error: null,
	};
}

export function useCreateWizardDraft() {
	return {
		mutateAsync: async (_input?: any) => ({
			success: true,
			data: { id: "temp-draft-id" },
		}),
		isLoading: false,
		error: null,
	};
}

export function useSaveWizardDraft() {
	return {
		mutate: () => {},
		mutateAsync: async (input?: { id: string; data: any }) => ({
			success: true,
			data: { id: input?.id || "temp-id" },
		}),
		isLoading: false,
		error: null,
	};
}

export function useUpdateWizardDraft() {
	return {
		mutate: () => {},
		mutateAsync: async () => ({ success: true }),
		isLoading: false,
		error: null,
	};
}

export function useDeleteWizardDraft() {
	return {
		mutate: (_draftId: string) => {},
		mutateAsync: async (_draftId: string) => ({ success: true }),
		isLoading: false,
		isPending: false,
		error: null,
	};
}

export function usePublishWizard() {
	return {
		mutate: () => {},
		mutateAsync: async () => ({ success: true }),
		isLoading: false,
		error: null,
	};
}

export function useGenerateAIContent() {
	return {
		mutate: (_input?: any) => {},
		mutateAsync: async (input?: any) => ({
			success: true,
			data: {
				content: {
					title: "Generated Title",
					description: "Generated description",
					content: `Generated content based on: ${JSON.stringify(input)}`,
					excerpt: "Generated excerpt",
				},
				suggestions: ["Suggestion 1", "Suggestion 2"],
			},
		}),
		isLoading: false,
		isPending: false,
		error: null,
	};
}

export function useWizardStep(_draftId: string | null, _currentStep?: number) {
	return {
		data: null,
		isLoading: false,
		error: null,
	};
}

export function useWizardFormPersistence(
	_draftId: string | null,
	_debounceMs = 1000
) {
	return {
		saveData: () => {},
		isAutoSaving: false,
		lastSaved: null,
	};
}

// Re-export from use-wizard-hooks for compatibility
export { useWizardStepManager } from "./use-wizard-hooks";
