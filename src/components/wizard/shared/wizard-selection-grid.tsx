"use client";

import { Check } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/index";

type SelectionOption = {
	id: string;
	label: string;
	description?: string;
	icon?: React.ReactNode;
	category?: string;
	disabled?: boolean;
};

type WizardSelectionGridProps = {
	options: SelectionOption[];
	selectedValues: string[];
	onSelectionChange: (values: string[]) => void;
	multiSelect?: boolean;
	columns?: 1 | 2 | 3 | 4;
	variant?: "default" | "compact" | "card";
	className?: string;
	showCategories?: boolean;
};

export function WizardSelectionGrid({
	options,
	selectedValues,
	onSelectionChange,
	multiSelect = false,
	columns = 2,
	variant = "default",
	className,
	showCategories = false,
}: WizardSelectionGridProps) {
	const handleSelection = (optionId: string) => {
		if (multiSelect) {
			const newSelection = selectedValues.includes(optionId)
				? selectedValues.filter((id) => id !== optionId)
				: [...selectedValues, optionId];
			onSelectionChange(newSelection);
		} else {
			onSelectionChange([optionId]);
		}
	};

	const gridCols = {
		1: "grid-cols-1",
		2: "grid-cols-1 sm:grid-cols-2",
		3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
		4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
	};

	const variantStyles = {
		default:
			"p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors",
		compact:
			"p-3 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors",
		card: "p-6 rounded-lg border-2 bg-card hover:border-primary/50 hover:bg-accent/30 transition-all",
	};

	// Group options by category if needed
	const groupedOptions = showCategories
		? options.reduce(
				(acc, option) => {
					const category = option.category || "Otros";
					if (!acc[category]) {
						acc[category] = [];
					}
					acc[category].push(option);
					return acc;
				},
				{} as Record<string, SelectionOption[]>
			)
		: { "": options };

	return (
		<div className={cn("space-y-6", className)}>
			{Object.entries(groupedOptions).map(([category, categoryOptions]) => (
				<div className="space-y-3" key={category}>
					{showCategories && category && (
						<div className="flex items-center gap-2">
							<h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
								{category}
							</h4>
							<div className="h-px flex-1 bg-border" />
						</div>
					)}

					<div className={cn("grid gap-3", gridCols[columns])}>
						{categoryOptions.map((option) => {
							const isSelected = selectedValues.includes(option.id);

							return (
								<Button
									className={cn(
										"relative h-auto justify-start text-left",
										variantStyles[variant],
										isSelected && "border-primary bg-primary/10",
										option.disabled && "cursor-not-allowed opacity-50"
									)}
									disabled={option.disabled}
									key={option.id}
									onClick={() => !option.disabled && handleSelection(option.id)}
									variant="ghost"
								>
									<div className="flex w-full items-start gap-3">
										{option.icon && (
											<div
												className={cn(
													"flex h-8 w-8 items-center justify-center rounded-md",
													isSelected
														? "bg-primary text-primary-foreground"
														: "bg-muted"
												)}
											>
												{option.icon}
											</div>
										)}

										<div className="flex-1 space-y-1">
											<div className="flex items-center justify-between">
												<span className="font-medium">{option.label}</span>
												{isSelected && (
													<Check className="h-4 w-4 text-primary" />
												)}
											</div>
											{option.description && (
												<p className="text-muted-foreground text-xs">
													{option.description}
												</p>
											)}
										</div>
									</div>
								</Button>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
}
