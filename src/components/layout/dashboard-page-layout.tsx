"use client";

import { memo, useMemo } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { useResponsive } from "@/hooks/use-responsive";
import { cn } from "@/lib/utils";
import { ariaLabels } from "@/lib/utils/accessibility";
import type { DashboardPageLayoutProps } from "@/types/layout";
import { ContentGrid } from "./content-grid";
import { PageHeader } from "./page-header";

export const DashboardPageLayout = memo(function DashboardPageLayout({
	title,
	description,
	breadcrumbs,
	actions,
	stats,
	statsLoading,
	headerExtras,
	children,
	sidebar,
	className,
	contentClassName,
	showSearch = false,
	searchPlaceholder = "Buscar...",
}: DashboardPageLayoutProps) {
	const { isMobile, isTablet, isMobileOrTablet } = useResponsive();

	// Memoize computed classes to prevent unnecessary recalculations
	const containerClasses = useMemo(
		() =>
			cn(
				"max-w-full flex-1 space-y-4",
				// Mobile-first responsive padding
				"p-3 sm:p-4 md:p-6 lg:p-8",
				// Adjust spacing based on screen size
				isMobile && "space-y-3",
				isTablet && "space-y-4",
				!isMobileOrTablet && "space-y-6"
			),
		[isMobile, isTablet, isMobileOrTablet]
	);

	const mainContentClasses = useMemo(
		() => cn("w-full flex-1", contentClassName),
		[contentClassName]
	);

	return (
		<PageTransition
			className={cn("flex min-h-screen flex-col bg-background", className)}
			variant="fade"
		>
			{/* Skip to main content link for screen readers */}
			<a
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:ring-2 focus:ring-secondary focus:ring-offset-2"
				href="#main-content"
			>
				{ariaLabels.skipToContent}
			</a>

			{/* Page Container with responsive padding */}
			<div className={containerClasses}>
				{/* Page Header */}
				<PageTransition delay={1} variant="slideDown">
					<header>
						<PageHeader
							actions={actions}
							breadcrumbs={breadcrumbs}
							description={description}
							searchPlaceholder={searchPlaceholder}
							showSearch={showSearch}
							stats={stats}
							statsLoading={statsLoading}
							title={title}
						/>
					</header>
				</PageTransition>

				{/* Page Content */}
				<PageTransition delay={2} variant="slideUp">
					{/* Header extras slot */}
					{headerExtras && (
						<section aria-label="Elementos de cabecera" className="mb-6">
							{headerExtras}
						</section>
					)}

					<main
						aria-label={`${title} - Contenido principal`}
						className={mainContentClasses}
						id="main-content"
					>
						<ContentGrid
							layout={sidebar ? "two-column" : "single"}
							sidebar={sidebar}
						>
							{children}
						</ContentGrid>
					</main>
				</PageTransition>
			</div>
		</PageTransition>
	);
});
