import { cn } from "@/lib/utils";

type FiltersSkeletonProps = {
	className?: string;
};

/**
 * Skeleton component for search filters sidebar
 * Provides loading state for filter controls
 */
export function FiltersSkeleton({ className }: FiltersSkeletonProps) {
	return (
		<div className={cn("space-y-6 p-4", className)}>
			{/* Search type tabs skeleton */}
			<div className="space-y-2">
				<div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
					<div className="h-8 animate-pulse rounded bg-background" />
					<div className="h-8 animate-pulse rounded bg-muted-foreground/10" />
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
			<div className="h-4 w-24 animate-pulse rounded bg-muted" />

			{/* Filter controls */}
			<div className="space-y-2">
				{/* Input field skeleton */}
				<div className="h-10 animate-pulse rounded-md bg-muted" />

				{/* Additional controls */}
				<div className="flex gap-2">
					<div className="h-8 w-16 animate-pulse rounded bg-muted" />
					<div className="h-8 w-20 animate-pulse rounded bg-muted" />
					<div className="h-8 w-18 animate-pulse rounded bg-muted" />
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
		<div className="space-y-4 p-2">
			{/* Compact filter controls */}
			<div className="grid grid-cols-2 gap-2">
				<div className="h-8 animate-pulse rounded bg-muted" />
				<div className="h-8 animate-pulse rounded bg-muted" />
			</div>

			<div className="grid grid-cols-3 gap-2">
				<div className="h-8 animate-pulse rounded bg-muted" />
				<div className="h-8 animate-pulse rounded bg-muted" />
				<div className="h-8 animate-pulse rounded bg-muted" />
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
				<div className="h-3 w-12 animate-pulse rounded bg-muted" />
				<div className="h-3 w-12 animate-pulse rounded bg-muted" />
			</div>
			<div className="h-2 animate-pulse rounded-full bg-muted" />
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
				<div className="flex items-center gap-2" key={index}>
					<div className="h-4 w-4 animate-pulse rounded bg-muted" />
					<div
						className="h-4 animate-pulse rounded bg-muted"
						style={{ width: `${60 + Math.random() * 40}%` }}
					/>
				</div>
			))}
		</div>
	);
}
