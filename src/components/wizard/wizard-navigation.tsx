"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";

type WizardNavigationProps = {
	currentStep: number;
	totalSteps: number;
	onPrevious: () => void;
	onNext: () => void;
	onSaveDraft?: () => Promise<void>;
	showDraftOption?: boolean;
	isSaving?: boolean;
};

export function WizardNavigation({
	currentStep,
	totalSteps,
	onPrevious,
	onNext,
	onSaveDraft,
	showDraftOption = true,
	isSaving = false,
}: WizardNavigationProps) {
	const handleSaveDraft = async () => {
		if (onSaveDraft) {
			await onSaveDraft();
		}
	};

	return (
		<Card>
			<CardContent>
				<div className="flex justify-between items-center pt-6">
					<div className="flex gap-2">
						<Button
							onClick={onPrevious}
							disabled={currentStep === 0}
							variant="outline"
						>
							<ChevronLeft className="h-4 mr-2 w-4" />
							Anterior
						</Button>
						{showDraftOption && onSaveDraft && (
							<Button
								onClick={handleSaveDraft}
								disabled={isSaving}
								variant="outline"
								size="sm"
							>
								<Save className="h-3 mr-2 w-3" />
								{isSaving ? "Guardando..." : "Guardar Borrador"}
							</Button>
						)}
					</div>
					<Button onClick={onNext}>
						{currentStep === totalSteps - 1 ? (
							"Finalizar"
						) : (
							<>
								Siguiente
								<ChevronRight className="h-4 ml-2 w-4" />
							</>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
