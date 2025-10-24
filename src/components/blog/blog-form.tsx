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

interface BlogFormProps {
	initialData?: BlogPost;
	isEditing?: boolean;
	onCancel?: () => void;
	onSuccess?: () => void;
}

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
		Array.isArray(initialData?.tags) ? initialData.tags : [],
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
						<input type="hidden" name="id" value={initialData.id} />
					)}
					<input type="hidden" name="tags" value={JSON.stringify(tags)} />
					<input type="hidden" name="images" value={JSON.stringify([])} />
					<input type="hidden" name="videos" value={JSON.stringify([])} />
					<input type="hidden" name="featured" value="false" />
					<input type="hidden" name="status" value="draft" />

					{/* Title */}
					<div className="space-y-2">
						<Label htmlFor="title">Título *</Label>
						<Input
							id="title"
							name="title"
							defaultValue={initialData?.title || ""}
							placeholder="Título del post del blog"
							required
						/>
						{state?.errors?.title && (
							<p className="text-sm text-red-600">{state.errors.title[0]}</p>
						)}
					</div>

					{/* Description (required by schema) */}
					<div className="space-y-2">
						<Label htmlFor="description">Descripción *</Label>
						<Textarea
							id="description"
							name="description"
							defaultValue={initialData?.excerpt || ""}
							placeholder="Breve descripción del contenido del post..."
							rows={3}
							required
						/>
						{state?.errors?.description && (
							<p className="text-sm text-red-600">
								{state.errors.description[0]}
							</p>
						)}
					</div>

					{/* Author */}
					<div className="space-y-2">
						<Label htmlFor="author">Autor *</Label>
						<Input
							id="author"
							name="author"
							defaultValue={initialData?.authorId || ""}
							placeholder="Nombre del autor"
							required
						/>
						{state?.errors?.author && (
							<p className="text-sm text-red-600">{state.errors.author[0]}</p>
						)}
					</div>

					{/* Category */}
					<div className="space-y-2">
						<Label htmlFor="category">Categoría *</Label>
						<input type="hidden" name="category" value={category} />
						<Select value={category} onValueChange={setCategory} required>
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
							<p className="text-sm text-red-600">{state.errors.category[0]}</p>
						)}
					</div>

					{/* Excerpt */}
					<div className="space-y-2">
						<Label htmlFor="excerpt">Resumen</Label>
						<Textarea
							id="excerpt"
							name="excerpt"
							defaultValue={initialData?.excerpt || ""}
							placeholder="Breve descripción del contenido del post..."
							rows={3}
						/>
						{state?.errors?.excerpt && (
							<p className="text-sm text-red-600">{state.errors.excerpt[0]}</p>
						)}
					</div>

					{/* Cover Image */}
					<div className="space-y-2">
						<Label htmlFor="coverImage">URL de Imagen de Portada</Label>
						<Input
							id="coverImage"
							name="coverImage"
							defaultValue={
								initialData?.coverImage &&
								typeof initialData.coverImage === "object" &&
								"url" in initialData.coverImage
									? (initialData.coverImage as any).url || ""
									: ""
							}
							placeholder="https://ejemplo.com/imagen.jpg"
						/>
						{state?.errors?.coverImage && (
							<p className="text-sm text-red-600">
								{state.errors.coverImage[0]}
							</p>
						)}
					</div>

					{/* Tags */}
					<div className="space-y-2">
						<Label>Etiquetas *</Label>
						<div className="flex gap-2">
							<Input
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								placeholder="Agregar etiqueta"
								onKeyPress={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addTag();
									}
								}}
							/>
							<Button type="button" onClick={addTag} variant="outline">
								Agregar
							</Button>
						</div>
						{tags.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-2">
								{tags.map((tag) => (
									<span
										key={tag}
										className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1"
									>
										{tag}
										<button
											type="button"
											onClick={() => removeTag(tag)}
											className="text-red-500 hover:text-red-700"
										>
											×
										</button>
									</span>
								))}
							</div>
						)}
						{state?.errors?.tags && (
							<p className="text-sm text-red-600">{state.errors.tags[0]}</p>
						)}
					</div>

					{/* Content */}
					<div className="space-y-2">
						<Label htmlFor="content">Contenido *</Label>
						<Textarea
							id="content"
							name="content"
							defaultValue={initialData?.content || ""}
							placeholder="Escribe el contenido completo del post aquí..."
							rows={10}
							required
						/>
						{state?.errors?.content && (
							<p className="text-sm text-red-600">{state.errors.content[0]}</p>
						)}
					</div>

					{/* Actions */}
					<div className="flex gap-4">
						<Button type="submit" disabled={isPending}>
							{isPending ? (
								<>
									<Loader2 className="animate-spin mr-2 h-4 w-4" />
									Guardando...
								</>
							) : isEditing ? (
								"Actualizar Post"
							) : (
								"Crear Post"
							)}
						</Button>
						{onCancel && (
							<Button type="button" variant="outline" onClick={onCancel}>
								Cancelar
							</Button>
						)}
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
