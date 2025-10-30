import { SectionHeader, SectionWrapper } from "../../ui/section-wrapper";
import { Skeleton } from "../../ui/skeleton";

export function FeaturedPropertiesSkeleton() {
	return (
		<SectionWrapper>
			<SectionHeader
				description="Descubre nuestra selección cuidadosamente elegida de propiedades premium - cada una seleccionada por su valor excepcional y características únicas."
				subtitle="Propiedades Destacadas"
				title="Últimas Propiedades Destacadas"
			/>

			{/* Property Grid Skeleton */}
			<div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, index) => (
					<div className="group relative" key={index}>
						<div className="relative overflow-hidden rounded-2xl">
							<Skeleton className="h-64 w-full" />

							{/* Property Info Overlay */}
							<div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-6">
								<div className="space-y-2">
									<Skeleton className="h-4 w-20 bg-white/20" />
									<Skeleton className="h-6 w-3/4 bg-white/20" />
									<Skeleton className="h-4 w-1/2 bg-white/20" />
								</div>

								<div className="mt-4 flex items-center justify-between">
									<Skeleton className="h-6 w-24 bg-white/20" />
									<div className="flex gap-2">
										<Skeleton className="h-8 w-8 rounded-full bg-white/20" />
										<Skeleton className="h-8 w-8 rounded-full bg-white/20" />
									</div>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</SectionWrapper>
	);
}
