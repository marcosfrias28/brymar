"use client";

import { useResponsive } from "@/hooks/use-responsive";
import { cn } from "@/lib/utils";
import type { ContentGridProps } from "@/types/layout";

export function ContentGrid({
	children,
	layout = "single",
	sidebar,
	className,
}: ContentGridProps) {
	const { isMobile, isTablet, isMobileOrTablet } = useResponsive();

	const getGridClasses = () => {
		// Responsive gap sizing
		const gapClass = isMobile ? "gap-3" : isTablet ? "gap-4" : "gap-6";

		switch (layout) {
			case "two-column":
				return sidebar
					? `grid grid-cols-1 lg:grid-cols-4 ${gapClass} w-full`
					: `grid grid-cols-1 md:grid-cols-2 ${gapClass} w-full`;
			case "three-column":
				// Better tablet behavior for three-column
				return `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${gapClass} w-full`;
			case "grid":
				// Enhanced responsive grid with better tablet breakpoints
				return `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${gapClass} w-full`;
			default:
				return sidebar
					? `grid grid-cols-1 lg:grid-cols-4 ${gapClass} w-full`
					: `space-y-${isMobile ? "3" : isTablet ? "4" : "6"} w-full`;
		}
	};

	// Single column layout without sidebar
	if (layout === "single" && !sidebar) {
		return (
			<div
				className={cn(
					"w-full max-w-full",
					isMobile ? "space-y-3" : isTablet ? "space-y-4" : "space-y-6",
					className,
				)}
			>
				{children}
			</div>
		);
	}

	return (
		<div className={cn(getGridClasses(), "max-w-full", className)}>
			<div
				className={cn(
					sidebar ? "lg:col-span-3" : "col-span-full",
					layout === "single"
						? isMobile
							? "space-y-3"
							: isTablet
								? "space-y-4"
								: "space-y-6"
						: "",
					"min-w-0 w-full",
				)}
			>
				{children}
			</div>

			{sidebar && (
				<div
					className={cn(
						"lg:col-span-1 min-w-0",
						// On mobile/tablet, sidebar goes below content
						isMobileOrTablet && "order-last mt-4 lg:mt-0 lg:order-none",
					)}
				>
					<div
						className={cn(
							// Sticky behavior only on desktop
							!isMobileOrTablet && "sticky top-6",
						)}
					>
						{sidebar}
					</div>
				</div>
			)}
		</div>
	);
}
