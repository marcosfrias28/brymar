"use client";

import type { BlogWizardData } from "@/types/blog-wizard";
import { BlogPreviewStep } from "./steps/blog-preview-step";

type BlogPreviewWrapperProps = {
	data: BlogWizardData;
};

export function BlogPreviewWrapper({ data }: BlogPreviewWrapperProps) {
	const handleUpdate = () => {
		// Preview component doesn't need to update data
	};

	return (
		<BlogPreviewStep
			data={data}
			errors={{}}
			isLoading={false}
			isMobile={false}
			onNext={() => {}}
			onPrevious={() => {}}
			onUpdate={handleUpdate}
		/>
	);
}
