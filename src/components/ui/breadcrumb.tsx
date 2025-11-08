"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useResponsive } from "@/hooks/use-responsive";
import { cn } from "@/lib/utils";
import { ariaLabels, focusRingClasses } from "@/lib/utils/accessibility";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";
import type { BreadcrumbItem } from "@/types/layout";
import { TouchTarget } from "./touch-target";

type BreadcrumbProps = {
	items: BreadcrumbItem[];
	className?: string;
};

export function Breadcrumb({ items, className }: BreadcrumbProps) {
	const { isMobile, isTablet } = useResponsive();

	// Limit items on mobile for better UX (use slice to avoid undefined)
	const displayItems = isMobile && items.length > 2 ? items.slice(-2) : items;

	return (
		<nav
			aria-label={ariaLabels.breadcrumbNavigation}
			className={cn(
				"flex items-center",
				// Responsive spacing and text size
				isMobile ? "space-x-0.5 text-xs" : "space-x-1 text-sm",
				className
			)}
		>
			<ol className="flex items-center space-x-1">
				{/* Home link - hide on mobile if we have items */}
				{(!isMobile || items.length === 0) && (
					<li>
						<TouchTarget asChild>
							<Link
								aria-label="Ir al Dashboard"
								className={cn(
									"flex items-center rounded-md text-muted-foreground transition-colors",
									secondaryColorClasses.navHover,
									"hover:text-foreground",
									focusRingClasses.default,
									// Enhanced touch targets
									isMobile ? "min-h-[36px] px-2 py-2" : "px-2 py-1"
								)}
								href="/dashboard"
							>
								<Home
									aria-hidden="true"
									className={cn(isMobile ? "h-4 w-4" : "h-4 w-4")}
								/>
								<span className="sr-only">Dashboard</span>
							</Link>
						</TouchTarget>
					</li>
				)}

				{displayItems.map((item, index) => (
					<li
						className={cn(
							"flex items-center",
							isMobile ? "space-x-0.5" : "space-x-1"
						)}
						key={index}
					>
						<ChevronRight
							className={cn(
								"text-muted-foreground",
								isMobile ? "h-3 w-3" : "h-4 w-4"
							)}
						/>
						{item.href ? (
							<TouchTarget asChild>
								<Link
									className={cn(
										"flex items-center rounded-md text-muted-foreground transition-colors",
										secondaryColorClasses.navHover,
										"hover:text-foreground focus-visible:outline-none",
										secondaryColorClasses.focusRing,
										// Responsive spacing and touch targets
										isMobile
											? "min-h-[36px] space-x-1 px-2 py-2"
											: "space-x-1 px-2 py-1"
									)}
									href={item.href}
								>
									{item.icon && (
										<item.icon
											className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")}
										/>
									)}
									<span className="max-w-[100px] truncate sm:max-w-none">
										{item.label}
									</span>
								</Link>
							</TouchTarget>
						) : (
							<div
								className={cn(
									"flex items-center rounded-md font-medium text-foreground",
									secondaryColorClasses.accent,
									// Responsive spacing
									isMobile ? "space-x-1 px-2 py-2" : "space-x-1 px-2 py-1"
								)}
							>
								{item.icon && (
									<item.icon className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
								)}
								<span className="max-w-[100px] truncate sm:max-w-none">
									{item.label}
								</span>
							</div>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
}
