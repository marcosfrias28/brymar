"use client";

import type { BlogWizardData } from "@/types/blog-wizard";

interface BlogPreviewStepProps {
	data: BlogWizardData;
	onUpdate: (data: BlogWizardData) => void;
	onNext: () => void;
	onPrevious: () => void;
	errors: Record<string, string>;
	isLoading: boolean;
	isMobile: boolean;
}

export function BlogPreviewStep({ data }: BlogPreviewStepProps) {
	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold">Vista Previa del Blog</h2>
			<div className="bg-white p-6 rounded-lg border">
				<h3 className="text-xl font-semibold mb-4">{data.title || "Sin título"}</h3>
				<div className="prose max-w-none">
					{data.content ? (
						<div dangerouslySetInnerHTML={{ __html: data.content }} />
					) : (
						<p className="text-gray-500">Sin contenido</p>
					)}
				</div>
			</div>
		</div>
	);
}