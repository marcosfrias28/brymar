import {
	AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/index";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";
import type { WizardStep } from "../types";

// Current step component
type WizardCurrentStepProps<T extends Record<string, unknown>> = {
	step: WizardStep<T>;
	data: T;
	errors: Record<string, string>;
	onChange: (data: Partial<T>) => void;
};

export function WizardCurrentStep<T extends Record<string, unknown>>({
	step,
	data,
	errors,
	onChange,
}: WizardCurrentStepProps<T>) {
	const hasStepErrors = Object.keys(errors).length > 0;

	return (
		<Card className={cn("border-border", secondaryColorClasses.cardHover)}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{step.title}
					{step.optional && (
						<Badge className="text-xs" variant="outline">
							Opcional
						</Badge>
					)}
				</CardTitle>
				{step.description && (
					<p className="text-muted-foreground">{step.description}</p>
				)}
				{hasStepErrors && (
					<div className="flex items-center gap-2 text-destructive text-sm">
						<AlertCircle className="h-4 w-4" />
						<span>Hay errores en este paso que necesitan ser corregidos</span>
					</div>
				)}
			</CardHeader>
			<CardContent>
				<step.component data={data} errors={errors} onChange={onChange} />
			</CardContent>
		</Card>
	);
}
