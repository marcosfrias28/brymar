"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FilterTab } from "@/types/layout";

type FilterTabsProps = {
	tabs: FilterTab[];
	className?: string;
};

export function FilterTabs({ tabs, className }: FilterTabsProps) {
	if (!tabs || tabs.length === 0) {
		return null;
	}

	return (
		<div className={cn("flex flex-wrap gap-2", className)}>
			{tabs.map((tab) => (
				<Button
					className={cn(
						"flex items-center gap-2 transition-all duration-200",
						tab.active
							? "bg-primary text-primary-foreground shadow-md"
							: "hover:border-secondary/30 hover:bg-secondary/10"
					)}
					key={tab.value}
					onClick={tab.onClick}
					size="sm"
					variant={tab.active ? "default" : "outline"}
				>
					<span>{tab.label}</span>
					{tab.count !== undefined && (
						<Badge
							className={cn(
								"ml-1 text-xs",
								tab.active
									? "bg-primary-foreground/20 text-primary-foreground"
									: "bg-muted text-muted-foreground"
							)}
							variant={tab.active ? "secondary" : "outline"}
						>
							{tab.count}
						</Badge>
					)}
				</Button>
			))}
		</div>
	);
}
