import { useState, useCallback } from "react";
import { PropertyBasicInfo } from "@/types/wizard";
import { toast } from "@/hooks/use-toast";
import {
    generatePropertyTitle,
    generatePropertyDescription,
    generatePropertyTags,
    generateAllPropertyContent,
} from "@/lib/actions/ai-actions";

interface AIGenerationState {
    isGenerating: boolean;
    error: string | null;
    lastGenerated: {
        title?: string;
        description?: string;
        tags?: string[];
    };
}

interface UseAIGenerationOptions {
    language?: "es" | "en";
    onSuccess?: (type: "title" | "description" | "tags", content: any) => void;
    onError?: (error: string) => void;
}

export function useAIGeneration(options: UseAIGenerationOptions = {}) {
    const { language = "es", onSuccess, onError } = options;

    const [state, setState] = useState<AIGenerationState>({
        isGenerating: false,
        error: null,
        lastGenerated: {},
    });

    const setGenerating = useCallback((isGenerating: boolean) => {
        setState(prev => ({ ...prev, isGenerating, error: null }));
    }, []);

    const setError = useCallback((error: string) => {
        setState(prev => ({ ...prev, error, isGenerating: false }));
    }, []);

    const setGenerated = useCallback((type: keyof AIGenerationState["lastGenerated"], content: any) => {
        setState(prev => ({
            ...prev,
            lastGenerated: { ...prev.lastGenerated, [type]: content },
            isGenerating: false,
            error: null,
        }));
    }, []);

    /**
     * Generate property title with AI
     */
    const generateTitle = useCallback(async (propertyData: PropertyBasicInfo): Promise<string | null> => {
        setGenerating(true);

        try {
            const result = await generatePropertyTitle(propertyData, { language });

            if (result.success && result.data) {
                setGenerated("title", result.data);
                onSuccess?.("title", result.data);

                toast({
                    title: "Título generado",
                    description: "Se ha generado un título automáticamente con IA",
                });

                return result.data;
            } else {
                throw new Error(result.error || "Error al generar título");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error inesperado al generar el título";

            setError(errorMessage);
            onError?.(errorMessage);

            toast({
                title: "Error al generar título",
                description: errorMessage,
                variant: "destructive",
            });

            return null;
        }
    }, [language, onSuccess, onError, setGenerating, setError, setGenerated]);

    /**
     * Generate property description with AI
     */
    const generateDescription = useCallback(async (propertyData: PropertyBasicInfo): Promise<string | null> => {
        setGenerating(true);

        try {
            const result = await generatePropertyDescription(propertyData, { language });

            if (result.success && result.data) {
                setGenerated("description", result.data);
                onSuccess?.("description", result.data);

                toast({
                    title: "Descripción generada",
                    description: "Se ha generado una descripción automáticamente con IA",
                });

                return result.data;
            } else {
                throw new Error(result.error || "Error al generar descripción");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error inesperado al generar la descripción";

            setError(errorMessage);
            onError?.(errorMessage);

            toast({
                title: "Error al generar descripción",
                description: errorMessage,
                variant: "destructive",
            });

            return null;
        }
    }, [language, onSuccess, onError, setGenerating, setError, setGenerated]);

    /**
     * Generate property tags with AI
     */
    const generateTags = useCallback(async (propertyData: PropertyBasicInfo): Promise<string[] | null> => {
        setGenerating(true);

        try {
            const result = await generatePropertyTags(propertyData, { language });

            if (result.success && result.data) {
                setGenerated("tags", result.data);
                onSuccess?.("tags", result.data);

                toast({
                    title: "Etiquetas generadas",
                    description: `Se han generado ${result.data.length} etiquetas automáticamente`,
                });

                return result.data;
            } else {
                throw new Error(result.error || "Error al generar etiquetas");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error inesperado al generar las etiquetas";

            setError(errorMessage);
            onError?.(errorMessage);

            toast({
                title: "Error al generar etiquetas",
                description: errorMessage,
                variant: "destructive",
            });

            return null;
        }
    }, [language, onSuccess, onError, setGenerating, setError, setGenerated]);

    /**
     * Generate all content at once
     */
    const generateAll = useCallback(async (propertyData: PropertyBasicInfo) => {
        setGenerating(true);

        try {
            const result = await generateAllPropertyContent(propertyData, { language });

            if (result.success && result.data) {
                const { title, description, tags } = result.data;

                setState(prev => ({
                    ...prev,
                    lastGenerated: { title, description, tags },
                    isGenerating: false,
                    error: null,
                }));

                toast({
                    title: "Contenido generado",
                    description: "Se ha generado título, descripción y etiquetas con IA",
                });

                // Call onSuccess for each generated item
                onSuccess?.("title", title);
                onSuccess?.("description", description);
                onSuccess?.("tags", tags);

                return { title, description, tags };
            } else {
                throw new Error(result.error || "Error al generar contenido");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error al generar contenido con IA";
            setError(errorMessage);

            toast({
                title: "Error de generación",
                description: errorMessage,
                variant: "destructive",
            });

            return null;
        }
    }, [language, onSuccess, setGenerating, setError]);

    /**
     * Clear generation state
     */
    const clearState = useCallback(() => {
        setState({
            isGenerating: false,
            error: null,
            lastGenerated: {},
        });
    }, []);

    return {
        // State
        isGenerating: state.isGenerating,
        error: state.error,
        lastGenerated: state.lastGenerated,

        // Actions
        generateTitle,
        generateDescription,
        generateTags,
        generateAll,
        clearState,
    };
}

export default useAIGeneration;