"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const PROGRESS_MULTIPLIER = 100;

type WizardProgressProps = {
	currentStep: number;
	totalSteps: number;
	title: string;
};

export function WizardProgress({
	currentStep,
	totalSteps,
	title,
}: WizardProgressProps) {
	const progressPercentage = ((currentStep + 1) / totalSteps) * PROGRESS_MULTIPLIER;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>{title}</span>
					<div className="flex items-center gap-2">
						<Badge variant="outline">
							{currentStep + 1} de {totalSteps}
						</Badge>
						<span className="font-normal text-sm text-muted-foreground">
							{Math.round(progressPercentage)}% completado
						</span>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Progress className="h-2" value={progressPercentage} />
			</CardContent>
		</Card>
	);
}
