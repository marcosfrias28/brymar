/**
 * Modern Step Layout Components for Wizard Steps
 * Provides consistent visual design across all wizard types
 */

"use client";

import { motion } from "framer-motion";
import {
	AlertCircle,
	AlertTriangle,
	CheckCircle,
	Info,
	type LucideIcon,
	Minus,
	Sparkles,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils/index";

// Animation variants
const containerVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.5,
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 10 },
	visible: { opacity: 1, y: 0 },
};

// Main step layout container
type ModernStepLayoutProps = {
	title: string;
	description: string;
	icon?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
};

export function ModernStepLayout({
	title,
	description,
	icon,
	children,
	className,
}: ModernStepLayoutProps) {
	return (
		<motion.div
			animate="visible"
			className={cn("space-y-8", className)}
			initial="hidden"
			variants={containerVariants}
		>
			{/* Header */}
			<motion.div className="space-y-4 text-center" variants={itemVariants}>
				{icon && (
					<div className="flex justify-center">
						<div className="rounded-full bg-primary/10 p-3">{icon}</div>
					</div>
				)}
				<div className="space-y-2">
					<h1 className="font-bold text-3xl tracking-tight">{title}</h1>
					<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
						{description}
					</p>
				</div>
			</motion.div>

			{/* Content */}
			<motion.div className="space-y-6" variants={itemVariants}>
				{children}
			</motion.div>
		</motion.div>
	);
}

// Section card component
type ModernSectionCardProps = {
	title: string;
	description?: string;
	icon?: React.ReactNode;
	badge?: string;
	variant?: "default" | "ghost";
	children: React.ReactNode;
	className?: string;
};

export function ModernSectionCard({
	title,
	description,
	icon,
	badge,
	variant = "default",
	children,
	className,
}: ModernSectionCardProps) {
	const content = (
		<>
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						{icon && <div className="rounded-lg bg-primary/10 p-2">{icon}</div>}
						<div>
							<CardTitle className="text-xl">{title}</CardTitle>
							{description && (
								<p className="mt-1 text-muted-foreground text-sm">
									{description}
								</p>
							)}
						</div>
					</div>
					{badge && <Badge variant="secondary">{badge}</Badge>}
				</div>
			</CardHeader>
			<CardContent className="space-y-6">{children}</CardContent>
		</>
	);

	if (variant === "ghost") {
		return (
			<motion.div
				className={cn("space-y-4", className)}
				variants={itemVariants}
			>
				<div className="mb-4 flex items-center space-x-3">
					{icon && <div className="rounded-lg bg-primary/10 p-2">{icon}</div>}
					<div>
						<h3 className="font-semibold text-xl">{title}</h3>
						{description && (
							<p className="text-muted-foreground text-sm">{description}</p>
						)}
					</div>
					{badge && <Badge variant="secondary">{badge}</Badge>}
				</div>
				<div className="space-y-6">{children}</div>
			</motion.div>
		);
	}

	return (
		<motion.div variants={itemVariants}>
			<Card className={cn("border-border/50 shadow-sm", className)}>
				{content}
			</Card>
		</motion.div>
	);
}

// Grid section for organizing form fields
type ModernGridSectionProps = {
	columns?: 1 | 2 | 3;
	gap?: "sm" | "md" | "lg";
	children: React.ReactNode;
	className?: string;
};

export function ModernGridSection({
	columns = 2,
	gap = "md",
	children,
	className,
}: ModernGridSectionProps) {
	const gridClasses = {
		1: "grid-cols-1",
		2: "grid-cols-1 md:grid-cols-2",
		3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
	};

	const gapClasses = {
		sm: "gap-4",
		md: "gap-6",
		lg: "gap-8",
	};

	return (
		<div
			className={cn("grid", gridClasses[columns], gapClasses[gap], className)}
		>
			{children}
		</div>
	);
}

// Info box for highlighting information
type ModernInfoBoxProps = {
	title: string;
	children: React.ReactNode;
	icon?: React.ReactNode;
	variant?: "default" | "success" | "warning" | "info" | "error";
	className?: string;
};

