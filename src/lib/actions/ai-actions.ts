"use server";

import { PropertyBasicInfo } from '@/types/wizard';
import { LandBasicInfoSchema, type LandFormData } from '@/lib/schemas/land-wizard-schemas';
import { AIServiceError, ErrorFactory } from "../errors/wizard-errors";
import { retryAIOperation, circuitBreakers } from "../utils/retry-logic";
import { sanitizeAIContent } from "../security/input-sanitization";
import { checkAIGenerationRateLimit, recordSuccessfulOperation, recordFailedOperation } from "../security/rate-limiting";
import { validatePropertyBasicInfo } from "../validation/server-validation";

// Simple Gemini AI Configuration - Using latest stable model
const GEMINI_MODEL = 'gemini-2.5-flash-lite'; // Latest stable model with 1M+ context
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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

        // Check if AI service is enabled via environment variable
        const aiEnabled = process.env.ENABLE_AI_GENERATION === 'true';

        if (!aiEnabled) {
            console.log("AI service disabled via environment variable - using fallback content");
            throw new AIServiceError(
                'AI service disabled',
                'API_ERROR',
                false
            );
        }

        const result = await retryAIOperation(async () => {
            return await circuitBreakers.aiService.execute(async () => {
                const prompt = buildTitlePrompt(validatedData, language);
                const generatedText = await callGeminiAPI(prompt, maxLength, 0.6);

                const cleanedText = cleanGeneratedText(generatedText, prompt);
                const sanitizedText = sanitizeAIContent(cleanedText, 'title');

                if (sanitizedText.length < 10) {
                    throw new AIServiceError(
                        'Generated title too short',
                        'API_ERROR',
                        true
                    );
                }

                console.log(`✅ Title generation successful with Gemini`);
                return sanitizedText;
            });
        });

        await recordSuccessfulOperation('aiGeneration', clientId);
        return { success: true, data: result };

    } catch (error) {
        console.error("AI title generation failed:", error);
        await recordFailedOperation('aiGeneration', clientId);

        // Return fallback title
        const fallbackTitle = generateTemplateTitle(propertyData, options.language || "es");
        return { success: true, data: fallbackTitle };
    }
}

// Skip the old error handling
/* Old code:
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
 * Enhanced rich text content interface
 */
interface RichTextContent {
    html: string;
    plainText: string;
    formatted: boolean;
}

/**
 * Server action to generate enhanced property description with rich formatting
 */
