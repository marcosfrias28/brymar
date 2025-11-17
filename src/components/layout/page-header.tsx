"use client";

import { UnifiedStatsCards } from "@/components/dashboard";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { UnifiedSearchBar } from "@/components/dashboard/unified-search-bar";
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
	searchValue,
	onSearchChange,
	stats,
	statsLoading,
}: PageHeaderProps & { children?: ReactNode }) {
	return (
		<div className={cn("flex flex-col space-y-4 pb-6", className)}>
			{breadcrumbs && breadcrumbs.length > 0 && (
				<Breadcrumb items={breadcrumbs} />
			)}
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
			{showSearch && (
				<div className="mt-2">
					<UnifiedSearchBar
						onChange={onSearchChange ?? (() => null)}
						placeholder={searchPlaceholder}
						value={searchValue ?? ""}
					/>
				</div>
			)}
			{/* Stats rendered within the header when provided */}
			{stats && stats.length > 0 && (
				<div className="mt-4">
					<UnifiedStatsCards loading={Boolean(statsLoading)} stats={stats} />
				</div>
			)}
		</div>
	);
}
