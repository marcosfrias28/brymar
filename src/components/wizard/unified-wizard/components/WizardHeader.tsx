import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/index";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";
import type { WizardStep } from "../types";

// Header component
type WizardHeaderProps = {
	title: string;
	description?: string;
	currentStep: number;
	steps: WizardStep[];
	completedSteps: Set<number>;
	overallProgress: number;
};

export function WizardHeader({
	title,
	description,
	currentStep,
	steps,
	completedSteps,
	overallProgress,
}: WizardHeaderProps) {
	return (
		<Card className={cn("border-border", secondaryColorClasses.cardHover)}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-2xl">{title}</CardTitle>
						{description && (
							<p className="mt-1 text-muted-foreground">{description}</p>
						)}
					</div>
					<Badge className="text-sm" variant="outline">
						Paso {currentStep + 1} de {steps.length}
					</Badge>
				</div>

				<div className="space-y-2">
					<Progress className="h-2" value={overallProgress} />
					<div className="flex justify-between text-muted-foreground text-xs">
						<span>Progreso: {Math.round(overallProgress)}%</span>
						<span>
							{completedSteps.size} de {steps.length} completados
						</span>
					</div>
				</div>
			</CardHeader>
		</Card>
	);
}
