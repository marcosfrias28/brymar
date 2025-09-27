"use client";

import { useEffect, useCallback } from "react";

interface WizardKeyboardNavigationProps {
    currentStep: number;
    maxStep: number;
    canGoNext: boolean;
    canGoPrevious: boolean;
    canUndo: boolean;
    canRedo: boolean;
    onNext: () => void;
    onPrevious: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onSave: () => void;
    onGoToStep: (step: number) => void;
    isLoading: boolean;
    disabled?: boolean;
}

export function useWizardKeyboardNavigation({
    currentStep,
    maxStep,
    canGoNext,
    canGoPrevious,
    canUndo,
    canRedo,
    onNext,
    onPrevious,
    onUndo,
    onRedo,
    onSave,
    onGoToStep,
    isLoading,
    disabled = false,
}: WizardKeyboardNavigationProps) {

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // Don't handle keyboard events if disabled or loading
            if (disabled || isLoading) return;

            // Don't handle if user is typing in an input/textarea
            const target = event.target as HTMLElement;
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.contentEditable === "true" ||
                target.closest('[contenteditable="true"]')
            ) {
                return;
            }

            const isCtrlOrCmd = event.ctrlKey || event.metaKey;
            const isShift = event.shiftKey;
            const isAlt = event.altKey;

            // Handle different key combinations
            switch (event.key) {
                case "ArrowRight":
                    if (!isCtrlOrCmd && !isShift && !isAlt && canGoNext) {
                        event.preventDefault();
                        onNext();
                    }
                    break;

                case "ArrowLeft":
                    if (!isCtrlOrCmd && !isShift && !isAlt && canGoPrevious) {
                        event.preventDefault();
                        onPrevious();
                    }
                    break;

                case "s":
                case "S":
                    if (isCtrlOrCmd && !isShift && !isAlt) {
                        event.preventDefault();
                        onSave();
                    }
                    break;

                case "z":
                case "Z":
                    if (isCtrlOrCmd && !isShift && !isAlt && canUndo) {
                        event.preventDefault();
                        onUndo();
                    } else if (isCtrlOrCmd && isShift && !isAlt && canRedo) {
                        event.preventDefault();
                        onRedo();
                    }
                    break;

                case "y":
                case "Y":
                    if (isCtrlOrCmd && !isShift && !isAlt && canRedo) {
                        event.preventDefault();
                        onRedo();
                    }
                    break;

                case "1":
                case "2":
                case "3":
                case "4":
                    if (isAlt && !isCtrlOrCmd && !isShift) {
                        const step = parseInt(event.key);
                        if (step >= 1 && step <= maxStep) {
                            event.preventDefault();
                            onGoToStep(step);
                        }
                    }
                    break;

                case "Home":
                    if (!isCtrlOrCmd && !isShift && !isAlt) {
                        event.preventDefault();
                        onGoToStep(1);
                    }
                    break;

                case "End":
                    if (!isCtrlOrCmd && !isShift && !isAlt) {
                        event.preventDefault();
                        onGoToStep(maxStep);
                    }
                    break;

                case "Escape":
                    // Could be used to cancel current operation or show help
                    if (!isCtrlOrCmd && !isShift && !isAlt) {
                        event.preventDefault();
                        // Focus management or help dialog could be triggered here
                    }
                    break;

                default:
                    break;
            }
        },
        [
            disabled,
            isLoading,
            canGoNext,
            canGoPrevious,
            canUndo,
            canRedo,
            onNext,
            onPrevious,
            onUndo,
            onRedo,
            onSave,
            onGoToStep,
            maxStep,
        ]
    );

    // Add keyboard event listeners
    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    // Return keyboard shortcuts info for help/documentation
    const keyboardShortcuts = {
        navigation: [
            { key: "→", description: "Next step" },
            { key: "←", description: "Previous step" },
            { key: "Alt + 1-4", description: "Go to specific step" },
            { key: "Home", description: "Go to first step" },
            { key: "End", description: "Go to last step" },
        ],
        actions: [
            { key: "Ctrl/Cmd + S", description: "Save draft" },
            { key: "Ctrl/Cmd + Z", description: "Undo" },
            { key: "Ctrl/Cmd + Shift + Z", description: "Redo" },
            { key: "Ctrl/Cmd + Y", description: "Redo (alternative)" },
        ],
        general: [
            { key: "Esc", description: "Cancel/Help" },
        ],
    };

    return {
        keyboardShortcuts,
    };
}