export async function generateEnhancedPropertyDescription(
    propertyData: PropertyBasicInfo,
    options: GenerationOptions = {},
    userId?: string
): Promise<{ success: boolean; data?: RichTextContent; error?: string }> {
    const clientId = userId ? `user:${userId}` : 'anonymous';

    try {
        // Rate limiting
        await checkAIGenerationRateLimit(clientId);

        // Input validation and sanitization
        const validatedData = await validatePropertyBasicInfo(propertyData);
        const { language = "es", maxLength = 500 } = options;

        const result = await retryAIOperation(async () => {
            return await circuitBreakers.aiService.execute(async () => {
                try {
                    const prompt = buildEnhancedDescriptionPrompt(validatedData, language);
                    const generatedText = await callGeminiAPI(prompt, maxLength, 0.7);

                    const cleanedText = cleanGeneratedText(generatedText, prompt);
                    const richContent = convertToRichTextContent(cleanedText, language);

                    console.log(`✅ Enhanced description generation successful with Gemini`);
                    return richContent;
                } catch (error) {
                    // Si falla la IA, usar contenido predeterminado rico
                    console.warn('AI service failed, using enhanced fallback content:', error);
                    return generateEnhancedFallbackDescription(validatedData, language);
                }
            });
        });

        // Record successful operation
        await recordSuccessfulOperation('aiGeneration', clientId);

        return { success: true, data: result };
    } catch (error) {
        console.error("Enhanced AI description generation failed:", error);

        // Record failed operation
        await recordFailedOperation('aiGeneration', clientId);

        // Fallback to enhanced template generation
        const enhancedTemplate = generateEnhancedFallbackDescription(propertyData, options.language || "es");

        return {
            success: true,
            data: enhancedTemplate,
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
                    const generatedText = await callGeminiAPI(prompt, maxLength, 0.7);
                    const cleanedText = cleanGeneratedText(generatedText, prompt);
                    const sanitizedText = sanitizeAIContent(cleanedText, 'description');

                    console.log(`✅ Description generation successful with Gemini`);
                    return sanitizedText;
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

        const generatedText = await callGeminiAPI(prompt, 150, 0.5);
        const cleanText = cleanGeneratedText(generatedText, prompt);
        const tags = parseTagsFromText(cleanText);

        console.log(`✅ Tags generation successful with Gemini`);
        return { success: true, data: tags };
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
 * Build enhanced description generation prompt for rich content
 */
function buildEnhancedDescriptionPrompt(propertyData: PropertyBasicInfo, language: "es" | "en"): string {
    const { type, location, price, surface, characteristics, bedrooms, bathrooms } = propertyData;

    if (language === "en") {
        return `Write a detailed, compelling real estate description for a ${type} in ${location}. 
Create a rich, well-structured description with multiple paragraphs that highlights:

Property Details:
- Price: ${price.toLocaleString()} USD
- Surface: ${surface}m²
${bedrooms ? `- Bedrooms: ${bedrooms}` : ""}
${bathrooms ? `- Bathrooms: ${bathrooms}` : ""}
- Features: ${characteristics.join(", ")}

Structure the description with:
1. An engaging opening paragraph that captures attention
2. A detailed paragraph about the property's main features and layout
3. A paragraph highlighting the location and neighborhood benefits
4. A closing paragraph that creates urgency and invites action

Use descriptive language, emphasize unique selling points, and make it appealing to potential buyers. Write in a professional yet engaging tone.

Enhanced Description:`;
    }

    return `Escribe una descripción detallada y atractiva para una propiedad inmobiliaria tipo ${type} en ${location}.
Crea una descripción rica y bien estructurada con múltiples párrafos que destaque:

Detalles de la Propiedad:
- Precio: ${price.toLocaleString()} USD
- Superficie: ${surface}m²
${bedrooms ? `- Habitaciones: ${bedrooms}` : ""}
${bathrooms ? `- Baños: ${bathrooms}` : ""}
- Características: ${characteristics.join(", ")}

Estructura la descripción con:
1. Un párrafo de apertura atractivo que capture la atención
2. Un párrafo detallado sobre las características principales y distribución
3. Un párrafo destacando la ubicación y beneficios del vecindario
4. Un párrafo de cierre que genere urgencia e invite a la acción

Usa lenguaje descriptivo, enfatiza los puntos de venta únicos y hazla atractiva para compradores potenciales. Escribe en un tono profesional pero atractivo.

Descripción Mejorada:`;
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
        return `Create ONE catchy real estate title for a ${type} in ${location} with ${mainFeatures}. 
Keep it under 80 characters and make it appealing to buyers.
Return ONLY the title, no explanations, no lists, no additional text.

Title:`;
    }

    return `Crea UN SOLO título atractivo para una propiedad inmobiliaria tipo ${type} en ${location} con ${mainFeatures}.
Mantén el título bajo 80 caracteres y hazlo atractivo para compradores.
Devuelve SOLO el título, sin explicaciones, sin listas, sin texto adicional.

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

    // For title generation, extract only the first title if multiple are provided
    if (originalPrompt.toLowerCase().includes('título') || originalPrompt.toLowerCase().includes('title')) {
        // Split by common list indicators and take the first item
        const lines = cleaned.split('\n');
        const firstLine = lines[0];
        
        // If it's a bulleted list, extract the first item
        if (firstLine.includes('*') || firstLine.includes('-') || firstLine.includes('•')) {
            // Extract text after the bullet point
            cleaned = firstLine.replace(/^[\s\*\-\•]+/, '').trim();
        } else if (lines.length > 1 && lines[1].includes('*')) {
            // If first line is intro text and second line starts with bullet, take second line
            cleaned = lines[1].replace(/^[\s\*\-\•]+/, '').trim();
        } else {
            // Take the first line as is
            cleaned = firstLine;
        }
        
        // Remove any remaining formatting
        cleaned = cleaned
            .replace(/^\*\*|\*\*$/g, '') // Remove bold markdown
            .replace(/^__?|__?$/g, '') // Remove underline markdown
            .trim();
    }

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

/**
 * Convert plain text to rich text content with HTML formatting
 */
function convertToRichTextContent(text: string, language: "es" | "en"): RichTextContent {
    // Split text into paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);

    if (paragraphs.length === 0) {
        return {
            html: `<p>${text}</p>`,
            plainText: text,
            formatted: false
        };
    }

    // Create HTML with proper paragraph structure
    let html = '';

    paragraphs.forEach((paragraph, index) => {
        const trimmedParagraph = paragraph.trim();

        // Check if this looks like a title or heading
        if (index === 0 && trimmedParagraph.length < 100) {
            html += `<h3>${trimmedParagraph}</h3>\n`;
        } else {
            // Format as paragraph with some basic styling
            let formattedParagraph = trimmedParagraph;

            // Add emphasis to key phrases
            const emphasisPatterns = language === "en"
                ? [/\b(luxury|premium|exclusive|stunning|beautiful|spacious|modern|elegant)\b/gi,
                    /\b(perfect|ideal|excellent|outstanding|exceptional)\b/gi]
                : [/\b(lujo|premium|exclusivo|impresionante|hermoso|espacioso|moderno|elegante)\b/gi,
                    /\b(perfecto|ideal|excelente|destacado|excepcional)\b/gi];

            emphasisPatterns.forEach(pattern => {
                formattedParagraph = formattedParagraph.replace(pattern, '<strong>$1</strong>');
            });

            html += `<p>${formattedParagraph}</p>\n`;
        }
    });

    return {
        html: html.trim(),
        plainText: text,
        formatted: true
    };
}

/**
 * Generate enhanced fallback description with rich formatting
 */
function generateEnhancedFallbackDescription(propertyData: PropertyBasicInfo, language: "es" | "en"): RichTextContent {
    const { type, location, price, surface, characteristics, bedrooms, bathrooms } = propertyData;

    if (language === "en") {
        const bedroomText = bedrooms ? ` with ${bedrooms} bedroom${bedrooms > 1 ? 's' : ''}` : '';
        const bathroomText = bathrooms ? ` and ${bathrooms} bathroom${bathrooms > 1 ? 's' : ''}` : '';
        const featuresText = characteristics.length > 0 ? characteristics.slice(0, 3).join(', ') : '';

        const paragraphs = [
            `Discover this stunning ${type} located in the heart of ${location}. This exceptional property offers the perfect blend of comfort, style, and modern living.`,

            `Featuring ${surface} square meters of beautifully designed living space${bedroomText}${bathroomText}, this property showcases quality craftsmanship and attention to detail throughout.${featuresText ? ` Notable amenities include ${featuresText}, ensuring a lifestyle of convenience and luxury.` : ''}`,

            `Situated in the desirable ${location} area, residents enjoy easy access to local amenities, shopping, dining, and transportation. This prime location offers both tranquility and connectivity to the vibrant community.`,

            `Priced at ${price.toLocaleString()} USD, this property represents an excellent investment opportunity. Don't miss your chance to own this remarkable ${type} - contact us today to schedule your private viewing!`
        ];

        const plainText = paragraphs.join('\n\n');
        return convertToRichTextContent(plainText, language);
    }

    const bedroomText = bedrooms ? ` con ${bedrooms} habitacion${bedrooms > 1 ? 'es' : ''}` : '';
    const bathroomText = bathrooms ? ` y ${bathrooms} baño${bathrooms > 1 ? 's' : ''}` : '';
    const featuresText = characteristics.length > 0 ? characteristics.slice(0, 3).join(', ') : '';

    const paragraphs = [
        `Descubre esta impresionante ${type} ubicada en el corazón de ${location}. Esta propiedad excepcional ofrece la combinación perfecta de comodidad, estilo y vida moderna.`,

        `Con ${surface} metros cuadrados de espacio habitable bellamente diseñado${bedroomText}${bathroomText}, esta propiedad muestra calidad artesanal y atención al detalle en cada rincón.${featuresText ? ` Entre las comodidades destacadas se incluyen ${featuresText}, asegurando un estilo de vida de conveniencia y lujo.` : ''}`,

        `Situada en la deseable zona de ${location}, los residentes disfrutan de fácil acceso a servicios locales, centros comerciales, restaurantes y transporte. Esta ubicación privilegiada ofrece tanto tranquilidad como conectividad con la vibrante comunidad.`,

        `Con un precio de ${price.toLocaleString()} USD, esta propiedad representa una excelente oportunidad de inversión. No pierdas la oportunidad de poseer esta extraordinaria ${type} - ¡contáctanos hoy para programar tu visita privada!`
    ];

    const plainText = paragraphs.join('\n\n');
    return convertToRichTextContent(plainText, language);
}

