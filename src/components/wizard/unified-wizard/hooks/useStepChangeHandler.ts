import { useCallback } from "react";

// Step change handler
export function useStepChangeHandler<T extends Record<string, unknown>>(
	currentStep: number,
	setData: React.Dispatch<React.SetStateAction<T>>,
	setErrors: React.Dispatch<
		React.SetStateAction<Record<string, Record<string, string>>>
	>
) {
	return useCallback(
		(stepData: Partial<T>) => {
			setData((prev: T) => ({ ...prev, ...stepData }));

			// Clear errors for current step when data changes
			setErrors((prev) => ({
				...prev,
				[currentStep]: {},
			}));
		},
		[currentStep, setData, setErrors]
	);
}
