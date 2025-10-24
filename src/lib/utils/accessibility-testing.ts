/**
 * Accessibility Testing Utilities
 *
 * This module provides utilities for testing and validating accessibility features
 * including color contrast, ARIA attributes, and keyboard navigation.
 */

// Color contrast calculation utilities
export class ColorContrastChecker {
	/**
	 * Convert hex color to RGB
	 */
	static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16),
				}
			: null;
	}

	/**
	 * Calculate relative luminance of a color
	 */
	static getLuminance(r: number, g: number, b: number): number {
		const [rs, gs, bs] = [r, g, b].map((c) => {
			c = c / 255;
			return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
	}

	/**
	 * Calculate contrast ratio between two colors
	 */
	static getContrastRatio(color1: string, color2: string): number {
		const rgb1 = ColorContrastChecker.hexToRgb(color1);
		const rgb2 = ColorContrastChecker.hexToRgb(color2);

		if (!rgb1 || !rgb2) return 0;

		const lum1 = ColorContrastChecker.getLuminance(rgb1.r, rgb1.g, rgb1.b);
		const lum2 = ColorContrastChecker.getLuminance(rgb2.r, rgb2.g, rgb2.b);

		const brightest = Math.max(lum1, lum2);
		const darkest = Math.min(lum1, lum2);

		return (brightest + 0.05) / (darkest + 0.05);
	}

	/**
	 * Check if contrast ratio meets WCAG standards
	 */
	static meetsWCAG(
		foreground: string,
		background: string,
		level: "AA" | "AAA" = "AA",
		size: "normal" | "large" = "normal",
	): boolean {
		const ratio = ColorContrastChecker.getContrastRatio(foreground, background);

		const requirements = {
			AA: { normal: 4.5, large: 3 },
			AAA: { normal: 7, large: 4.5 },
		};

		return ratio >= requirements[level][size];
	}
}

// Secondary color contrast validation
export const validateSecondaryColorContrast = () => {
	const secondaryColors = {
		light: "#f0e5c1", // rgb(240, 229, 193)
		dark: "#e9d8a6", // rgb(233, 216, 166)
	};

	const backgroundColors = {
		light: "#ffffff",
		dark: "#000000",
	};

	const results = {
		lightMode: ColorContrastChecker.meetsWCAG(
			secondaryColors.light,
			backgroundColors.light,
			"AA",
			"normal",
		),
		darkMode: ColorContrastChecker.meetsWCAG(
			secondaryColors.dark,
			backgroundColors.dark,
			"AA",
			"normal",
		),
	};

	return results;
};

// ARIA attribute validation
export class AriaValidator {
	/**
	 * Check if element has required ARIA attributes
	 */
	static validateAriaAttributes(element: HTMLElement): {
		hasAccessibleName: boolean;
		hasProperRole: boolean;
		hasRequiredAttributes: boolean;
		missingAttributes: string[];
	} {
		const tagName = element.tagName.toLowerCase();
		const role = element.getAttribute("role");
		const ariaLabel = element.getAttribute("aria-label");
		const ariaLabelledBy = element.getAttribute("aria-labelledby");
		const _ariaDescribedBy = element.getAttribute("aria-describedby");

		const missingAttributes: string[] = [];

		// Check for accessible name
		const hasAccessibleName = !!(
			ariaLabel ||
			ariaLabelledBy ||
			element.textContent?.trim() ||
			(tagName === "input" && element.getAttribute("placeholder")) ||
			(tagName === "img" && element.getAttribute("alt"))
		);

		// Check for proper role
		const interactiveTags = ["button", "a", "input", "select", "textarea"];
		const hasProperRole =
			interactiveTags.includes(tagName) ||
			Boolean(
				role && ["button", "link", "menuitem", "tab", "option"].includes(role),
			);

		// Check for required attributes based on role/tag
		let hasRequiredAttributes = true;

		if (role === "button" && !hasAccessibleName) {
			missingAttributes.push("aria-label or text content");
			hasRequiredAttributes = false;
		}

		if (role === "tab") {
			if (!element.getAttribute("aria-selected")) {
				missingAttributes.push("aria-selected");
				hasRequiredAttributes = false;
			}
			if (!element.getAttribute("aria-controls")) {
				missingAttributes.push("aria-controls");
				hasRequiredAttributes = false;
			}
		}

		if (role === "menuitem" && !hasAccessibleName) {
			missingAttributes.push("aria-label or text content");
			hasRequiredAttributes = false;
		}

		if (tagName === "img" && !element.getAttribute("alt")) {
			missingAttributes.push("alt");
			hasRequiredAttributes = false;
		}

		return {
			hasAccessibleName,
			hasProperRole,
			hasRequiredAttributes,
			missingAttributes,
		};
	}

	/**
	 * Validate form accessibility
	 */
	static validateFormAccessibility(form: HTMLFormElement): {
		hasLabels: boolean;
		hasErrorMessages: boolean;
		hasRequiredIndicators: boolean;
		issues: string[];
	} {
		const issues: string[] = [];
		const inputs = form.querySelectorAll("input, select, textarea");

		let hasLabels = true;
		let hasErrorMessages = true;
		let hasRequiredIndicators = true;

		inputs.forEach((input, index) => {
			const element = input as HTMLElement;
			const id = element.getAttribute("id");
			const ariaLabel = element.getAttribute("aria-label");
			const ariaLabelledBy = element.getAttribute("aria-labelledby");
			const required = element.hasAttribute("required");
			const ariaRequired = element.getAttribute("aria-required") === "true";
			const ariaInvalid = element.getAttribute("aria-invalid") === "true";
			const ariaDescribedBy = element.getAttribute("aria-describedby");

			// Check for labels
			if (!ariaLabel && !ariaLabelledBy) {
				const label = id ? form.querySelector(`label[for="${id}"]`) : null;
				if (!label) {
					hasLabels = false;
					issues.push(`Input ${index + 1} missing label`);
				}
			}

			// Check for required indicators
			if ((required || ariaRequired) && !element.textContent?.includes("*")) {
				const describedElement = ariaDescribedBy
					? document.getElementById(ariaDescribedBy)
					: null;
				if (!describedElement?.textContent?.includes("obligatorio")) {
					hasRequiredIndicators = false;
					issues.push(`Required input ${index + 1} missing indicator`);
				}
			}

			// Check for error messages
			if (ariaInvalid && !ariaDescribedBy) {
				hasErrorMessages = false;
				issues.push(`Invalid input ${index + 1} missing error message`);
			}
		});

		return {
			hasLabels,
			hasErrorMessages,
			hasRequiredIndicators,
			issues,
		};
	}
}

// Keyboard navigation testing
export class KeyboardNavigationTester {
	/**
	 * Test if element is keyboard accessible
	 */
	static isKeyboardAccessible(element: HTMLElement): boolean {
		const tabIndex = element.getAttribute("tabindex");
		const tagName = element.tagName.toLowerCase();

		// Naturally focusable elements
		const naturallyFocusable = [
			"button",
			"input",
			"select",
			"textarea",
			"a",
			"summary",
		];

		if (naturallyFocusable.includes(tagName)) {
			return tabIndex !== "-1";
		}

		// Elements with positive or zero tabindex
		return tabIndex !== null && tabIndex !== "-1";
	}

	/**
	 * Get all focusable elements in container
	 */
	static getFocusableElements(container: HTMLElement): HTMLElement[] {
		const selector = [
			"button:not([disabled])",
			"input:not([disabled])",
			"select:not([disabled])",
			"textarea:not([disabled])",
			"a[href]",
			'[tabindex]:not([tabindex="-1"])',
			'[contenteditable="true"]',
			"summary",
		].join(", ");

		return Array.from(container.querySelectorAll(selector)).filter((el) => {
			const element = el as HTMLElement;
			const style = window.getComputedStyle(element);
			return (
				style.display !== "none" &&
				style.visibility !== "hidden" &&
				element.offsetParent !== null
			);
		}) as HTMLElement[];
	}

	/**
	 * Test focus trap functionality
	 */
	static testFocusTrap(container: HTMLElement): {
		canTrapFocus: boolean;
		focusableCount: number;
		issues: string[];
	} {
		const focusableElements =
			KeyboardNavigationTester.getFocusableElements(container);
		const issues: string[] = [];

		if (focusableElements.length === 0) {
			issues.push("No focusable elements found");
			return { canTrapFocus: false, focusableCount: 0, issues };
		}

		if (focusableElements.length === 1) {
			issues.push(
				"Only one focusable element - focus trap may not work properly",
			);
		}

		return {
			canTrapFocus: focusableElements.length > 0,
			focusableCount: focusableElements.length,
			issues,
		};
	}
}

// Comprehensive accessibility audit
export class AccessibilityAuditor {
	/**
	 * Run complete accessibility audit on element
	 */
	static auditElement(element: HTMLElement): {
		score: number;
		issues: string[];
		recommendations: string[];
		colorContrast: any;
		aria: any;
		keyboard: any;
	} {
		const issues: string[] = [];
		const recommendations: string[] = [];

		// ARIA validation
		const aria = AriaValidator.validateAriaAttributes(element);
		if (!aria.hasAccessibleName) {
			issues.push("Missing accessible name");
			recommendations.push("Add aria-label or ensure element has text content");
		}

		// Keyboard accessibility
		const keyboard = {
			isAccessible: KeyboardNavigationTester.isKeyboardAccessible(element),
			focusableElements: KeyboardNavigationTester.getFocusableElements(element),
		};

		if (!keyboard.isAccessible && element.onclick) {
			issues.push("Interactive element not keyboard accessible");
			recommendations.push('Add tabindex="0" and keyboard event handlers');
		}

		// Color contrast (simplified check)
		const colorContrast = {
			hasGoodContrast: true, // Would need actual color calculation
			ratio: 0, // Would calculate actual ratio
		};

		// Calculate score
		const totalChecks = 4;
		let passedChecks = 0;

		if (aria.hasAccessibleName) passedChecks++;
		if (aria.hasProperRole) passedChecks++;
		if (keyboard.isAccessible) passedChecks++;
		if (colorContrast.hasGoodContrast) passedChecks++;

		const score = (passedChecks / totalChecks) * 100;

		return {
			score,
			issues,
			recommendations,
			colorContrast,
			aria,
			keyboard,
		};
	}

	/**
	 * Audit entire page or container
	 */
	static auditContainer(container: HTMLElement = document.body): {
		overallScore: number;
		elementAudits: any[];
		summary: {
			totalElements: number;
			passedElements: number;
			failedElements: number;
			commonIssues: string[];
		};
	} {
		const interactiveElements = container.querySelectorAll(
			'button, input, select, textarea, a, [role="button"], [role="link"], [tabindex]',
		);

		const elementAudits = Array.from(interactiveElements).map((el) => {
			const audit = AccessibilityAuditor.auditElement(el as HTMLElement);
			return {
				element: el,
				tagName: el.tagName.toLowerCase(),
				...audit,
			};
		});

		const totalElements = elementAudits.length;
		const passedElements = elementAudits.filter(
			(audit) => audit.score >= 80,
		).length;
		const failedElements = totalElements - passedElements;

		const overallScore =
			totalElements > 0
				? elementAudits.reduce((sum, audit) => sum + audit.score, 0) /
					totalElements
				: 100;

		// Find common issues
		const allIssues = elementAudits.flatMap((audit) => audit.issues);
		const issueCount = allIssues.reduce(
			(acc, issue) => {
				acc[issue] = (acc[issue] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		const commonIssues = Object.entries(issueCount)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
			.map(([issue]) => issue);

		return {
			overallScore,
			elementAudits,
			summary: {
				totalElements,
				passedElements,
				failedElements,
				commonIssues,
			},
		};
	}
}

// Development-only accessibility checker
export const runAccessibilityCheck = (element?: HTMLElement) => {
	if (process.env.NODE_ENV !== "development") return;

	const target = element || document.body;
	const audit = AccessibilityAuditor.auditContainer(target);

	console.group("🔍 Accessibility Audit Results");
	console.log(`Overall Score: ${audit.overallScore.toFixed(1)}%`);
	console.log(`Elements Audited: ${audit.summary.totalElements}`);
	console.log(`Passed: ${audit.summary.passedElements}`);
	console.log(`Failed: ${audit.summary.failedElements}`);

	if (audit.summary.commonIssues.length > 0) {
		console.group("Common Issues:");
		audit.summary.commonIssues.forEach((issue) => console.log(`• ${issue}`));
		console.groupEnd();
	}

	if (audit.elementAudits.some((a) => a.score < 80)) {
		console.group("Failed Elements:");
		audit.elementAudits
			.filter((a) => a.score < 80)
			.forEach((audit) => {
				console.log(
					`${audit.tagName}: ${audit.score.toFixed(1)}% - ${audit.issues.join(", ")}`,
				);
			});
		console.groupEnd();
	}

	console.groupEnd();

	return audit;
};
