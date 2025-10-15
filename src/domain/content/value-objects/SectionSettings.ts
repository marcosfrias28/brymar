import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export interface SectionSettingsData {
    layout?: string;
    theme?: string;
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
    animation?: string;
    responsive?: Record<string, any>;
    customCSS?: string;
    [key: string]: any; // Allow additional custom settings
}

export class SectionSettings extends ValueObject<SectionSettingsData> {
    private static readonly VALID_LAYOUTS = [
        'default', 'grid', 'flex', 'carousel', 'masonry', 'list', 'card'
    ];

    private static readonly VALID_THEMES = [
        'light', 'dark', 'primary', 'secondary', 'accent', 'neutral'
    ];

    private static readonly VALID_ANIMATIONS = [
        'none', 'fade', 'slide', 'zoom', 'bounce', 'rotate'
    ];

    private constructor(value: SectionSettingsData) {
        super(value);
    }

    static create(data: SectionSettingsData = {}): SectionSettings {
        const validatedData = this.validateSettingsData(data);
        return new SectionSettings(validatedData);
    }

    static default(): SectionSettings {
        return new SectionSettings({
            layout: 'default',
            theme: 'light',
            padding: 'medium',
            animation: 'none'
        });
    }

    private static validateSettingsData(data: SectionSettingsData): SectionSettingsData {
        const validated: SectionSettingsData = { ...data };

        // Validate layout
        if (validated.layout && !this.VALID_LAYOUTS.includes(validated.layout)) {
            throw new ValueObjectValidationError(
                `Invalid layout: ${validated.layout}. Valid layouts are: ${this.VALID_LAYOUTS.join(', ')}`
            );
        }

        // Validate theme
        if (validated.theme && !this.VALID_THEMES.includes(validated.theme)) {
            throw new ValueObjectValidationError(
                `Invalid theme: ${validated.theme}. Valid themes are: ${this.VALID_THEMES.join(', ')}`
            );
        }

        // Validate animation
        if (validated.animation && !this.VALID_ANIMATIONS.includes(validated.animation)) {
            throw new ValueObjectValidationError(
                `Invalid animation: ${validated.animation}. Valid animations are: ${this.VALID_ANIMATIONS.join(', ')}`
            );
        }

        // Validate color values (basic hex color validation)
        if (validated.backgroundColor && !this.isValidColor(validated.backgroundColor)) {
            throw new ValueObjectValidationError('Invalid background color format');
        }

        if (validated.textColor && !this.isValidColor(validated.textColor)) {
            throw new ValueObjectValidationError('Invalid text color format');
        }

        // Validate CSS (basic check for dangerous content)
        if (validated.customCSS && this.containsDangerousCSS(validated.customCSS)) {
            throw new ValueObjectValidationError('Custom CSS contains potentially dangerous content');
        }

        return validated;
    }

