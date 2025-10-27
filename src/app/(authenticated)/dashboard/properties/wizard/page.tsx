"use client";

import { PropertyWizard } from "@/components/wizard";
import type { PropertyWizardData } from "@/types/property-wizard";

export default function PropertyWizardPage() {
	const handleComplete = async () => {
		// Property creation is handled by the PropertyWizard component
		alert("Property creation completed!");
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
			/>
		</div>
	);
}
