import {
	Check,
	ChevronLeft,
	ChevronRight,
	Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/index";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

// Navigation component
interface WizardNavigationProps {
	isFirstStep: boolean;
	isLastStep: boolean;
	isLoading: boolean;
	showDraftOption: boolean;
	onPrevious: () => void;
	onNext: () => void;
	onComplete: () => void;
	onSaveDraft?: () => void;
}

export function WizardNavigation({
	isFirstStep,
	isLastStep,
	isLoading,
	showDraftOption,
	onPrevious,
	onNext,
	onComplete,
	onSaveDraft,
}: WizardNavigationProps) {
	return (
		<Card className={cn("border-border", secondaryColorClasses.cardHover)}>
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<Button
						className="flex items-center gap-2"
						disabled={isFirstStep || isLoading}
						onClick={onPrevious}
						variant="outline"
					>
						<ChevronLeft className="h-4 w-4" />
						Anterior
					</Button>

					<div className="flex items-center gap-2">
						{showDraftOption && onSaveDraft && (
							<Button
								className="flex items-center gap-2"
								disabled={isLoading}
								onClick={onSaveDraft}
								variant="outline"
							>
								<Save className="h-4 w-4" />
								Guardar Borrador
							</Button>
						)}

						{isLastStep ? (
							<Button
								className="flex items-center gap-2"
								disabled={isLoading}
								onClick={onComplete}
							>
								<Check className="h-4 w-4" />
								{isLoading ? "Completando..." : "Completar"}
							</Button>
						) : (
							<Button
								className="flex items-center gap-2"
								disabled={isLoading}
								onClick={onNext}
							>
								Siguiente
								<ChevronRight className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
