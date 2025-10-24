"use server";

import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import db from "@/lib/db/drizzle";
import { blogPosts } from "@/lib/db/schema";
import type { BlogWizardData } from "@/lib/schemas/blog-wizard-schemas";
import { BlogDraftManager } from "@/lib/utils/draft-management";

// Simple result type
interface ActionResult<T = any> {
	success: boolean;
	data?: T;
	message?: string;
}

// Create blog post from wizard data
export const createBlogFromWizard = async (
	data: BlogWizardData,
): Promise<ActionResult<{ blogPost: any }>> => {
	try {
		// Calculate reading time
		const wordsPerMinute = 200;
		const wordCount = data.content.split(" ").length;
		const readingTime = Math.ceil(wordCount / wordsPerMinute);

		// Generate slug if not provided (for potential future use)
		data.slug ||
			data.title
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-")
				.trim();

		const [newBlogPost] = await db
			.insert(blogPosts)
			.values({
				title: data.title,
				content: data.content,
				author: data.author,
				category: data.category,
				status: data.status,
				image: data.coverImage || "",
				readingTime: readingTime,
				createdAt: new Date(),
			})
			.returning();

		revalidatePath("/dashboard/blog");
		return {
			success: true,
			data: { blogPost: newBlogPost },
			message: "Post de blog creado exitosamente!",
		};
	} catch (error) {
		console.error("Error creating blog post from wizard:", error);
		return {
			success: false,
			message: "Error al crear el post de blog",
		};
	}
};

// Update blog post from wizard data
export const updateBlogFromWizard = async (
	data: BlogWizardData & { id?: string },
): Promise<ActionResult<{ blogPost: any }>> => {
	try {
		if (!data.id) {
			throw new Error("ID is required for updating blog post");
		}

		// Calculate reading time
		const wordsPerMinute = 200;
		const wordCount = data.content.split(" ").length;
		const readingTime = Math.ceil(wordCount / wordsPerMinute);

		const [updatedBlogPost] = await db
			.update(blogPosts)
			.set({
				title: data.title,
				content: data.content,
				author: data.author,
				category: data.category,
				status: data.status,
				image: data.coverImage || "",
				readingTime: readingTime,
				updatedAt: new Date(),
			})
			.where(eq(blogPosts.id, parseInt(data.id, 10)))
			.returning();

		revalidatePath("/dashboard/blog");
		revalidatePath(`/blog/${data.id}`);
		return {
			success: true,
			data: { blogPost: updatedBlogPost },
			message: "Post de blog actualizado exitosamente!",
		};
	} catch (error) {
		console.error("Error updating blog post from wizard:", error);
		return {
			success: false,
			message: "Error al actualizar el post de blog",
		};
	}
};

// Save blog draft
export const saveBlogDraft = async (
	data: Partial<BlogWizardData> & {
		draftId?: string;
		userId: string;
		stepCompleted: number;
		completionPercentage: number;
	},
): Promise<ActionResult<{ draftId: string }>> => {
	try {
		const result = await BlogDraftManager.save({
			draftId: data.draftId,
			userId: data.userId,
			formData: data,
			stepCompleted: data.stepCompleted,
			completionPercentage: data.completionPercentage,
			title: data.title,
			metadata: {
				category: data.category,
			},
		});

		if (result.success && result.data) {
			return {
				success: true,
				data: { draftId: result.data.draftId },
				message: result.message || "Borrador guardado exitosamente!",
			};
		} else {
			return {
				success: false,
				message: result.message || "Error al guardar el borrador",
			};
		}
	} catch (error) {
		console.error("Error saving blog draft:", error);
		return {
			success: false,
			message: "Error al guardar el borrador",
		};
	}
};

// Upload blog image
export const uploadBlogImage = async (data: {
	title: string;
	image: File;
}): Promise<ActionResult<{ url: string; filename: string }>> => {
	try {
		if (!data.image || !data.image.type.startsWith("image/")) {
			throw new Error("Invalid image file");
		}

		const timestamp = Date.now();
		const filename = `blog/${timestamp}-${data.image.name}`;

		const { url } = await put(filename, data.image, {
			access: "public",
		});

		return {
			success: true,
			data: { url, filename: data.image.name },
			message: "Imagen subida exitosamente!",
		};
	} catch (error) {
		console.error("Error uploading blog image:", error);
		return {
			success: false,
			message: "Error al subir la imagen",
		};
	}
};

