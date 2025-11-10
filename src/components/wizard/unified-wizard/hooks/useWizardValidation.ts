import { useCallback } from "react";
import type { WizardStep } from "../types";

// Validation hook
export function useWizardValidation<T extends Record<string, unknown>>(steps: WizardStep<T>[]) {
	return useCallback(
		(stepIndex: number, stepData: T) => {
			const step = steps[stepIndex];
			if (!step.validation) {
				return null;
			}

			const stepErrors = step.validation(stepData);
			return stepErrors;
		},
		[steps]
	);
}
