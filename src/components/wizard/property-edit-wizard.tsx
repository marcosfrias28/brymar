"use client";

import type { PropertyWizardData } from "@/types/property-wizard";

interface PropertyEditWizardProps {
	initialData?: Partial<PropertyWizardData>;
	onComplete?: (data: PropertyWizardData) => void | Promise<void>;
	onSaveDraft?: (
		data: Partial<PropertyWizardData>,
		currentStep: string,
	) => Promise<string>;
}

export function PropertyEditWizard({
	initialData,
	onComplete,
	onSaveDraft,
}: PropertyEditWizardProps) {
	// Placeholder implementation - this should be replaced with actual wizard logic
	return (
		<div className="space-y-6">
			<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
				<p className="text-sm text-yellow-800">
					Property Edit Wizard - Implementation in progress
				</p>
				<pre className="mt-2 text-xs">
					{JSON.stringify({ initialData, hasOnComplete: !!onComplete, hasOnSaveDraft: !!onSaveDraft }, null, 2)}
				</pre>
			</div>
		</div>
	);
}