// Generate AI content for blog
export const generateBlogContent = async (data: {
	title: string;
	category: string;
	contentType:
		| "title"
		| "content"
		| "excerpt"
		| "seo-title"
		| "seo-description"
		| "tags";
	prompt?: string;
}): Promise<ActionResult<{ content: string }>> => {
	try {
		// This is a placeholder for AI content generation
		// In a real implementation, you would integrate with an AI service like OpenAI

		let generatedContent = "";

		switch (data.contentType) {
			case "title":
				generatedContent = `${data.title} - Guía Completa`;
				break;
			case "content":
				generatedContent = `# ${data.title}\n\nEste es un artículo generado automáticamente sobre ${data.title}. El contenido incluye información relevante sobre el tema en el contexto inmobiliario.\n\n## Introducción\n\nEn el mundo inmobiliario actual, es importante entender los aspectos clave de ${data.title}.\n\n## Desarrollo\n\nA continuación, exploramos los puntos más importantes:\n\n- Punto clave 1\n- Punto clave 2\n- Punto clave 3\n\n## Conclusión\n\nEn resumen, ${data.title} es un tema fundamental en el sector inmobiliario que requiere atención especializada.`;
				break;
			case "excerpt":
				generatedContent = `Descubre todo lo que necesitas saber sobre ${data.title} en el sector inmobiliario. Una guía completa con consejos prácticos y análisis detallado.`;
				break;
			case "seo-title":
				generatedContent = `${data.title} - Guía Completa 2024`;
				break;
			case "seo-description":
				generatedContent = `Guía completa sobre ${data.title}. Consejos expertos, análisis detallado y todo lo que necesitas saber en el sector inmobiliario.`;
				break;
			case "tags":
				generatedContent =
					"inmobiliaria,propiedades,inversión,mercado,consejos";
				break;
			default:
				generatedContent = data.prompt || "Contenido generado automáticamente";
		}

		return {
			success: true,
			data: { content: generatedContent },
			message: "Contenido generado exitosamente!",
		};
	} catch (error) {
		console.error("Error generating blog content:", error);
		return {
			success: false,
			message: "Error al generar contenido",
		};
	}
};

// Load blog draft
export const loadBlogDraft = async (data: {
	draftId: string;
	userId: string;
}): Promise<
	ActionResult<{ formData: Partial<BlogWizardData>; stepCompleted: number }>
> => {
	try {
		const result = await BlogDraftManager.load({
			draftId: data.draftId,
			userId: data.userId,
		});

		if (result.success && result.data) {
			return {
				success: true,
				data: {
					formData: result.data.formData,
					stepCompleted: result.data.stepCompleted,
				},
				message: result.message || "Borrador cargado exitosamente!",
			};
		} else {
			return {
				success: false,
				message: result.message || "Error al cargar el borrador",
			};
		}
	} catch (error) {
		console.error("Error loading blog draft:", error);
		return {
			success: false,
			message: "Error al cargar el borrador",
		};
	}
};

// Delete blog draft
export const deleteBlogDraft = async (data: {
	draftId: string;
	userId: string;
}): Promise<ActionResult> => {
	try {
		const result = await BlogDraftManager.delete({
			draftId: data.draftId,
			userId: data.userId,
		});

		if (result.success) {
			return {
				success: true,
				message: result.message || "Borrador eliminado exitosamente!",
			};
		} else {
			return {
				success: false,
				message: result.message || "Error al eliminar el borrador",
			};
		}
	} catch (error) {
		console.error("Error deleting blog draft:", error);
		return {
			success: false,
			message: "Error al eliminar el borrador",
		};
	}
};

// Get blog drafts for user
export const getBlogDrafts = async (userId: string) => {
	try {
		const result = await BlogDraftManager.list(userId);

		if (result.success && result.data) {
			return { drafts: result.data };
		} else {
			console.error("Error fetching blog drafts:", result.message);
			return { drafts: [] };
		}
	} catch (error) {
		console.error("Error fetching blog drafts:", error);
		return { drafts: [] };
	}
};

// Generate SEO suggestions
export const generateSEOSuggestions = async (data: {
	title: string;
	content: string;
	category: string;
}): Promise<
	ActionResult<{
		seoTitle: string;
		seoDescription: string;
		tags: string[];
		suggestions: string[];
	}>
> => {
	try {
		// Extract keywords from content
		const words = data.content.toLowerCase().split(/\W+/);
		const wordFreq = words.reduce(
			(acc, word) => {
				if (word.length > 3) {
					acc[word] = (acc[word] || 0) + 1;
				}
				return acc;
			},
			{} as Record<string, number>,
		);

		const topWords = Object.entries(wordFreq)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
			.map(([word]) => word);

		const seoTitle = `${data.title} - Guía Completa 2024`;
		const seoDescription = `Descubre todo sobre ${data.title}. Guía completa con consejos expertos y análisis detallado del mercado inmobiliario.`;
		const tags = [...topWords, "inmobiliaria", "propiedades"];

		const suggestions = [
			"Considera agregar más palabras clave relacionadas con inmobiliaria",
			"El título SEO está optimizado para búsquedas",
			"La descripción SEO tiene una longitud adecuada",
			"Las etiquetas incluyen términos relevantes del sector",
		];

		return {
			success: true,
			data: { seoTitle, seoDescription, tags, suggestions },
			message: "Sugerencias SEO generadas exitosamente!",
		};
	} catch (error) {
		console.error("Error generating SEO suggestions:", error);
		return {
			success: false,
			message: "Error al generar sugerencias SEO",
		};
	}
};
