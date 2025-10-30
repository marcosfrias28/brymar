import { useCallback, useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
	generateEnhancedPropertyDescription,
	generateLandDescription,
	generateLandTitle,
	generatePropertyDescription,
	generatePropertyTags,
	generatePropertyTitle,
} from "@/lib/actions/ai-actions";
import type { PropertyBasicInfo } from "@/types/wizard";

export type RichTextContent = {
	html: string;
	plainText: string;
	formatted: boolean;
};

type AIGenerationState = {
	isGenerating: boolean;
	error: string | null;
	lastGenerated: {
		title?: string;
		description?: string | RichTextContent;
		tags?: string[];
	};
};

type UseAIGenerationOptions = {
	language?: "es" | "en";
	useRichText?: boolean;
	onSuccess?: (type: "title" | "description" | "tags", content: any) => void;
	onError?: (error: string) => void;
};

export function useAIGeneration(options: UseAIGenerationOptions = {}) {
	const { language = "es", useRichText = false, onSuccess, onError } = options;

	const [state, setState] = useState<AIGenerationState>({
		isGenerating: false,
		error: null,
		lastGenerated: {},
	});

	const setGenerating = useCallback((isGenerating: boolean) => {
		setState((prev) => ({ ...prev, isGenerating, error: null }));
	}, []);

	const setError = useCallback((error: string) => {
		setState((prev) => ({ ...prev, error, isGenerating: false }));
	}, []);

	const setGenerated = useCallback(
		(type: keyof AIGenerationState["lastGenerated"], content: any) => {
			setState((prev) => ({
				...prev,
				lastGenerated: { ...prev.lastGenerated, [type]: content },
				isGenerating: false,
				error: null,
			}));
		},
		[]
	);

	/**
	 * Generate property title with AI
	 */
	const generateTitle = useCallback(
		async (propertyData: PropertyBasicInfo): Promise<string | null> => {
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
				}
				throw new Error(result.error || "Error al generar título");
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Error inesperado al generar el título";

				setError(errorMessage);
				onError?.(errorMessage);

				toast({
					title: "Error al generar título",
					description: errorMessage,
					variant: "destructive",
				});

				return null;
			}
		},
		[language, onSuccess, onError, setGenerating, setError, setGenerated]
	);

	/**
	 * Generate property description with AI
	 */
	const generateDescription = useCallback(
		async (
			propertyData: PropertyBasicInfo
		): Promise<string | RichTextContent | null> => {
			setGenerating(true);

			try {
				let result;

				if (useRichText) {
					result = await generateEnhancedPropertyDescription(propertyData, {
						language,
					});
				} else {
					result = await generatePropertyDescription(propertyData, {
						language,
					});
				}

				if (result.success && result.data) {
					setGenerated("description", result.data);
					onSuccess?.("description", result.data);

					toast({
						title: "Descripción generada",
						description: useRichText
							? "Se ha generado una descripción rica con formato automáticamente con IA"
							: "Se ha generado una descripción automáticamente con IA",
					});

					return result.data;
				}
				throw new Error(result.error || "Error al generar descripción");
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Error inesperado al generar la descripción";

				setError(errorMessage);
				onError?.(errorMessage);

				toast({
					title: "Error al generar descripción",
					description: errorMessage,
					variant: "destructive",
				});

				return null;
			}
		},
		[
			language,
			useRichText,
			onSuccess,
			onError,
			setGenerating,
			setError,
			setGenerated,
		]
	);

	/**
	 * Generate property tags with AI
	 */
	const generateTags = useCallback(
		async (propertyData: PropertyBasicInfo): Promise<string[] | null> => {
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
				}
				throw new Error(result.error || "Error al generar etiquetas");
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Error inesperado al generar las etiquetas";

				setError(errorMessage);
				onError?.(errorMessage);

				toast({
					title: "Error al generar etiquetas",
					description: errorMessage,
					variant: "destructive",
				});

				return null;
			}
		},
		[language, onSuccess, onError, setGenerating, setError, setGenerated]
	);

	/**
	 * Generate all content at once
	 */
	const generateAll = useCallback(
		async (propertyData: PropertyBasicInfo) => {
			setGenerating(true);

			try {
				// Generate title and tags normally, but use enhanced description if rich text is enabled
				const [titleResult, descriptionResult, tagsResult] =
					await Promise.allSettled([
						generatePropertyTitle(propertyData, { language }),
						useRichText
							? generateEnhancedPropertyDescription(propertyData, { language })
							: generatePropertyDescription(propertyData, { language }),
						generatePropertyTags(propertyData, { language }),
					]);

				const title =
					titleResult.status === "fulfilled" && titleResult.value.success
						? titleResult.value.data!
						: "";

				const description =
					descriptionResult.status === "fulfilled" &&
					descriptionResult.value.success
						? descriptionResult.value.data!
						: useRichText
							? { html: "", plainText: "", formatted: false }
							: "";

				const tags =
					tagsResult.status === "fulfilled" && tagsResult.value.success
						? tagsResult.value.data!
						: [];

				setState((prev) => ({
					...prev,
					lastGenerated: { title, description, tags },
					isGenerating: false,
					error: null,
				}));

				toast({
					title: "Contenido generado",
					description: useRichText
						? "Se ha generado título, descripción rica y etiquetas con IA"
						: "Se ha generado título, descripción y etiquetas con IA",
				});

				// Call onSuccess for each generated item
				onSuccess?.("title", title);
				onSuccess?.("description", description);
				onSuccess?.("tags", tags);

				return { title, description, tags };
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Error al generar contenido con IA";
				setError(errorMessage);

				toast({
					title: "Error de generación",
					description: errorMessage,
					variant: "destructive",
				});

				return null;
			}
		},
		[language, useRichText, onSuccess, setGenerating, setError]
	);

	/**
	 * Generic content generation for different types (property, land, blog)
	 */
	const generateContent = useCallback(
		async (request: {
			type: "property" | "land" | "blog";
			generationType: "title" | "description" | "tags";
			inputData: any;
			language: "es" | "en";
		}): Promise<string | null> => {
			setGenerating(true);

			try {
				let result;

				if (request.type === "property") {
					switch (request.generationType) {
						case "title":
							result = await generatePropertyTitle(request.inputData, {
								language: request.language,
							});
							break;
						case "description":
							result = useRichText
								? await generateEnhancedPropertyDescription(request.inputData, {
										language: request.language,
									})
								: await generatePropertyDescription(request.inputData, {
										language: request.language,
									});
							break;
						case "tags":
							result = await generatePropertyTags(request.inputData, {
								language: request.language,
							});
							break;
						default:
							throw new Error(
								"Tipo de generación no soportado para propiedades"
							);
					}
				} else if (request.type === "land") {
					switch (request.generationType) {
						case "title":
							result = await generateLandTitle(request.inputData, {
								language: request.language,
							});
							break;
						case "description":
							result = await generateLandDescription(request.inputData, {
								language: request.language,
							});
							break;
						default:
							throw new Error("Tipo de generación no soportado para terrenos");
					}
				} else {
					throw new Error("Tipo de contenido no soportado");
				}

				if (result.success && result.data) {
					const contentType = request.generationType;
					setGenerated(contentType, result.data);
					onSuccess?.(contentType, result.data);

					const typeLabels = {
						property: "propiedad",
						land: "terreno",
						blog: "blog",
					};

					const generationLabels = {
						title: "título",
						description: "descripción",
						content: "contenido",
						tags: "etiquetas",
					};

					toast({
						title: `${generationLabels[request.generationType]} generado`,
						description: `Se ha generado ${generationLabels[request.generationType]} para ${typeLabels[request.type]} con IA`,
					});

					if (typeof result.data === "string") {
						return result.data;
					}
					if (Array.isArray(result.data)) {
						return result.data.join(", ");
					}
					if (
						result.data &&
						typeof result.data === "object" &&
						"plainText" in result.data
					) {
						return (
							(result.data as any).plainText || (result.data as any).html || ""
						);
					}
					return String(result.data);
				}
				throw new Error(
					result.error || `Error al generar ${request.generationType}`
				);
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: `Error inesperado al generar ${request.generationType}`;

				setError(errorMessage);
				onError?.(errorMessage);

				toast({
					title: `Error al generar ${request.generationType}`,
					description: errorMessage,
					variant: "destructive",
				});

				return null;
			}
		},
		[useRichText, onSuccess, onError, setGenerating, setError, setGenerated]
	);

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
		generateContent, // New generic function
		clearState,
	};
}

export default useAIGeneration;