// ============================================================================
// SIMPLE GEMINI AI SERVICE
// ============================================================================

/**
 * Call Google Gemini API - Simple and Clean
 */
async function callGeminiAPI(
    prompt: string,
    maxTokens: number = 500,
    temperature: number = 0.7
): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new AIServiceError(
            'Gemini API key not configured',
            'API_ERROR',
            false
        );
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': GEMINI_API_KEY || ''
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens,
                    topP: 0.9
                }
            })
        });

        if (!response.ok) {
            throw new AIServiceError(
                `Gemini API error: ${response.status}`,
                'API_ERROR',
                response.status >= 500
            );
        }

        const data = await response.json();

        // Debug: Log the full response to understand the structure
        console.log('Gemini API Response:', JSON.stringify(data, null, 2));

        // Try different possible response structures
        let generatedText = '';

        if (data.candidates && data.candidates[0]) {
            const candidate = data.candidates[0];

            // Try the standard structure
            if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
                generatedText = candidate.content.parts[0].text || '';
            }
            // Try alternative structure
            else if (candidate.text) {
                generatedText = candidate.text;
            }
            // Try another alternative
            else if (candidate.output) {
                generatedText = candidate.output;
            }
        }

        // Also try direct text field
        if (!generatedText && data.text) {
            generatedText = data.text;
        }

        // Clean up the text
        generatedText = generatedText.trim();

        console.log('Extracted text:', generatedText);

        if (!generatedText || generatedText.length < 10) {
            console.error('Gemini response structure:', data);
            throw new AIServiceError(
                'No valid text generated by Gemini',
                'INVALID_RESPONSE',
                true
            );
        }

        return generatedText;
    } catch (error) {
        console.error('Gemini API call failed:', error);
        throw error instanceof AIServiceError ? error : new AIServiceError(
            'Gemini service unavailable',
            'NETWORK_ERROR',
            true
        );
    }
}

