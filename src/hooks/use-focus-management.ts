"use client";

import { useCallback, useEffect, useRef } from "react";
import { keyboardKeys } from "@/lib/utils/accessibility";

type UseFocusManagementOptions = {
	restoreOnUnmount?: boolean;
	trapFocus?: boolean;
	autoFocus?: boolean;
};

/**
 * Hook for managing focus in modals, menus, and other interactive components
 */
export function useFocusManagement(
	isOpen: boolean,
	options: UseFocusManagementOptions = {}
) {
	const {
		restoreOnUnmount = true,
		trapFocus = true,
		autoFocus = true,
	} = options;

	const containerRef = useRef<HTMLElement>(null);
	const previousActiveElementRef = useRef<HTMLElement | null>(null);
	const focusableElementsRef = useRef<HTMLElement[]>([]);

	// Selector for focusable elements
	const focusableSelector = [
		'button:not([disabled]):not([aria-hidden="true"])',
		'input:not([disabled]):not([aria-hidden="true"])',
		'select:not([disabled]):not([aria-hidden="true"])',
		'textarea:not([disabled]):not([aria-hidden="true"])',
		'a[href]:not([aria-hidden="true"])',
		'[tabindex]:not([tabindex="-1"]):not([aria-hidden="true"])',
		'[contenteditable="true"]:not([aria-hidden="true"])',
		'summary:not([aria-hidden="true"])',
	].join(", ");

	// Get all focusable elements within container
	const getFocusableElements = useCallback((): HTMLElement[] => {
		if (!containerRef.current) {
			return [];
		}

		const elements = Array.from(
			containerRef.current.querySelectorAll(focusableSelector)
		) as HTMLElement[];

		// Filter out elements that are not visible
		return elements.filter((element) => {
			const style = window.getComputedStyle(element);
			return (
				style.display !== "none" &&
				style.visibility !== "hidden" &&
				element.offsetParent !== null
			);
		});
	}, []);

	// Focus first focusable element
	const focusFirstElement = useCallback(() => {
		const focusableElements = getFocusableElements();
		if (focusableElements.length > 0) {
			focusableElements[0].focus();
		}
	}, [getFocusableElements]);

	// Focus last focusable element
	const focusLastElement = useCallback(() => {
		const focusableElements = getFocusableElements();
		if (focusableElements.length > 0) {
			const lastElement = focusableElements.at(-1);
			lastElement?.focus();
		}
	}, [getFocusableElements]);

	// Handle tab key for focus trapping
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!trapFocus || event.key !== keyboardKeys.TAB) {
				return;
			}

			const focusableElements = getFocusableElements();
			if (focusableElements.length === 0) {
				return;
			}

			const firstElement = focusableElements[0];
			const lastElement = focusableElements.at(-1);
			const activeElement = document.activeElement as HTMLElement;

			if (!firstElement || !lastElement) return;

			if (event.shiftKey) {
				// Shift + Tab: moving backwards
				if (
					activeElement === firstElement ||
					!focusableElements.includes(activeElement)
				) {
					event.preventDefault();
					lastElement.focus();
				}
			} else {
				// Tab: moving forwards
				if (
					activeElement === lastElement ||
					!focusableElements.includes(activeElement)
				) {
					event.preventDefault();
					firstElement.focus();
				}
			}
		},
		[trapFocus, getFocusableElements]
	);

	// Handle escape key
	const handleEscapeKey = useCallback((event: KeyboardEvent) => {
		if (event.key === keyboardKeys.ESCAPE) {
			// Allow parent components to handle escape
			event.stopPropagation();
		}
	}, []);

	// Store previous active element when opening
	useEffect(() => {
		if (isOpen) {
			previousActiveElementRef.current = document.activeElement as HTMLElement;

			// Auto focus first element if enabled
			if (autoFocus) {
				// Use setTimeout to ensure DOM is ready
				setTimeout(() => {
					focusFirstElement();
				}, 0);
			}
		}
	}, [isOpen, autoFocus, focusFirstElement]);

	// Set up event listeners
	useEffect(() => {
		if (!(isOpen && containerRef.current)) {
			return;
		}

		const container = containerRef.current;

		// Add event listeners
		container.addEventListener("keydown", handleKeyDown);
		container.addEventListener("keydown", handleEscapeKey);

		return () => {
			container.removeEventListener("keydown", handleKeyDown);
			container.removeEventListener("keydown", handleEscapeKey);
		};
	}, [isOpen, handleKeyDown, handleEscapeKey]);

	// Restore focus when closing
	useEffect(() => {
		return () => {
			if (restoreOnUnmount && previousActiveElementRef.current) {
				// Use setTimeout to ensure the component is fully unmounted
				setTimeout(() => {
					if (
						previousActiveElementRef.current &&
						typeof previousActiveElementRef.current.focus === "function"
					) {
						previousActiveElementRef.current.focus();
					}
				}, 0);
			}
		};
	}, [restoreOnUnmount]);

	// Update focusable elements when container changes
	useEffect(() => {
		if (isOpen && containerRef.current) {
			focusableElementsRef.current = getFocusableElements();
		}
	}, [isOpen, getFocusableElements]);

	return {
		containerRef,
		focusFirstElement,
		focusLastElement,
		getFocusableElements,
		focusableElements: focusableElementsRef.current,
	};
}

