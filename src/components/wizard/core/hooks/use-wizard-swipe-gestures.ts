import React from "react";
import { triggerHapticFeedback } from "@/lib/utils/mobile-utils";
import { useTouchGestures } from "@/hooks/use-mobile-responsive";

type UseWizardSwipeGesturesProps = {
	enableTouchGestures: boolean;
	isTouchDevice: boolean;
	canGoNext: boolean;
	canGoPrevious: boolean;
	onPrevious: () => void;
	onNext: () => void;
};

export function useWizardSwipeGestures({
	enableTouchGestures,
	isTouchDevice,
	canGoNext,
	canGoPrevious,
	onPrevious,
	onNext,
}: UseWizardSwipeGesturesProps) {
	const { touchState, handlers } = useTouchGestures();

	// Handle swipe gestures
	React.useEffect(() => {
		if (!(enableTouchGestures && isTouchDevice) || touchState.isPressed) {
			return;
		}

		const { deltaX, distance } = touchState;
		const swipeThreshold = 50;

		if (distance > swipeThreshold) {
			if (deltaX > swipeThreshold && canGoPrevious) {
				onPrevious();
				triggerHapticFeedback("light");
			} else if (deltaX < -swipeThreshold && canGoNext) {
				onNext();
			}
		}
	}, [
		touchState,
		enableTouchGestures,
		isTouchDevice,
		canGoNext,
		canGoPrevious,
		onPrevious,
		onNext,
	]);

	return { handlers };
}
