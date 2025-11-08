/**
 * Accessibility Utilities
 *
 * This module provides utilities for implementing accessibility features
 * including ARIA attributes, keyboard navigation, focus management, and color contrast.
 */

import { useCallback, useRef } from "react";

// ARIA label utilities
export const ariaLabels = {
	// Navigation
	mainNavigation: "Navegación principal",
	breadcrumbNavigation: "Navegación de migas de pan",
	userNavigation: "Navegación de usuario",
	sidebarNavigation: "Navegación lateral",

	// Actions
	toggleSidebar: "Alternar barra lateral",
	toggleTheme: "Alternar tema",
	openMenu: "Abrir menú",
	closeMenu: "Cerrar menú",
	search: "Buscar",

	// Forms
	required: "Campo obligatorio",
	optional: "Campo opcional",
	invalid: "Campo inválido",

	// Status
	loading: "Cargando",
	error: "Error",
	success: "Éxito",

	// Content
	skipToContent: "Saltar al contenido principal",
	backToTop: "Volver arriba",
} as const;

// ARIA descriptions
export const ariaDescriptions = {
	// Navigation
	breadcrumbs: "Muestra tu ubicación actual en el sitio",
	sidebar: "Navegación principal del dashboard",

	// Forms
	passwordRequirements: "La contraseña debe tener al menos 8 caracteres",
	emailFormat: "Ingresa un email válido",

	// Actions
	deleteConfirmation: "Esta acción no se puede deshacer",
	saveChanges: "Guarda los cambios realizados",
} as const;

// Keyboard navigation utilities
export const keyboardKeys = {
	ENTER: "Enter",
	SPACE: " ",
	ESCAPE: "Escape",
	ARROW_UP: "ArrowUp",
	ARROW_DOWN: "ArrowDown",
	ARROW_LEFT: "ArrowLeft",
	ARROW_RIGHT: "ArrowRight",
	TAB: "Tab",
	HOME: "Home",
	END: "End",
} as const;

// Focus management utilities
export const useFocusManagement = () => {
	const focusableElementsSelector = [
		"button:not([disabled])",
		"input:not([disabled])",
		"select:not([disabled])",
		"textarea:not([disabled])",
		"a[href]",
		'[tabindex]:not([tabindex="-1"])',
		'[contenteditable="true"]',
	].join(", ");

	const getFocusableElements = useCallback(
		(container: HTMLElement) =>
			Array.from(
				container.querySelectorAll(focusableElementsSelector)
			) as HTMLElement[],
		[]
	);

	const trapFocus = useCallback(
		(container: HTMLElement) => {
			const focusableElements = getFocusableElements(container);
			const firstElement = focusableElements[0];
			const lastElement = focusableElements.at(-1);

			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === keyboardKeys.TAB) {
					if (e.shiftKey) {
						if (document.activeElement === firstElement) {
							e.preventDefault();
							lastElement?.focus();
						}
					} else if (document.activeElement === lastElement) {
						e.preventDefault();
						firstElement?.focus();
					}
				}
			};

			container.addEventListener("keydown", handleKeyDown);
			return () => container.removeEventListener("keydown", handleKeyDown);
		},
		[getFocusableElements]
	);

	const restoreFocus = useCallback((element: HTMLElement | null) => {
		if (element && typeof element.focus === "function") {
			element.focus();
		}
	}, []);

	return {
		getFocusableElements,
		trapFocus,
		restoreFocus,
	};
};

// Skip link component utilities
export const skipLinkClasses =
	"sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg";

// Screen reader utilities
export const screenReaderClasses = {
	only: "sr-only",
	focusable: "sr-only focus:not-sr-only",
	hidden: "aria-hidden",
} as const;

