import { useCallback } from "react";
import { toast } from "sonner";
import type { WizardStep } from "../types";

// Navigation handlers
type NavigationHandlersParams<T extends Record<string, unknown>> = {
	steps: WizardStep<T>[];
	currentStep: number;
	data: T;
	validateStep: (
		stepIndex: number,
		stepData: T
	) => Record<string, string> | null;
	setErrors: React.Dispatch<
		React.SetStateAction<Record<string, Record<string, string>>>
	>;
	setCompletedSteps: React.Dispatch<React.SetStateAction<Set<number>>>;
	setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
	completedSteps: Set<number>;
};

export function useNavigationHandlers<T extends Record<string, unknown>>({
	steps,
	currentStep,
	data,
	validateStep,
	setErrors,
	setCompletedSteps,
	setCurrentStep,
	completedSteps,
}: NavigationHandlersParams<T>) {
	const handleNext = useCallback(() => {
		const stepErrors = validateStep(currentStep, data);

		if (stepErrors && Object.keys(stepErrors).length > 0) {
			setErrors((prev) => ({
				...prev,
				[currentStep]: stepErrors,
			}));
			toast.error("Por favor corrige los errores antes de continuar");
			return;
		}

		setCompletedSteps((prev) => new Set([...prev, currentStep]));
		setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
	}, [
		currentStep,
		data,
		validateStep,
		steps.length,
		setErrors,
		setCompletedSteps,
		setCurrentStep,
	]);

	const handlePrevious = useCallback(() => {
		setCurrentStep((prev) => Math.max(prev - 1, 0));
	}, [setCurrentStep]);

	const handleStepClick = useCallback(
		(stepIndex: number) => {
			// Only allow navigation to completed steps or the next step
			if (stepIndex <= currentStep || completedSteps.has(stepIndex - 1)) {
				setCurrentStep(stepIndex);
			}
		},
		[currentStep, completedSteps, setCurrentStep]
	);

	return { handleNext, handlePrevious, handleStepClick };
}
