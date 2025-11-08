"use client";

import { useEffect } from "react";
import { UnifiedForm, type FormConfig } from "@/components/forms/unified-form";
import {
	createBlogPostAction,
	updateBlogPostAction,
} from "@/lib/actions/blog-actions";
import type { BlogPost } from "@/lib/types/blog";

type BlogFormProps = {
	initialData?: BlogPost;
	isEditing?: boolean;
	onCancel?: () => void;
	onSuccess?: () => void;
};

const categoryOptions = [
	{ value: "property-news", label: "Noticias de Propiedades" },
	{ value: "market-analysis", label: "Análisis de Mercado" },
	{ value: "investment-tips", label: "Consejos de Inversión" },
	{ value: "legal-advice", label: "Asesoría Legal" },
	{ value: "home-improvement", label: "Mejoras del Hogar" },
	{ value: "general", label: "General" },
];

export function BlogForm({
	initialData,
	isEditing = false,
	onCancel,
	onSuccess,
}: BlogFormProps) {
	// Configuración del formulario para blog
	const blogFormConfig: FormConfig = {
		title: isEditing ? "Editar Post del Blog" : "Crear Nuevo Post del Blog",
		description: isEditing
			? "Modifica la información del post"
			: "Crea un nuevo post para el blog",
		fields: [
			...(isEditing && initialData?.id
				? [{ name: "id", type: "hidden" as const }]
				: []),
			{ name: "tags", type: "hidden" as const },
			{ name: "images", type: "hidden" as const },
			{ name: "videos", type: "hidden" as const },
			{ name: "featured", type: "hidden" as const },
			{ name: "status", type: "hidden" as const },
			{
				name: "title",
				label: "Título",
				type: "text",
				required: true,
				placeholder: "Título del post del blog",
			},
			{
				name: "description",
				label: "Descripción",
				type: "textarea",
				required: true,
				placeholder: "Breve descripción del contenido del post...",
				rows: 3,
			},
			{
				name: "author",
				label: "Autor",
				type: "text",
				required: true,
				placeholder: "Nombre del autor",
			},
			{
				name: "category",
				label: "Categoría",
				type: "select",
				required: true,
				options: categoryOptions,
			},
			{
				name: "excerpt",
				label: "Resumen",
				type: "textarea",
				placeholder: "Breve descripción del contenido del post...",
				rows: 3,
			},
			{
				name: "coverImage",
				label: "URL de Imagen de Portada",
				type: "text",
				placeholder: "https://ejemplo.com/imagen.jpg",
			},
			{
				name: "content",
				label: "Contenido",
				type: "textarea",
				required: true,
				placeholder: "Escribe el contenido completo del post aquí...",
				rows: 10,
			},
		],
		submitText: isEditing ? "Actualizar Post" : "Crear Post",
		cancelText: "Cancelar",
		cancelUrl: onCancel ? undefined : "/dashboard/blog",
	};

	// Preparar datos iniciales con valores por defecto para campos hidden
	const initialFormData = {
		...initialData,
		tags: JSON.stringify(
			Array.isArray(initialData?.tags) ? initialData.tags : []
		),
		images: JSON.stringify([]),
		videos: JSON.stringify([]),
		featured: "false",
		status: "draft",
		description: initialData?.excerpt || "",
		author: initialData?.authorId || "",
	};

	const action = isEditing ? updateBlogPostAction : createBlogPostAction;

	// Handle success callback
	useEffect(() => {
		if (onSuccess) {
			// This would need to be triggered by the form's success state
			// For now, we'll rely on the action's built-in success handling
		}
	}, [onSuccess]);

	return (
		<UnifiedForm
			action={action}
			config={blogFormConfig}
			initialData={initialFormData}
			isEditing={isEditing}
		/>
	);
}
