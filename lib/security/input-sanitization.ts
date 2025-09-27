/**
 * Input sanitization utilities for wizard form fields and AI-generated content
 * Provides comprehensive protection against XSS, injection attacks, and malicious content
 */

// Conditional import to avoid server-side issues
let DOMPurify: any = null;
if (typeof window !== 'undefined') {
    try {
        DOMPurify = require('isomorphic-dompurify');
    } catch (error) {
        console.warn('DOMPurify not available:', error);
    }
}
import { z } from 'zod';

// Security configuration
const SECURITY_CONFIG = {
    // Maximum lengths for different field types
    MAX_LENGTHS: {
        title: 100,
        description: 2000,
        address: 200,
        city: 100,
        province: 100,
        filename: 255,
        characteristic: 50,
    },

    // Allowed HTML tags for rich content (if needed)
    ALLOWED_HTML_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'] as string[],

    // Blocked patterns for security
    BLOCKED_PATTERNS: [
        // Script injection
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /data:text\/html/gi,
        /vbscript:/gi,

        // HTML injection
        /<iframe/gi,
        /<object/gi,
        /<embed/gi,
        /<link/gi,
        /<meta/gi,
        /<style/gi,

        // CSS injection
        /expression\s*\(/gi,
        /url\s*\(/gi,
        /@import/gi,
        /binding\s*:/gi,

        // SQL injection patterns
        /union\s+select/gi,
        /drop\s+table/gi,
        /insert\s+into/gi,
        /delete\s+from/gi,
        /update\s+set/gi,

        // Command injection
        /\|\s*\w+/g,
        /;\s*\w+/g,
        /&&\s*\w+/g,
        /\$\(/g,
        /`[^`]*`/g,
    ],

    // Character whitelist for different field types
    ALLOWED_CHARS: {
        alphanumeric: /^[a-zA-Z0-9\s\-.,()áéíóúÁÉÍÓÚñÑ]+$/,
        address: /^[a-zA-Z0-9\s\-.,()#áéíóúÁÉÍÓÚñÑ]+$/,
        filename: /^[a-zA-Z0-9\-._]+$/,
        numeric: /^[0-9.]+$/,
        coordinates: /^-?[0-9.]+$/,
    }
} as const;

/**
 * Sanitize text input to prevent XSS and injection attacks
 */
export function sanitizeText(
    input: string,
    options: {
        maxLength?: number;
        allowHtml?: boolean;
        allowedChars?: RegExp;
        preserveLineBreaks?: boolean;
    } = {}
): string {
    if (!input || typeof input !== 'string') {
        return '';
    }

    let sanitized = input;

    // Trim whitespace
    sanitized = sanitized.trim();

    // Check length limit
    if (options.maxLength && sanitized.length > options.maxLength) {
        sanitized = sanitized.substring(0, options.maxLength);
    }

    // Remove blocked patterns
    SECURITY_CONFIG.BLOCKED_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
    });

    // Handle HTML content
    if (options.allowHtml && DOMPurify) {
        try {
            // Use DOMPurify to sanitize HTML
            sanitized = DOMPurify.sanitize(sanitized, {
                ALLOWED_TAGS: SECURITY_CONFIG.ALLOWED_HTML_TAGS,
                ALLOWED_ATTR: [],
                KEEP_CONTENT: true,
            });
        } catch (error) {
            console.warn('DOMPurify sanitization failed, using basic sanitization:', error);
            // Fallback: remove all HTML tags
            sanitized = sanitized.replace(/<[^>]*>/g, '');
        }
    } else if (options.allowHtml) {
        // Fallback: remove all HTML tags if DOMPurify is not available
        sanitized = sanitized.replace(/<[^>]*>/g, '');
    } else {
        // Remove all HTML tags
        sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    // Validate against allowed characters
    if (options.allowedChars && !options.allowedChars.test(sanitized)) {
        // Remove disallowed characters
        sanitized = sanitized.replace(new RegExp(`[^${options.allowedChars.source.slice(2, -2)}]`, 'g'), '');
    }

    // Preserve line breaks if requested
    if (options.preserveLineBreaks) {
        sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        // Limit consecutive line breaks
        sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
    } else {
        // Replace line breaks with spaces
        sanitized = sanitized.replace(/[\r\n]+/g, ' ');
    }

    // Final cleanup
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    return sanitized;
}

/**
 * Sanitize property title
 */
export function sanitizeTitle(title: string): string {
    return sanitizeText(title, {
        maxLength: SECURITY_CONFIG.MAX_LENGTHS.title,
        allowedChars: SECURITY_CONFIG.ALLOWED_CHARS.alphanumeric,
        allowHtml: false,
    });
}

/**
 * Sanitize property description
 */
export function sanitizeDescription(description: string): string {
    return sanitizeText(description, {
        maxLength: SECURITY_CONFIG.MAX_LENGTHS.description,
        allowedChars: SECURITY_CONFIG.ALLOWED_CHARS.alphanumeric,
        allowHtml: false,
        preserveLineBreaks: true,
    });
}

/**
 * Sanitize address fields
 */
export function sanitizeAddress(address: string): string {
    return sanitizeText(address, {
        maxLength: SECURITY_CONFIG.MAX_LENGTHS.address,
        allowedChars: SECURITY_CONFIG.ALLOWED_CHARS.address,
        allowHtml: false,
    });
}

/**
 * Sanitize city/province names
 */
export function sanitizeLocationName(name: string): string {
    return sanitizeText(name, {
        maxLength: SECURITY_CONFIG.MAX_LENGTHS.city,
        allowedChars: SECURITY_CONFIG.ALLOWED_CHARS.alphanumeric,
        allowHtml: false,
    });
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') {
        return '';
    }

    // Extract extension
    const lastDotIndex = filename.lastIndexOf('.');
    const name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
    const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';

    // Sanitize name part
    let sanitizedName = name
        .toLowerCase()
        .replace(/[^a-z0-9\-_]/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_+|_+$/g, '');

    // Ensure minimum length
    if (sanitizedName.length < 1) {
        sanitizedName = 'file';
    }

    // Limit length
    if (sanitizedName.length > 50) {
        sanitizedName = sanitizedName.substring(0, 50);
    }

    return sanitizedName + extension;
}

/**
 * Sanitize AI-generated content
 */
export function sanitizeAIContent(content: string, type: 'title' | 'description' | 'tags'): string {
    switch (type) {
        case 'title':
            return sanitizeTitle(content);
        case 'description':
            return sanitizeDescription(content);
        case 'tags':
            return sanitizeText(content, {
                maxLength: 200,
                allowedChars: SECURITY_CONFIG.ALLOWED_CHARS.alphanumeric,
                allowHtml: false,
            });
        default:
            return sanitizeText(content);
    }
}

/**
 * Validate and sanitize coordinates
 */
export function sanitizeCoordinates(lat: number, lng: number): { latitude: number; longitude: number } | null {
    // Validate types
    if (typeof lat !== 'number' || typeof lng !== 'number') {
        return null;
    }

    // Check for valid numbers
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }

    // Dominican Republic bounds validation
    const DR_BOUNDS = {
        minLat: 17.5,
        maxLat: 19.9,
        minLng: -72.0,
        maxLng: -68.3,
    };

    if (lat < DR_BOUNDS.minLat || lat > DR_BOUNDS.maxLat ||
        lng < DR_BOUNDS.minLng || lng > DR_BOUNDS.maxLng) {
        return null;
    }

    // Round to reasonable precision (6 decimal places ≈ 0.1m accuracy)
    return {
        latitude: Math.round(lat * 1000000) / 1000000,
        longitude: Math.round(lng * 1000000) / 1000000,
    };
}

/**
 * Validate and sanitize numeric values
 */
export function sanitizeNumeric(
    value: unknown,
    options: {
        min?: number;
        max?: number;
        integer?: boolean;
        positive?: boolean;
    } = {}
): number | null {
    // Convert to number
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);

    // Check if valid number
    if (!Number.isFinite(num)) {
        return null;
    }

    // Check integer requirement
    if (options.integer && !Number.isInteger(num)) {
        return null;
    }

    // Check positive requirement
    if (options.positive && num <= 0) {
        return null;
    }

    // Check bounds
    if (options.min !== undefined && num < options.min) {
        return null;
    }

    if (options.max !== undefined && num > options.max) {
        return null;
    }

    return num;
}

/**
 * Sanitize property characteristics
 */
export function sanitizeCharacteristics(characteristics: unknown[]): Array<{
    id: string;
    name: string;
    category: 'amenity' | 'feature' | 'location';
    selected: boolean;
}> {
    if (!Array.isArray(characteristics)) {
        return [];
    }

    return characteristics
        .filter((char): char is any => Boolean(char && typeof char === 'object'))
        .map(char => ({
            id: typeof char.id === 'string' ? sanitizeText(char.id, { maxLength: 50 }) : '',
            name: typeof char.name === 'string' ? sanitizeText(char.name, {
                maxLength: SECURITY_CONFIG.MAX_LENGTHS.characteristic,
                allowedChars: SECURITY_CONFIG.ALLOWED_CHARS.alphanumeric
            }) : '',
            category: ['amenity', 'feature', 'location'].includes(char.category) ? char.category : 'feature',
            selected: Boolean(char.selected),
        }))
        .filter(char => char.id && char.name)
        .slice(0, 20); // Limit to 20 characteristics
}

/**
 * Comprehensive form data sanitization
 */
export function sanitizeFormData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
        switch (key) {
            case 'title':
                sanitized[key] = sanitizeTitle(String(value || ''));
                break;

            case 'description':
                sanitized[key] = sanitizeDescription(String(value || ''));
                break;

            case 'price':
            case 'surface':
                sanitized[key] = sanitizeNumeric(value, { positive: true, max: 999999999 });
                break;

            case 'bedrooms':
            case 'bathrooms':
                sanitized[key] = sanitizeNumeric(value, { integer: true, min: 0, max: 50 });
                break;

            case 'coordinates':
                if (value && typeof value === 'object' && 'latitude' in value && 'longitude' in value) {
                    sanitized[key] = sanitizeCoordinates(value.latitude, value.longitude);
                }
                break;

            case 'address':
                if (value && typeof value === 'object') {
                    sanitized[key] = {
                        street: sanitizeAddress(String(value.street || '')),
                        city: sanitizeLocationName(String(value.city || '')),
                        province: sanitizeLocationName(String(value.province || '')),
                        postalCode: sanitizeText(String(value.postalCode || ''), {
                            allowedChars: /^[0-9]+$/,
                            maxLength: 5
                        }),
                        country: 'Dominican Republic',
                        formattedAddress: sanitizeAddress(String(value.formattedAddress || '')),
                    };
                }
                break;

            case 'characteristics':
                sanitized[key] = sanitizeCharacteristics(Array.isArray(value) ? value : []);
                break;

            case 'images':
                if (Array.isArray(value)) {
                    sanitized[key] = value
                        .filter(img => img && typeof img === 'object')
                        .map(img => ({
                            id: sanitizeText(String(img.id || ''), { maxLength: 50 }),
                            url: String(img.url || ''),
                            filename: sanitizeFilename(String(img.filename || '')),
                            size: sanitizeNumeric(img.size, { positive: true, max: 10 * 1024 * 1024 }),
                            contentType: String(img.contentType || ''),
                            width: sanitizeNumeric(img.width, { positive: true }),
                            height: sanitizeNumeric(img.height, { positive: true }),
                            displayOrder: sanitizeNumeric(img.displayOrder, { integer: true, min: 0 }),
                        }))
                        .filter(img => img.id && img.url && img.filename)
                        .slice(0, 20);
                }
                break;

            default:
                // For other fields, apply basic sanitization
                if (typeof value === 'string') {
                    sanitized[key] = sanitizeText(value);
                } else if (typeof value === 'number') {
                    sanitized[key] = sanitizeNumeric(value);
                } else if (typeof value === 'boolean') {
                    sanitized[key] = Boolean(value);
                } else {
                    sanitized[key] = value;
                }
        }
    }

    return sanitized;
}

/**
 * Content Security Policy helpers
 */
export const CSP_DIRECTIVES = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://api-inference.huggingface.co'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'font-src': ["'self'", 'https:'],
    'connect-src': ["'self'", 'https://api-inference.huggingface.co', 'https://*.vercel-storage.com'],
    'media-src': ["'self'", 'https:', 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
} as const;

/**
 * Generate CSP header value
 */
export function generateCSPHeader(): string {
    return Object.entries(CSP_DIRECTIVES)
        .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
        .join('; ');
}