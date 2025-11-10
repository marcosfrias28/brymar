"use client";

import { Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BlogWizardData } from "@/lib/schemas/blog-wizard-schemas";

type BlogSeoStepProps = {
	data: BlogWizardData;
	onChange: (data: BlogWizardData) => void;
};

export function BlogSeoStep({ data, onChange }: BlogSeoStepProps) {
	const [newTag, setNewTag] = useState("");
	const tags = data.tags || [];

	const handleChange = (field: 'slug' | 'seoDescription' | 'tags', value: string | string[]) => {
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
			tags.filter((tag: string) => tag !== tagToRemove)
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
							onChange={(e) => handleChange("slug", e.target.value)}
							placeholder="mi-articulo-de-blog"
							value={data.slug || ""}
						/>
						<p className="text-muted-foreground text-sm">
							URL amigable para el artículo (sin espacios, solo letras, números
							y guiones)
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="seoDescription">Meta Descripción</Label>
						<Textarea
							id="seoDescription"
							maxLength={160}
							onChange={(e) => handleChange("seoDescription", e.target.value)}
							placeholder="Descripción breve para motores de búsqueda..."
							rows={3}
							value={data.seoDescription || ""}
						/>
						<p className="text-muted-foreground text-sm">
							Máximo 160 caracteres. Aparecerá en los resultados de búsqueda.
						</p>
					</div>

					<div className="space-y-2">
						<Label>Etiquetas</Label>
						<div className="flex gap-2">
							<Input
								onChange={(e) => setNewTag(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && addTag()}
								placeholder="Agregar etiqueta..."
								value={newTag}
							/>
							<Button onClick={addTag} size="sm" type="button">
								<Plus className="h-4 w-4" />
							</Button>
						</div>

						{tags.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-2">
								{tags.map((tag: string, index: number) => (
									<Badge
										className="flex items-center gap-1"
										key={index}
										variant="secondary"
									>
										{tag}
										<Button
											className="h-auto p-0 hover:bg-transparent"
											onClick={() => removeTag(tag)}
											size="sm"
											type="button"
											variant="ghost"
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
