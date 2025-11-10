import { useEffect, useState } from "react";
import type { WizardStep } from "../types";
import { countRelevantFields, countFilledFields, PROGRESS_PERCENTAGE_MULTIPLIER } from "../utils/progress-calculations";

// Real-time progress calculation hook
export function useRealTimeProgress<T extends Record<string, unknown>>(
	steps: WizardStep<T>[],
	data: T,
	validateStep: (stepIndex: number, stepData: T) => Record<string, string> | null
) {
	const [fieldProgress, setFieldProgress] = useState<Record<number, number>>({});

	// Calculate field completion progress for each step
	useEffect(() => {
		const newProgress: Record<number, number> = {};
		
		steps.forEach((step, index) => {
			const stepErrors = validateStep(index, data);
			const stepData = data as Record<string, unknown>;
			
			// Count total relevant fields and filled fields for this step
			const totalFields = countRelevantFields(step.id, stepData);
			const filledFields = countFilledFields(step.id, stepData, stepErrors);
			
			// Calculate percentage (0-100) for this step
			newProgress[index] = totalFields > 0 ? Math.round((filledFields / totalFields) * PROGRESS_PERCENTAGE_MULTIPLIER) : 0;
		});
		
		setFieldProgress(newProgress);
	}, [data, steps, validateStep]);

	// Calculate overall progress as average of step progress
	const overallProgress = Math.round(
		Object.values(fieldProgress).reduce((sum, progress) => sum + progress, 0) / steps.length
	);

	return { overallProgress, fieldProgress };
}
