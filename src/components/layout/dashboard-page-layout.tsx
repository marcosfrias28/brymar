"use client";

import { cn } from "@/lib/utils";
import { ariaLabels } from "@/lib/utils/accessibility";
import type { DashboardPageLayoutProps } from "@/types/layout";
import { ContentGrid } from "./content-grid";
import { PageHeader } from "./page-header";

export function DashboardPageLayout({
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
	return (
		<div className={cn("flex min-h-screen flex-col bg-background", className)}>
			{/* Skip to main content link for screen readers */}
			<a
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:ring-2 focus:ring-secondary focus:ring-offset-2"
				href="#main-content"
			>
				{ariaLabels.skipToContent}
			</a>

			{/* Page Container with responsive padding */}
			<div className="max-w-full flex-1 space-y-4 p-3 sm:space-y-4 sm:p-4 lg:space-y-6 lg:p-8 xl:p-6">
				{/* Page Header */}
				<div>
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
				</div>

				{/* Page Content */}
				<div>
					{/* Header extras slot */}
					{headerExtras && (
						<section aria-label="Header elements" className="mb-6">
							{headerExtras}
						</section>
					)}

					<main
						aria-label={`${title} - Main content`}
						className={cn("w-full flex-1", contentClassName)}
						id="main-content"
					>
						<ContentGrid
							layout={sidebar ? "two-column" : "single"}
							sidebar={sidebar}
						>
							{children}
						</ContentGrid>
					</main>
				</div>
			</div>
		</div>
	);
}
