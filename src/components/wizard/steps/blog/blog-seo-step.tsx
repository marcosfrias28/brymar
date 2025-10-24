"use client";

import { Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BlogSeoData {
	slug?: string;
	metaDescription?: string;
	tags?: string[];
}

interface BlogSeoStepProps {
	data: BlogSeoData;
	onChange: (data: BlogSeoData) => void;
	errors?: Record<string, string>;
}

export function BlogSeoStep({ data, onChange, errors }: BlogSeoStepProps) {
	const [newTag, setNewTag] = useState("");
	const tags = data.tags || [];

	const handleChange = (field: keyof BlogSeoData, value: string | string[]) => {
		onChange({ ...data, [field]: value });
	};

	const addTag = () => {
		if (newTag.trim() && !tags.includes(newTag.trim())) {
			handleChange("tags", [...tags, newTag.trim()]);
			setNewTag("");
		}
	};

	const removeTag = (tagToRemove: string) => {
		handleChange(
			"tags",
			tags.filter((tag: string) => tag !== tagToRemove),
		);
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Search className="h-5 w-5" />
						SEO y Metadatos
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="slug">URL Slug</Label>
						<Input
							id="slug"
							value={data.slug || ""}
							onChange={(e) => handleChange("slug", e.target.value)}
							placeholder="mi-articulo-de-blog"
						/>
						<p className="text-sm text-muted-foreground">
							URL amigable para el artículo (sin espacios, solo letras, números
							y guiones)
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="metaDescription">Meta Descripción</Label>
						<Textarea
							id="metaDescription"
							value={data.metaDescription || ""}
							onChange={(e) => handleChange("metaDescription", e.target.value)}
							placeholder="Descripción breve para motores de búsqueda..."
							rows={3}
							maxLength={160}
						/>
						<p className="text-sm text-muted-foreground">
							Máximo 160 caracteres. Aparecerá en los resultados de búsqueda.
						</p>
					</div>

					<div className="space-y-2">
						<Label>Etiquetas</Label>
						<div className="flex gap-2">
							<Input
								value={newTag}
								onChange={(e) => setNewTag(e.target.value)}
								placeholder="Agregar etiqueta..."
								onKeyPress={(e) => e.key === "Enter" && addTag()}
							/>
							<Button type="button" onClick={addTag} size="sm">
								<Plus className="h-4 w-4" />
							</Button>
						</div>

						{tags.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-2">
								{tags.map((tag: string, index: number) => (
									<Badge
										key={index}
										variant="secondary"
										className="flex items-center gap-1"
									>
										{tag}
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="h-auto p-0 hover:bg-transparent"
											onClick={() => removeTag(tag)}
										>
											<X className="h-3 w-3" />
										</Button>
									</Badge>
								))}
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
