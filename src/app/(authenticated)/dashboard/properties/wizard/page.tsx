"use client";

import { PropertyWizard } from "@/components/wizard";
import { toast } from "@/hooks/use-toast";
import type { PropertyWizardData } from "@/types/property-wizard";

export default function PropertyWizardPage() {
	const handleComplete = () => {
		// Property creation is handled by the PropertyWizard component
		toast({ title: "Property creation completed!" });
	};

	const _handleSaveDraft = (
		_data: Partial<PropertyWizardData>,
		_currentStep: string
	) => {
		// This will be implemented in future tasks
		return "draft-id-placeholder";
	};

	return (
		<div className="container mx-auto py-8">
			<PropertyWizard onComplete={handleComplete} />
		</div>
	);
}
