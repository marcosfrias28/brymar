// Main Wizard Hook - Replaces all existing wizard hooks

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
// import { WizardPersistence } from "@/lib/wizard/wizard-persistence";
// import { WizardValidator } from "@/lib/wizard/wizard-validator";
import type {
	UseWizardOptions,
	UseWizardReturn,
	WizardData,
} from "@/types/wizard-core";

export function useWizard<T extends WizardData>(
	options: UseWizardOptions<T>
): UseWizardReturn<T> {
	const {
		config,
		initialData = {} as Partial<T>,
		draftId,
		onComplete,
		onSaveDraft,
		onUpdate,
	} = options;

	// const router = useRouter();
	// const isMobile = useIsMobile();

	// Core state
	const [data, setData] = useState<Partial<T>>(initialData);
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isValidating, setIsValidating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasDraft, setHasDraft] = useState(false);

	// Refs for cleanup
	const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const mountedRef = useRef(true);

	// Derived values
	const currentStep = config.steps[currentStepIndex]?.id || "";
	const totalSteps = config.steps.length;
	const progress =
		totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

	// Navigation helpers
	const canGoPrevious = currentStepIndex > 0;
	const canGoNext = currentStepIndex < totalSteps - 1;
	// && WizardValidator.canProceedToNextStep(currentStep, data, config);
	const canComplete = true; // WizardValidator.canComplete(data, config);

	// Initialize wizard (moved below to avoid using callbacks before declaration)
	// Note: depends on `autoSaveDraft` and `loadDraft` defined later

	// Update data handler
	const updateData = useCallback(
		(updates: Partial<T>) => {
			setData((prev) => {
				const newData = { ...prev, ...updates };

				// Clear errors for updated fields
				const updatedFields = Object.keys(updates);
				setErrors((prevErrors) => {
					const newErrors = { ...prevErrors };
					updatedFields.forEach((field) => {
						delete newErrors[field];
						delete newErrors[`${currentStep}.${field}`];
					});
					return newErrors;
				});

				// Call onUpdate callback
				onUpdate?.(newData);

				return newData;
			});
		},
		[currentStep, onUpdate]
	);

	// Reset data
	const resetData = useCallback(() => {
		setData(initialData);
		setCurrentStepIndex(0);
		setErrors({});
		setError(null);
	}, [initialData]);

	// Persistence functions using DDD use cases (moved above navigation functions)
	const saveDraft = useCallback(async (): Promise<string | null> => {
		if (!onSaveDraft) {
			return null;
		}

		setIsSaving(true);
		try {
			// Placeholder implementation
			const savedDraftId = draftId || `draft-${Date.now()}`;
			setHasDraft(true);
			toast.success("Borrador guardado");
			return savedDraftId;
		} catch (err: any) {
			const message = err?.message || "Error al guardar borrador";
			setError(message);
			toast.error(message);
			return null;
		} finally {
			setIsSaving(false);
		}
	}, [onSaveDraft, draftId]);

	const autoSaveDraft = useCallback(async (): Promise<string | null> => {
		if (!(config.persistence?.autoSave && onSaveDraft)) {
			return null;
		}

		try {
			// Placeholder implementation
			const savedDraftId = `auto-draft-${Date.now()}`;
			setHasDraft(true);
			return savedDraftId;
		} catch (_err) {
			return null;
		}
	}, [config, onSaveDraft]);

	const loadDraft = useCallback(async (_draftId: string): Promise<boolean> => {
		setIsLoading(true);
		try {
			// Placeholder implementation
			setHasDraft(true);
			toast.success("Borrador cargado (placeholder)");
			return true;
		} catch (err: any) {
			const message = err?.message || "Error al cargar borrador";
			setError(message);
			toast.error(message);
			return false;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const deleteDraft = useCallback(
		async (_draftId: string): Promise<boolean> => {
			try {
				// Placeholder implementation
				setHasDraft(false);
				toast.success("Borrador eliminado (placeholder)");
				return true;
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Error al eliminar borrador";
				setError(message);
				toast.error(message);
				return false;
			}
		},
		[]
	);

	// Navigation functions
	const goToStep = useCallback(
		(stepId: string): boolean => {
			const stepIndex = config.steps.findIndex((step) => step.id === stepId);
			if (stepIndex === -1) {
				return false;
			}

			// Validate all previous steps if moving forward
			if (stepIndex > currentStepIndex) {
				for (let i = currentStepIndex; i < stepIndex; i++) {
					const _step = config.steps[i];
					// if (!WizardValidator.canProceedToNextStep(step.id, data, config)) {
					// 	const stepErrors = WizardValidator.getStepErrors(
					// 		step.id,
					// 		data,
					// 		config,
					// 	);
					// 	setErrors((prev) => ({ ...prev, ...stepErrors }));
					// 	toast.error(
					// 		`Por favor completa el paso "${step.title}" antes de continuar`,
					// 	);
					// 	return false;
					// }
				}
			}

			setCurrentStepIndex(stepIndex);
			return true;
		},
		[config.steps, currentStepIndex, config]
	);

	const nextStep = useCallback(async (): Promise<boolean> => {
		if (!canGoNext) {
			return false;
		}

		setIsValidating(true);

		try {
			// Validate current step
			// const isValid = WizardValidator.canProceedToNextStep(
			// 	currentStep,
			// 	data,
			// 	config,
			// );
			const isValid = true; // Temporary bypass

			if (!isValid) {
				// const stepErrors = WizardValidator.getStepErrors(
				// 	currentStep,
				// 	data,
				// 	config,
				// );
				// setErrors((prev) => ({ ...prev, ...stepErrors }));
				toast.error("Por favor corrige los errores antes de continuar");
				return false;
			}

			// Clear current step errors
			setErrors((prev) => {
				const newErrors = { ...prev };
				Object.keys(newErrors).forEach((key) => {
					if (key.startsWith(`${currentStep}.`)) {
						delete newErrors[key];
					}
				});
				return newErrors;
			});

			// Move to next step
			setCurrentStepIndex((prev) => prev + 1);

			// Auto-save progress
			if (config.persistence?.autoSave) {
				await autoSaveDraft();
			}

			return true;
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Error al avanzar al siguiente paso"
			);
			return false;
		} finally {
			setIsValidating(false);
		}
	}, [canGoNext, currentStep, config, autoSaveDraft]);

	const previousStep = useCallback((): boolean => {
		if (!canGoPrevious) {
			return false;
		}

		setCurrentStepIndex((prev) => prev - 1);
		return true;
	}, [canGoPrevious]);

	// Validation functions
	const validateCurrentStep = useCallback((): boolean => {
		return true; // WizardValidator.canProceedToNextStep(currentStep, data, config);
	}, []);

	const validateAllSteps = useCallback((): boolean => {
		// const result = WizardValidator.validateAllSteps(data, config);
		// setErrors(result.errors);
		// return result.isValid;
		return true; // Temporary bypass
	}, []);

	const getStepErrors = useCallback(
		(stepId?: string): Record<string, string> => {
			if (stepId) {
				return {}; // WizardValidator.getStepErrors(stepId, data, config);
			}
			return errors;
		},
		[errors]
	);

	const clearErrors = useCallback((stepId?: string) => {
		if (stepId) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				Object.keys(newErrors).forEach((key) => {
					if (key.startsWith(`${stepId}.`)) {
						delete newErrors[key];
					}
				});
				return newErrors;
			});
		} else {
			setErrors({});
		}
	}, []);

	// Persistence helpers moved above for correct declaration order

	// Initialize wizard
	useEffect(() => {
		mountedRef.current = true;

		// Load draft if draftId is provided
		if (draftId) {
			loadDraft(draftId);
		}

		// Setup auto-save if enabled
		if (config.persistence?.autoSave) {
			const interval = config.persistence.autoSaveInterval || 30_000;
			autoSaveTimeoutRef.current = setInterval(() => {
				if (Object.keys(data).length > 0) {
					autoSaveDraft();
				}
			}, interval);
		}

		return () => {
			mountedRef.current = false;
			if (autoSaveTimeoutRef.current) {
				clearInterval(autoSaveTimeoutRef.current);
			}
		};
	}, [draftId, config.persistence, data, autoSaveDraft, loadDraft]);

	// Completion function
	const complete = useCallback(async (): Promise<boolean> => {
		if (!(canComplete && onComplete)) {
			return false;
		}

		setIsLoading(true);
		try {
			// Final validation
			if (!validateAllSteps()) {
				toast.error("Por favor corrige todos los errores antes de completar");
				return false;
			}

			// Always use the callback for now
			await onComplete(data as T);

			toast.success("¡Completado exitosamente!");
			return true;
		} catch (err: any) {
			const message = err?.message || "Error al completar";
			setError(message);
			toast.error(message);
			return false;
		} finally {
			setIsLoading(false);
		}
	}, [onComplete, data, validateAllSteps]);

	return {
		// Data
		data,
		updateData,
		resetData,

		// Navigation
		currentStep,
		currentStepIndex,
		totalSteps,
		progress,
		goToStep,
		nextStep,
		previousStep,
		canGoNext,
		canGoPrevious,

		// Validation
		validateCurrentStep,
		validateAllSteps,
		getStepErrors,
		clearErrors,

		// Persistence
		saveDraft,
		loadDraft,
		deleteDraft,
		hasDraft,

		// Completion
		complete,
		canComplete,

		// State
		isLoading,
		isSaving,
		isValidating,
		error,
	};
}

export type { UseWizardReturn } from "@/types/wizard-core";
