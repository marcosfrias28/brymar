import { useEffect } from "react";
import type { UseWizardReturn } from "./use-wizard";
import type { WizardData } from "@/types/wizard-core";

type UseWizardKeyboardProps<T extends WizardData> = {
	enableKeyboardNavigation: boolean;
	wizard: Pick<UseWizardReturn<T>, 
		| "nextStep" 
		| "previousStep" 
		| "saveDraft" 
		| "complete" 
		| "canGoNext" 
		| "canComplete"
	>;
	onCancel?: () => void;
};

const isInputElement = (target: EventTarget): boolean =>
	target instanceof HTMLInputElement ||
	target instanceof HTMLTextAreaElement ||
	target instanceof HTMLSelectElement;

const handleNavigationKeys = <T extends WizardData>(
	key: string,
	ctrlOrMeta: boolean,
	wizard: Pick<UseWizardReturn<T>, 
		| "nextStep" 
		| "previousStep" 
		| "saveDraft" 
		| "complete" 
		| "canGoNext" 
		| "canComplete"
	>
): boolean => {
	if (!ctrlOrMeta) return false;
	
	switch (key) {
		case "ArrowRight":
		case "PageDown":
			wizard.nextStep();
			return true;
		case "ArrowLeft":
		case "PageUp":
			wizard.previousStep();
			return true;
		case "s":
			wizard.saveDraft();
			return true;
		case "Enter": {
			if (wizard.canComplete) {
				wizard.complete();
			} else if (wizard.canGoNext) {
				wizard.nextStep();
			}
			return true;
		}
		default:
			return false;
	}
};

export function useWizardKeyboard<T extends WizardData>({
	enableKeyboardNavigation,
	wizard,
	onCancel,
}: UseWizardKeyboardProps<T>) {
	useEffect(() => {
		if (!enableKeyboardNavigation) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			// Don't interfere with form inputs
			if (event.target && isInputElement(event.target)) {
				return;
			}

			const ctrlOrMeta = event.ctrlKey || event.metaKey;
			
			if (handleNavigationKeys(event.key, ctrlOrMeta, wizard)) {
				event.preventDefault();
				return;
			}

			// Handle escape key
			if (event.key === "Escape" && onCancel) {
				event.preventDefault();
				onCancel();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [
		enableKeyboardNavigation,
		wizard,
		onCancel,
	]);
}
