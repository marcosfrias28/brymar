"use server";

import { PropertyBasicInfo } from "@/types/wizard";
import { AIServiceError, ErrorFactory } from "../errors/wizard-errors";
import { retryAIOperation, circuitBreakers } from "../utils/retry-logic";
import { sanitizeAIContent } from "../security/input-sanitization";
import { checkAIGenerationRateLimit, recordSuccessfulOperation, recordFailedOperation } from "../security/rate-limiting";
import { validatePropertyBasicInfo } from "../validation/server-validation";

// Server-side AI service configuration
const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models";
const DEFAULT_MODEL = "microsoft/DialoGPT-medium";

interface HuggingFaceResponse {
    generated_text?: string;
    error?: string;
}

interface GenerationOptions {
    maxLength?: number;
    temperature?: number;
    language?: "es" | "en";
}

/**
 * Server action to generate property title using AI
 */
export async function generatePropertyTitle(
    propertyData: PropertyBasicInfo,
    options: GenerationOptions = {},
    userId?: string
): Promise<{ success: boolean; data?: string; error?: string }> {
    const clientId = userId ? `user:${userId}` : 'anonymous';

    try {
        // Rate limiting
        await checkAIGenerationRateLimit(clientId);

        // Input validation and sanitization
        const validatedData = await validatePropertyBasicInfo(propertyData);
        const { language = "es", maxLength = 100 } = options;

        const result = await retryAIOperation(async () => {
            return await circuitBreakers.aiService.execute(async () => {
                const prompt = buildTitlePrompt(validatedData, language);
                const response = await callHuggingFaceAPI(prompt, {
                    max_length: maxLength,
                    temperature: 0.6,
                    do_sample: true,
                });

                if (response.generated_text) {
                    const cleanedText = cleanGeneratedText(response.generated_text, prompt);
                    return sanitizeAIContent(cleanedText, 'title');
                }

                throw new AIServiceError(
                    'No generated text in response',
                    'INVALID_RESPONSE',
                    false,
                    { response }
                );
            });
        });

        // Record successful operation
        await recordSuccessfulOperation('aiGeneration', clientId);

        return { success: true, data: result };
    } catch (error) {
        console.error("AI title generation failed:", error);

        // Record failed operation
        await recordFailedOperation('aiGeneration', clientId);

        // Fallback to template generation
        const templateTitle = generateTemplateTitle(propertyData, options.language || "es");
        const sanitizedTemplate = sanitizeAIContent(templateTitle, 'title');

        return {
            success: true,
            data: sanitizedTemplate,
            error: error instanceof AIServiceError ? error.userMessage : 'Error generating AI content'
        };
    }
}

/**
 * Server action to generate property description using AI
 */
export async function generatePropertyDescription(
    propertyData: PropertyBasicInfo,
    options: GenerationOptions = {},
    userId?: string
): Promise<{ success: boolean; data?: string; error?: string }> {
    const clientId = userId ? `user:${userId}` : 'anonymous';

    try {
        // Rate limiting
        await checkAIGenerationRateLimit(clientId);

        // Input validation and sanitization
        const validatedData = await validatePropertyBasicInfo(propertyData);
        const { language = "es", maxLength = 300 } = options;

        const result = await retryAIOperation(async () => {
            return await circuitBreakers.aiService.execute(async () => {
                try {
                    const prompt = buildDescriptionPrompt(validatedData, language);
                    const response = await callHuggingFaceAPI(prompt, {
                        max_length: maxLength,
                        temperature: 0.7,
                        do_sample: true,
                    });

                    if (response.error) {
                        throw new AIServiceError(response.error, 'API_ERROR', true);
                    }

                    if (response.generated_text) {
                        const cleanedText = cleanGeneratedText(response.generated_text, prompt);
                        return sanitizeAIContent(cleanedText, 'description');
                    }

                    throw new AIServiceError(
                        'No generated text in response',
                        'INVALID_RESPONSE',
                        false,
                        { response }
                    );
                } catch (error) {
                    // Si falla la IA, usar contenido predeterminado
                    console.warn('AI service failed, using fallback content:', error);
                    return generateFallbackDescription(validatedData, language);
                }
            });
        });

        // Record successful operation
        await recordSuccessfulOperation('aiGeneration', clientId);

        return { success: true, data: result };
    } catch (error) {
        console.error("AI description generation failed:", error);

        // Record failed operation
        await recordFailedOperation('aiGeneration', clientId);

        // Fallback to template generation
        const templateDescription = generateTemplateDescription(propertyData, options.language || "es");
        const sanitizedTemplate = sanitizeAIContent(templateDescription, 'description');

        return {
            success: true,
            data: sanitizedTemplate,
            error: error instanceof AIServiceError ? error.userMessage : 'Error generating AI content'
        };
    }
}

