"use client";

import type React from "react";
import { cn } from "@/lib/utils";

export type GridLayout = "single" | "two-column" | "three-column" | "card-grid";
export type GridSpacing = "compact" | "normal" | "relaxed";

interface ContentGridProps {
	children: React.ReactNode;
	layout?: GridLayout;
	spacing?: GridSpacing;
	className?: string;
	contentClassName?: string;
	sidebarContent?: React.ReactNode;
	sidebarPosition?: "left" | "right";
}

export function ContentGrid({
	children,
	layout = "single",
	spacing = "normal",
	className,
	contentClassName,
	sidebarContent,
	sidebarPosition = "right",
}: ContentGridProps) {
	const getSpacingClasses = () => {
		switch (spacing) {
			case "compact":
				return "gap-4";
			case "relaxed":
				return "gap-8 md:gap-12";
			default:
				return "gap-6 md:gap-8";
		}
	};

	const getLayoutClasses = () => {
		switch (layout) {
			case "single":
				return "grid grid-cols-1";

			case "two-column":
				if (sidebarContent) {
					return sidebarPosition === "left"
						? "grid grid-cols-1 lg:grid-cols-[300px_1fr]"
						: "grid grid-cols-1 lg:grid-cols-[1fr_300px]";
				}
				return "grid grid-cols-1 md:grid-cols-2";

			case "three-column":
				if (sidebarContent) {
					return sidebarPosition === "left"
						? "grid grid-cols-1 lg:grid-cols-[250px_1fr_250px]"
						: "grid grid-cols-1 lg:grid-cols-[250px_1fr_250px]";
				}
				return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

			case "card-grid":
				return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

			default:
				return "grid grid-cols-1";
		}
	};

	const renderContent = () => {
		if (layout === "two-column" && sidebarContent) {
			return (
				<>
					{sidebarPosition === "left" && (
						<aside className="space-y-6">{sidebarContent}</aside>
					)}
					<main className={cn("min-w-0", contentClassName)}>{children}</main>
					{sidebarPosition === "right" && (
						<aside className="space-y-6">{sidebarContent}</aside>
					)}
				</>
			);
		}

		if (layout === "three-column" && sidebarContent) {
			return (
				<>
					<aside className="space-y-6">
						{/* Left sidebar - could be navigation or filters */}
						<div className="secondary-accent rounded-lg p-4">
							<h3 className="font-medium text-foreground mb-3">Navegación</h3>
							{/* Navigation content would go here */}
						</div>
					</aside>
					<main className={cn("min-w-0", contentClassName)}>{children}</main>
					<aside className="space-y-6">{sidebarContent}</aside>
				</>
			);
		}

		return <div className={cn("w-full", contentClassName)}>{children}</div>;
	};

	return (
		<div
			className={cn(
				"w-full",
				getLayoutClasses(),
				getSpacingClasses(),
				className,
			)}
		>
			{renderContent()}
		</div>
	);
}

// Specialized grid components for specific use cases
interface CardGridProps {
	children: React.ReactNode;
	columns?: {
		sm?: number;
		md?: number;
		lg?: number;
		xl?: number;
		"2xl"?: number;
	};
	spacing?: GridSpacing;
	className?: string;
}

export function CardGrid({
	children,
	columns = { sm: 2, md: 2, lg: 3, xl: 4, "2xl": 5 },
	spacing = "normal",
	className,
}: CardGridProps) {
	const getColumnClasses = () => {
		const classes = ["grid", "grid-cols-1"];

		if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
		if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
		if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
		if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
		if (columns["2xl"]) classes.push(`2xl:grid-cols-${columns["2xl"]}`);

		return classes.join(" ");
	};

	const getSpacingClasses = () => {
		switch (spacing) {
			case "compact":
				return "gap-3 md:gap-4";
			case "relaxed":
				return "gap-6 md:gap-8";
			default:
				return "gap-4 md:gap-6";
		}
	};

	return (
		<div className={cn(getColumnClasses(), getSpacingClasses(), className)}>
			{children}
		</div>
	);
}

// Responsive grid utilities
interface ResponsiveGridProps {
	children: React.ReactNode;
	minItemWidth?: string;
	spacing?: GridSpacing;
	className?: string;
}

export function ResponsiveGrid({
	children,
	minItemWidth = "280px",
	spacing = "normal",
	className,
}: ResponsiveGridProps) {
	const getSpacingClasses = () => {
		switch (spacing) {
			case "compact":
				return "gap-3 md:gap-4";
			case "relaxed":
				return "gap-6 md:gap-8";
			default:
				return "gap-4 md:gap-6";
		}
	};

	return (
		<div
			className={cn("grid", getSpacingClasses(), className)}
			style={{
				gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`,
			}}
		>
			{children}
		</div>
	);
}

// Grid container with secondary color accents
interface AccentGridProps {
	children: React.ReactNode;
	layout?: GridLayout;
	spacing?: GridSpacing;
	showAccents?: boolean;
	className?: string;
}

export function AccentGrid({
	children,
	layout = "card-grid",
	spacing = "normal",
	showAccents = true,
	className,
}: AccentGridProps) {
	return (
		<div
			className={cn(
				showAccents && "secondary-accent rounded-lg p-4 md:p-6",
				className,
			)}
		>
			<ContentGrid layout={layout} spacing={spacing}>
				{children}
			</ContentGrid>
		</div>
	);
}
