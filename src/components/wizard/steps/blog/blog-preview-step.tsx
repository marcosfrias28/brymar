"use client";

import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BlogPreviewData {
	title?: string;
	author?: string;
	description?: string;
	excerpt?: string;
	category?: string;
	slug?: string;
	tags?: string[];
	content?: string;
}

interface BlogPreviewStepProps {
	data: BlogPreviewData;
	onChange: (data: BlogPreviewData) => void;
	errors?: Record<string, string>;
}

export function BlogPreviewStep({
	data,
	onChange,
	errors,
}: BlogPreviewStepProps) {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Eye className="h-5 w-5" />
						Vista Previa del Artículo
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-4">
						<div>
							<h3 className="text-lg font-semibold">
								{data.title || "Sin título"}
							</h3>
							<p className="text-sm text-muted-foreground">
								Por: {data.author || "Sin autor"}
							</p>
							<p className="text-muted-foreground mt-2">
								{data.description || "Sin descripción"}
							</p>
						</div>

						{data.excerpt && (
							<div className="bg-muted p-3 rounded-md">
								<h4 className="font-medium mb-1">Extracto:</h4>
								<p className="text-sm">{data.excerpt}</p>
							</div>
						)}

						<div className="flex gap-2">
							{data.category && (
								<Badge variant="outline">Categoría: {data.category}</Badge>
							)}
							{data.slug && <Badge variant="outline">URL: /{data.slug}</Badge>}
						</div>

						{data.tags && data.tags.length > 0 && (
							<div>
								<h4 className="font-medium mb-2">Etiquetas:</h4>
								<div className="flex flex-wrap gap-1">
									{data.tags.map((tag: string, index: number) => (
										<Badge key={index} variant="secondary" className="text-xs">
											{tag}
										</Badge>
									))}
								</div>
							</div>
						)}

						{data.content && (
							<div className="border-t pt-4">
								<h4 className="font-medium mb-2">Contenido:</h4>
								<div className="prose prose-sm max-w-none">
									<div
										dangerouslySetInnerHTML={{
											__html: data.content.replace(/\n/g, "<br>"),
										}}
									/>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
