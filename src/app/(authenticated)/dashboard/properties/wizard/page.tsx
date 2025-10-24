"use client";

import { PropertyWizard } from "@/components/wizard";
import type { PropertyWizardData } from "@/types/property-wizard";

export default function PropertyWizardPage() {
	const handleComplete = async (data: PropertyWizardData) => {
		console.log("Property completed:", data);
		// This will be implemented in future tasks
		alert("Property creation completed! (Implementation pending)");
	};

	const handleSaveDraft = async (
		data: Partial<PropertyWizardData>,
		currentStep: string,
	) => {
		console.log("Draft saved:", data, "Step:", currentStep);
		// This will be implemented in future tasks
		return "draft-id-placeholder";
	};

	return (
		<div className="container mx-auto py-8">
			<PropertyWizard
				onComplete={handleComplete}
				onSaveDraft={handleSaveDraft}
			/>
		</div>
	);
}
