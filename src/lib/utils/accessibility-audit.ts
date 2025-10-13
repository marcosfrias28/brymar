/**
 * Comprehensive Accessibility Audit Utilities
 * 
 * This module provides tools for conducting accessibility audits on the dashboard
 * and ensuring WCAG 2.1 AA compliance.
 */

import { validateAccessibility, createAccessibilityChecker } from './accessibility';

export interface AccessibilityIssue {
    element: HTMLElement;
    type: 'error' | 'warning' | 'info';
    message: string;
    wcagReference?: string;
    suggestion?: string;
}

export interface AccessibilityAuditResult {
    totalElements: number;
    issuesFound: AccessibilityIssue[];
    score: number; // 0-100
    summary: {
        errors: number;
        warnings: number;
        info: number;
    };
}

// WCAG 2.1 AA compliance checks
const wcagChecks = {
    // 1.1.1 Non-text Content
    checkImages: (container: HTMLElement): AccessibilityIssue[] => {
        const issues: AccessibilityIssue[] = [];
        const images = container.querySelectorAll('img');

        images.forEach(img => {
            const alt = img.getAttribute('alt');
            const role = img.getAttribute('role');

            if (alt === null && role !== 'presentation' && role !== 'none') {
                issues.push({
                    element: img as HTMLElement,
                    type: 'error',
                    message: 'Image missing alt attribute',
                    wcagReference: '1.1.1',
                    suggestion: 'Add descriptive alt text or role="presentation" for decorative images'
                });
            }
        });

        return issues;
    },

    // 1.3.1 Info and Relationships
    checkHeadingStructure: (container: HTMLElement): AccessibilityIssue[] => {
        const issues: AccessibilityIssue[] = [];
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;

        headings.forEach(heading => {
            const level = parseInt(heading.tagName.charAt(1));

            if (level > previousLevel + 1) {
                issues.push({
                    element: heading as HTMLElement,
                    type: 'warning',
                    message: `Heading level skipped from h${previousLevel} to h${level}`,
                    wcagReference: '1.3.1',
                    suggestion: 'Use heading levels sequentially'
                });
            }

            previousLevel = level;
        });

        return issues;
    },

    // 1.4.3 Contrast (Minimum)
    checkColorContrast: (container: HTMLElement): AccessibilityIssue[] => {
        const issues: AccessibilityIssue[] = [];
        const textElements = container.querySelectorAll('p, span, div, button, a, label, input, textarea, select');

        textElements.forEach(element => {
            const styles = window.getComputedStyle(element as HTMLElement);
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;

            // Simple check for transparent or very light backgrounds
            if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
                // Check if parent has background
                const parent = element.parentElement;
                if (parent) {
                    const parentStyles = window.getComputedStyle(parent);
                    if (parentStyles.backgroundColor === 'rgba(0, 0, 0, 0)' || parentStyles.backgroundColor === 'transparent') {
                        issues.push({
                            element: element as HTMLElement,
                            type: 'warning',
                            message: 'Text may not have sufficient contrast',
                            wcagReference: '1.4.3',
                            suggestion: 'Ensure text has sufficient color contrast (4.5:1 for normal text)'
                        });
                    }
                }
            }
        });

        return issues;
    },

    // 2.1.1 Keyboard
    checkKeyboardAccessibility: (container: HTMLElement): AccessibilityIssue[] => {
        const issues: AccessibilityIssue[] = [];
        const interactiveElements = container.querySelectorAll('button, a, input, select, textarea, [tabindex], [role="button"], [role="link"]');

        interactiveElements.forEach(element => {
            const tabIndex = element.getAttribute('tabindex');
            const role = element.getAttribute('role');

            // Check for negative tabindex on interactive elements
            if (tabIndex === '-1' && !role) {
                issues.push({
                    element: element as HTMLElement,
                    type: 'warning',
                    message: 'Interactive element removed from tab order',
                    wcagReference: '2.1.1',
                    suggestion: 'Ensure all interactive elements are keyboard accessible'
                });
            }

            // Check for missing keyboard event handlers on custom interactive elements
            if (role === 'button' || role === 'link') {
                const hasKeyHandler = element.hasAttribute('onkeydown') || element.hasAttribute('onkeyup');
                if (!hasKeyHandler) {
                    issues.push({
                        element: element as HTMLElement,
                        type: 'warning',
                        message: 'Custom interactive element may not respond to keyboard',
                        wcagReference: '2.1.1',
                        suggestion: 'Add keyboard event handlers for Enter and Space keys'
                    });
                }
            }
        });

        return issues;
    },

    // 2.4.1 Bypass Blocks
    checkSkipLinks: (container: HTMLElement): AccessibilityIssue[] => {
        const issues: AccessibilityIssue[] = [];
        const skipLinks = container.querySelectorAll('a[href^="#"]');

        if (skipLinks.length === 0) {
            const main = container.querySelector('main');
            if (main) {
                issues.push({
                    element: main as HTMLElement,
                    type: 'info',
                    message: 'Consider adding skip links for better navigation',
                    wcagReference: '2.4.1',
                    suggestion: 'Add "Skip to main content" link at the beginning of the page'
                });
            }
        }

        return issues;
    },

    // 2.4.6 Headings and Labels
    checkLabels: (container: HTMLElement): AccessibilityIssue[] => {
        const issues: AccessibilityIssue[] = [];
        const formElements = container.querySelectorAll('input, select, textarea');

        formElements.forEach(element => {
            const id = element.id;
            const ariaLabel = element.getAttribute('aria-label');
            const ariaLabelledBy = element.getAttribute('aria-labelledby');
            const label = id ? container.querySelector(`label[for="${id}"]`) : null;

            if (!label && !ariaLabel && !ariaLabelledBy) {
                issues.push({
                    element: element as HTMLElement,
                    type: 'error',
                    message: 'Form element missing label',
                    wcagReference: '2.4.6',
                    suggestion: 'Add a label element or aria-label attribute'
                });
            }
        });

        return issues;
    },

    // 4.1.2 Name, Role, Value
    checkAriaAttributes: (container: HTMLElement): AccessibilityIssue[] => {
        const issues: AccessibilityIssue[] = [];
        const elementsWithAria = container.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');

        elementsWithAria.forEach(element => {
            const ariaLabelledBy = element.getAttribute('aria-labelledby');
            const ariaDescribedBy = element.getAttribute('aria-describedby');

            // Check if referenced elements exist
            if (ariaLabelledBy) {
                const referencedElements = ariaLabelledBy.split(' ').every(id =>
                    container.querySelector(`#${id}`)
                );

                if (!referencedElements) {
                    issues.push({
                        element: element as HTMLElement,
                        type: 'error',
                        message: 'aria-labelledby references non-existent element',
                        wcagReference: '4.1.2',
                        suggestion: 'Ensure all referenced IDs exist in the document'
                    });
                }
            }

            if (ariaDescribedBy) {
                const referencedElements = ariaDescribedBy.split(' ').every(id =>
                    container.querySelector(`#${id}`)
                );

                if (!referencedElements) {
                    issues.push({
                        element: element as HTMLElement,
                        type: 'error',
                        message: 'aria-describedby references non-existent element',
                        wcagReference: '4.1.2',
                        suggestion: 'Ensure all referenced IDs exist in the document'
                    });
                }
            }
        });

        return issues;
    }
};