// ============================================================================
// LAND AI GENERATION FUNCTIONS
// ============================================================================

/**
 * Server action to generate land description using AI
 */
export async function generateLandDescription(
    landData: any,
    options: GenerationOptions = {},
    userId?: string
): Promise<{ success: boolean; data?: string; error?: string }> {
    const clientId = userId ? `user:${userId}` : 'anonymous';

    try {
        // Rate limiting
        await checkAIGenerationRateLimit(clientId);

        // Input validation
        const validatedData = LandBasicInfoSchema.parse(landData);
        const { language = "es", maxLength = 500 } = options;

        // Check if AI service is enabled via environment variable
        const aiEnabled = process.env.ENABLE_AI_GENERATION === 'true';

        if (!aiEnabled) {
            console.log("AI service disabled via environment variable - using fallback content");
            throw new AIServiceError(
                'AI service disabled',
                'API_ERROR',
                false
            );
        }

        // Generate with Gemini AI
        const result = await retryAIOperation(async () => {
            return await circuitBreakers.aiService.execute(async () => {
                const prompt = buildLandDescriptionPrompt(validatedData, language);
                const generatedText = await callGeminiAPI(prompt, maxLength, 0.7);

                const cleanedText = cleanGeneratedText(generatedText, prompt);
                const sanitizedText = sanitizeAIContent(cleanedText, 'description');

                if (sanitizedText.length < 50) {
                    throw new AIServiceError(
                        'Generated text too short',
                        'API_ERROR',
                        true
                    );
                }

                console.log(`✅ AI generation successful with Gemini`);
                return sanitizedText;
            });
        });

        await recordSuccessfulOperation('aiGeneration', clientId);
        return { success: true, data: result };

    } catch (error) {
        await recordFailedOperation('aiGeneration', clientId);
        console.error("Land description generation failed:", error);

        // Log detailed error information for debugging
        if (error instanceof AIServiceError) {
            console.error("AI Service Error Details:", {
                code: error.code,
                retryable: error.retryable,
                context: error.context,
                userMessage: error.userMessage
            });
        }

        // Return fallback description with success flag
        console.log("Using fallback land description due to AI service failure");
        const fallbackDescription = generateLandFallbackDescription(landData, options.language || "es");
        return { success: true, data: fallbackDescription };
    }
}

