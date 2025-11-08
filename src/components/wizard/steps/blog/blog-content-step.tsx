"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, FileText, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { useGenerateAIContent } from "@/hooks/use-wizard";
import { cn } from "@/lib/utils/index";

const BlogContentSchema = z.object({
	title: z.string().min(1, "El título es requerido"),
	description: z.string().min(1, "La descripción es requerida"),
	content: z.string().min(1, "El contenido es requerido"),
	author: z.string().min(1, "El autor es requerido"),
	category: z.string().min(1, "La categoría es requerida"),
	excerpt: z.string().optional(),
});

type BlogContentData = z.infer<typeof BlogContentSchema>;

const BLOG_CATEGORIES = [
	{ value: "property-news", label: "Noticias de Propiedades" },
	{ value: "market-trends", label: "Tendencias del Mercado" },
	{ value: "investment-tips", label: "Consejos de Inversión" },
	{ value: "location-guides", label: "Guías de Ubicación" },
	{ value: "legal-advice", label: "Asesoría Legal" },
	{ value: "lifestyle", label: "Estilo de Vida" },
];

type BlogData = {
	title?: string;
	description?: string;
	content?: string;
	author?: string;
	category?: string;
	excerpt?: string;
};

type BlogContentStepProps = {
	data: BlogData;
	onChange: (data: BlogData) => void;
	errors?: Record<string, string>;
};

