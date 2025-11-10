import { useWizardState } from "./useWizardState";
import { useRealTimeProgress } from "./useRealTimeProgress";
import { useWizardValidation } from "./useWizardValidation";
import { useStepChangeHandler } from "./useStepChangeHandler";
import { useNavigationHandlers } from "./useNavigationHandlers";
import { useCompletionHandlers } from "./useCompletionHandlers";
import type { WizardStep } from "../types";

// Main wizard component logic
export function useWizardLogic<T extends Record<string, unknown>>(
	steps: WizardStep<T>[],
	initialData: T,
	onComplete: (
		wizardData: T
	) => Promise<{ success: boolean; message?: string; error?: string }>,
	onSaveDraft?: (wizardData: T) => Promise<void>
) {
	const wizardState = useWizardState(initialData);
	const {
		currentStep,
		data,
		errors,
		isLoading,
		completedSteps,
		setData,
		setErrors,
		setIsLoading,
		setCompletedSteps,
		setCurrentStep,
	} = wizardState;

	const validateStep = useWizardValidation(steps);
	
	// Add real-time progress tracking
	const { overallProgress, fieldProgress } = useRealTimeProgress(steps, data, validateStep);

	const handleStepChange = useStepChangeHandler(
		currentStep,
		setData,
		setErrors
	);

	const navigationHandlers = useNavigationHandlers({
		steps,
		currentStep,
		data,
		validateStep,
		setErrors,
		setCompletedSteps,
		setCurrentStep,
		completedSteps,
	});

	const completionHandlers = useCompletionHandlers({
		data,
		steps,
		validateStep,
		setErrors,
		setIsLoading,
		onComplete,
		onSaveDraft,
	});

	return {
		currentStep,
		data,
		errors,
		isLoading,
		completedSteps,
		overallProgress,
		fieldProgress,
		handleStepChange,
		...navigationHandlers,
		...completionHandlers,
	};
}
