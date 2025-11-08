import { triggerHapticFeedback } from "@/lib/utils/mobile-utils";

type UseWizardNavigationHandlersProps = {
	onNext: () => void;
	onComplete: () => void;
	onSaveDraft: () => void;
	isTouchDevice: boolean;
};

export function useWizardNavigationHandlers({
	onNext,
	onComplete,
	onSaveDraft,
	isTouchDevice,
}: UseWizardNavigationHandlersProps) {
	const handleNext = async () => {
		try {
			if (isTouchDevice) {
				triggerHapticFeedback("light");
			}
			await onNext();
		} catch (_error) {
			if (isTouchDevice) {
				triggerHapticFeedback("heavy");
			}
		}
	};

	const handleComplete = async () => {
		try {
			if (isTouchDevice) {
				triggerHapticFeedback("medium");
			}
			await onComplete();
		} catch (_error) {
			if (isTouchDevice) {
				triggerHapticFeedback("heavy");
			}
		}
	};

	const handleSaveDraft = async () => {
		try {
			if (isTouchDevice) {
				triggerHapticFeedback("light");
			}
			await onSaveDraft();
		} catch (_error) {
			if (isTouchDevice) {
				triggerHapticFeedback("heavy");
			}
		}
	};

	return {
		handleNext,
		handleComplete,
		handleSaveDraft,
	};
}