export function BlogContentStep({
	data,
	onChange,
	errors,
}: BlogContentStepProps) {
	const [showPreview, setShowPreview] = useState(false);
	const [wordCount, setWordCount] = useState(0);
	const [readTime, setReadTime] = useState(0);

	const generateAI = useGenerateAIContent();

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors: formErrors, isValid },
	} = useForm<BlogContentData>({
		resolver: zodResolver(BlogContentSchema),
		mode: "onChange",
		defaultValues: {
			title: data.title || "",
			description: data.description || "",
			content: data.content || "",
			author: data.author || "",
			category: data.category || "",
			excerpt: data.excerpt || "",
		},
	});

	const watchedValues = watch();

	// Calculate word count and reading time
	useEffect(() => {
		const content = watchedValues.content || "";
		const words = content.split(/\s+/).filter((word) => word.length > 0).length;
		setWordCount(words);
		setReadTime(Math.ceil(words / 200)); // 200 words per minute
	}, [watchedValues.content]);

	const handleGenerateTitle = useCallback(async () => {
		try {
			const result = await generateAI.mutateAsync({
				wizardType: "blog",
				contentType: "title",
				baseData: {
					category: watchedValues.category,
					topic: watchedValues.description,
				},
			});

			if (result.success && result.data?.content?.title) {
				setValue("title", result.data.content.title);
			}
		} catch (_error) {}
	}, [watchedValues, generateAI, setValue]);

	const handleGenerateContent = useCallback(async () => {
		if (!watchedValues.title) {
			return;
		}

		try {
			const result = await generateAI.mutateAsync({
				wizardType: "blog",
				contentType: "content",
				baseData: {
					title: watchedValues.title,
					category: watchedValues.category,
					description: watchedValues.description,
				},
			});

			if (result.success && result.data?.content?.content) {
				setValue("content", result.data.content.content);
			}
		} catch (_error) {}
	}, [watchedValues, generateAI, setValue]);

	const handleGenerateExcerpt = useCallback(async () => {
		if (!watchedValues.title) {
			return;
		}

		try {
			const result = await generateAI.mutateAsync({
				wizardType: "blog",
				contentType: "excerpt",
				baseData: {
					title: watchedValues.title,
					content: watchedValues.content,
				},
			});

			if (result.success && result.data?.content?.excerpt) {
				setValue("excerpt", result.data.content.excerpt);
			}
		} catch (_error) {}
	}, [watchedValues, generateAI, setValue]);

	// Update parent when form data changes
	useEffect(() => {
		onChange(watchedValues);
	}, [watchedValues, onChange]);

	const renderPreview = () => {
		if (!watchedValues.content) {
			return (
				<p className="text-muted-foreground">No hay contenido para previsualizar</p>
			);
		}

		return (
			<div className="prose prose-sm max-w-none">
				<div
					dangerouslySetInnerHTML={{
						__html: watchedValues.content.replace(/\n/g, "<br>"),
					}}
				/>
			</div>
		);
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Contenido del Artículo
					</CardTitle>
					<div className="flex gap-2">
						<Badge variant="outline">{wordCount} palabras</Badge>
						<Badge variant="outline">{readTime} min lectura</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Title */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="title">Título *</Label>
							<Button
								disabled={generateAI.isPending}
								onClick={handleGenerateTitle}
								size="sm"
								type="button"
								variant="outline"
							>
								<Sparkles className="mr-2 h-4 w-4" />
								{generateAI.isPending ? "Generando..." : "Generar"}
							</Button>
						</div>
						<Input
							id="title"
							{...register("title")}
							className={cn(formErrors.title && "border-destructive")}
							placeholder="Ingresa el título del artículo..."
						/>
						{formErrors.title && (
							<p className="text-destructive text-sm">{formErrors.title.message}</p>
						)}
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="description">Descripción Breve *</Label>
						<Textarea
							id="description"
							{...register("description")}
							className={cn(formErrors.description && "border-destructive")}
							placeholder="Breve descripción del artículo..."
							rows={2}
						/>
						{formErrors.description && (
							<p className="text-destructive text-sm">
								{formErrors.description.message}
							</p>
						)}
					</div>

					{/* Author and Category */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="author">Autor *</Label>
							<Input
								id="author"
								{...register("author")}
								className={cn(formErrors.author && "border-destructive")}
								placeholder="Nombre del autor..."
							/>
							{formErrors.author && (
								<p className="text-destructive text-sm">
									{formErrors.author.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label>Categoría *</Label>
							<Select
								onValueChange={(value) => setValue("category", value)}
								value={watchedValues.category || ""}
							>
								<SelectTrigger
									className={cn(formErrors.category && "border-destructive")}
								>
									<SelectValue placeholder="Selecciona una categoría" />
								</SelectTrigger>
								<SelectContent>
									{BLOG_CATEGORIES.map((category) => (
										<SelectItem key={category.value} value={category.value}>
											{category.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{formErrors.category && (
								<p className="text-destructive text-sm">
									{formErrors.category.message}
								</p>
							)}
						</div>
					</div>

					{/* Excerpt */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="excerpt">Extracto</Label>
							<Button
								disabled={!watchedValues.title || generateAI.isPending}
								onClick={handleGenerateExcerpt}
								size="sm"
								type="button"
								variant="outline"
							>
								<Sparkles className="mr-2 h-4 w-4" />
								{generateAI.isPending ? "Generando..." : "Generar"}
							</Button>
						</div>
						<Textarea
							id="excerpt"
							{...register("excerpt")}
							placeholder="Breve extracto del artículo..."
							rows={3}
						/>
					</div>

					{/* Content */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="content">Contenido *</Label>
							<div className="flex gap-2">
								<Button
									onClick={() => setShowPreview(!showPreview)}
									size="sm"
									type="button"
									variant="outline"
								>
									{showPreview ? (
										<>
											<EyeOff className="mr-2 h-4 w-4" />
											Editar
										</>
									) : (
										<>
											<Eye className="mr-2 h-4 w-4" />
											Vista Previa
										</>
									)}
								</Button>
								<Button
									disabled={!watchedValues.title || generateAI.isPending}
									onClick={handleGenerateContent}
									size="sm"
									type="button"
									variant="outline"
								>
									<Sparkles className="mr-2 h-4 w-4" />
									{generateAI.isPending ? "Generando..." : "Generar"}
								</Button>
							</div>
						</div>

						{showPreview ? (
							<Card className="min-h-[300px] p-4">{renderPreview()}</Card>
						) : (
							<Textarea
								id="content"
								{...register("content")}
								className={cn(formErrors.content && "border-destructive")}
								placeholder="Escribe el contenido del artículo..."
								rows={15}
							/>
						)}
						{formErrors.content && (
							<p className="text-destructive text-sm">
								{formErrors.content.message}
							</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
