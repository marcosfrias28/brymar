import { renderHook, act } from '@testing-library/react';
import { useAIGeneration } from '../use-ai-generation';
import { generatePropertyContent } from '@/lib/actions/ai-actions';

// Mock the AI actions
jest.mock('@/lib/actions/ai-actions');

const mockGeneratePropertyContent = generatePropertyContent as jest.MockedFunction<typeof generatePropertyContent>;

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
    toast: jest.fn(),
}));

import { toast } from '@/hooks/use-toast';

describe('useAIGeneration', () => {
    const mockPropertyData = {
        type: 'house',
        location: 'Santo Domingo',
        price: 150000,
        surface: 200,
        characteristics: ['piscina', 'garaje'],
        bedrooms: 3,
        bathrooms: 2,
    };

    const mockGeneratedContent = {
        title: 'Hermosa Casa en Santo Domingo',
        description: 'Una propiedad excepcional con todas las comodidades modernas...',
        tags: ['casa', 'santo domingo', 'moderna'],
    };

    beforeEach(() => {
        mockGeneratePropertyContent.mockResolvedValue({
            success: true,
            data: mockGeneratedContent,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('initializes with default state', () => {
        const { result } = renderHook(() => useAIGeneration());

        expect(result.current.isGenerating).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('generates content successfully', async () => {
        const { result } = renderHook(() => useAIGeneration());

        let generatedContent;

        await act(async () => {
            generatedContent = await result.current.generateContent(mockPropertyData);
        });

        expect(mockGeneratePropertyContent).toHaveBeenCalledWith(mockPropertyData);
        expect(generatedContent).toEqual(mockGeneratedContent);
        expect(result.current.isGenerating).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('sets loading state during generation', async () => {
        let resolveGeneration: (value: any) => void;
        const generationPromise = new Promise(resolve => {
            resolveGeneration = resolve;
        });

        mockGeneratePropertyContent.mockReturnValue(generationPromise);

        const { result } = renderHook(() => useAIGeneration());

        // Start generation
        act(() => {
            result.current.generateContent(mockPropertyData);
        });

        expect(result.current.isGenerating).toBe(true);

        // Resolve generation
        await act(async () => {
            resolveGeneration({ success: true, data: mockGeneratedContent });
            await generationPromise;
        });

        expect(result.current.isGenerating).toBe(false);
    });

    it('handles generation errors', async () => {
        const errorMessage = 'AI service unavailable';
        mockGeneratePropertyContent.mockResolvedValue({
            success: false,
            error: errorMessage,
        });

        const { result } = renderHook(() => useAIGeneration());

        await act(async () => {
            try {
                await result.current.generateContent(mockPropertyData);
            } catch (error) {
                // Expected to throw
            }
        });

        expect(result.current.error).toBe(errorMessage);
        expect(result.current.isGenerating).toBe(false);
        expect(toast).toHaveBeenCalledWith({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
        });
    });

    it('handles network errors', async () => {
        const networkError = new Error('Network error');
        mockGeneratePropertyContent.mockRejectedValue(networkError);

        const { result } = renderHook(() => useAIGeneration());

        await act(async () => {
            try {
                await result.current.generateContent(mockPropertyData);
            } catch (error) {
                // Expected to throw
            }
        });

        expect(result.current.error).toBe('Error de conexión. Intente nuevamente.');
        expect(result.current.isGenerating).toBe(false);
    });

    it('generates title only', async () => {
        mockGeneratePropertyContent.mockResolvedValue({
            success: true,
            data: { title: 'Generated Title' },
        });

        const { result } = renderHook(() => useAIGeneration());

        let generatedContent;

        await act(async () => {
            generatedContent = await result.current.generateTitle(mockPropertyData);
        });

        expect(mockGeneratePropertyContent).toHaveBeenCalledWith(
            mockPropertyData,
            'title'
        );
        expect(generatedContent).toBe('Generated Title');
    });

    it('generates description only', async () => {
        mockGeneratePropertyContent.mockResolvedValue({
            success: true,
            data: { description: 'Generated Description' },
        });

        const { result } = renderHook(() => useAIGeneration());

        let generatedContent;

        await act(async () => {
            generatedContent = await result.current.generateDescription(mockPropertyData);
        });

        expect(mockGeneratePropertyContent).toHaveBeenCalledWith(
            mockPropertyData,
            'description'
        );
        expect(generatedContent).toBe('Generated Description');
    });

    it('generates tags only', async () => {
        mockGeneratePropertyContent.mockResolvedValue({
            success: true,
            data: { tags: ['tag1', 'tag2'] },
        });

        const { result } = renderHook(() => useAIGeneration());

        let generatedContent;

        await act(async () => {
            generatedContent = await result.current.generateTags(mockPropertyData);
        });

        expect(mockGeneratePropertyContent).toHaveBeenCalledWith(
            mockPropertyData,
            'tags'
        );
        expect(generatedContent).toEqual(['tag1', 'tag2']);
    });

    it('clears error state on successful generation', async () => {
        const { result } = renderHook(() => useAIGeneration());

        // First, cause an error
        mockGeneratePropertyContent.mockResolvedValueOnce({
            success: false,
            error: 'Test error',
        });

        await act(async () => {
            try {
                await result.current.generateContent(mockPropertyData);
            } catch (error) {
                // Expected to throw
            }
        });

        expect(result.current.error).toBe('Test error');

        // Then, succeed
        mockGeneratePropertyContent.mockResolvedValueOnce({
            success: true,
            data: mockGeneratedContent,
        });

        await act(async () => {
            await result.current.generateContent(mockPropertyData);
        });

        expect(result.current.error).toBeNull();
    });

    it('prevents concurrent generations', async () => {
        let resolveFirstGeneration: (value: any) => void;
        const firstGenerationPromise = new Promise(resolve => {
            resolveFirstGeneration = resolve;
        });

        mockGeneratePropertyContent.mockReturnValueOnce(firstGenerationPromise);

        const { result } = renderHook(() => useAIGeneration());

        // Start first generation
        const firstPromise = act(async () => {
            return result.current.generateContent(mockPropertyData);
        });

        expect(result.current.isGenerating).toBe(true);

        // Try to start second generation while first is in progress
        const secondPromise = act(async () => {
            return result.current.generateContent(mockPropertyData);
        });

        // Second call should be ignored
        expect(mockGeneratePropertyContent).toHaveBeenCalledTimes(1);

        // Resolve first generation
        await act(async () => {
            resolveFirstGeneration({ success: true, data: mockGeneratedContent });
            await firstPromise;
            await secondPromise;
        });

        expect(result.current.isGenerating).toBe(false);
    });

    it('validates property data before generation', async () => {
        const { result } = renderHook(() => useAIGeneration());

        const invalidPropertyData = {
            type: '',
            location: '',
            price: 0,
            surface: 0,
            characteristics: [],
        };

        await act(async () => {
            try {
                await result.current.generateContent(invalidPropertyData);
            } catch (error) {
                // Expected to throw
            }
        });

        expect(result.current.error).toBe('Datos de propiedad insuficientes para generar contenido');
        expect(mockGeneratePropertyContent).not.toHaveBeenCalled();
    });

    it('handles rate limiting errors', async () => {
        mockGeneratePropertyContent.mockResolvedValue({
            success: false,
            error: 'Rate limit exceeded',
            retryAfter: 60,
        });

        const { result } = renderHook(() => useAIGeneration());

        await act(async () => {
            try {
                await result.current.generateContent(mockPropertyData);
            } catch (error) {
                // Expected to throw
            }
        });

        expect(result.current.error).toBe('Límite de solicitudes excedido. Intente en 60 segundos.');
    });

    it('provides retry functionality', async () => {
        const { result } = renderHook(() => useAIGeneration());

        // First call fails
        mockGeneratePropertyContent.mockResolvedValueOnce({
            success: false,
            error: 'Temporary error',
        });

        await act(async () => {
            try {
                await result.current.generateContent(mockPropertyData);
            } catch (error) {
                // Expected to throw
            }
        });

        expect(result.current.error).toBe('Temporary error');

        // Retry succeeds
        mockGeneratePropertyContent.mockResolvedValueOnce({
            success: true,
            data: mockGeneratedContent,
        });

        let retryResult;

        await act(async () => {
            retryResult = await result.current.retry();
        });

        expect(retryResult).toEqual(mockGeneratedContent);
        expect(result.current.error).toBeNull();
        expect(mockGeneratePropertyContent).toHaveBeenCalledTimes(2);
    });

    it('tracks generation history', async () => {
        const { result } = renderHook(() => useAIGeneration());

        await act(async () => {
            await result.current.generateContent(mockPropertyData);
        });

        expect(result.current.generationHistory).toHaveLength(1);
        expect(result.current.generationHistory[0]).toMatchObject({
            input: mockPropertyData,
            output: mockGeneratedContent,
            timestamp: expect.any(Date),
        });
    });
});