"use client";

import { useState } from "react";
import type { BlogPost } from "@/lib/types/blog";

interface BlogWizardProps {
	onComplete?: (blogPost: Partial<BlogPost>) => void;
	initialData?: Partial<BlogPost>;
}

export function BlogWizard({ onComplete, initialData }: BlogWizardProps) {
	const [currentStep, setCurrentStep] = useState(0);
	const [formData, setFormData] = useState<Partial<BlogPost>>(
		initialData || {},
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
		<div className="max-w-2xl mx-auto p-6">
			<div className="mb-8">
				<h2 className="text-2xl font-bold">Blog Wizard</h2>
				<p className="text-gray-600">Step {currentStep + 1} of 3</p>
			</div>

			<div className="space-y-6">
				{currentStep === 0 && (
					<div>
						<h3 className="text-lg font-semibold mb-4">Basic Information</h3>
						<div className="space-y-4">
							<input
								type="text"
								placeholder="Blog Post Title"
								className="w-full p-3 border rounded-lg"
								value={formData.title || ""}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
							/>
							<textarea
								placeholder="Blog Post Excerpt"
								className="w-full p-3 border rounded-lg h-24"
								value={formData.excerpt || ""}
								onChange={(e) =>
									setFormData({ ...formData, excerpt: e.target.value })
								}
							/>
						</div>
					</div>
				)}

				{currentStep === 1 && (
					<div>
						<h3 className="text-lg font-semibold mb-4">Content</h3>
						<div className="space-y-4">
							<textarea
								placeholder="Blog Post Content"
								className="w-full p-3 border rounded-lg h-48"
								value={formData.content || ""}
								onChange={(e) =>
									setFormData({ ...formData, content: e.target.value })
								}
							/>
							<select
								className="w-full p-3 border rounded-lg"
								value={formData.category || ""}
								onChange={(e) =>
									setFormData({ ...formData, category: e.target.value })
								}
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
						<h3 className="text-lg font-semibold mb-4">Review & Submit</h3>
						<div className="bg-gray-50 p-4 rounded-lg">
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
						onClick={handleBack}
						disabled={currentStep === 0}
						className="px-4 py-2 border rounded-lg disabled:opacity-50"
					>
						Back
					</button>
					<button
						onClick={handleNext}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg"
					>
						{currentStep === 2 ? "Complete" : "Next"}
					</button>
				</div>
			</div>
		</div>
	);
}
