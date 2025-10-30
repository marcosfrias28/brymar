"use client";

import { useState } from "react";
import type { BlogPost } from "@/lib/types/blog";

type BlogWizardProps = {
	onComplete?: (blogPost: Partial<BlogPost>) => void;
	initialData?: Partial<BlogPost>;
};

export function BlogWizard({ onComplete, initialData }: BlogWizardProps) {
	const [currentStep, setCurrentStep] = useState(0);
	const [formData, setFormData] = useState<Partial<BlogPost>>(
		initialData || {}
	);

	const handleNext = () => {
		if (currentStep < 2) {
			setCurrentStep(currentStep + 1);
		} else {
			onComplete?.(formData);
		}
	};

	const handleBack = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	return (
		<div className="mx-auto max-w-2xl p-6">
			<div className="mb-8">
				<h2 className="font-bold text-2xl">Blog Wizard</h2>
				<p className="text-gray-600">Step {currentStep + 1} of 3</p>
			</div>

			<div className="space-y-6">
				{currentStep === 0 && (
					<div>
						<h3 className="mb-4 font-semibold text-lg">Basic Information</h3>
						<div className="space-y-4">
							<input
								className="w-full rounded-lg border p-3"
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
								placeholder="Blog Post Title"
								type="text"
								value={formData.title || ""}
							/>
							<textarea
								className="h-24 w-full rounded-lg border p-3"
								onChange={(e) =>
									setFormData({ ...formData, excerpt: e.target.value })
								}
								placeholder="Blog Post Excerpt"
								value={formData.excerpt || ""}
							/>
						</div>
					</div>
				)}

				{currentStep === 1 && (
					<div>
						<h3 className="mb-4 font-semibold text-lg">Content</h3>
						<div className="space-y-4">
							<textarea
								className="h-48 w-full rounded-lg border p-3"
								onChange={(e) =>
									setFormData({ ...formData, content: e.target.value })
								}
								placeholder="Blog Post Content"
								value={formData.content || ""}
							/>
							<select
								className="w-full rounded-lg border p-3"
								onChange={(e) =>
									setFormData({ ...formData, category: e.target.value })
								}
								value={formData.category || ""}
							>
								<option value="">Select Category</option>
								<option value="real-estate">Real Estate</option>
								<option value="market-trends">Market Trends</option>
								<option value="investment">Investment</option>
							</select>
						</div>
					</div>
				)}

				{currentStep === 2 && (
					<div>
						<h3 className="mb-4 font-semibold text-lg">Review & Submit</h3>
						<div className="rounded-lg bg-gray-50 p-4">
							<p>
								<strong>Title:</strong> {formData.title}
							</p>
							<p>
								<strong>Category:</strong> {formData.category}
							</p>
							<p>
								<strong>Content Length:</strong> {formData.content?.length || 0}{" "}
								characters
							</p>
						</div>
					</div>
				)}

				<div className="flex justify-between pt-6">
					<button
						className="rounded-lg border px-4 py-2 disabled:opacity-50"
						disabled={currentStep === 0}
						onClick={handleBack}
					>
						Back
					</button>
					<button
						className="rounded-lg bg-blue-600 px-4 py-2 text-white"
						onClick={handleNext}
					>
						{currentStep === 2 ? "Complete" : "Next"}
					</button>
				</div>
			</div>
		</div>
	);
}
