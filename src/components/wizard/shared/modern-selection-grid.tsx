"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Search } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils/index";

export type SelectionOption = {
	id: string;
	label: string;
	description?: string;
	icon?: React.ReactNode;
	category?: string;
	disabled?: boolean;
	badge?: string;
};

type ModernSelectionGridProps = {
	options: SelectionOption[];
	value?: string | string[];
	onChange: (value: string | string[]) => void;
	mode?: "single" | "multiple";
	columns?: 1 | 2 | 3 | 4;
	variant?: "default" | "cards" | "compact";
	searchable?: boolean;
	showCategories?: boolean;
	className?: string;
	emptyMessage?: string;
};

export function ModernSelectionGrid({
	options,
	value,
	onChange,
	mode = "single",
	columns = 2,
	variant = "default",
	searchable = false,
	showCategories = false,
	className,
	emptyMessage = "Nessuna opzione disponibile",
}: ModernSelectionGridProps) {
	const [searchQuery, setSearchQuery] = React.useState("");

	// Normalize value to array for easier handling
	const selectedValues = React.useMemo(() => {
		if (mode === "single") {
			return value ? [value as string] : [];
		}
		return (value as string[]) || [];
	}, [value, mode]);

	// Filter options based on search query
	const filteredOptions = React.useMemo(() => {
		if (!searchQuery) {
			return options;
		}

		const query = searchQuery.toLowerCase();
		return options.filter(
			(option) =>
				option.label.toLowerCase().includes(query) ||
				option.description?.toLowerCase().includes(query) ||
				option.category?.toLowerCase().includes(query)
		);
	}, [options, searchQuery]);

	// Group options by category if needed
	const groupedOptions = React.useMemo(() => {
		if (!showCategories) {
			return { "": filteredOptions };
		}

		return filteredOptions.reduce(
			(acc, option) => {
				const category = option.category || "Otros";
				if (!acc[category]) {
					acc[category] = [];
				}
				acc[category].push(option);
				return acc;
			},
			{} as Record<string, SelectionOption[]>
		);
	}, [filteredOptions, showCategories]);

	const handleSelectionChange = (optionId: string) => {
		if (mode === "single") {
			onChange(optionId);
		} else {
			const newSelection = selectedValues.includes(optionId)
				? selectedValues.filter((id) => id !== optionId)
				: [...selectedValues, optionId];
			onChange(newSelection);
		}
	};

	const gridCols = {
		1: "grid-cols-1",
		2: "grid-cols-1 sm:grid-cols-2",
		3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
		4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
	};

	// Render single selection with RadioGroup
	if (mode === "single" && variant === "default") {
		return (
			<div className={cn("space-y-4", className)}>
				{searchable && (
					<div className="relative">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
						<Input
							className="pl-9"
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Buscar..."
							type="text"
							value={searchQuery}
						/>
					</div>
				)}

				{Object.keys(groupedOptions).length === 0 ? (
					<p className="py-8 text-center text-muted-foreground text-sm">
						{emptyMessage}
					</p>
				) : (
					Object.entries(groupedOptions).map(([category, categoryOptions]) => (
						<div className="space-y-3" key={category}>
							{showCategories && category && (
								<h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
									{category}
								</h4>
							)}

							<RadioGroup
								className="space-y-2"
								onValueChange={handleSelectionChange}
								value={selectedValues[0] || ""}
							>
								{categoryOptions.map((option) => (
									<div
										className={cn(
											"flex items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-accent/50",
											selectedValues.includes(option.id) &&
												"border-primary bg-primary/5",
											option.disabled && "cursor-not-allowed opacity-50"
										)}
										key={option.id}
									>
										<RadioGroupItem
											className="mt-1"
											disabled={option.disabled}
											id={option.id}
											value={option.id}
										/>
										<div className="flex-1 space-y-1">
											<Label
												className={cn(
													"flex cursor-pointer items-center gap-2 font-medium",
													option.disabled && "cursor-not-allowed"
												)}
												htmlFor={option.id}
											>
												{option.icon && (
													<span className="shrink-0">{option.icon}</span>
												)}
												{option.label}
												{option.badge && (
													<Badge className="text-xs" variant="secondary">
														{option.badge}
													</Badge>
												)}
											</Label>
											{option.description && (
												<p className="text-muted-foreground text-sm leading-relaxed">
													{option.description}
												</p>
											)}
										</div>
									</div>
								))}
							</RadioGroup>
						</div>
					))
				)}
			</div>
		);
	}

	// Render multiple selection or card variants
	return (
		<div className={cn("space-y-4", className)}>
			{searchable && (
				<div className="relative">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
					<Input
						className="pl-9"
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Buscar..."
						type="text"
						value={searchQuery}
					/>
				</div>
			)}

			{Object.keys(groupedOptions).length === 0 ? (
				<p className="py-8 text-center text-muted-foreground text-sm">
					{emptyMessage}
				</p>
			) : (
				Object.entries(groupedOptions).map(([category, categoryOptions]) => (
					<div className="space-y-3" key={category}>
						{showCategories && category && (
							<div className="flex items-center gap-3">
								<h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
									{category}
								</h4>
								<div className="h-px flex-1 bg-border" />
							</div>
						)}

						<div className={cn("grid gap-3", gridCols[columns])}>
							<AnimatePresence mode="popLayout">
								{categoryOptions.map((option) => {
									const isSelected = selectedValues.includes(option.id);

									if (variant === "cards") {
										return (
											<motion.div
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.95 }}
												initial={{ opacity: 0, scale: 0.95 }}
												key={option.id}
												layout
												transition={{ duration: 0.2 }}
											>
												<Card
													className={cn(
														"relative cursor-pointer p-4 transition-all hover:shadow-md",
														isSelected &&
															"border-primary bg-primary/5 shadow-sm",
														option.disabled && "cursor-not-allowed opacity-50"
													)}
													onClick={() =>
														!option.disabled && handleSelectionChange(option.id)
													}
												>
													<div className="flex items-start gap-3">
														{mode === "multiple" && (
															<Checkbox
																checked={isSelected}
																className="mt-1"
																disabled={option.disabled}
															/>
														)}

														{option.icon && (
															<div
																className={cn(
																	"flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
																	isSelected
																		? "bg-primary text-primary-foreground"
																		: "bg-muted"
																)}
															>
																{option.icon}
															</div>
														)}

														<div className="flex-1 space-y-1">
															<div className="flex items-center justify-between gap-2">
																<Label
																	className={cn(
																		"cursor-pointer font-medium",
																		option.disabled && "cursor-not-allowed"
																	)}
																>
																	{option.label}
																</Label>
																{isSelected && mode === "single" && (
																	<Check className="h-4 w-4 text-primary" />
																)}
															</div>
															{option.badge && (
																<Badge className="text-xs" variant="secondary">
																	{option.badge}
																</Badge>
															)}
															{option.description && (
																<p className="text-muted-foreground text-xs leading-relaxed">
																	{option.description}
																</p>
															)}
														</div>
													</div>
												</Card>
											</motion.div>
										);
									}

									// Compact variant
									return (
										<motion.div
											animate={{ opacity: 1, scale: 1 }}
											className={cn(
												"flex items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-accent/50",
												isSelected && "border-primary bg-primary/5",
												option.disabled && "cursor-not-allowed opacity-50"
											)}
											exit={{ opacity: 0, scale: 0.95 }}
											initial={{ opacity: 0, scale: 0.95 }}
											key={option.id}
											layout
											onClick={() =>
												!option.disabled && handleSelectionChange(option.id)
											}
											transition={{ duration: 0.2 }}
										>
											{mode === "multiple" ? (
												<Checkbox
													checked={isSelected}
													disabled={option.disabled}
													id={option.id}
												/>
											) : (
												<RadioGroupItem
													disabled={option.disabled}
													id={option.id}
													value={option.id}
												/>
											)}

											<div className="flex-1 space-y-0.5">
												<Label
													className={cn(
														"flex cursor-pointer items-center gap-2 font-medium text-sm",
														option.disabled && "cursor-not-allowed"
													)}
													htmlFor={option.id}
												>
													{option.icon && (
														<span className="shrink-0">{option.icon}</span>
													)}
													{option.label}
													{option.badge && (
														<Badge className="text-xs" variant="outline">
															{option.badge}
														</Badge>
													)}
												</Label>
												{option.description && (
													<p className="text-muted-foreground text-xs">
														{option.description}
													</p>
												)}
											</div>

											{isSelected && mode === "single" && (
												<Check className="h-4 w-4 shrink-0 text-primary" />
											)}
										</motion.div>
									);
								})}
							</AnimatePresence>
						</div>
					</div>
				))
			)}
		</div>
	);
}