    private static isValidColor(color: string): boolean {
        // Basic validation for hex colors, rgb, rgba, hsl, hsla, and named colors
        const colorRegex = /^(#[0-9A-Fa-f]{3,8}|rgb\(.*\)|rgba\(.*\)|hsl\(.*\)|hsla\(.*\)|[a-zA-Z]+)$/;
        return colorRegex.test(color.trim());
    }

    private static containsDangerousCSS(css: string): boolean {
        // Basic check for potentially dangerous CSS content
        const dangerousPatterns = [
            /javascript:/i,
            /expression\(/i,
            /behavior:/i,
            /@import/i,
            /url\s*\(\s*["']?javascript:/i
        ];

        return dangerousPatterns.some(pattern => pattern.test(css));
    }

    // Getters
    get layout(): string | undefined {
        return this.value.layout;
    }

    get theme(): string | undefined {
        return this.value.theme;
    }

    get backgroundColor(): string | undefined {
        return this.value.backgroundColor;
    }

    get textColor(): string | undefined {
        return this.value.textColor;
    }

    get padding(): string | undefined {
        return this.value.padding;
    }

    get margin(): string | undefined {
        return this.value.margin;
    }

    get animation(): string | undefined {
        return this.value.animation;
    }

    get responsive(): Record<string, any> | undefined {
        return this.value.responsive;
    }

    get customCSS(): string | undefined {
        return this.value.customCSS;
    }

    // Setting manipulation methods
    setLayout(layout: string): SectionSettings {
        return SectionSettings.create({
            ...this.value,
            layout
        });
    }

    setTheme(theme: string): SectionSettings {
        return SectionSettings.create({
            ...this.value,
            theme
        });
    }

    setBackgroundColor(color: string): SectionSettings {
        return SectionSettings.create({
            ...this.value,
            backgroundColor: color
        });
    }

    setTextColor(color: string): SectionSettings {
        return SectionSettings.create({
            ...this.value,
            textColor: color
        });
    }

    setPadding(padding: string): SectionSettings {
        return SectionSettings.create({
            ...this.value,
            padding
        });
    }

    setMargin(margin: string): SectionSettings {
        return SectionSettings.create({
            ...this.value,
            margin
        });
    }

    setAnimation(animation: string): SectionSettings {
        return SectionSettings.create({
            ...this.value,
            animation
        });
    }

    setResponsive(responsive: Record<string, any>): SectionSettings {
        return SectionSettings.create({
            ...this.value,
            responsive
        });
    }

    setCustomCSS(css: string): SectionSettings {
        return SectionSettings.create({
            ...this.value,
            customCSS: css
        });
    }

    setSetting(key: string, value: any): SectionSettings {
        return SectionSettings.create({
            ...this.value,
            [key]: value
        });
    }

    removeSetting(key: string): SectionSettings {
        const newSettings = { ...this.value };
        delete newSettings[key];
        return SectionSettings.create(newSettings);
    }

    // Query methods
    hasLayout(): boolean {
        return !!this.value.layout;
    }

    hasTheme(): boolean {
        return !!this.value.theme;
    }

    hasCustomColors(): boolean {
        return !!this.value.backgroundColor || !!this.value.textColor;
    }

    hasAnimation(): boolean {
        return !!this.value.animation && this.value.animation !== 'none';
    }

    hasResponsiveSettings(): boolean {
        return !!this.value.responsive && Object.keys(this.value.responsive).length > 0;
    }

    hasCustomCSS(): boolean {
        return !!this.value.customCSS && this.value.customCSS.trim().length > 0;
    }

    getSetting(key: string): any {
        return this.value[key];
    }

    // Business logic
    isAccessible(): boolean {
        // Basic accessibility checks
        if (this.hasCustomColors()) {
            // Should have both background and text color for proper contrast
            return !!this.value.backgroundColor && !!this.value.textColor;
        }
        return true;
    }

    isPerformant(): boolean {
        // Check for performance-impacting settings
        if (this.hasAnimation() && this.value.animation === 'bounce') {
            return false; // Bounce animations can be performance-heavy
        }

        if (this.hasCustomCSS() && this.value.customCSS!.length > 1000) {
            return false; // Very long custom CSS might impact performance
        }

        return true;
    }

    // Utility methods
    toCSS(): string {
        const cssRules: string[] = [];

        if (this.value.backgroundColor) {
            cssRules.push(`background-color: ${this.value.backgroundColor}`);
        }

        if (this.value.textColor) {
            cssRules.push(`color: ${this.value.textColor}`);
        }

        if (this.value.padding) {
            cssRules.push(`padding: ${this.value.padding}`);
        }

        if (this.value.margin) {
            cssRules.push(`margin: ${this.value.margin}`);
        }

        if (this.value.customCSS) {
            cssRules.push(this.value.customCSS);
        }

        return cssRules.join('; ');
    }

    getSettingsSummary(): string {
        const parts: string[] = [];

        if (this.hasLayout()) {
            parts.push(`Layout: ${this.value.layout}`);
        }

        if (this.hasTheme()) {
            parts.push(`Tema: ${this.value.theme}`);
        }

        if (this.hasCustomColors()) {
            parts.push('Colores personalizados');
        }

        if (this.hasAnimation()) {
            parts.push(`Animación: ${this.value.animation}`);
        }

        if (this.hasResponsiveSettings()) {
            parts.push('Configuración responsive');
        }

        if (this.hasCustomCSS()) {
            parts.push('CSS personalizado');
        }

        return parts.length > 0 ? parts.join(', ') : 'Configuración por defecto';
    }
}