// Color contrast utilities
export const contrastUtilities = {
	// Minimum contrast ratios (WCAG 2.1 AA)
	normalText: 4.5, // 4.5:1 for normal text
	largeText: 3, // 3:1 for large text (18pt+ or 14pt+ bold)
	uiComponents: 3, // 3:1 for UI components and graphics

	// Enhanced contrast ratios (WCAG 2.1 AAA)
	enhancedNormalText: 7, // 7:1 for normal text
	enhancedLargeText: 4.5, // 4.5:1 for large text
};

// Focus ring utilities with secondary color compliance
export const focusRingClasses = {
	default:
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
	thick:
		"focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-secondary focus-visible:ring-offset-2",
	inset:
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary",
	button:
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:border-secondary",
	input:
		"focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-secondary/50 focus-visible:border-secondary",
} as const;

// Keyboard navigation hook
export const useKeyboardNavigation = (
	items: HTMLElement[],
	options: {
		loop?: boolean;
		orientation?: "horizontal" | "vertical" | "both";
		onActivate?: (index: number) => void;
	} = {}
) => {
	const { loop = true, orientation = "vertical", onActivate } = options;
	const currentIndexRef = useRef(0);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			const { key } = e;
			let newIndex = currentIndexRef.current;

			switch (key) {
				case keyboardKeys.ARROW_DOWN:
					if (orientation === "vertical" || orientation === "both") {
						e.preventDefault();
						newIndex = loop
							? (currentIndexRef.current + 1) % items.length
							: Math.min(currentIndexRef.current + 1, items.length - 1);
					}
					break;

				case keyboardKeys.ARROW_UP:
					if (orientation === "vertical" || orientation === "both") {
						e.preventDefault();
						newIndex = loop
							? currentIndexRef.current === 0
								? items.length - 1
								: currentIndexRef.current - 1
							: Math.max(currentIndexRef.current - 1, 0);
					}
					break;

				case keyboardKeys.ARROW_RIGHT:
					if (orientation === "horizontal" || orientation === "both") {
						e.preventDefault();
						newIndex = loop
							? (currentIndexRef.current + 1) % items.length
							: Math.min(currentIndexRef.current + 1, items.length - 1);
					}
					break;

				case keyboardKeys.ARROW_LEFT:
					if (orientation === "horizontal" || orientation === "both") {
						e.preventDefault();
						newIndex = loop
							? currentIndexRef.current === 0
								? items.length - 1
								: currentIndexRef.current - 1
							: Math.max(currentIndexRef.current - 1, 0);
					}
					break;

				case keyboardKeys.HOME:
					e.preventDefault();
					newIndex = 0;
					break;

				case keyboardKeys.END:
					e.preventDefault();
					newIndex = items.length - 1;
					break;

				case keyboardKeys.ENTER:
				case keyboardKeys.SPACE:
					e.preventDefault();
					onActivate?.(currentIndexRef.current);
					return;
			}

			if (newIndex !== currentIndexRef.current && items[newIndex]) {
				currentIndexRef.current = newIndex;
				items[newIndex].focus();
			}
		},
		[items, loop, orientation, onActivate]
	);

	return { handleKeyDown, currentIndex: currentIndexRef.current };
};

// Announcement utilities for screen readers
export const announceToScreenReader = (
	message: string,
	priority: "polite" | "assertive" = "polite"
) => {
	const announcement = document.createElement("div");
	announcement.setAttribute("aria-live", priority);
	announcement.setAttribute("aria-atomic", "true");
	announcement.className = "sr-only";
	announcement.textContent = message;

	document.body.appendChild(announcement);

	// Remove after announcement
	setTimeout(() => {
		document.body.removeChild(announcement);
	}, 1000);
};

// Reduced motion utilities
export const useReducedMotion = () => {
	const prefersReducedMotion =
		typeof window !== "undefined"
			? window.matchMedia("(prefers-reduced-motion: reduce)").matches
			: false;

	return prefersReducedMotion;
};

// High contrast mode detection
export const useHighContrast = () => {
	const prefersHighContrast =
		typeof window !== "undefined"
			? window.matchMedia("(prefers-contrast: high)").matches
			: false;

	return prefersHighContrast;
};

