"use client";

import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlogWizardData } from "@/lib/schemas/blog-wizard-schemas";

type BlogPreviewStepProps = {
	data: BlogWizardData;
	onChange: (data: BlogWizardData) => void;
};

export function BlogPreviewStep({
	data,
}: Omit<BlogPreviewStepProps, 'onChange'>) {
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
							<h3 className="font-semibold text-lg">
								{data.title || "Sin título"}
							</h3>
							<p className="text-muted-foreground text-sm">
								Por: {data.author || "Sin autor"}
							</p>
							<p className="mt-2 text-muted-foreground">
								{data.description || "Sin descripción"}
							</p>
						</div>

						{data.excerpt && (
							<div className="rounded-md bg-muted p-3">
								<h4 className="mb-1 font-medium">Extracto:</h4>
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
								<h4 className="mb-2 font-medium">Etiquetas:</h4>
								<div className="flex flex-wrap gap-1">
									{data.tags.map((tag: string) => (
										<Badge className="text-xs" key={tag} variant="secondary">
											{tag}
										</Badge>
									))}
								</div>
							</div>
						)}

						{data.content && (
							<div className="border-t pt-4">
								<h4 className="mb-2 font-medium">Contenido:</h4>
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
