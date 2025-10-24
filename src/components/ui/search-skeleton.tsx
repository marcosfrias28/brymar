import { cn } from "@/lib/utils";

interface SearchSkeletonProps {
	count?: number;
	className?: string;
}

/**
 * Skeleton component for search results using modern React patterns
 * Replicates the exact structure of property cards for seamless loading states
 */
export function SearchSkeleton({ count = 6, className }: SearchSkeletonProps) {
	return (
		<div className={cn("p-8", className)}>
			<div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pt-20">
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
		<div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm border-border">
			{/* Image skeleton */}
			<div className="relative w-full h-48 overflow-hidden rounded-t-lg">
				<div className="absolute inset-0 bg-muted animate-pulse" />

				{/* Badge skeletons */}
				<div className="absolute top-2 left-2 flex flex-wrap gap-1">
					<div className="h-6 w-16 bg-muted-foreground/20 rounded-md animate-pulse" />
					<div className="h-6 w-20 bg-muted-foreground/20 rounded-md animate-pulse" />
				</div>
			</div>

			{/* Content skeleton */}
			<div className="p-4">
				<div className="space-y-2">
					{/* Title and price skeleton */}
					<div>
						<div className="h-6 w-3/4 bg-muted animate-pulse rounded mb-2" />
						<div className="h-4 w-24 bg-muted animate-pulse rounded" />
					</div>

					{/* Property details skeleton */}
					<div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
						{/* Location skeleton */}
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 bg-muted animate-pulse rounded" />
							<div className="h-3 w-16 bg-muted animate-pulse rounded" />
							<div className="h-3 w-20 bg-muted animate-pulse rounded" />
						</div>

						{/* Bedrooms skeleton */}
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 bg-muted animate-pulse rounded" />
							<div className="h-3 w-20 bg-muted animate-pulse rounded" />
							<div className="h-3 w-4 bg-muted animate-pulse rounded" />
						</div>

						{/* Bathrooms skeleton */}
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 bg-muted animate-pulse rounded" />
							<div className="h-3 w-12 bg-muted animate-pulse rounded" />
							<div className="h-3 w-4 bg-muted animate-pulse rounded" />
						</div>

						{/* Area skeleton */}
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 bg-muted animate-pulse rounded" />
							<div className="h-3 w-8 bg-muted animate-pulse rounded" />
							<div className="h-3 w-12 bg-muted animate-pulse rounded" />
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
		<div className="p-4 space-y-4">
			{Array.from({ length: count }, (_, index) => (
				<div key={index} className="bg-card rounded-lg border p-4">
					<div className="flex gap-4">
						{/* Image skeleton */}
						<div className="w-20 h-20 bg-muted animate-pulse rounded-lg flex-shrink-0" />

						{/* Content skeleton */}
						<div className="flex-1 space-y-2">
							<div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
							<div className="h-3 w-20 bg-muted animate-pulse rounded" />
							<div className="flex gap-2">
								<div className="h-3 w-12 bg-muted animate-pulse rounded" />
								<div className="h-3 w-12 bg-muted animate-pulse rounded" />
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
		2: "grid-cols-1 md:grid-cols-2",
		3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
		4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
	};

	return (
		<div className={cn("p-8", className)}>
			<div
				className={cn(
					"grid gap-8",
					gridCols[columns as keyof typeof gridCols] || gridCols[3],
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
		<div className="p-8 space-y-6">
			{Array.from({ length: count }, (_, index) => (
				<div key={index} className="bg-card rounded-xl border p-6">
					<div className="flex gap-6">
						{/* Image skeleton */}
						<div className="w-48 h-32 bg-muted animate-pulse rounded-lg flex-shrink-0" />

						{/* Content skeleton */}
						<div className="flex-1 space-y-3">
							<div className="space-y-2">
								<div className="h-6 w-2/3 bg-muted animate-pulse rounded" />
								<div className="h-4 w-24 bg-muted animate-pulse rounded" />
							</div>

							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="flex items-center gap-2">
									<div className="h-3 w-3 bg-muted animate-pulse rounded" />
									<div className="h-3 w-16 bg-muted animate-pulse rounded" />
								</div>
								<div className="flex items-center gap-2">
									<div className="h-3 w-3 bg-muted animate-pulse rounded" />
									<div className="h-3 w-12 bg-muted animate-pulse rounded" />
								</div>
								<div className="flex items-center gap-2">
									<div className="h-3 w-3 bg-muted animate-pulse rounded" />
									<div className="h-3 w-12 bg-muted animate-pulse rounded" />
								</div>
								<div className="flex items-center gap-2">
									<div className="h-3 w-3 bg-muted animate-pulse rounded" />
									<div className="h-3 w-16 bg-muted animate-pulse rounded" />
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
			<div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: count }, (_, index) => (
					<div
						key={index}
						className="bg-card rounded-xl border overflow-hidden"
					>
						{/* Shimmer effect */}
						<div className="relative">
							<div className="h-48 bg-muted" />
							<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
						</div>

						<div className="p-4 space-y-3">
							<div className="relative">
								<div className="h-6 bg-muted rounded" />
								<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
							</div>

							<div className="relative">
								<div className="h-4 w-24 bg-muted rounded" />
								<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
							</div>

							<div className="space-y-2">
								{Array.from({ length: 4 }, (_, i) => (
									<div key={i} className="relative">
										<div
											className="h-3 bg-muted rounded"
											style={{ width: `${60 + Math.random() * 40}%` }}
										/>
										<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
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
