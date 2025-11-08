import React from "react";

const ANNOUNCEMENT_TIMEOUT = 1000;

type UseWizardKeyboardNavigationProps = {
	onNext: () => void;
	onPrevious: () => void;
	onComplete: () => void;
	onSaveDraft: () => void;
	onCancel?: () => void;
	canGoNext: boolean;
	canComplete: boolean;
	isEnabled?: boolean;
};

function handleArrowKeys({
	isCtrlOrCmd,
	canGoNext,
	onNext,
	onPrevious,
	announceAction,
}: {
	isCtrlOrCmd: boolean;
	canGoNext: boolean;
	onNext: () => void;
	onPrevious: () => void;
	announceAction: (action: string) => void;
}) {
	return {
		ArrowRight: () => {
			if (isCtrlOrCmd && canGoNext) {
				announceAction("Navegando al siguiente paso");
				onNext();
			}
		},
		ArrowLeft: () => {
			if (isCtrlOrCmd) {
				announceAction("Navegando al paso anterior");
				onPrevious();
			}
		},
	};
}

function handleActionKeys({
	isCtrlOrCmd,
	canGoNext,
	canComplete,
	onNext,
	onComplete,
	onSaveDraft,
	onCancel,
	announceAction,
}: {
	isCtrlOrCmd: boolean;
	canGoNext: boolean;
	canComplete: boolean;
	onNext: () => void;
	onComplete: () => void;
	onSaveDraft: () => void;
	onCancel?: () => void;
	announceAction: (action: string) => void;
}) {
	return {
		Enter: () => {
			if (isCtrlOrCmd) {
				if (canComplete) {
					announceAction("Completando asistente");
					onComplete();
				} else if (canGoNext) {
					announceAction("Navegando al siguiente paso");
					onNext();
				}
			}
		},
		s: () => {
			if (isCtrlOrCmd) {
				announceAction("Guardando borrador");
				onSaveDraft();
			}
		},
		Escape: () => {
			if (onCancel) {
				announceAction("Cancelando asistente");
				onCancel();
			}
		},
	};
}

function handleHelpKeys({
	isAltKey,
	announceAction,
}: {
	isAltKey: boolean;
	announceAction: (action: string) => void;
}) {
	return {
		"?": () => {
			if (isAltKey) {
				announceAction(
					"Atajos de teclado: Ctrl+Flecha derecha para siguiente, Ctrl+Flecha izquierda para anterior, Ctrl+S para guardar, Escape para cancelar"
				);
			}
		},
	};
}

function handleKeyNavigation({
	event,
	isCtrlOrCmd,
	isAltKey,
	canGoNext,
	canComplete,
	onNext,
	onPrevious,
	onComplete,
	onSaveDraft,
	onCancel,
	announceAction,
}: {
	event: KeyboardEvent;
	isCtrlOrCmd: boolean;
	isAltKey: boolean;
	canGoNext: boolean;
	canComplete: boolean;
	onNext: () => void;
	onPrevious: () => void;
	onComplete: () => void;
	onSaveDraft: () => void;
	onCancel?: () => void;
	announceAction: (action: string) => void;
}) {
	const arrowHandlers = handleArrowKeys({
		isCtrlOrCmd,
		canGoNext,
		onNext,
		onPrevious,
		announceAction,
	});

	const actionHandlers = handleActionKeys({
		isCtrlOrCmd,
		canGoNext,
		canComplete,
		onNext,
		onComplete,
		onSaveDraft,
		onCancel,
		announceAction,
	});

	const helpHandlers = handleHelpKeys({
		isAltKey,
		announceAction,
	});

	const handler =
		arrowHandlers[event.key as keyof typeof arrowHandlers] ||
		actionHandlers[event.key as keyof typeof actionHandlers] ||
		helpHandlers[event.key as keyof typeof helpHandlers];

	if (handler) {
		event.preventDefault();
		handler();
	}
}

function createKeyboardHandler({
	onNext,
	onPrevious,
	onComplete,
	onSaveDraft,
	onCancel,
	canGoNext,
	canComplete,
}: Omit<UseWizardKeyboardNavigationProps, "isEnabled">) {
	const announceAction = (action: string) => {
		const announcement = document.createElement("div");
		announcement.setAttribute("aria-live", "polite");
		announcement.setAttribute("aria-atomic", "true");
		announcement.className = "sr-only";
		announcement.textContent = action;
		document.body.appendChild(announcement);
		setTimeout(
			() => document.body.removeChild(announcement),
			ANNOUNCEMENT_TIMEOUT
		);
	};

	return (event: KeyboardEvent) => {
		// Only handle keyboard shortcuts when not in form inputs
		if (
			event.target instanceof HTMLInputElement ||
			event.target instanceof HTMLTextAreaElement ||
			event.target instanceof HTMLSelectElement ||
			(event.target as HTMLElement)?.contentEditable === "true"
		) {
			return;
		}

		const isCtrlOrCmd = event.ctrlKey || event.metaKey;
		const isAltKey = event.altKey;

		handleKeyNavigation({
			event,
			isCtrlOrCmd,
			isAltKey,
			canGoNext,
			canComplete,
			onNext,
			onPrevious,
			onComplete,
			onSaveDraft,
			onCancel,
			announceAction,
		});
	};
}

export function useWizardKeyboardNavigation({
	onNext,
	onPrevious,
	onComplete,
	onSaveDraft,
	onCancel,
	canGoNext,
	canComplete,
	isEnabled = true,
}: UseWizardKeyboardNavigationProps) {
	React.useEffect(() => {
		if (!isEnabled) {
			return;
		}

		const handleKeyDown = createKeyboardHandler({
			onNext,
			onPrevious,
			onComplete,
			onSaveDraft,
			onCancel,
			canGoNext,
			canComplete,
		});

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [
		onNext,
		onPrevious,
		onComplete,
		onSaveDraft,
		onCancel,
		canGoNext,
		canComplete,
		isEnabled,
	]);
}
