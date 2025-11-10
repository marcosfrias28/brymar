import {
	AlertCircle,
	Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/index";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";
import type { WizardStep } from "../types";

// Steps navigation component
type WizardStepsNavigationProps = {
	steps: WizardStep[];
	currentStep: number;
	completedSteps: Set<number>;
	errors: Record<string, Record<string, string>>;
	onStepClick: (index: number) => void;
};

export function WizardStepsNavigation({
	steps,
	currentStep,
	completedSteps,
	errors,
	onStepClick,
}: WizardStepsNavigationProps) {
	const getButtonVariant = (isCurrent: boolean, isCompleted: boolean) => {
		if (isCurrent) {
			return "default";
		}
		if (isCompleted) {
			return "secondary";
		}
		return "outline";
	};

	const getStepIcon = (
		isCompleted: boolean,
		hasErrors: boolean,
		index: number
	) => {
		if (isCompleted) {
			return <Check className="h-4 w-4" />;
		}
		if (hasErrors) {
			return <AlertCircle className="h-4 w-4" />;
		}
		return <span className="text-xs">{index + 1}</span>;
	};

	return (
		<Card className={cn("border-border", secondaryColorClasses.cardHover)}>
			<CardContent className="p-4">
				<div className="flex flex-wrap gap-2">
					{steps.map((step, index) => {
						const isCompleted = completedSteps.has(index);
						const isCurrent = index === currentStep;
						const isAccessible =
							index <= currentStep || completedSteps.has(index - 1);
						const hasErrors =
							errors[index] && Object.keys(errors[index]).length > 0;

						return (
							<Button
								className={cn(
									"flex items-center gap-2",
									hasErrors && "border-destructive text-destructive",
									!isAccessible && "cursor-not-allowed opacity-50"
								)}
								disabled={!isAccessible}
								key={step.id}
								onClick={() => onStepClick(index)}
								size="sm"
								variant={getButtonVariant(isCurrent, isCompleted)}
							>
								{getStepIcon(isCompleted, hasErrors, index)}
								<span className="hidden sm:inline">{step.title}</span>
								{step.optional && (
									<Badge className="ml-1 text-xs" variant="outline">
										Opcional
									</Badge>
								)}
							</Button>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
