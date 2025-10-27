"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
	title: string;
	description?: string;
	children?: ReactNode;
	className?: string;
	breadcrumbs?: any;
	actions?: ReactNode;
	showSearch?: boolean;
	searchPlaceholder?: string;
}

export function PageHeader({
	title,
	description,
	children,
	className,
	breadcrumbs,
	actions,
	showSearch,
	searchPlaceholder,
}: PageHeaderProps) {
	return (
		<div className={cn("flex flex-col space-y-4 pb-6", className)}>
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
					{description && (
						<p className="text-muted-foreground mt-2">{description}</p>
					)}
				</div>
				{children && (
					<div className="flex items-center space-x-2">{children}</div>
				)}
			</div>
		</div>
	);
}