/**
 * Hook for managing roving tabindex in lists and menus
 */
export function useRovingTabIndex(
	items: HTMLElement[],
	options: {
		orientation?: "horizontal" | "vertical" | "both";
		loop?: boolean;
		onActivate?: (index: number) => void;
	} = {}
) {
	const { orientation = "vertical", loop = true, onActivate } = options;
	const activeIndexRef = useRef(0);

	// Set tabindex for all items
	const updateTabIndex = useCallback(
		(activeIndex: number) => {
			items.forEach((item, index) => {
				if (item) {
					item.setAttribute("tabindex", index === activeIndex ? "0" : "-1");
				}
			});
			activeIndexRef.current = activeIndex;
		},
		[items]
	);

	// Handle keyboard navigation
	const handleKeyDown = useCallback(
		(event: KeyboardEvent, currentIndex: number) => {
			let newIndex = currentIndex;
			let handled = false;

			switch (event.key) {
				case keyboardKeys.ARROW_DOWN:
					if (orientation === "vertical" || orientation === "both") {
						newIndex = loop
							? (currentIndex + 1) % items.length
							: Math.min(currentIndex + 1, items.length - 1);
						handled = true;
					}
					break;

				case keyboardKeys.ARROW_UP:
					if (orientation === "vertical" || orientation === "both") {
						newIndex = loop
							? currentIndex === 0
								? items.length - 1
								: currentIndex - 1
							: Math.max(currentIndex - 1, 0);
						handled = true;
					}
					break;

				case keyboardKeys.ARROW_RIGHT:
					if (orientation === "horizontal" || orientation === "both") {
						newIndex = loop
							? (currentIndex + 1) % items.length
							: Math.min(currentIndex + 1, items.length - 1);
						handled = true;
					}
					break;

				case keyboardKeys.ARROW_LEFT:
					if (orientation === "horizontal" || orientation === "both") {
						newIndex = loop
							? currentIndex === 0
								? items.length - 1
								: currentIndex - 1
							: Math.max(currentIndex - 1, 0);
						handled = true;
					}
					break;

				case keyboardKeys.HOME:
					newIndex = 0;
					handled = true;
					break;

				case keyboardKeys.END:
					newIndex = items.length - 1;
					handled = true;
					break;

				case keyboardKeys.ENTER:
				case keyboardKeys.SPACE:
					onActivate?.(currentIndex);
					handled = true;
					break;
			}

			if (handled) {
				event.preventDefault();
				event.stopPropagation();

				if (newIndex !== currentIndex && items[newIndex]) {
					updateTabIndex(newIndex);
					items[newIndex].focus();
				}
			}
		},
		[items, orientation, loop, onActivate, updateTabIndex]
	);

	// Initialize tabindex
	useEffect(() => {
		if (items.length > 0) {
			updateTabIndex(0);
		}
	}, [items, updateTabIndex]);

	return {
		handleKeyDown,
		updateTabIndex,
		activeIndex: activeIndexRef.current,
	};
}
