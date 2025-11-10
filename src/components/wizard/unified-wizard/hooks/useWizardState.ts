import { useState, useEffect } from "react";

// Custom hooks for wizard logic
export function useWizardState<T extends Record<string, unknown>>(initialData: T) {
	const [currentStep, setCurrentStep] = useState(0);
	const [data, setData] = useState<T>(initialData);
	const [errors, setErrors] = useState<Record<string, Record<string, string>>>(
		{}
	);
	const [isLoading, setIsLoading] = useState(false);
	const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

	// Merge initialData when component mounts
	useEffect(() => {
		if (initialData) {
			setData((prev) => ({ ...prev, ...initialData }));
		}
	}, [initialData]);

	return {
		currentStep,
		setData,
		setErrors,
		setIsLoading,
		setCompletedSteps,
		setCurrentStep,
		data,
		errors,
		isLoading,
		completedSteps,
	};
}
