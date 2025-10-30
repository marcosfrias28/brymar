"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LandType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
	badgeVariants,
	interactiveClasses,
	secondaryColorClasses,
} from "@/lib/utils/secondary-colors";

type LandFiltersProps = {
	currentFilter: "all" | LandType;
	onFilterChange: (filter: "all" | LandType) => void;
	totalCount?: number;
};

export function LandFilters({
	currentFilter,
	onFilterChange,
	totalCount = 0,
}: LandFiltersProps) {
	const filters = [
		{
			label: "Todos",
			value: "all" as const,
			count: totalCount,
		},
		{
			label: "Comerciales",
			value: "commercial" as const,
			count: 0, // This would be calculated from actual data
		},
		{
			label: "Residenciales",
			value: "residential" as const,
			count: 0, // This would be calculated from actual data
		},
		{
			label: "Agrícolas",
			value: "agricultural" as const,
			count: 0, // This would be calculated from actual data
		},
		{
			label: "Industriales",
			value: "industrial" as const,
			count: 0, // This would be calculated from actual data
		},
		{
			label: "Recreativos",
			value: "recreational" as const,
			count: 0, // This would be calculated from actual data
		},
		{
			label: "Uso Mixto",
			value: "mixed-use" as const,
			count: 0, // This would be calculated from actual data
		},
	];

	return (
		<div className="flex flex-wrap gap-2">
			{filters.map((filter) => {
				const isActive = currentFilter === filter.value;
				return (
					<Button
						className={cn(
							"transition-all duration-200",
							isActive
								? cn(
										"bg-arsenic text-white hover:bg-blackCoral",
										secondaryColorClasses.focusRing
									)
								: cn(
										"border-blackCoral/30 text-blackCoral hover:bg-blackCoral hover:text-white",
										secondaryColorClasses.accentHover,
										interactiveClasses.button
									)
						)}
						key={filter.value}
						onClick={() => onFilterChange(filter.value)}
						size="sm"
						variant={isActive ? "default" : "outline"}
					>
						{filter.label}
						{filter.count > 0 && (
							<Badge
								className={cn(
									"ml-2 text-xs",
									isActive
										? "bg-white/20 text-white"
										: badgeVariants.secondarySubtle
								)}
								variant="secondary"
							>
								{filter.count}
							</Badge>
						)}
					</Button>
				);
			})}
		</div>
	);
}
