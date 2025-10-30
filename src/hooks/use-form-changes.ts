"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseFormChangesOptions = {
	/**
	 * Delay in milliseconds before checking for changes after an event
	 * @default 100
	 */
	debounceMs?: number;
	/**
	 * Whether to automatically reset hasChanges when resetChanges is called
	 * @default true
	 */
	autoReset?: boolean;
};

type UseFormChangesReturn = {
	/**
	 * Ref to attach to the form element
	 */
	formRef: React.RefObject<HTMLFormElement | null>;
	/**
	 * Whether the form has changes compared to initial state
	 */
	hasChanges: boolean;
	/**
	 * Manually reset the changes state and capture new initial data
	 */
	resetChanges: () => void;
	/**
	 * Manually trigger a check for changes
	 */
	checkForChanges: () => void;
	/**
	 * Manually notify that a change has occurred (useful for programmatic updates)
	 */
	notifyChange: () => void;
};

/**
 * Hook to detect changes in a form compared to its initial state
 */
export function useFormChanges(
	options: UseFormChangesOptions = {}
): UseFormChangesReturn {
	const { debounceMs = 100, autoReset = true } = options;

	const formRef = useRef<HTMLFormElement>(null);
	const initialFormDataRef = useRef<FormData | null>(null);
	const [hasChanges, setHasChanges] = useState(false);

	// Function to serialize FormData for comparison
	const serializeFormData = useCallback(
		(formData: FormData): Record<string, string> => {
			const serialized: Record<string, string> = {};

			for (const [key, value] of formData.entries()) {
				// Handle different input types
				if (typeof value === "string") {
					serialized[key] = value;
				} else if (value instanceof File) {
					// For files, we compare by name and size
					serialized[key] = `${value.name}:${value.size}`;
				} else {
					serialized[key] = String(value);
				}
			}

			return serialized;
		},
		[]
	);

	// Function to compare two serialized form data objects
	const compareFormData = useCallback(
		(data1: Record<string, string>, data2: Record<string, string>): boolean => {
			const keys1 = Object.keys(data1).sort();
			const keys2 = Object.keys(data2).sort();

			// Compare keys first
			if (keys1.length !== keys2.length) {
				return false;
			}
			if (!keys1.every((key, index) => key === keys2[index])) {
				return false;
			}

			// Compare values
			return keys1.every((key) => data1[key] === data2[key]);
		},
		[]
	);

	// Function to capture initial form state
	const captureInitialState = useCallback(() => {
		if (!formRef.current) {
			return;
		}

		const formData = new FormData(formRef.current);
		initialFormDataRef.current = formData;
		setHasChanges(false);
	}, []);

	// Function to check for changes
	const checkForChanges = useCallback(() => {
		if (!(formRef.current && initialFormDataRef.current)) {
			return;
		}

		const currentFormData = new FormData(formRef.current);
		const initialSerialized = serializeFormData(initialFormDataRef.current);
		const currentSerialized = serializeFormData(currentFormData);

		const areEqual = compareFormData(initialSerialized, currentSerialized);
		setHasChanges(!areEqual);
	}, [serializeFormData, compareFormData]);

	// Function to reset changes state
	const resetChanges = useCallback(() => {
		if (autoReset) {
			captureInitialState();
		} else {
			setHasChanges(false);
		}
	}, [autoReset, captureInitialState]);

	// Function to manually notify of changes
	const notifyChange = useCallback(() => {
		// Use a small delay to ensure DOM updates are complete
		setTimeout(checkForChanges, 50);
	}, [checkForChanges]);

	// Debounced change handler
	const debouncedCheckForChanges = useCallback(() => {
		const timeoutId = setTimeout(checkForChanges, debounceMs);
		return () => clearTimeout(timeoutId);
	}, [checkForChanges, debounceMs]);

	// Set up event listeners when form ref is available
	useEffect(() => {
		const form = formRef.current;
		if (!form) {
			return;
		}

		// Capture initial state when form is first available
		if (!initialFormDataRef.current) {
			// Small delay to ensure form is fully rendered with default values
			const timeoutId = setTimeout(captureInitialState, 50);
			return () => clearTimeout(timeoutId);
		}

		// Event handler with debouncing
		const handleFormChange = () => {
			const cleanup = debouncedCheckForChanges();
			// Store cleanup function to call it if component unmounts
			return cleanup;
		};

		// Listen to various form events that indicate changes
		const events = ["input", "change", "select", "paste", "keyup"];
		const cleanupFunctions: (() => void)[] = [];

		events.forEach((eventType) => {
			const handler = () => {
				const cleanup = handleFormChange();
				if (cleanup) {
					cleanupFunctions.push(cleanup);
				}
			};
			form.addEventListener(eventType, handler);

			// Store the cleanup function for this event
			cleanupFunctions.push(() => form.removeEventListener(eventType, handler));
		});

		// Set up MutationObserver to detect programmatic changes to hidden inputs
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (
					mutation.type === "attributes" &&
					mutation.attributeName === "value"
				) {
					const target = mutation.target as HTMLInputElement;
					if (target.type === "hidden" && form.contains(target)) {
						handleFormChange();
					}
				}
			});
		});

		// Observe all hidden inputs in the form
		const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
		hiddenInputs.forEach((input) => {
			observer.observe(input, { attributes: true, attributeFilter: ["value"] });
		});

		cleanupFunctions.push(() => observer.disconnect());

		// Cleanup function
		return () => {
			cleanupFunctions.forEach((cleanup) => cleanup());
		};
	}, [captureInitialState, debouncedCheckForChanges]);

	return {
		formRef,
		hasChanges,
		resetChanges,
		checkForChanges,
		notifyChange,
	};
}
