"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StatCard } from "@/types/layout";

type StatsCardsProps = {
	stats: StatCard[];
	isLoading?: boolean;
	className?: string;
	gridCols?: {
		default?: string;
		sm?: string;
		md?: string;
		lg?: string;
		xl?: string;
	};
};

export function StatsCards({
	stats,
	isLoading = false,
	className = "",
	gridCols = {
		default: "2",
		sm: "2",
		md: "3",
		lg: "4",
	},
}: StatsCardsProps) {
	const gridClasses = cn(
		"grid gap-4",
		`grid-cols-${gridCols.default || "2"}`,
		gridCols.sm && `sm:grid-cols-${gridCols.sm}`,
		gridCols.md && `md:grid-cols-${gridCols.md}`,
		gridCols.lg && `lg:grid-cols-${gridCols.lg}`,
		gridCols.xl && `xl:grid-cols-${gridCols.xl}`,
		className
	);

	if (isLoading) {
		return (
			<div className={gridClasses}>
				{[1, 2, 3, 4].map((index) => (
					<Card className="border-border shadow-lg" key={index}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<div className="h-4 w-20 animate-pulse rounded bg-muted" />
							<div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
						</CardHeader>
						<CardContent>
							<div className="mb-2 h-8 w-16 animate-pulse rounded bg-muted" />
							<div className="h-3 w-24 animate-pulse rounded bg-muted" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className={gridClasses}>
			{stats.map((stat, index) => (
				<StatCard key={index} stat={stat} />
			))}
		</div>
	);
}

type StatCardProps = {
	stat: StatCard;
};

function StatCard({ stat }: StatCardProps) {
	const {
		title,
		value,
		change,
		icon: Icon,
		color = "bg-primary",
		description,
	} = stat;

	return (
		<Card className="border-border shadow-lg transition-all duration-200 hover:border-secondary/20 hover:shadow-xl">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-medium text-muted-foreground text-sm">
					{title}
				</CardTitle>
				<div className={cn("rounded-lg p-2", color)}>
					<Icon className="h-4 w-4 text-white" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="font-bold text-2xl text-foreground">{value}</div>
				{change && (
					<p className="mt-1 text-muted-foreground text-xs">
						<span className="rounded-full bg-secondary/20 px-1.5 py-0.5 font-medium text-secondary-foreground">
							{change}
						</span>{" "}
						{description || "desde el mes pasado"}
					</p>
				)}
			</CardContent>
		</Card>
	);
}

export default StatsCards;