// Main audit function
export const auditAccessibility = (container: HTMLElement = document.body): AccessibilityAuditResult => {
    const allIssues: AccessibilityIssue[] = [];

    // Run all WCAG checks
    Object.values(wcagChecks).forEach(check => {
        allIssues.push(...check(container));
    });

    // Count elements
    const totalElements = container.querySelectorAll('*').length;

    // Calculate summary
    const summary = {
        errors: allIssues.filter(issue => issue.type === 'error').length,
        warnings: allIssues.filter(issue => issue.type === 'warning').length,
        info: allIssues.filter(issue => issue.type === 'info').length,
    };

    // Calculate score (100 - percentage of elements with issues)
    const elementsWithIssues = new Set(allIssues.map(issue => issue.element)).size;
    const score = Math.max(0, Math.round(100 - (elementsWithIssues / totalElements) * 100));

    return {
        totalElements,
        issuesFound: allIssues,
        score,
        summary
    };
};

// Quick accessibility check for development
export const quickAccessibilityCheck = (element: HTMLElement): boolean => {
    const checker = createAccessibilityChecker();
    const result = checker.checkElement(element);

    if (result.issues.length > 0) {
        console.warn('Accessibility issues found:', result.issues);
        return false;
    }

    return true;
};

// Generate accessibility report
export const generateAccessibilityReport = (auditResult: AccessibilityAuditResult): string => {
    const { totalElements, issuesFound, score, summary } = auditResult;

    let report = `# Accessibility Audit Report\n\n`;
    report += `**Score:** ${score}/100\n`;
    report += `**Total Elements:** ${totalElements}\n`;
    report += `**Issues Found:** ${issuesFound.length}\n\n`;

    report += `## Summary\n`;
    report += `- Errors: ${summary.errors}\n`;
    report += `- Warnings: ${summary.warnings}\n`;
    report += `- Info: ${summary.info}\n\n`;

    if (issuesFound.length > 0) {
        report += `## Issues\n\n`;

        issuesFound.forEach((issue, index) => {
            report += `### ${index + 1}. ${issue.message}\n`;
            report += `**Type:** ${issue.type}\n`;
            if (issue.wcagReference) {
                report += `**WCAG Reference:** ${issue.wcagReference}\n`;
            }
            if (issue.suggestion) {
                report += `**Suggestion:** ${issue.suggestion}\n`;
            }
            report += `**Element:** ${issue.element.tagName.toLowerCase()}`;
            if (issue.element.className) {
                report += ` class="${issue.element.className}"`;
            }
            report += `\n\n`;
        });
    }

    return report;
};

// Export for use in tests and development tools
export { wcagChecks };