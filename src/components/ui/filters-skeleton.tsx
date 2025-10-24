import { cn } from "@/lib/utils";

interface FiltersSkeletonProps {
	className?: string;
}

/**
 * Skeleton component for search filters sidebar
 * Provides loading state for filter controls
 */
export function FiltersSkeleton({ className }: FiltersSkeletonProps) {
	return (
		<div className={cn("p-4 space-y-6", className)}>
			{/* Search type tabs skeleton */}
			<div className="space-y-2">
				<div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-lg">
					<div className="h-8 bg-background rounded animate-pulse" />
					<div className="h-8 bg-muted-foreground/10 rounded animate-pulse" />
				</div>
			</div>

			{/* Filter sections */}
			<FilterSectionSkeleton title="Ubicación" />
			<FilterSectionSkeleton title="Tipo de Propiedad" />
			<FilterSectionSkeleton title="Rango de Precio" />
			<FilterSectionSkeleton title="Características" />
			<FilterSectionSkeleton title="Comodidades" />
		</div>
	);
}

/**
 * Individual filter section skeleton
 */
function FilterSectionSkeleton({ title }: { title: string }) {
	return (
		<div className="space-y-3">
			{/* Section title */}
			<div className="h-4 w-24 bg-muted animate-pulse rounded" />

			{/* Filter controls */}
			<div className="space-y-2">
				{/* Input field skeleton */}
				<div className="h-10 bg-muted animate-pulse rounded-md" />

				{/* Additional controls */}
				<div className="flex gap-2">
					<div className="h-8 w-16 bg-muted animate-pulse rounded" />
					<div className="h-8 w-20 bg-muted animate-pulse rounded" />
					<div className="h-8 w-18 bg-muted animate-pulse rounded" />
				</div>
			</div>
		</div>
	);
}

/**
 * Mobile filters skeleton
 */
export function MobileFiltersSkeleton() {
	return (
		<div className="p-2 space-y-4">
			{/* Compact filter controls */}
			<div className="grid grid-cols-2 gap-2">
				<div className="h-8 bg-muted animate-pulse rounded" />
				<div className="h-8 bg-muted animate-pulse rounded" />
			</div>

			<div className="grid grid-cols-3 gap-2">
				<div className="h-8 bg-muted animate-pulse rounded" />
				<div className="h-8 bg-muted animate-pulse rounded" />
				<div className="h-8 bg-muted animate-pulse rounded" />
			</div>
		</div>
	);
}

/**
 * Range slider skeleton
 */
export function RangeSliderSkeleton() {
	return (
		<div className="space-y-2">
			<div className="flex justify-between">
				<div className="h-3 w-12 bg-muted animate-pulse rounded" />
				<div className="h-3 w-12 bg-muted animate-pulse rounded" />
			</div>
			<div className="h-2 bg-muted animate-pulse rounded-full" />
		</div>
	);
}

/**
 * Checkbox group skeleton
 */
export function CheckboxGroupSkeleton({ count = 5 }: { count?: number }) {
	return (
		<div className="space-y-2">
			{Array.from({ length: count }, (_, index) => (
				<div key={index} className="flex items-center gap-2">
					<div className="h-4 w-4 bg-muted animate-pulse rounded" />
					<div
						className="h-4 bg-muted animate-pulse rounded"
						style={{ width: `${60 + Math.random() * 40}%` }}
					/>
				</div>
			))}
		</div>
	);
}
