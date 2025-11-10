"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, FileText, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGenerateAIContent } from "@/hooks/use-wizard";
import {
	BlogContentStepSchema,
	type BlogWizardData,
} from "@/lib/schemas/blog-wizard-schemas";

type BlogContentFormData = z.infer<typeof BlogContentStepSchema>;

type BlogContentStepProps = {
	data: BlogWizardData;
	onChange: (data: BlogWizardData) => void;
};

const BLOG_CATEGORIES = [
	{ value: "property-news", label: "Noticias de Propiedades" },
	{ value: "market-trends", label: "Tendencias del Mercado" },
	{ value: "investment-tips", label: "Consejos de Inversión" },
	{ value: "location-guides", label: "Guías de Ubicación" },
	{ value: "legal-advice", label: "Asesoría Legal" },
	{ value: "lifestyle", label: "Estilo de Vida" },
];

const WORDS_PER_MINUTE = 200;

export function BlogContentStep({ data, onChange }: BlogContentStepProps) {
	const [showPreview, setShowPreview] = useState(false);
	const [wordCount, setWordCount] = useState(0);
	const [readTime, setReadTime] = useState(0);

	const generateAI = useGenerateAIContent();

	const form = useForm<BlogContentFormData>({
		resolver: zodResolver(BlogContentStepSchema),
		mode: "onChange",
		defaultValues: {
			title: data.title || "",
			content: data.content || "",
			author: data.author || "",
			category: data.category || "property-news",
			excerpt: data.excerpt || "",
		},
	});

	const watchedValues = form.watch();

	// Calculate word count and reading time
	useEffect(() => {
		const content = watchedValues.content || "";
		const words = content
			.split(/\s+/g)
			.filter((word) => word.length > 0).length;
		setWordCount(words);
		setReadTime(Math.ceil(words / WORDS_PER_MINUTE));
	}, [watchedValues.content]);

	const handleGenerateTitle = useCallback(async () => {
		try {
			const result = await generateAI.mutateAsync({
				wizardType: "blog",
				contentType: "title",
				baseData: {
					category: watchedValues.category,
					topic: watchedValues.content,
				},
			});

			if (result.success && result.data?.content?.title) {
				form.setValue("title", result.data.content.title);
			}
		} catch (error) {
			console.error("Error generating title:", error);
		}
	}, [watchedValues, generateAI, form]);

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
					description: watchedValues.content,
				},
			});

			if (result.success && result.data?.content?.content) {
				form.setValue("content", result.data.content.content);
			}
		} catch (error) {
			console.error("Error generating content:", error);
		}
	}, [watchedValues, generateAI, form]);

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
				form.setValue("excerpt", result.data.content.excerpt);
			}
		} catch (error) {
			console.error("Error generating excerpt:", error);
		}
	}, [watchedValues, generateAI, form]);

	// Update parent when form data changes
	useEffect(() => {
		onChange({ ...data, ...watchedValues });
	}, [watchedValues, data, onChange]);

	const renderPreview = () => {
		if (!watchedValues.content) {
			return (
				<p className="text-muted-foreground">
					El contenido del artículo aparecerá aquí...
				</p>
			);
		}

		return (
			<div className="prose prose-sm max-w-none">
				<h3 className="mb-2 font-semibold text-lg">{watchedValues.title}</h3>
				<div
					className="whitespace-pre-wrap text-sm"
					dangerouslySetInnerHTML={{
						__html: watchedValues.content.replace(/\n/g, "<br />"),
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
				<CardContent>
					<Form {...form}>
						<form className="space-y-4">
							{/* Title */}
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center justify-between">
											<FormLabel>Título *</FormLabel>
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
										<FormControl>
											<Input
												placeholder="Ingresa el título del artículo..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Description */}
							<FormField
								control={form.control}
								name="content"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Descripción Breve *</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Breve descripción del artículo..."
												rows={2}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Author and Category */}
							<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
								<FormField
									control={form.control}
									name="author"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Autor *</FormLabel>
											<FormControl>
												<Input placeholder="Nombre del autor..." {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="category"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Categoría *</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Selecciona una categoría" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{BLOG_CATEGORIES.map((category) => (
														<SelectItem
															key={category.value}
															value={category.value}
														>
															{category.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Excerpt */}
							<FormField
								control={form.control}
								name="excerpt"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center justify-between">
											<FormLabel>Extracto</FormLabel>
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
										<FormControl>
											<Textarea
												placeholder="Breve extracto del artículo..."
												rows={3}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Content */}
							<FormField
								control={form.control}
								name="content"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center justify-between">
											<FormLabel>Contenido *</FormLabel>
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
													disabled={
														!watchedValues.title || generateAI.isPending
													}
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
											<Card className="min-h-[300px] p-4">
												{renderPreview()}
											</Card>
										) : (
											<FormControl>
												<Textarea
													placeholder="Escribe el contenido del artículo..."
													rows={15}
													{...field}
												/>
											</FormControl>
										)}
										<FormMessage />
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
