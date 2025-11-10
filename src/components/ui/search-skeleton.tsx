import { cn } from "@/lib/utils";

type SearchSkeletonProps = {
	count?: number;
	className?: string;
};

/**
 * Skeleton component for search results using modern React patterns
 * Replicates the exact structure of property cards for seamless loading states
 */
export function SearchSkeleton({ count = 6, className }: SearchSkeletonProps) {
	return (
		<div className={cn("p-8", className)}>
			<div className="grid grid-cols-1 gap-8 pt-20 lg:grid-cols-3 xl:grid-cols-2">
				{Array.from({ length: count }, (_, index) => (
					<PropertyCardSkeleton key={index} />
				))}
			</div>
		</div>
	);
}

/**
 * Individual property card skeleton component
 * Matches the exact structure of the real property cards
 */
function PropertyCardSkeleton() {
	return (
		<div className="flex flex-col gap-6 rounded-xl border border-border bg-card py-6 text-card-foreground shadow-sm">
			{/* Image skeleton */}
			<div className="relative h-48 w-full overflow-hidden rounded-t-lg">
				<div className="absolute inset-0 animate-pulse bg-muted" />

				{/* Badge skeletons */}
				<div className="absolute top-2 left-2 flex flex-wrap gap-1">
					<div className="h-6 w-16 animate-pulse rounded-md bg-muted-foreground/20" />
					<div className="h-6 w-20 animate-pulse rounded-md bg-muted-foreground/20" />
				</div>
			</div>

			{/* Content skeleton */}
			<div className="p-4">
				<div className="space-y-2">
					{/* Title and price skeleton */}
					<div>
						<div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-muted" />
						<div className="h-4 w-24 animate-pulse rounded bg-muted" />
					</div>

					{/* Property details skeleton */}
					<div className="flex flex-wrap gap-3 text-muted-foreground text-xs">
						{/* Location skeleton */}
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 animate-pulse rounded bg-muted" />
							<div className="h-3 w-16 animate-pulse rounded bg-muted" />
							<div className="h-3 w-20 animate-pulse rounded bg-muted" />
						</div>

						{/* Bedrooms skeleton */}
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 animate-pulse rounded bg-muted" />
							<div className="h-3 w-20 animate-pulse rounded bg-muted" />
							<div className="h-3 w-4 animate-pulse rounded bg-muted" />
						</div>

						{/* Bathrooms skeleton */}
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 animate-pulse rounded bg-muted" />
							<div className="h-3 w-12 animate-pulse rounded bg-muted" />
							<div className="h-3 w-4 animate-pulse rounded bg-muted" />
						</div>

						{/* Area skeleton */}
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 animate-pulse rounded bg-muted" />
							<div className="h-3 w-8 animate-pulse rounded bg-muted" />
							<div className="h-3 w-12 animate-pulse rounded bg-muted" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Compact skeleton for mobile search results
 */
export function MobileSearchSkeleton({ count = 4 }: { count?: number }) {
	return (
		<div className="space-y-4 p-4">
			{Array.from({ length: count }, (_, index) => (
				<div className="rounded-lg border bg-card p-4" key={index}>
					<div className="flex gap-4">
						{/* Image skeleton */}
						<div className="h-20 w-20 flex-shrink-0 animate-pulse rounded-lg bg-muted" />

						{/* Content skeleton */}
						<div className="flex-1 space-y-2">
							<div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
							<div className="h-3 w-20 animate-pulse rounded bg-muted" />
							<div className="flex gap-2">
								<div className="h-3 w-12 animate-pulse rounded bg-muted" />
								<div className="h-3 w-12 animate-pulse rounded bg-muted" />
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

/**
 * Grid skeleton for different layouts
 */
export function GridSkeleton({
	columns = 3,
	rows = 2,
	className,
}: {
	columns?: number;
	rows?: number;
	className?: string;
}) {
	const gridCols = {
		1: "grid-cols-1",
		2: "grid-cols-1 xl:grid-cols-2",
		3: "grid-cols-1 xl:grid-cols-2 lg:grid-cols-3",
		4: "grid-cols-1 xl:grid-cols-2 lg:grid-cols-4",
	};

	return (
		<div className={cn("p-8", className)}>
			<div
				className={cn(
					"grid gap-8",
					gridCols[columns as keyof typeof gridCols] || gridCols[3]
				)}
			>
				{Array.from({ length: columns * rows }, (_, index) => (
					<PropertyCardSkeleton key={index} />
				))}
			</div>
		</div>
	);
}

/**
 * List skeleton for alternative layouts
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
	return (
		<div className="space-y-6 p-8">
			{Array.from({ length: count }, (_, index) => (
				<div className="rounded-xl border bg-card p-6" key={index}>
					<div className="flex gap-6">
						{/* Image skeleton */}
						<div className="h-32 w-48 flex-shrink-0 animate-pulse rounded-lg bg-muted" />

						{/* Content skeleton */}
						<div className="flex-1 space-y-3">
							<div className="space-y-2">
								<div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
								<div className="h-4 w-24 animate-pulse rounded bg-muted" />
							</div>

							<div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
								<div className="flex items-center gap-2">
									<div className="h-3 w-3 animate-pulse rounded bg-muted" />
									<div className="h-3 w-16 animate-pulse rounded bg-muted" />
								</div>
								<div className="flex items-center gap-2">
									<div className="h-3 w-3 animate-pulse rounded bg-muted" />
									<div className="h-3 w-12 animate-pulse rounded bg-muted" />
								</div>
								<div className="flex items-center gap-2">
									<div className="h-3 w-3 animate-pulse rounded bg-muted" />
									<div className="h-3 w-12 animate-pulse rounded bg-muted" />
								</div>
								<div className="flex items-center gap-2">
									<div className="h-3 w-3 animate-pulse rounded bg-muted" />
									<div className="h-3 w-16 animate-pulse rounded bg-muted" />
								</div>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

/**
 * Skeleton with shimmer effect for enhanced visual feedback
 */
export function ShimmerSkeleton({ count = 6 }: { count?: number }) {
	return (
		<div className="p-8">
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3 xl:grid-cols-2">
				{Array.from({ length: count }, (_, index) => (
					<div
						className="overflow-hidden rounded-xl border bg-card"
						key={index}
					>
						{/* Shimmer effect */}
						<div className="relative">
							<div className="h-48 bg-muted" />
							<div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
						</div>

						<div className="space-y-3 p-4">
							<div className="relative">
								<div className="h-6 rounded bg-muted" />
								<div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
							</div>

							<div className="relative">
								<div className="h-4 w-24 rounded bg-muted" />
								<div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
							</div>

							<div className="space-y-2">
								{Array.from({ length: 4 }, (_, i) => (
									<div className="relative" key={i}>
										<div
											className="h-3 rounded bg-muted"
											style={{ width: `${60 + Math.random() * 40}%` }}
										/>
										<div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
									</div>
								))}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// Add shimmer animation to your CSS
const shimmerStyles = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
`;

// Export styles for inclusion in your CSS
export { shimmerStyles };
