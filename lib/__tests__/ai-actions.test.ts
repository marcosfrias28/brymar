import { describe, it, expect, beforeEach } from '@jest/globals';
import {
    generatePropertyTitle,
    generatePropertyDescription,
    generatePropertyTags,
    generateAllPropertyContent,
} from '@/lib/actions/ai-actions';
import { PropertyBasicInfo } from '@/types/wizard';

// Mock property data for testing
const mockPropertyData: PropertyBasicInfo = {
    type: "Casa",
    location: "Punta Cana",
    price: 450000,
    surface: 280,
    characteristics: ["Piscina", "Vista al Mar", "Estacionamiento"],
    bedrooms: 3,
    bathrooms: 2,
};

describe('AI Actions', () => {
    beforeEach(() => {
        // Reset environment variables for testing
        process.env.HUGGINGFACE_API_KEY = 'test_key';
    });

    describe('generatePropertyTitle', () => {
        it('should generate a title successfully with fallback', async () => {
            const result = await generatePropertyTitle(mockPropertyData, { language: 'es' });

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(typeof result.data).toBe('string');
            expect(result.data!.length).toBeGreaterThan(0);
        });

        it('should generate an English title when language is set to en', async () => {
            const result = await generatePropertyTitle(mockPropertyData, { language: 'en' });

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(typeof result.data).toBe('string');
        });

        it('should handle missing API key gracefully', async () => {
            delete process.env.HUGGINGFACE_API_KEY;

            const result = await generatePropertyTitle(mockPropertyData);

            // Should still succeed with template fallback
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });
    });

    describe('generatePropertyDescription', () => {
        it('should generate a description successfully with fallback', async () => {
            const result = await generatePropertyDescription(mockPropertyData, { language: 'es' });

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(typeof result.data).toBe('string');
            expect(result.data!.length).toBeGreaterThan(50);
        });

        it('should include property details in description', async () => {
            const result = await generatePropertyDescription(mockPropertyData);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data).toContain('280');
            expect(result.data).toContain('450');
        });
    });

    describe('generatePropertyTags', () => {
        it('should generate tags successfully with fallback', async () => {
            const result = await generatePropertyTags(mockPropertyData, { language: 'es' });

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data!.length).toBeGreaterThan(0);
            expect(result.data!.length).toBeLessThanOrEqual(8);
        });

        it('should include property characteristics in tags', async () => {
            const result = await generatePropertyTags(mockPropertyData);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();

            const tags = result.data!.join(' ').toLowerCase();
            expect(tags).toContain('casa');
        });
    });

    describe('generateAllPropertyContent', () => {
        it('should generate all content successfully', async () => {
            const result = await generateAllPropertyContent(mockPropertyData, { language: 'es' });

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data!.title).toBeDefined();
            expect(result.data!.description).toBeDefined();
            expect(result.data!.tags).toBeDefined();
            expect(Array.isArray(result.data!.tags)).toBe(true);
        });

        it('should generate content in the specified language', async () => {
            const result = await generateAllPropertyContent(mockPropertyData, { language: 'en' });

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(typeof result.data!.title).toBe('string');
            expect(typeof result.data!.description).toBe('string');
        });
    });

    describe('Template fallbacks', () => {
        it('should work without characteristics', async () => {
            const minimalData: PropertyBasicInfo = {
                type: "Apartamento",
                location: "Santo Domingo",
                price: 200000,
                surface: 120,
                characteristics: [],
            };

            const result = await generatePropertyTitle(minimalData);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data).toContain('Apartamento');
            expect(result.data).toContain('Santo Domingo');
        });

        it('should handle very large property data', async () => {
            const largeData: PropertyBasicInfo = {
                type: "Villa",
                location: "Cap Cana",
                price: 2500000,
                surface: 1200,
                characteristics: [
                    "Piscina", "Jacuzzi", "Gimnasio", "Cancha de tenis",
                    "Vista al mar", "Jardín", "Garaje", "Seguridad 24/7"
                ],
                bedrooms: 8,
                bathrooms: 10,
            };

            const result = await generateAllPropertyContent(largeData);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });
    });
});