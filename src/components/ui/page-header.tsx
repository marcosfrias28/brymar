"use client";

import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { useResponsive } from "@/hooks/use-responsive";
import { cn } from "@/lib/utils";
import { ariaLabels, focusRingClasses } from "@/lib/utils/accessibility";
import type { PageHeaderProps } from "@/types/layout";
import { Breadcrumb } from "./breadcrumb";
import { TouchTarget } from "./touch-target";

export function PageHeader({
	title,
	description,
	breadcrumbs,
	actions,
	showSearch = false,
	searchPlaceholder = "Buscar...",
	className,
}: PageHeaderProps) {
	const autoBreadcrumbs = useBreadcrumbs();
	const displayBreadcrumbs = breadcrumbs || autoBreadcrumbs;
	const { isMobile, isTablet, isMobileOrTablet } = useResponsive();

	return (
		<div
			className={cn(
				"border-border/40 border-b",
				// Responsive spacing and padding
				isMobile
					? "space-y-3 pb-4"
					: isTablet
						? "space-y-3 pb-5"
						: "space-y-4 pb-6",
				className
			)}
		>
			{/* Breadcrumbs */}
			{displayBreadcrumbs.length > 0 && (
				<Breadcrumb items={displayBreadcrumbs} />
			)}

			{/* Header Content */}
			<div
				className={cn(
					"flex flex-col gap-3 sm:gap-4",
					// Better responsive layout
					isMobileOrTablet
						? "space-y-3"
						: "sm:flex-row sm:items-start sm:justify-between"
				)}
			>
				<div className={cn("flex-1", isMobile ? "space-y-1" : "space-y-2")}>
					<h1
						className={cn(
							"font-bold font-serif text-foreground tracking-tight",
							// Responsive title sizing
							isMobile
								? "text-2xl"
								: isTablet
									? "text-2xl sm:text-3xl"
									: "text-3xl"
						)}
					>
						{title}
					</h1>
					{description && (
						<p
							className={cn(
								"max-w-2xl text-muted-foreground leading-relaxed",
								// Responsive description sizing
								isMobile ? "text-sm" : "text-base"
							)}
						>
							{description}
						</p>
					)}
				</div>

				{/* Actions Area */}
				{actions && (
					<div
						className={cn(
							"flex flex-shrink-0 items-center",
							// Better mobile layout for actions
							isMobileOrTablet ? "flex-wrap gap-2" : "gap-2",
							// Full width on mobile for better touch targets
							isMobile && "w-full justify-start"
						)}
					>
						<TouchTarget asChild>{actions}</TouchTarget>
					</div>
				)}
			</div>

			{/* Search Bar (if enabled) */}
			{showSearch && (
				<div className={cn(isMobile ? "w-full" : "max-w-md")}>
					<label className="sr-only" htmlFor="page-search">
						{ariaLabels.search}
					</label>
					<TouchTarget asChild>
						<input
							aria-label={ariaLabels.search}
							className={cn(
								"w-full rounded-md border border-input bg-background placeholder:text-muted-foreground",
								focusRingClasses.input,
								"transition-colors duration-200",
								// Enhanced touch targets
								isMobile ? "px-4 py-3 text-base" : "px-3 py-2 text-sm",
								// Prevent zoom on iOS
								"text-[16px] sm:text-sm"
							)}
							id="page-search"
							placeholder={searchPlaceholder}
							type="search"
						/>
					</TouchTarget>
				</div>
			)}
		</div>
	);
}
