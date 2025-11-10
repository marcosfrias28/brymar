"use client";

import { cn } from "@/lib/utils";
import { loadingAnimations, pageTransitions } from "@/lib/utils/animations";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

type LoadingSkeletonProps = {
	className?: string;
	variant?: "default" | "shimmer" | "pulse";
	children?: React.ReactNode;
};

/**
 * Enhanced skeleton component with secondary color accents and animation variants
 */
export function LoadingSkeleton({
	className,
	variant = "default",
	...props
}: LoadingSkeletonProps) {
	const baseClasses = "bg-muted animate-pulse rounded-md";

	const variantClasses = {
		default: loadingAnimations.pulse,
		shimmer: loadingAnimations.shimmer,
		pulse: `${loadingAnimations.pulse} bg-secondary/10 border border-secondary/20`,
	};

	return (
		<div
			className={cn(baseClasses, variantClasses[variant], className)}
			{...props}
		/>
	);
}

/**
 * Dashboard page skeleton with consistent layout structure
 */
export function DashboardPageSkeleton() {
	return (
		<div className={cn("space-y-6", pageTransitions.fadeIn)}>
			{/* Page Header Skeleton */}
			<div className="animate-fade-in space-y-4">
				<div className="flex items-center gap-2">
					<LoadingSkeleton className="h-4 w-16" variant="shimmer" />
					<span className="text-muted-foreground">/</span>
					<LoadingSkeleton className="h-4 w-20" variant="shimmer" />
				</div>
				<div className="animation-delay-100 space-y-2">
					<LoadingSkeleton className="h-8 w-64" variant="pulse" />
					<LoadingSkeleton className="h-4 w-96" />
				</div>
			</div>

			{/* Content Area Skeleton */}
			<div className="animation-delay-200 grid grid-cols-1 gap-6 lg:grid-cols-4">
				{/* Main Content */}
				<div className="space-y-6 lg:col-span-3">
					{/* Stats Cards */}
					<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								className={cn(
									"animate-fade-in rounded-lg border p-6",
									secondaryColorClasses.accent,
									`animation-delay-${(i + 1) * 100}`
								)}
								key={i}
							>
								<LoadingSkeleton className="mb-2 h-4 w-20" />
								<LoadingSkeleton className="mb-1 h-8 w-16" variant="pulse" />
								<LoadingSkeleton className="h-3 w-24" />
							</div>
						))}
					</div>

					{/* Main Content Area */}
					<div className="animation-delay-400 animate-fade-in space-y-4">
						<LoadingSkeleton className="h-64 w-full" variant="shimmer" />
						<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
							<LoadingSkeleton className="animation-delay-500 h-32 w-full animate-fade-in" />
							<LoadingSkeleton className="animation-delay-500 h-32 w-full animate-fade-in" />
						</div>
					</div>
				</div>

				{/* Sidebar */}
				<div className="animation-delay-300 animate-fade-in space-y-4">
					<LoadingSkeleton className="h-48 w-full" />
					<LoadingSkeleton className="h-32 w-full" />
				</div>
			</div>
		</div>
	);
}

/**
 * Card list skeleton for properties, lands, blog posts
 */
export function CardListSkeleton({ count = 6 }: { count?: number }) {
	return (
		<div className={cn("space-y-4", pageTransitions.fadeIn)}>
			{Array.from({ length: count }).map((_, i) => (
				<div
					className={cn(
						"animate-fade-in rounded-lg border p-4",
						secondaryColorClasses.cardHover,
						`animation-delay-${Math.min(i * 100, 500)}`
					)}
					key={i}
				>
					<div className="flex gap-4">
						<LoadingSkeleton
							className="h-24 w-24 flex-shrink-0 rounded-lg"
							variant="shimmer"
						/>
						<div className="flex-1 space-y-2">
							<LoadingSkeleton className="h-5 w-3/4" variant="pulse" />
							<LoadingSkeleton className="h-4 w-1/2" />
							<div className="mt-3 flex gap-2">
								<LoadingSkeleton className="h-6 w-16 rounded-full" />
								<LoadingSkeleton className="h-6 w-20 rounded-full" />
							</div>
						</div>
						<div className="space-y-2">
							<LoadingSkeleton className="h-6 w-20" variant="pulse" />
							<LoadingSkeleton className="h-4 w-16" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

/**
 * Form skeleton for create/edit pages
 */
export function FormSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
				<div className="space-y-2">
					<LoadingSkeleton className="h-4 w-20" />
					<LoadingSkeleton className="h-10 w-full" variant="pulse" />
				</div>
				<div className="space-y-2">
					<LoadingSkeleton className="h-4 w-24" />
					<LoadingSkeleton className="h-10 w-full" variant="pulse" />
				</div>
			</div>

			<div className="space-y-2">
				<LoadingSkeleton className="h-4 w-28" />
				<LoadingSkeleton className="h-24 w-full" variant="shimmer" />
			</div>

			<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<div className="space-y-2" key={i}>
						<LoadingSkeleton className="h-4 w-16" />
						<LoadingSkeleton className="h-10 w-full" />
					</div>
				))}
			</div>

			<div className="flex gap-2 pt-4">
				<LoadingSkeleton className="h-10 w-24" variant="pulse" />
				<LoadingSkeleton className="h-10 w-20" />
			</div>
		</div>
	);
}

/**
 * Table skeleton for data tables
 */
export function TableSkeleton({
	rows = 5,
	columns = 4,
}: {
	rows?: number;
	columns?: number;
}) {
	return (
		<div className="space-y-4">
			{/* Table Header */}
			<div
				className="grid gap-4"
				style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
			>
				{Array.from({ length: columns }).map((_, i) => (
					<LoadingSkeleton className="h-4 w-20" key={i} />
				))}
			</div>

			{/* Table Rows */}
			{Array.from({ length: rows }).map((_, rowIndex) => (
				<div
					className="grid gap-4"
					key={rowIndex}
					style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
				>
					{Array.from({ length: columns }).map((_, colIndex) => (
						<LoadingSkeleton
							className="h-4 w-full"
							key={colIndex}
							variant={colIndex === 0 ? "pulse" : "default"}
						/>
					))}
				</div>
			))}
		</div>
	);
}
