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
import { cn } from "@/lib/utils";

export interface SelectionOption {
	id: string;
	label: string;
	description?: string;
	icon?: React.ReactNode;
	category?: string;
	disabled?: boolean;
	badge?: string;
}

interface ModernSelectionGridProps {
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
}

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
		if (!searchQuery) return options;

		const query = searchQuery.toLowerCase();
		return options.filter(
			(option) =>
				option.label.toLowerCase().includes(query) ||
				option.description?.toLowerCase().includes(query) ||
				option.category?.toLowerCase().includes(query),
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
				if (!acc[category]) acc[category] = [];
				acc[category].push(option);
				return acc;
			},
			{} as Record<string, SelectionOption[]>,
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
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Buscar..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
				)}

				{Object.keys(groupedOptions).length === 0 ? (
					<p className="text-sm text-muted-foreground text-center py-8">
						{emptyMessage}
					</p>
				) : (
					Object.entries(groupedOptions).map(([category, categoryOptions]) => (
						<div key={category} className="space-y-3">
							{showCategories && category && (
								<h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
									{category}
								</h4>
							)}

							<RadioGroup
								value={selectedValues[0] || ""}
								onValueChange={handleSelectionChange}
								className="space-y-2"
							>
								{categoryOptions.map((option) => (
									<div
										key={option.id}
										className={cn(
											"flex items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-accent/50",
											selectedValues.includes(option.id) &&
												"border-primary bg-primary/5",
											option.disabled && "opacity-50 cursor-not-allowed",
										)}
									>
										<RadioGroupItem
											value={option.id}
											id={option.id}
											disabled={option.disabled}
											className="mt-1"
										/>
										<div className="flex-1 space-y-1">
											<Label
												htmlFor={option.id}
												className={cn(
													"flex items-center gap-2 font-medium cursor-pointer",
													option.disabled && "cursor-not-allowed",
												)}
											>
												{option.icon && (
													<span className="shrink-0">{option.icon}</span>
												)}
												{option.label}
												{option.badge && (
													<Badge variant="secondary" className="text-xs">
														{option.badge}
													</Badge>
												)}
											</Label>
											{option.description && (
												<p className="text-sm text-muted-foreground leading-relaxed">
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
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Buscar..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
			)}

			{Object.keys(groupedOptions).length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-8">
					{emptyMessage}
				</p>
			) : (
				Object.entries(groupedOptions).map(([category, categoryOptions]) => (
					<div key={category} className="space-y-3">
						{showCategories && category && (
							<div className="flex items-center gap-3">
								<h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
									{category}
								</h4>
								<div className="flex-1 h-px bg-border" />
							</div>
						)}

						<div className={cn("grid gap-3", gridCols[columns])}>
							<AnimatePresence mode="popLayout">
								{categoryOptions.map((option) => {
									const isSelected = selectedValues.includes(option.id);

									if (variant === "cards") {
										return (
											<motion.div
												key={option.id}
												layout
												initial={{ opacity: 0, scale: 0.95 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.95 }}
												transition={{ duration: 0.2 }}
											>
												<Card
													className={cn(
														"relative p-4 cursor-pointer transition-all hover:shadow-md",
														isSelected &&
															"border-primary bg-primary/5 shadow-sm",
														option.disabled && "opacity-50 cursor-not-allowed",
													)}
													onClick={() =>
														!option.disabled && handleSelectionChange(option.id)
													}
												>
													<div className="flex items-start gap-3">
														{mode === "multiple" && (
															<Checkbox
																checked={isSelected}
																disabled={option.disabled}
																className="mt-1"
															/>
														)}

														{option.icon && (
															<div
																className={cn(
																	"flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
																	isSelected
																		? "bg-primary text-primary-foreground"
																		: "bg-muted",
																)}
															>
																{option.icon}
															</div>
														)}

														<div className="flex-1 space-y-1">
															<div className="flex items-center justify-between gap-2">
																<Label
																	className={cn(
																		"font-medium cursor-pointer",
																		option.disabled && "cursor-not-allowed",
																	)}
																>
																	{option.label}
																</Label>
																{isSelected && mode === "single" && (
																	<Check className="h-4 w-4 text-primary" />
																)}
															</div>
															{option.badge && (
																<Badge variant="secondary" className="text-xs">
																	{option.badge}
																</Badge>
															)}
															{option.description && (
																<p className="text-xs text-muted-foreground leading-relaxed">
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
											key={option.id}
											layout
											initial={{ opacity: 0, scale: 0.95 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.95 }}
											transition={{ duration: 0.2 }}
											className={cn(
												"flex items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-accent/50",
												isSelected && "border-primary bg-primary/5",
												option.disabled && "opacity-50 cursor-not-allowed",
											)}
											onClick={() =>
												!option.disabled && handleSelectionChange(option.id)
											}
										>
											{mode === "multiple" ? (
												<Checkbox
													id={option.id}
													checked={isSelected}
													disabled={option.disabled}
												/>
											) : (
												<RadioGroupItem
													value={option.id}
													id={option.id}
													disabled={option.disabled}
												/>
											)}

											<div className="flex-1 space-y-0.5">
												<Label
													htmlFor={option.id}
													className={cn(
														"flex items-center gap-2 text-sm font-medium cursor-pointer",
														option.disabled && "cursor-not-allowed",
													)}
												>
													{option.icon && (
														<span className="shrink-0">{option.icon}</span>
													)}
													{option.label}
													{option.badge && (
														<Badge variant="outline" className="text-xs">
															{option.badge}
														</Badge>
													)}
												</Label>
												{option.description && (
													<p className="text-xs text-muted-foreground">
														{option.description}
													</p>
												)}
											</div>

											{isSelected && mode === "single" && (
												<Check className="h-4 w-4 text-primary shrink-0" />
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
