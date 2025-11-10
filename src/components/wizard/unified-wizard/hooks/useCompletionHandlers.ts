import { useCallback } from "react";
import { toast } from "sonner";
import type { WizardStep } from "../types";

// Completion handlers
type CompletionHandlersParams<T extends Record<string, unknown>> = {
	data: T;
	steps: WizardStep<T>[];
	validateStep: (
		stepIndex: number,
		stepData: T
	) => Record<string, string> | null;
	setErrors: React.Dispatch<
		React.SetStateAction<Record<string, Record<string, string>>>
	>;
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
	onComplete: (
		wizardData: T
	) => Promise<{ success: boolean; message?: string; error?: string }>;
	onSaveDraft?: (wizardData: T) => Promise<void>;
};

export function useCompletionHandlers<T extends Record<string, unknown>>({
	data,
	steps,
	validateStep,
	setErrors,
	setIsLoading,
	onComplete,
	onSaveDraft,
}: CompletionHandlersParams<T>) {
	const handleComplete = useCallback(async () => {
		setIsLoading(true);

		try {
			// Validate all steps
			let hasErrors = false;
			const allErrors: Record<string, Record<string, string>> = {};

			for (let i = 0; i < steps.length; i += 1) {
				const stepErrors = validateStep(i, data);
				if (stepErrors && Object.keys(stepErrors).length > 0) {
					allErrors[i] = stepErrors;
					hasErrors = true;
				}
			}

			if (hasErrors) {
				setErrors(allErrors);
				toast.error("Por favor corrige todos los errores antes de completar");
				return;
			}

			const result = await onComplete(data);

			if (result.success) {
				toast.success(result.message || "¡Completado exitosamente!");
			} else {
				toast.error(result.error || "Error al completar");
			}
		} catch (_error) {
			toast.error("Error inesperado al completar");
		} finally {
			setIsLoading(false);
		}
	}, [data, onComplete, steps, validateStep, setErrors, setIsLoading]);

	const handleSaveDraft = useCallback(async () => {
		if (!onSaveDraft) {
			return;
		}

		setIsLoading(true);
		try {
			await onSaveDraft(data);
			toast.success("Borrador guardado");
		} catch (_error) {
			toast.error("Error al guardar borrador");
		} finally {
			setIsLoading(false);
		}
	}, [data, onSaveDraft, setIsLoading]);

	return { handleComplete, handleSaveDraft };
}