export function ModernInfoBox({
	title,
	children,
	icon,
	variant = "default",
	className,
}: ModernInfoBoxProps) {
	const variantStyles = {
		default: "bg-muted/50 border-border",
		success:
			"bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
		warning:
			"bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800",
		info: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
		error: "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
	};

	const iconMap = {
		default: Info,
		success: CheckCircle,
		warning: AlertTriangle,
		info: Info,
		error: AlertCircle,
	};

	const IconComponent = iconMap[variant];

	return (
		<motion.div variants={itemVariants}>
			<div
				className={cn(
					"rounded-lg border p-4",
					variantStyles[variant],
					className
				)}
			>
				<div className="flex items-start space-x-3">
					<div className="flex-shrink-0">
						{icon || <IconComponent className="h-5 w-5" />}
					</div>
					<div className="flex-1 space-y-2">
						<h4 className="font-medium">{title}</h4>
						<div className="text-sm">{children}</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}

// Divider with optional label
type ModernDividerProps = {
	label?: string;
	className?: string;
};

export function ModernDivider({ label, className }: ModernDividerProps) {
	if (label) {
		return (
			<div className={cn("relative", className)}>
				<div className="absolute inset-0 flex items-center">
					<Separator className="w-full" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">
						{label}
					</span>
				</div>
			</div>
		);
	}

	return <Separator className={className} />;
}

// Stats card for displaying metrics
type ModernStatsCardProps = {
	title: string;
	value: string | number;
	icon?: React.ReactNode;
	trend?: "up" | "down" | "neutral";
	trendValue?: string;
	className?: string;
};

export function ModernStatsCard({
	title,
	value,
	icon,
	trend,
	trendValue,
	className,
}: ModernStatsCardProps) {
	const trendIcons = {
		up: TrendingUp,
		down: TrendingDown,
		neutral: Minus,
	};

	const trendColors = {
		up: "text-green-600",
		down: "text-red-600",
		neutral: "text-muted-foreground",
	};

	const TrendIcon = trend ? trendIcons[trend] : null;

	return (
		<Card className={cn("p-4", className)}>
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<p className="font-medium text-muted-foreground text-sm">{title}</p>
					<p className="font-bold text-2xl">{value}</p>
					{trend && trendValue && TrendIcon && (
						<div
							className={cn("flex items-center text-sm", trendColors[trend])}
						>
							<TrendIcon className="mr-1 h-4 w-4" />
							{trendValue}
						</div>
					)}
				</div>
				{icon && <div className="rounded-full bg-primary/10 p-2">{icon}</div>}
			</div>
		</Card>
	);
}

// AI Generation Button Component
type ModernAIButtonProps = {
	onGenerate: () => void;
	isGenerating?: boolean;
	label?: string;
	size?: "sm" | "md" | "lg";
	variant?: "default" | "outline" | "ghost";
	className?: string;
};

export function ModernAIButton({
	onGenerate,
	isGenerating = false,
	label = "Generar con IA",
	size = "md",
	variant = "outline",
	className,
}: ModernAIButtonProps) {
	// Map our size to Button's valid sizes
	const buttonSize = size === "md" ? "default" : size;

	return (
		<Button
			className={cn(
				"gap-2 transition-all duration-200",
				isGenerating && "animate-pulse",
				className
			)}
			disabled={isGenerating}
			onClick={onGenerate}
			size={buttonSize}
			type="button"
			variant={variant}
		>
			<Sparkles
				className={cn(
					"transition-transform duration-200",
					isGenerating ? "animate-spin" : "group-hover:scale-110",
					size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
				)}
			/>
			{isGenerating ? "Generando..." : label}
		</Button>
	);
}

// Selection Grid for property types, etc.
type ModernSelectionGridProps = {
	items: Array<{
		id: string;
		label: string;
		icon?: LucideIcon;
		description?: string;
	}>;
	selectedId?: string;
	onSelect: (id: string) => void;
	columns?: 2 | 3 | 4;
	className?: string;
};

export function ModernSelectionGrid({
	items,
	selectedId,
	onSelect,
	columns = 3,
	className,
}: ModernSelectionGridProps) {
	const gridClasses = {
		2: "grid-cols-1 sm:grid-cols-2",
		3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
		4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
	};

	return (
		<div className={cn("grid gap-3", gridClasses[columns], className)}>
			{items.map((item) => {
				const IconComponent = item.icon;
				const isSelected = selectedId === item.id;

				return (
					<motion.div
						key={item.id}
						variants={itemVariants}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						<Card
							className={cn(
								"cursor-pointer transition-all duration-200 hover:shadow-md",
								isSelected
									? "border-primary bg-primary/5 ring-2 ring-primary"
									: "hover:border-primary/50"
							)}
							onClick={() => onSelect(item.id)}
						>
							<CardContent className="space-y-2 p-4 text-center">
								{IconComponent && (
									<div
										className={cn(
											"mx-auto rounded-lg p-2 transition-colors",
											isSelected
												? "bg-primary text-primary-foreground"
												: "bg-muted"
										)}
									>
										<IconComponent className="h-6 w-6" />
									</div>
								)}
								<div>
									<p className="font-medium">{item.label}</p>
									{item.description && (
										<p className="mt-1 text-muted-foreground text-xs">
											{item.description}
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					</motion.div>
				);
			})}
		</div>
	);
}