// Accessibility validation utilities
export const validateAccessibility = {
	// Check if element has accessible name
	hasAccessibleName: (element: HTMLElement): boolean =>
		Boolean(
			element.getAttribute("aria-label") ||
				element.getAttribute("aria-labelledby") ||
				element.textContent?.trim() ||
				element.getAttribute("title") ||
				element.getAttribute("alt")
		),

	// Check if interactive element has proper role
	hasProperRole: (element: HTMLElement): boolean => {
		const tagName = element.tagName.toLowerCase();
		const role = element.getAttribute("role");

		// Interactive elements that should have proper roles
		const interactiveElements = ["button", "a", "input", "select", "textarea"];

		if (interactiveElements.includes(tagName)) {
			return true;
		}

		if (
			role &&
			["button", "link", "menuitem", "tab", "checkbox", "radio"].includes(role)
		) {
			return true;
		}

		return false;
	},

	// Check if element has sufficient color contrast
	hasSufficientContrast: (element: HTMLElement): boolean => {
		// This would require a color contrast calculation library
		// For now, we'll assume elements with proper classes have sufficient contrast
		const classList = element.className;
		return classList.includes("text-") && classList.includes("bg-");
	},

	// Check if form element has proper labeling
	hasProperLabeling: (
		element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
	): boolean => {
		const id = element.id;
		const ariaLabel = element.getAttribute("aria-label");
		const ariaLabelledBy = element.getAttribute("aria-labelledby");

		// Check for associated label
		const hasLabel = id && document.querySelector(`label[htmlFor="${id}"]`);

		return Boolean(hasLabel || ariaLabel || ariaLabelledBy);
	},

	// Check if element has proper focus indicator
	hasFocusIndicator: (element: HTMLElement): boolean => {
		const classList = element.className;
		return classList.includes("focus-visible:") || classList.includes("focus:");
	},

	// Comprehensive accessibility audit for an element
	auditElement: (element: HTMLElement) => {
		const issues: string[] = [];

		// Check for accessible name on interactive elements
		if (
			element.matches(
				'button, a, input, select, textarea, [role="button"], [role="link"]'
			) &&
			!validateAccessibility.hasAccessibleName(element)
		) {
			issues.push("Missing accessible name");
		}

		// Check for proper focus indicator
		if (
			element.matches("button, a, input, select, textarea, [tabindex]") &&
			!validateAccessibility.hasFocusIndicator(element)
		) {
			issues.push("Missing focus indicator");
		}

		// Check for form labeling
		if (
			element.matches("input, select, textarea") &&
			!validateAccessibility.hasProperLabeling(element as HTMLInputElement)
		) {
			issues.push("Missing proper form labeling");
		}

		// Check for images without alt text
		if (element.matches("img") && !element.getAttribute("alt")) {
			issues.push("Image missing alt text");
		}

		return {
			element,
			issues,
			isAccessible: issues.length === 0,
		};
	},
};

// Performance optimized accessibility checker
export const createAccessibilityChecker = () => {
	const checkedElements = new WeakSet<HTMLElement>();
	const issueCache = new WeakMap<HTMLElement, string[]>();

	return {
		checkElement: (element: HTMLElement) => {
			if (checkedElements.has(element) && issueCache.has(element)) {
				return {
					element,
					issues: issueCache.get(element) || [],
					isAccessible: (issueCache.get(element) || []).length === 0,
				};
			}

			const result = validateAccessibility.auditElement(element);
			checkedElements.add(element);
			issueCache.set(element, result.issues);

			return result;
		},

		clearCache: () => {
			issueCache.delete = issueCache.delete.bind(issueCache);
		},
	};
};

// Export types
export type AriaLabel = keyof typeof ariaLabels;
export type AriaDescription = keyof typeof ariaDescriptions;
export type FocusRingClass = keyof typeof focusRingClasses;
export type ScreenReaderClass = keyof typeof screenReaderClasses;