/**
 * Server action to generate property tags using AI
 */
export async function generatePropertyTags(
    propertyData: PropertyBasicInfo,
    options: GenerationOptions = {}
): Promise<{ success: boolean; data?: string[]; error?: string }> {
    try {
        const { language = "es" } = options;
        const prompt = buildTagsPrompt(propertyData, language);

        const response = await callHuggingFaceAPI(prompt, {
            max_length: 150,
            temperature: 0.5,
            do_sample: true,
        });

        if (response.generated_text) {
            const cleanText = cleanGeneratedText(response.generated_text, prompt);
            const tags = parseTagsFromText(cleanText);
            return { success: true, data: tags };
        }

        // Fallback to template generation
        const templateTags = generateTemplateTags(propertyData, language);
        return { success: true, data: templateTags };
    } catch (error) {
        console.error("AI tags generation failed:", error);

        // Fallback to template generation
        const templateTags = generateTemplateTags(propertyData, options.language || "es");
        return { success: true, data: templateTags };
    }
}

/**
 * Server action to generate all content at once
 */
export async function generateAllPropertyContent(
    propertyData: PropertyBasicInfo,
    options: GenerationOptions = {}
): Promise<{
    success: boolean;
    data?: { title: string; description: string; tags: string[] };
    error?: string;
}> {
    try {
        const [titleResult, descriptionResult, tagsResult] = await Promise.allSettled([
            generatePropertyTitle(propertyData, options),
            generatePropertyDescription(propertyData, options),
            generatePropertyTags(propertyData, options),
        ]);

        const title = titleResult.status === "fulfilled" && titleResult.value.success
            ? titleResult.value.data!
            : generateTemplateTitle(propertyData, options.language || "es");

        const description = descriptionResult.status === "fulfilled" && descriptionResult.value.success
            ? descriptionResult.value.data!
            : generateTemplateDescription(propertyData, options.language || "es");

        const tags = tagsResult.status === "fulfilled" && tagsResult.value.success
            ? tagsResult.value.data!
            : generateTemplateTags(propertyData, options.language || "es");

        return {
            success: true,
            data: { title, description, tags },
        };
    } catch (error) {
        console.error("AI content generation failed:", error);
        return {
            success: false,
            error: "Error al generar contenido con IA",
        };
    }
}

/**
 * Call HuggingFace Inference API
 */
async function callHuggingFaceAPI(
    prompt: string,
    parameters: Record<string, any> = {},
    model: string = DEFAULT_MODEL
): Promise<HuggingFaceResponse> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
        throw new AIServiceError(
            "HuggingFace API key not configured",
            'API_ERROR',
            false
        );
    }

    const url = `${HUGGINGFACE_API_URL}/${model}`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    return_full_text: false,
                    ...parameters,
                },
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 429) {
                throw new AIServiceError(
                    `Rate limit exceeded`,
                    'RATE_LIMIT',
                    true,
                    { status: response.status }
                );
            }

            if (response.status === 503) {
                throw new AIServiceError(
                    `Service unavailable`,
                    'API_ERROR',
                    true,
                    { status: response.status }
                );
            }

            if (response.status >= 500) {
                throw new AIServiceError(
                    `Server error: ${response.status}`,
                    'API_ERROR',
                    true,
                    { status: response.status }
                );
            }

            throw new AIServiceError(
                `API request failed: ${response.status}`,
                'API_ERROR',
                false,
                { status: response.status }
            );
        }

        const data = await response.json();

        if (data.error) {
            throw new AIServiceError(
                `API returned error: ${data.error}`,
                'API_ERROR',
                false,
                { apiError: data.error }
            );
        }

        if (Array.isArray(data) && data.length > 0) {
            return data[0];
        }

        return data;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new AIServiceError(
                'Request timeout',
                'TIMEOUT',
                true
            );
        }

        if (error instanceof AIServiceError) {
            throw error;
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new AIServiceError(
                'Network error',
                'NETWORK_ERROR',
                true
            );
        }

        throw ErrorFactory.createFromError(error, { context: 'HuggingFace API call' });
    }
}

/**
 * Build description generation prompt
 */
