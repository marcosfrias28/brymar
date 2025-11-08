"use client";

import type { PropertyWizardData } from "@/types/property-wizard";

type PropertyEditWizardProps = {
	initialData?: Partial<PropertyWizardData>;
	onComplete?: (data: PropertyWizardData) => void | Promise<void>;
	onSaveDraft?: (
		data: Partial<PropertyWizardData>,
		currentStep: string
	) => Promise<string>;
};

export function PropertyEditWizard({
	initialData,
	onComplete,
	onSaveDraft,
}: PropertyEditWizardProps) {
	// Placeholder implementation - this should be replaced with actual wizard logic
	return (
		<div className="space-y-6">
			<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
				<p className="text-sm text-yellow-800">
					Property Edit Wizard - Implementation in progress
				</p>
				<pre className="mt-2 text-xs">
					{JSON.stringify(
						{
							initialData,
							hasOnComplete: Boolean(onComplete),
							hasOnSaveDraft: Boolean(onSaveDraft),
						},
						null,
						2
					)}
				</pre>
			</div>
		</div>
	);
}
