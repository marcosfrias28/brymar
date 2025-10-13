/**
 * Enhanced AI Generation Hook for All Wizard Types
 * Supports properties, lands, and blog posts with comprehensive content generation
 */

import { useState, useCallback } from "react";
import { toast } from '@/hooks/use-toast';

// Types for different content generation
export interface PropertyAIData {
  type: "property";
  propertyType?: string;
  location?: string;
  price?: number;
  surface?: number;
  bedrooms?: number;
  bathrooms?: number;
  characteristics?: string[];
}

export interface LandAIData {
  type: "land";
  landType?: string;
  location?: string;
  price?: number;
  surface?: number;
  developmentPotential?: string;
  zoning?: string;
  characteristics?: string[];
}

export interface BlogAIData {
  type: "blog";
  category?: string;
  topic?: string;
  targetAudience?: string;
  keywords?: string[];
  tone?: "professional" | "casual" | "informative" | "persuasive";
}

export type AIContentData = PropertyAIData | LandAIData | BlogAIData;

export interface RichTextContent {
  html: string;
  plainText: string;
  formatted: boolean;
}

export interface AIGenerationResult {
  title?: string;
  description?: string | RichTextContent;
  tags?: string[];
  content?: string | RichTextContent;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
}

interface AIGenerationState {
  isGenerating: boolean;
  error: string | null;
  lastGenerated: AIGenerationResult;
  generationHistory: Array<{
    timestamp: Date;
    type: string;
    content: any;
  }>;
}

interface UseEnhancedAIGenerationOptions {
  language?: "es" | "en";
  useRichText?: boolean;
  autoSave?: boolean;
  onSuccess?: (type: string, content: any) => void;
  onError?: (error: string) => void;
}

