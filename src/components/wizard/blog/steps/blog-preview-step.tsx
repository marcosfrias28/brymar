"use client";

import type { BlogWizardData } from "@/types/blog-wizard";

type BlogPreviewStepProps = {
	data: BlogWizardData;
	onUpdate: (data: BlogWizardData) => void;
	onNext: () => void;
	onPrevious: () => void;
	errors: Record<string, string>;
	isLoading: boolean;
	isMobile: boolean;
};

export function BlogPreviewStep({ data }: BlogPreviewStepProps) {
	return (
		<div className="space-y-6">
			<h2 className="font-bold text-2xl">Vista Previa del Blog</h2>
			<div className="rounded-lg border bg-white p-6">
				<h3 className="mb-4 font-semibold text-xl">
					{data.title || "Sin título"}
				</h3>
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