function buildDescriptionPrompt(propertyData: PropertyBasicInfo, language: "es" | "en"): string {
    const { type, location, price, surface, characteristics, bedrooms, bathrooms } = propertyData;

    if (language === "en") {
        return `Write a compelling real estate description for a ${type} in ${location}. 
Price: $${price.toLocaleString()} USD
Surface: ${surface}m²
${bedrooms ? `Bedrooms: ${bedrooms}` : ""}
${bathrooms ? `Bathrooms: ${bathrooms}` : ""}
Features: ${characteristics.join(", ")}

Description:`;
    }

    return `Escribe una descripción atractiva para una propiedad inmobiliaria tipo ${type} en ${location}.
Precio: $${price.toLocaleString()} USD
Superficie: ${surface}m²
${bedrooms ? `Habitaciones: ${bedrooms}` : ""}
${bathrooms ? `Baños: ${bathrooms}` : ""}
Características: ${characteristics.join(", ")}

Descripción:`;
}

/**
 * Build title generation prompt
 */
function buildTitlePrompt(propertyData: PropertyBasicInfo, language: "es" | "en"): string {
    const { type, location, characteristics } = propertyData;
    const mainFeatures = characteristics.slice(0, 2).join(", ");

    if (language === "en") {
        return `Create a catchy real estate title for a ${type} in ${location} with ${mainFeatures}. 
Keep it under 80 characters and make it appealing to buyers.

Title:`;
    }

    return `Crea un título atractivo para una propiedad inmobiliaria tipo ${type} en ${location} con ${mainFeatures}.
Mantén el título bajo 80 caracteres y hazlo atractivo para compradores.

Título:`;
}

/**
 * Build tags generation prompt
 */
function buildTagsPrompt(propertyData: PropertyBasicInfo, language: "es" | "en"): string {
    const { type, location, characteristics } = propertyData;

    if (language === "en") {
        return `Generate 5-8 relevant tags for a ${type} in ${location} with features: ${characteristics.join(", ")}.
Tags should be single words or short phrases separated by commas.

Tags:`;
    }

    return `Genera 5-8 etiquetas relevantes para un ${type} en ${location} con características: ${characteristics.join(", ")}.
Las etiquetas deben ser palabras individuales o frases cortas separadas por comas.

Etiquetas:`;
}

/**
 * Clean generated text by removing prompt and extra content
 */
