"use client";

import { useState } from "react";
import type { Land } from "@/lib/types/lands";

type LandWizardProps = {
	onComplete?: (land: Partial<Land>) => void;
	initialData?: Partial<Land>;
};

export function LandWizard({ onComplete, initialData }: LandWizardProps) {
	const [currentStep, setCurrentStep] = useState(0);
	const [formData, setFormData] = useState<Partial<Land>>(initialData || {});

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
				<h2 className="font-bold text-2xl">Land Wizard</h2>
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
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="Land Name"
								type="text"
								value={formData.name || ""}
							/>
							<textarea
								className="h-32 w-full rounded-lg border p-3"
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								placeholder="Land Description"
								value={formData.description || ""}
							/>
						</div>
					</div>
				)}

				{currentStep === 1 && (
					<div>
						<h3 className="mb-4 font-semibold text-lg">Land Details</h3>
						<div className="space-y-4">
							<input
								className="w-full rounded-lg border p-3"
								onChange={(e) =>
									setFormData({ ...formData, area: Number(e.target.value) })
								}
								placeholder="Area (sq ft)"
								type="number"
								value={formData.area || ""}
							/>
							<input
								className="w-full rounded-lg border p-3"
								onChange={(e) =>
									setFormData({ ...formData, price: Number(e.target.value) })
								}
								placeholder="Price"
								type="number"
								value={formData.price || ""}
							/>
							<select
								className="w-full rounded-lg border p-3"
								onChange={(e) =>
									setFormData({ ...formData, type: e.target.value as any })
								}
								value={formData.type || ""}
							>
								<option value="">Select Land Type</option>
								<option value="residential">Residential</option>
								<option value="commercial">Commercial</option>
								<option value="agricultural">Agricultural</option>
							</select>
						</div>
					</div>
				)}

				{currentStep === 2 && (
					<div>
						<h3 className="mb-4 font-semibold text-lg">Review & Submit</h3>
						<div className="rounded-lg bg-gray-50 p-4">
							<p>
								<strong>Name:</strong> {formData.name}
							</p>
							<p>
								<strong>Area:</strong> {formData.area} sq ft
							</p>
							<p>
								<strong>Price:</strong> ${formData.price}
							</p>
							<p>
								<strong>Type:</strong> {formData.type}
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
