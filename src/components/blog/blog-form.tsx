"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
	const [tags, setTags] = useState<string[]>(
		Array.isArray(initialData?.tags) ? initialData.tags : []
	);
	const [tagInput, setTagInput] = useState("");
	const [category, setCategory] = useState(initialData?.category || "");

	const action = isEditing ? updateBlogPostAction : createBlogPostAction;
	const [state, formAction, isPending] = useActionState(action, {
		success: false,
	});

	// Handle success
	useEffect(() => {
		if (state?.success) {
			toast.success(state.message || "Blog post saved successfully");
			onSuccess?.();
		}
	}, [state?.success, state?.message, onSuccess]);

	// Handle errors
	useEffect(() => {
		if (state?.message && !state.success) {
			toast.error(state.message);
		}
	}, [state?.message, state?.success]);

	const addTag = () => {
		if (tagInput.trim() && !tags.includes(tagInput.trim())) {
			setTags([...tags, tagInput.trim()]);
			setTagInput("");
		}
	};

	const removeTag = (tagToRemove: string) => {
		setTags(tags.filter((tag) => tag !== tagToRemove));
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{isEditing ? "Editar Post del Blog" : "Crear Nuevo Post del Blog"}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form action={formAction} className="space-y-6">
					{/* Hidden fields */}
					{isEditing && initialData?.id && (
						<input name="id" type="hidden" value={initialData.id} />
					)}
					<input name="tags" type="hidden" value={JSON.stringify(tags)} />
					<input name="images" type="hidden" value={JSON.stringify([])} />
					<input name="videos" type="hidden" value={JSON.stringify([])} />
					<input name="featured" type="hidden" value="false" />
					<input name="status" type="hidden" value="draft" />

					{/* Title */}
					<div className="space-y-2">
						<Label htmlFor="title">Título *</Label>
						<Input
							defaultValue={initialData?.title || ""}
							id="title"
							name="title"
							placeholder="Título del post del blog"
							required
						/>
						{state?.errors?.title && (
							<p className="text-red-600 text-sm">{state.errors.title[0]}</p>
						)}
					</div>

					{/* Description (required by schema) */}
					<div className="space-y-2">
						<Label htmlFor="description">Descripción *</Label>
						<Textarea
							defaultValue={initialData?.excerpt || ""}
							id="description"
							name="description"
							placeholder="Breve descripción del contenido del post..."
							required
							rows={3}
						/>
						{state?.errors?.description && (
							<p className="text-red-600 text-sm">
								{state.errors.description[0]}
							</p>
						)}
					</div>

					{/* Author */}
					<div className="space-y-2">
						<Label htmlFor="author">Autor *</Label>
						<Input
							defaultValue={initialData?.authorId || ""}
							id="author"
							name="author"
							placeholder="Nombre del autor"
							required
						/>
						{state?.errors?.author && (
							<p className="text-red-600 text-sm">{state.errors.author[0]}</p>
						)}
					</div>

					{/* Category */}
					<div className="space-y-2">
						<Label htmlFor="category">Categoría *</Label>
						<input name="category" type="hidden" value={category} />
						<Select onValueChange={setCategory} required value={category}>
							<SelectTrigger>
								<SelectValue placeholder="Seleccionar categoría" />
							</SelectTrigger>
							<SelectContent>
								{categoryOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{state?.errors?.category && (
							<p className="text-red-600 text-sm">{state.errors.category[0]}</p>
						)}
					</div>

					{/* Excerpt */}
					<div className="space-y-2">
						<Label htmlFor="excerpt">Resumen</Label>
						<Textarea
							defaultValue={initialData?.excerpt || ""}
							id="excerpt"
							name="excerpt"
							placeholder="Breve descripción del contenido del post..."
							rows={3}
						/>
						{state?.errors?.excerpt && (
							<p className="text-red-600 text-sm">{state.errors.excerpt[0]}</p>
						)}
					</div>

					{/* Cover Image */}
					<div className="space-y-2">
						<Label htmlFor="coverImage">URL de Imagen de Portada</Label>
						<Input
							defaultValue={
								initialData?.coverImage &&
								typeof initialData.coverImage === "object" &&
								"url" in initialData.coverImage
									? (initialData.coverImage as any).url || ""
									: ""
							}
							id="coverImage"
							name="coverImage"
							placeholder="https://ejemplo.com/imagen.jpg"
						/>
						{state?.errors?.coverImage && (
							<p className="text-red-600 text-sm">
								{state.errors.coverImage[0]}
							</p>
						)}
					</div>

					{/* Tags */}
					<div className="space-y-2">
						<Label>Etiquetas *</Label>
						<div className="flex gap-2">
							<Input
								onChange={(e) => setTagInput(e.target.value)}
								onKeyPress={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addTag();
									}
								}}
								placeholder="Agregar etiqueta"
								value={tagInput}
							/>
							<Button onClick={addTag} type="button" variant="outline">
								Agregar
							</Button>
						</div>
						{tags.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-2">
								{tags.map((tag) => (
									<span
										className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-secondary-foreground text-sm"
										key={tag}
									>
										{tag}
										<button
											className="text-red-500 hover:text-red-700"
											onClick={() => removeTag(tag)}
											type="button"
										>
											×
										</button>
									</span>
								))}
							</div>
						)}
						{state?.errors?.tags && (
							<p className="text-red-600 text-sm">{state.errors.tags[0]}</p>
						)}
					</div>

					{/* Content */}
					<div className="space-y-2">
						<Label htmlFor="content">Contenido *</Label>
						<Textarea
							defaultValue={initialData?.content || ""}
							id="content"
							name="content"
							placeholder="Escribe el contenido completo del post aquí..."
							required
							rows={10}
						/>
						{state?.errors?.content && (
							<p className="text-red-600 text-sm">{state.errors.content[0]}</p>
						)}
					</div>

					{/* Actions */}
					<div className="flex gap-4">
						<Button disabled={isPending} type="submit">
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Guardando...
								</>
							) : isEditing ? (
								"Actualizar Post"
							) : (
								"Crear Post"
							)}
						</Button>
						{onCancel && (
							<Button onClick={onCancel} type="button" variant="outline">
								Cancelar
							</Button>
						)}
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
