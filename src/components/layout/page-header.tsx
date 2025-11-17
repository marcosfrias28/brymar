"use client";

import { UnifiedStatsCards } from "@/components/dashboard";
import { cn } from "@/lib/utils";
import type { PageHeaderProps } from "@/types/layout";
import type { ReactNode } from "react";

export function PageHeader({
	title,
	description,
	children,
	className,
	breadcrumbs,
	actions,
	showSearch,
	searchPlaceholder,
	stats,
	statsLoading,
}: PageHeaderProps & { children?: ReactNode }) {
	return (
		<div className={cn("flex flex-col space-y-4 pb-6", className)}>
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">{title}</h1>
					{description && (
						<p className="mt-2 text-muted-foreground">{description}</p>
					)}
				</div>
				<div className="flex items-center space-x-2">
					{actions}
					{children}
				</div>
			</div>
			{/* Stats rendered within the header when provided */}
			{stats && stats.length > 0 && (
				<div className="mt-4">
					<UnifiedStatsCards loading={Boolean(statsLoading)} stats={stats} />
				</div>
			)}
		</div>
	);
}
