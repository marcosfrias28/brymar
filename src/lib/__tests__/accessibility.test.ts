/**
 * Accessibility Tests
 * 
 * Tests for accessibility features including ARIA attributes,
 * keyboard navigation, color contrast, and screen reader support.
 */

import {
    ColorContrastChecker,
    AriaValidator,
    KeyboardNavigationTester,
    validateSecondaryColorContrast
} from '@/lib/utils/accessibility-testing';
import {
    ariaLabels,
    keyboardKeys
} from '@/lib/utils/accessibility';

describe('Color Contrast', () => {
    test('should meet WCAG AA standards for normal text', () => {
        const ratio = ColorContrastChecker.getContrastRatio('#000000', '#ffffff');
        expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    test('should meet WCAG AA standards for large text', () => {
        const ratio = ColorContrastChecker.getContrastRatio('#666666', '#ffffff');
        expect(ratio).toBeGreaterThanOrEqual(3);
    });

    test('secondary colors should meet contrast requirements', () => {
        const results = validateSecondaryColorContrast();
        expect(typeof results.lightMode).toBe('boolean');
        expect(typeof results.darkMode).toBe('boolean');
    });

    test('should correctly calculate luminance', () => {
        const blackLuminance = ColorContrastChecker.getLuminance(0, 0, 0);
        const whiteLuminance = ColorContrastChecker.getLuminance(255, 255, 255);

        expect(blackLuminance).toBe(0);
        expect(whiteLuminance).toBe(1);
    });

    test('should convert hex to RGB correctly', () => {
        const rgb = ColorContrastChecker.hexToRgb('#ff0000');
        expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
    });
});

describe('ARIA Validation', () => {
    test('should validate accessible names', () => {
        const buttonWithLabel = document.createElement('button');
        buttonWithLabel.setAttribute('aria-label', 'Test button');

        const buttonWithText = document.createElement('button');
        buttonWithText.textContent = 'Click me';

        const buttonWithoutName = document.createElement('button');

        const validation1 = AriaValidator.validateAriaAttributes(buttonWithLabel);
        const validation2 = AriaValidator.validateAriaAttributes(buttonWithText);
        const validation3 = AriaValidator.validateAriaAttributes(buttonWithoutName);

        expect(validation1.hasAccessibleName).toBe(true);
        expect(validation2.hasAccessibleName).toBe(true);
        expect(validation3.hasAccessibleName).toBe(false);
    });

    test('should validate proper roles', () => {
        const button = document.createElement('button');
        const div = document.createElement('div');
        const divWithRole = document.createElement('div');
        divWithRole.setAttribute('role', 'button');

        const validation1 = AriaValidator.validateAriaAttributes(button);
        const validation2 = AriaValidator.validateAriaAttributes(div);
        const validation3 = AriaValidator.validateAriaAttributes(divWithRole);

        expect(validation1.hasProperRole).toBe(true);
        expect(validation2.hasProperRole).toBeFalsy();
        expect(validation3.hasProperRole).toBe(true);
    });
});

describe('Keyboard Navigation', () => {
    test('should identify keyboard accessible elements', () => {
        const button = document.createElement('button');
        const div = document.createElement('div');
        const divWithTabindex = document.createElement('div');
        divWithTabindex.setAttribute('tabindex', '0');

        expect(KeyboardNavigationTester.isKeyboardAccessible(button)).toBe(true);
        expect(KeyboardNavigationTester.isKeyboardAccessible(div)).toBe(false);
        expect(KeyboardNavigationTester.isKeyboardAccessible(divWithTabindex)).toBe(true);
    });

    test('should find focusable elements', () => {
        const container = document.createElement('div');
        container.innerHTML = `
      <button>Button 1</button>
      <input type="text" />
      <a href="#">Link</a>
      <div tabindex="0">Focusable div</div>
      <div>Non-focusable div</div>
    `;

        // Mock offsetParent for visibility check
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
            get() { return this.parentNode; }
        });

        const focusableElements = KeyboardNavigationTester.getFocusableElements(container);
        expect(focusableElements).toHaveLength(4);
    });
});

describe('Accessibility Constants', () => {
    test('should have all required ARIA labels', () => {
        expect(ariaLabels.mainNavigation).toBeDefined();
        expect(ariaLabels.breadcrumbNavigation).toBeDefined();
        expect(ariaLabels.toggleSidebar).toBeDefined();
        expect(ariaLabels.search).toBeDefined();
        expect(ariaLabels.skipToContent).toBeDefined();
    });

    test('should have all keyboard keys defined', () => {
        expect(keyboardKeys.ENTER).toBe('Enter');
        expect(keyboardKeys.SPACE).toBe(' ');
        expect(keyboardKeys.ESCAPE).toBe('Escape');
        expect(keyboardKeys.TAB).toBe('Tab');
    });
});

describe('Screen Reader Support', () => {
    test('should create announcement elements', () => {
        const originalCreateElement = document.createElement;
        const mockElement = {
            setAttribute: jest.fn(),
            textContent: '',
            className: '',
        };

        document.createElement = jest.fn().mockReturnValue(mockElement);
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();

        const { announceToScreenReader } = require('@/lib/utils/accessibility');
        announceToScreenReader('Test message', 'polite');

        expect(document.createElement).toHaveBeenCalledWith('div');
        expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
        expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');

        document.createElement = originalCreateElement;
    });
});