/**
 * Server action to generate land title using AI
 */
export async function generateLandTitle(
    landData: any,
    options: GenerationOptions = {},
    userId?: string
): Promise<{ success: boolean; data?: string; error?: string }> {
    const clientId = userId ? `user:${userId}` : 'anonymous';

    try {
        // Rate limiting
        await checkAIGenerationRateLimit(clientId);

        // Input validation
        const validatedData = LandBasicInfoSchema.parse(landData);
        const { language = "es", maxLength = 100 } = options;

        const result = await retryAIOperation(async () => {
            return await circuitBreakers.aiService.execute(async () => {
                const prompt = buildLandTitlePrompt(validatedData, language);
                const generatedText = await callGeminiAPI(prompt, maxLength, 0.6);
                const cleanedText = cleanGeneratedText(generatedText, prompt);
                const sanitizedText = sanitizeAIContent(cleanedText, 'title');

                if (sanitizedText.length < 10) {
                    throw new AIServiceError(
                        'Generated title too short',
                        'API_ERROR',
                        true
                    );
                }

                console.log(`✅ Land title generation successful with Gemini`);
                return sanitizedText;
            });
        });

        await recordSuccessfulOperation('aiGeneration', clientId);
        return { success: true, data: result };

    } catch (error) {
        await recordFailedOperation('aiGeneration', clientId);
        console.error("Land title generation failed:", error);

        // Return fallback title
        const fallbackTitle = generateLandFallbackTitle(landData, options.language || "es");
        return { success: true, data: fallbackTitle };
    }
}

/**
 * Build land description generation prompt
 */
function buildLandDescriptionPrompt(landData: any, language: "es" | "en"): string {
    const { landType, location, price, surface, characteristics, zoning, utilities } = landData;

    if (language === "en") {
        return `Write a compelling real estate description for a ${landType} land in ${location}.
Price: ${price.toLocaleString()} USD
Surface: ${surface}m² (${(surface / 10000).toFixed(2)} hectares)
${zoning ? `Zoning: ${zoning}` : ""}
${utilities && utilities.length > 0 ? `Utilities: ${utilities.join(", ")}` : ""}
${characteristics && characteristics.length > 0 ? `Features: ${characteristics.join(", ")}` : ""}

Create an engaging description that highlights the land's potential uses, location benefits, and investment opportunities. Focus on what makes this land special and attractive to potential buyers.

Description:`;
    }

    return `Escribe una descripción atractiva para un terreno ${landType} en ${location}.
Precio: ${price.toLocaleString()} USD
Superficie: ${surface}m² (${(surface / 10000).toFixed(2)} hectáreas)
${zoning ? `Zonificación: ${zoning}` : ""}
${utilities && utilities.length > 0 ? `Servicios: ${utilities.join(", ")}` : ""}
${characteristics && characteristics.length > 0 ? `Características: ${characteristics.join(", ")}` : ""}

Crea una descripción atractiva que destaque el potencial de uso del terreno, los beneficios de la ubicación y las oportunidades de inversión. Enfócate en lo que hace especial y atractivo este terreno para compradores potenciales.

Descripción:`;
}

