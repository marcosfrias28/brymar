"use client";

import { useCreateWizardDraft, useSaveWizardDraft } from "@/hooks/use-wizard";
import { createBlogPost } from "@/lib/actions/blog";
import type { CreateBlogPostInput } from "@/lib/types/blog";
import { BlogContentStep } from "./steps/blog/blog-content-step";
import { BlogMediaStep } from "./steps/blog/blog-media-step";
import { BlogSeoStep } from "./steps/blog/blog-seo-step";
import { BlogPreviewStep } from "./steps/blog/blog-preview-step";
import { UnifiedWizard, type WizardStep } from "./unified-wizard";
import { BlogWizardSchema, type BlogWizardData } from "@/lib/schemas/blog-wizard-schemas";
import { z } from "zod";

// Blog wizard steps using proper shadcn form components
const blogWizardSteps: WizardStep<BlogWizardData>[] = [
	{
		id: "content",
		title: "Contenido del Artículo",
		description: "Escribe el contenido principal de tu artículo",
		component: BlogContentStep,
		validation: (data: BlogWizardData) => {
			const errors: Record<string, string> = {};
			if (!data.title || data.title.trim() === "") {
				errors.title = "El título es requerido";
			}
			if (!data.description || data.description.trim() === "") {
				errors.description = "La descripción es requerida";
			}
			if (!data.content || data.content.trim() === "") {
				errors.content = "El contenido es requerido";
			}
			if (!data.author || data.author.trim() === "") {
				errors.author = "El autor es requerido";
			}
			if (!data.category || data.category.trim() === "") {
				errors.category = "La categoría es requerida";
			}
			return Object.keys(errors).length > 0 ? errors : null;
		},
	},
	{
		id: "media",
		title: "Imágenes y Multimedia",
		description: "Agrega imágenes y contenido multimedia",
		component: BlogMediaStep,
		optional: true,
	},
	{
		id: "seo",
		title: "SEO y Metadatos",
		description: "Optimiza tu artículo para motores de búsqueda",
		component: BlogSeoStep,
		optional: true,
	},
	{
		id: "preview",
		title: "Vista Previa y Publicación",
		description: "Revisa tu artículo antes de publicarlo",
		component: BlogPreviewStep,
		validation: (data: BlogWizardData) => {
			// Final validation before publishing
			const errors: Record<string, string> = {};
			if (!data.title || data.title.trim() === "") {
				errors.title = "El título es requerido";
			}
			if (!data.content || data.content.trim() === "") {
				errors.content = "El contenido es requerido";
			}
			return Object.keys(errors).length > 0 ? errors : null;
		},
	},
];

type BlogWizardProps = {
	draftId?: string;
	initialData?: BlogWizardData;
	onComplete?: () => void;
};

export function BlogWizard({
	draftId,
	initialData,
	onComplete,
}: BlogWizardProps) {
	const createDraft = useCreateWizardDraft();
	const saveDraft = useSaveWizardDraft();

	const handleComplete = async (data: BlogWizardData) => {
		try {
			// Validate with Zod schema
			const validatedData = BlogWizardSchema.parse(data);
			
			const blogPostData: CreateBlogPostInput = {
				title: validatedData.title,
				content: validatedData.content,
				category: validatedData.category,
				authorId: "current-author-id", // TODO: Get from user context
				excerpt: validatedData.excerpt,
				slug: validatedData.slug,
				tags: validatedData.tags,
				coverImage: validatedData.coverImage ? { url: validatedData.coverImage } : undefined,
			};
			
			const result = await createBlogPost(blogPostData);

			if (result.success) {
				onComplete?.();
				return { success: true, message: "Artículo creado exitosamente" };
			}
			return {
				success: false,
				error: result.error || "Error al crear el artículo",
			};
		} catch (error) {
			if (error instanceof z.ZodError) {
				return {
					success: false,
					error: `Datos inválidos: ${error.flatten().fieldErrors}`,
				};
			}
			return { success: false, error: "Error inesperado" };
		}
	};

	const handleSaveDraft = async (data: BlogWizardData) => {
		try {
			if (draftId) {
				await saveDraft.mutateAsync({
					id: draftId,
					data,
				});
			} else {
				await createDraft.mutateAsync();
			}
		} catch (_error) {}
	};

	return (
		<UnifiedWizard<BlogWizardData>
			description="Completa la información para agregar un nuevo artículo al blog"
			initialData={initialData}
			onComplete={handleComplete}
			onSaveDraft={handleSaveDraft}
			showDraftOption={true}
			steps={blogWizardSteps}
			title="Crear Nuevo Artículo"
		/>
	);
}
