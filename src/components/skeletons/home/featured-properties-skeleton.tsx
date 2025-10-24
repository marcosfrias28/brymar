import { SectionHeader, SectionWrapper } from "../../ui/section-wrapper";
import { Skeleton } from "../../ui/skeleton";

export function FeaturedPropertiesSkeleton() {
	return (
		<SectionWrapper>
			<SectionHeader
				subtitle="Propiedades Destacadas"
				title="Últimas Propiedades Destacadas"
				description="Descubre nuestra selección cuidadosamente elegida de propiedades premium - cada una seleccionada por su valor excepcional y características únicas."
			/>

			{/* Property Grid Skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
				{Array.from({ length: 6 }).map((_, index) => (
					<div key={index} className="group relative">
						<div className="relative overflow-hidden rounded-2xl">
							<Skeleton className="w-full h-64" />

							{/* Property Info Overlay */}
							<div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
								<div className="space-y-2">
									<Skeleton className="h-4 w-20 bg-white/20" />
									<Skeleton className="h-6 w-3/4 bg-white/20" />
									<Skeleton className="h-4 w-1/2 bg-white/20" />
								</div>

								<div className="flex items-center justify-between mt-4">
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