export function useEnhancedAIGeneration(
  options: UseEnhancedAIGenerationOptions = {},
) {
  const {
    language = "es",
    useRichText = false,
    autoSave = false,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<AIGenerationState>({
    isGenerating: false,
    error: null,
    lastGenerated: {},
    generationHistory: [],
  });

  const setGenerating = useCallback((isGenerating: boolean) => {
    setState((prev) => ({ ...prev, isGenerating, error: null }));
  }, []);

  const setError = useCallback(
    (error: string) => {
      setState((prev) => ({ ...prev, error, isGenerating: false }));
      onError?.(error);
    },
    [onError],
  );

  const addToHistory = useCallback((type: string, content: any) => {
    setState((prev) => ({
      ...prev,
      generationHistory: [
        ...prev.generationHistory.slice(-9), // Keep last 10 entries
        { timestamp: new Date(), type, content },
      ],
    }));
  }, []);

  const setGenerated = useCallback(
    (type: string, content: any) => {
      setState((prev) => ({
        ...prev,
        lastGenerated: { ...prev.lastGenerated, [type]: content },
        isGenerating: false,
        error: null,
      }));

      addToHistory(type, content);
      onSuccess?.(type, content);
    },
    [addToHistory, onSuccess],
  );

  /**
   * Generate title based on content type
   */
  const generateTitle = useCallback(
    async (data: AIContentData): Promise<string | null> => {
      setGenerating(true);

      try {
        // Simulate AI generation - replace with actual API calls
        let title = "";

        switch (data.type) {
          case "property":
            title = await generatePropertyTitle(data);
            break;
          case "land":
            title = await generateLandTitle(data);
            break;
          case "blog":
            title = await generateBlogTitle(data);
            break;
        }

        setGenerated("title", title);

        toast({
          title: "Título generado",
          description: `Se ha generado un título para ${data.type} con IA`,
        });

        return title;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error al generar título";
        setError(errorMessage);

        toast({
          title: "Error al generar título",
          description: errorMessage,
          variant: "destructive",
        });

        return null;
      }
    },
    [setGenerating, setGenerated, setError],
  );

  /**
   * Generate description based on content type
   */
  const generateDescription = useCallback(
    async (data: AIContentData): Promise<string | RichTextContent | null> => {
      setGenerating(true);

      try {
        let description: string | RichTextContent = "";

        switch (data.type) {
          case "property":
            description = useRichText
              ? await generatePropertyRichDescription(data)
              : await generatePropertyDescription(data);
            break;
          case "land":
            description = useRichText
              ? await generateLandRichDescription(data)
              : await generateLandDescription(data);
            break;
          case "blog":
            description = useRichText
              ? await generateBlogRichContent(data)
              : await generateBlogDescription(data);
            break;
        }

        setGenerated("description", description);

        toast({
          title: "Descripción generada",
          description: `Se ha generado una descripción para ${data.type} con IA`,
        });

        return description;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al generar descripción";
        setError(errorMessage);

        toast({
          title: "Error al generar descripción",
          description: errorMessage,
          variant: "destructive",
        });

        return null;
      }
    },
    [useRichText, setGenerating, setGenerated, setError],
  );

  /**
   * Generate tags/keywords based on content type
   */
  const generateTags = useCallback(
    async (data: AIContentData): Promise<string[] | null> => {
      setGenerating(true);

      try {
        let tags: string[] = [];

        switch (data.type) {
          case "property":
            tags = await generatePropertyTags(data);
            break;
          case "land":
            tags = await generateLandTags(data);
            break;
          case "blog":
            tags = await generateBlogTags(data);
            break;
        }

        setGenerated("tags", tags);

        toast({
          title: "Etiquetas generadas",
          description: `Se han generado ${tags.length} etiquetas para ${data.type}`,
        });

        return tags;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error al generar etiquetas";
        setError(errorMessage);

        toast({
          title: "Error al generar etiquetas",
          description: errorMessage,
          variant: "destructive",
        });

        return null;
      }
    },
    [setGenerating, setGenerated, setError],
  );

  /**
   * Generate SEO content
   */
  const generateSEO = useCallback(
    async (
      data: AIContentData,
    ): Promise<{
      seoTitle: string;
      seoDescription: string;
      keywords: string[];
    } | null> => {
      setGenerating(true);

      try {
        const seoContent = await generateSEOContent(data);

        setGenerated("seoTitle", seoContent.seoTitle);
        setGenerated("seoDescription", seoContent.seoDescription);
        setGenerated("keywords", seoContent.keywords);

        toast({
          title: "SEO generado",
          description: "Se ha generado contenido SEO optimizado",
        });

        return seoContent;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error al generar SEO";
        setError(errorMessage);

        toast({
          title: "Error al generar SEO",
          description: errorMessage,
          variant: "destructive",
        });

        return null;
      }
    },
    [setGenerating, setGenerated, setError],
  );

  /**
   * Generate all content at once
   */
  const generateAll = useCallback(
    async (data: AIContentData): Promise<AIGenerationResult | null> => {
      setGenerating(true);

      try {
        const [title, description, tags, seoContent] = await Promise.allSettled(
          [
            generateTitle(data),
            generateDescription(data),
            generateTags(data),
            generateSEO(data),
          ],
        );

        const result: AIGenerationResult = {
          title:
            title.status === "fulfilled" ? title.value || undefined : undefined,
          description:
            description.status === "fulfilled"
              ? description.value || undefined
              : undefined,
          tags:
            tags.status === "fulfilled" ? tags.value || undefined : undefined,
          seoTitle:
            seoContent.status === "fulfilled"
              ? seoContent.value?.seoTitle
              : undefined,
          seoDescription:
            seoContent.status === "fulfilled"
              ? seoContent.value?.seoDescription
              : undefined,
          keywords:
            seoContent.status === "fulfilled"
              ? seoContent.value?.keywords
              : undefined,
        };

        setState((prev) => ({
          ...prev,
          lastGenerated: result,
          isGenerating: false,
          error: null,
        }));

        toast({
          title: "Contenido completo generado",
          description: `Se ha generado todo el contenido para ${data.type} con IA`,
        });

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al generar contenido completo";
        setError(errorMessage);

        toast({
          title: "Error de generación completa",
          description: errorMessage,
          variant: "destructive",
        });

        return null;
      }
    },
    [generateTitle, generateDescription, generateTags, generateSEO, setError],
  );

  /**
   * Clear generation state
   */
  const clearState = useCallback(() => {
    setState({
      isGenerating: false,
      error: null,
      lastGenerated: {},
      generationHistory: [],
    });
  }, []);

  /**
   * Get suggestions based on partial data
   */
  const getSuggestions = useCallback(
    async (data: Partial<AIContentData>, field: string): Promise<string[]> => {
      try {
        // Generate contextual suggestions based on the field and existing data
        return await generateSuggestions(data, field);
      } catch (error) {
        return [];
      }
    },
    [],
  );

  return {
    // State
    isGenerating: state.isGenerating,
    error: state.error,
    lastGenerated: state.lastGenerated,
    generationHistory: state.generationHistory,

    // Actions
    generateTitle,
    generateDescription,
    generateTags,
    generateSEO,
    generateAll,
    getSuggestions,
    clearState,
  };
}

// Helper functions for different content types (these would call actual AI APIs)
async function generatePropertyTitle(data: PropertyAIData): Promise<string> {
  // Mock implementation - replace with actual AI API call
  const {
    propertyType = "propiedad",
    location = "ubicación privilegiada",
    bedrooms,
    bathrooms,
  } = data;

  let title = `Hermosa ${propertyType} en ${location}`;

  if (bedrooms && bathrooms) {
    title += ` - ${bedrooms} hab, ${bathrooms} baños`;
  } else if (bedrooms) {
    title += ` - ${bedrooms} habitaciones`;
  }

  return title;
}

async function generateLandTitle(data: LandAIData): Promise<string> {
  const { landType, location, surface } = data;
  return `Terreno ${landType} en ${location} - ${surface} m²`;
}

async function generateBlogTitle(data: BlogAIData): Promise<string> {
  const { topic, category } = data;
  return `Guía Completa: ${topic} - ${category}`;
}

async function generatePropertyDescription(
  data: PropertyAIData,
): Promise<string> {
  return `Descubre esta increíble ${data.propertyType} ubicada en ${data.location}. Con ${data.bedrooms} habitaciones y ${data.bathrooms} baños, esta propiedad ofrece el espacio perfecto para tu familia.`;
}

async function generatePropertyRichDescription(
  data: PropertyAIData,
): Promise<RichTextContent> {
  const html = `<p><strong>Descubre esta increíble ${data.propertyType}</strong> ubicada en <em>${data.location}</em>.</p><ul><li>${data.bedrooms} habitaciones espaciosas</li><li>${data.bathrooms} baños modernos</li><li>Superficie de ${data.surface} m²</li></ul>`;
  const plainText = `Descubre esta increíble ${data.propertyType} ubicada en ${data.location}. Con ${data.bedrooms} habitaciones y ${data.bathrooms} baños.`;

  return { html, plainText, formatted: true };
}

async function generateLandDescription(data: LandAIData): Promise<string> {
  return `Excelente terreno ${data.landType} en ${data.location} con ${data.surface} m² de superficie. Ideal para ${data.developmentPotential}.`;
}

async function generateLandRichDescription(
  data: LandAIData,
): Promise<RichTextContent> {
  const html = `<p><strong>Excelente terreno ${data.landType}</strong> en <em>${data.location}</em>.</p><ul><li>Superficie: ${data.surface} m²</li><li>Potencial: ${data.developmentPotential}</li><li>Zonificación: ${data.zoning}</li></ul>`;
  const plainText = `Excelente terreno ${data.landType} en ${data.location} con ${data.surface} m² de superficie.`;

  return { html, plainText, formatted: true };
}

async function generateBlogDescription(data: BlogAIData): Promise<string> {
  return `Artículo completo sobre ${data.topic} en la categoría ${data.category}. Información actualizada y relevante para ${data.targetAudience}.`;
}

async function generateBlogRichContent(
  data: BlogAIData,
): Promise<RichTextContent> {
  const html = `<h2>${data.topic}</h2><p>Contenido completo sobre <strong>${data.topic}</strong> dirigido a <em>${data.targetAudience}</em>.</p><p>Este artículo cubre todos los aspectos importantes del tema.</p>`;
  const plainText = `${data.topic}\n\nContenido completo sobre ${data.topic} dirigido a ${data.targetAudience}.`;

  return { html, plainText, formatted: true };
}

async function generatePropertyTags(data: PropertyAIData): Promise<string[]> {
  const baseTags: (string | undefined)[] = [data.propertyType, data.location];
  if (data.bedrooms) baseTags.push(`${data.bedrooms} habitaciones`);
  if (data.bathrooms) baseTags.push(`${data.bathrooms} baños`);
  if (data.characteristics) baseTags.push(...data.characteristics);

  return baseTags.filter((tag): tag is string => Boolean(tag));
}

async function generateLandTags(data: LandAIData): Promise<string[]> {
  const baseTags: (string | undefined)[] = [data.landType, data.location];
  if (data.developmentPotential) baseTags.push(data.developmentPotential);
  if (data.zoning) baseTags.push(data.zoning);
  if (data.characteristics) baseTags.push(...data.characteristics);

  return baseTags.filter((tag): tag is string => Boolean(tag));
}

async function generateBlogTags(data: BlogAIData): Promise<string[]> {
  const baseTags: (string | undefined)[] = [data.category, data.topic];
  if (data.keywords) baseTags.push(...data.keywords);
  if (data.targetAudience) baseTags.push(data.targetAudience);

  return baseTags.filter((tag): tag is string => Boolean(tag));
}

async function generateSEOContent(
  data: AIContentData,
): Promise<{ seoTitle: string; seoDescription: string; keywords: string[] }> {
  switch (data.type) {
    case "property": {
      const propertyType = data.propertyType || "propiedad";
      const location = data.location || "ubicación privilegiada";
      const bedrooms = data.bedrooms;
      const bathrooms = data.bathrooms;

      let seoDescription = `Encuentra la mejor ${propertyType} en ${location}.`;
      if (bedrooms && bathrooms) {
        seoDescription += ` ${bedrooms} hab, ${bathrooms} baños.`;
      }
      seoDescription += " ¡Contáctanos hoy!";

      const keywords = [
        propertyType,
        location,
        "venta",
        "propiedad",
        "inmobiliaria",
      ].filter(Boolean);

      return {
        seoTitle: `${propertyType} en ${location} - Venta de Propiedades`,
        seoDescription,
        keywords,
      };
    }
    case "land": {
      const landType = data.landType || "terreno";
      const location = data.location || "ubicación privilegiada";
      const surface = data.surface;

      let seoDescription = `Terreno ${landType}`;
      if (surface) {
        seoDescription += ` de ${surface} m²`;
      }
      seoDescription += ` en ${location}. Excelente oportunidad de inversión.`;

      const keywords = [
        landType,
        location,
        "terreno",
        "venta",
        "inversión",
      ].filter(Boolean);

      return {
        seoTitle: `Terreno ${landType} en ${location} - Venta de Terrenos`,
        seoDescription,
        keywords,
      };
    }
    case "blog": {
      const topic = data.topic || "temas inmobiliarios";
      const category = data.category || "artículos";
      const targetAudience = data.targetAudience || "nuestros lectores";

      const keywords = [
        topic,
        category,
        "guía",
        "inmobiliaria",
        "consejos",
      ].filter(Boolean);

      return {
        seoTitle: `${topic} - Guía Completa | Blog Inmobiliario`,
        seoDescription: `Todo lo que necesitas saber sobre ${topic}. Guía completa y actualizada para ${targetAudience}.`,
        keywords,
      };
    }
    default:
      return {
        seoTitle: "Contenido Generado con IA",
        seoDescription: "Descripción generada automáticamente",
        keywords: ["ai", "generado", "contenido"],
      };
  }
}

async function generateSuggestions(
  data: Partial<AIContentData>,
  field: string,
): Promise<string[]> {
  // Mock suggestions - replace with actual AI API
  const suggestions: Record<string, string[]> = {
    propertyType: ["Casa", "Apartamento", "Villa", "Penthouse", "Estudio"],
    landType: ["Residencial", "Comercial", "Industrial", "Agrícola", "Mixto"],
    location: [
      "Santo Domingo",
      "Santiago",
      "Punta Cana",
      "La Romana",
      "Puerto Plata",
    ],
    category: [
      "Mercado Inmobiliario",
      "Inversiones",
      "Consejos de Compra",
      "Tendencias",
      "Financiamiento",
    ],
    topic: [
      "Cómo comprar tu primera casa",
      "Inversión inmobiliaria",
      "Tendencias del mercado",
      "Financiamiento hipotecario",
    ],
  };

  return suggestions[field] || [];
}

export default useEnhancedAIGeneration;