function cleanGeneratedText(generatedText: string, originalPrompt: string): string {
    let cleaned = generatedText;

    // Remove the original prompt if it appears in the response
    const promptLines = originalPrompt.split('\n');
    const lastPromptLine = promptLines[promptLines.length - 1];

    if (cleaned.includes(lastPromptLine)) {
        cleaned = cleaned.split(lastPromptLine)[1] || cleaned;
    }

    // Clean up common artifacts
    cleaned = cleaned
        .trim()
        .replace(/^[:\-\s]+/, '') // Remove leading colons, dashes, spaces
        .replace(/\n\n+/g, '\n\n') // Normalize line breaks
        .replace(/^\d+\.\s*/, '') // Remove leading numbers
        .replace(/^["']|["']$/g, '') // Remove surrounding quotes
        .trim();

    return cleaned;
}

/**
 * Parse tags from generated text
 */
function parseTagsFromText(text: string): string[] {
    return text
        .split(/[,\n]/)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && tag.length < 30)
        .slice(0, 8); // Limit to 8 tags
}

// Fallback template methods
function generateTemplateDescription(propertyData: PropertyBasicInfo, language: "es" | "en"): string {
    const { type, location, price, surface, characteristics, bedrooms, bathrooms } = propertyData;

    if (language === "en") {
        const bedroomText = bedrooms ? ` with ${bedrooms} bedroom${bedrooms > 1 ? 's' : ''}` : '';
        const bathroomText = bathrooms ? ` and ${bathrooms} bathroom${bathrooms > 1 ? 's' : ''}` : '';
        const featuresText = characteristics.length > 0 ? ` Features include ${characteristics.slice(0, 3).join(', ')}.` : '';

        return `Beautiful ${type} located in ${location}${bedroomText}${bathroomText}. This property offers ${surface}m² of living space at an attractive price of $${price.toLocaleString()} USD.${featuresText} Perfect for those seeking quality and comfort in a prime location.`;
    }

    const bedroomText = bedrooms ? ` con ${bedrooms} habitacion${bedrooms > 1 ? 'es' : ''}` : '';
    const bathroomText = bathrooms ? ` y ${bathrooms} baño${bathrooms > 1 ? 's' : ''}` : '';
    const featuresText = characteristics.length > 0 ? ` Incluye ${characteristics.slice(0, 3).join(', ')}.` : '';

    return `Hermosa ${type} ubicada en ${location}${bedroomText}${bathroomText}. Esta propiedad ofrece ${surface}m² de espacio habitable a un precio atractivo de $${price.toLocaleString()} USD.${featuresText} Perfecta para quienes buscan calidad y comodidad en una ubicación privilegiada.`;
}

function generateTemplateTitle(propertyData: PropertyBasicInfo, language: "es" | "en"): string {
    const { type, location, characteristics } = propertyData;
    const mainFeature = characteristics[0] || '';

    if (language === "en") {
        return mainFeature
            ? `${type} in ${location} with ${mainFeature}`
            : `Beautiful ${type} in ${location}`;
    }

    return mainFeature
        ? `${type} en ${location} con ${mainFeature}`
        : `Hermosa ${type} en ${location}`;
}

function generateTemplateTags(propertyData: PropertyBasicInfo, language: "es" | "en"): string[] {
    const { type, characteristics } = propertyData;

    const baseTags = language === "en"
        ? [type, "real estate", "property", "investment"]
        : [type, "inmueble", "propiedad", "inversión"];

    const featureTags = characteristics.slice(0, 4);

    return [...baseTags, ...featureTags].slice(0, 8);
}
/**

 * Generate fallback title when AI service fails
 */
function generateFallbackTitle(propertyData: PropertyBasicInfo, language: "es" | "en"): string {
    const { type, location, price, surface, bedrooms, bathrooms } = propertyData;

    if (language === "en") {
        const bedroomText = bedrooms ? `${bedrooms} bedroom${bedrooms > 1 ? 's' : ''}` : '';
        const bathroomText = bathrooms ? `${bathrooms} bathroom${bathrooms > 1 ? 's' : ''}` : '';
        const details = [bedroomText, bathroomText, `${surface}m²`].filter(Boolean).join(', ');

        return `Beautiful ${type} in ${location}${details ? ` - ${details}` : ''}`;
    }

    const bedroomText = bedrooms ? `${bedrooms} habitacion${bedrooms > 1 ? 'es' : ''}` : '';
    const bathroomText = bathrooms ? `${bathrooms} baño${bathrooms > 1 ? 's' : ''}` : '';
    const details = [bedroomText, bathroomText, `${surface}m²`].filter(Boolean).join(', ');

    return `Hermosa ${type} en ${location}${details ? ` - ${details}` : ''}`;
}

/**
 * Generate fallback description when AI service fails
 */
function generateFallbackDescription(propertyData: PropertyBasicInfo, language: "es" | "en"): string {
    const { type, location, price, surface, characteristics, bedrooms, bathrooms } = propertyData;

    if (language === "en") {
        let description = `Discover this beautiful ${type} located in ${location}. `;

        if (surface) {
            description += `With ${surface} square meters of living space, `;
        }

        if (bedrooms && bathrooms) {
            description += `featuring ${bedrooms} bedroom${bedrooms > 1 ? 's' : ''} and ${bathrooms} bathroom${bathrooms > 1 ? 's' : ''}, `;
        }

        description += `this property offers comfort and style. `;

        if (characteristics.length > 0) {
            description += `Notable features include ${characteristics.slice(0, 3).join(', ')}. `;
        }

        description += `Perfect for those seeking quality living in a prime location. Contact us today to schedule a viewing!`;

        return description;
    }

    let description = `Descubre esta hermosa ${type} ubicada en ${location}. `;

    if (surface) {
        description += `Con ${surface} metros cuadrados de espacio habitable, `;
    }

    if (bedrooms && bathrooms) {
        description += `cuenta con ${bedrooms} habitacion${bedrooms > 1 ? 'es' : ''} y ${bathrooms} baño${bathrooms > 1 ? 's' : ''}, `;
    }

    description += `esta propiedad ofrece comodidad y estilo. `;

    if (characteristics.length > 0) {
        description += `Entre sus características destacadas se encuentran ${characteristics.slice(0, 3).join(', ')}. `;
    }

    description += `Perfecta para quienes buscan calidad de vida en una ubicación privilegiada. ¡Contáctanos hoy para agendar una visita!`;

    return description;
}

/**
 * Generate fallback tags when AI service fails
 */
function generateFallbackTags(propertyData: PropertyBasicInfo, language: "es" | "en"): string[] {
    const { type, location, characteristics } = propertyData;

    if (language === "en") {
        const baseTags = [type, location, "real estate", "property", "for sale"];
        const featureTags = characteristics.slice(0, 3);
        return [...baseTags, ...featureTags].slice(0, 8);
    }

    const baseTags = [type, location, "inmobiliaria", "propiedad", "venta"];
    const featureTags = characteristics.slice(0, 3);
    return [...baseTags, ...featureTags].slice(0, 8);
}