/**
 * Build land title generation prompt
 */
function buildLandTitlePrompt(landData: any, language: "es" | "en"): string {
    const { landType, location, characteristics } = landData;
    const mainFeatures = characteristics && characteristics.length > 0 ? characteristics.slice(0, 2).join(", ") : "";

    if (language === "en") {
        return `Create a catchy real estate title for a ${landType} land in ${location}${mainFeatures ? ` with ${mainFeatures}` : ""}.
Keep it under 80 characters and make it appealing to investors and developers.

Title:`;
    }

    return `Crea un título atractivo para un terreno ${landType} en ${location}${mainFeatures ? ` con ${mainFeatures}` : ""}.
Mantén el título bajo 80 caracteres y hazlo atractivo para inversionistas y desarrolladores.

Título:`;
}

/**
 * Generate fallback land description when AI service fails
 */
function generateLandFallbackDescription(landData: any, language: "es" | "en"): string {
    const { landType, location, price, surface, characteristics, zoning, utilities } = landData;

    if (language === "en") {
        let description = `Discover this exceptional ${landType} land located in ${location}. `;

        description += `With ${surface.toLocaleString()} square meters (${(surface / 10000).toFixed(2)} hectares) of prime real estate, `;
        description += `this property offers endless possibilities for development and investment. `;

        if (zoning) {
            description += `The land is zoned for ${zoning}, providing flexibility for various projects. `;
        }

        if (utilities && utilities.length > 0) {
            description += `Available utilities include ${utilities.join(", ")}, making development more convenient. `;
        }

        if (characteristics && characteristics.length > 0) {
            description += `Notable features include ${characteristics.slice(0, 3).join(", ")}. `;
        }

        description += `Strategically positioned in ${location}, this land offers excellent access and growth potential. `;
        description += `Priced at ${price.toLocaleString()} USD, this represents a valuable investment opportunity. `;
        description += `Contact us today to explore the possibilities!`;

        return description;
    }

    let description = `Descubre este excepcional terreno ${landType} ubicado en ${location}. `;

    description += `Con ${surface.toLocaleString()} metros cuadrados (${(surface / 10000).toFixed(2)} hectáreas) de propiedad inmobiliaria privilegiada, `;
    description += `esta propiedad ofrece infinitas posibilidades para desarrollo e inversión. `;

    if (zoning) {
        description += `El terreno está zonificado para ${zoning}, proporcionando flexibilidad para diversos proyectos. `;
    }

    if (utilities && utilities.length > 0) {
        description += `Los servicios disponibles incluyen ${utilities.join(", ")}, facilitando el desarrollo. `;
    }

    if (characteristics && characteristics.length > 0) {
        description += `Entre las características destacadas se encuentran ${characteristics.slice(0, 3).join(", ")}. `;
    }

    description += `Estratégicamente posicionado en ${location}, este terreno ofrece excelente acceso y potencial de crecimiento. `;
    description += `Con un precio de ${price.toLocaleString()} USD, representa una valiosa oportunidad de inversión. `;
    description += `¡Contáctanos hoy para explorar las posibilidades!`;

    return description;
}

/**
 * Generate fallback land title when AI service fails
 */
function generateLandFallbackTitle(landData: any, language: "es" | "en"): string {
    const { landType, location, surface } = landData;
    const hectares = (surface / 10000).toFixed(1);

    if (language === "en") {
        return `${landType} Land in ${location} - ${hectares} Hectares`;
    }

    return `Terreno ${landType} en ${location} - ${hectares} Hectáreas`;
}