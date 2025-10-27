"use client";

import { useCreateWizardDraft, useSaveWizardDraft } from "@/hooks/use-wizard";
import { createBlogPost } from "@/lib/actions/blog";
import type { CreateBlogPostInput } from "@/lib/types/blog";
import { BlogForm } from "../blog/blog-form";
import { UnifiedWizard, type WizardStep } from "./unified-wizard";

interface BlogWizardData {
	title?: string;
	content?: string;
	author?: string;
	status?: string;
	[key: string]: unknown;
}

interface BlogStepProps {
	data: BlogWizardData;
	onChange: (data: BlogWizardData) => void;
	errors?: Record<string, string>;
}

// Blog wizard step components
const BlogBasicInfoStep = ({ data, onChange, errors }: BlogStepProps) => {
	return (
		<div className="space-y-4">
			<BlogForm
				initialData={data as any}
				onSuccess={() => {
					// Handle success if needed
				}}
			/>
		</div>
	);
};

const blogWizardSteps: WizardStep[] = [
	{
		id: "basic-info",
		title: "Información del Post",
		description: "Datos principales del artículo",
		component: BlogBasicInfoStep,
		validation: (data: BlogWizardData) => {
			const errors: Record<string, string> = {};
			if (!data.title) errors.title = "El título es requerido";
			if (!data.content) errors.content = "El contenido es requerido";
			if (!data.author) errors.author = "El autor es requerido";
			return Object.keys(errors).length > 0 ? errors : null;
		},
	},
];

interface BlogWizardProps {
	draftId?: string;
	initialData?: BlogWizardData;
	onComplete?: () => void;
}

export function BlogWizard({
	draftId,
	initialData,
	onComplete,
}: BlogWizardProps) {
	const createDraft = useCreateWizardDraft();
	const saveDraft = useSaveWizardDraft();

	const handleComplete = async (data: BlogWizardData) => {
		try {
			const blogPostData: CreateBlogPostInput = {
				title: data.title || "Untitled",
				content: data.content || "",
				category: (data.category as string) || "general",
				authorId: (data.authorId as string) || "default-author-id",
				excerpt: (data.excerpt as string) || undefined,
				slug: (data.slug as string) || undefined,
				tags: (data.tags as string[]) || undefined,
				coverImage: (data.coverImage as any) || undefined,
			};
			const result = await createBlogPost(blogPostData);

			if (result.success) {
				onComplete?.();
				return { success: true, message: "Post creado exitosamente" };
			} else {
				return {
					success: false,
					error: result.error || "Error al crear el post",
				};
			}
		} catch (_error) {
			return { success: false, error: "Error inesperado" };
		}
	};

	const handleSaveDraft = async (data: BlogWizardData) => {
		try {
			if (draftId) {
				await saveDraft.mutateAsync({
					id: draftId,
					data: data,
				});
			} else {
				await createDraft.mutateAsync();
			}
		} catch (error) {
			console.warn("Wizard draft functionality is temporarily disabled:", error);
		}
	};

	return (
		<UnifiedWizard
			title="Crear Nuevo Post"
			description="Completa la información para agregar un nuevo artículo al blog"
			steps={blogWizardSteps}
			initialData={initialData}
			onComplete={handleComplete}
			onSaveDraft={handleSaveDraft}
			showDraftOption={true}
		/>
	);
}
