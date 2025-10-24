import { cn } from "@/lib/utils";
import { SectionHeader, SectionWrapper } from "../../ui/section-wrapper";
import { Skeleton } from "../../ui/skeleton";

export function CategoriesSkeleton() {
	return (
		<SectionWrapper className="relative overflow-hidden">
			<div className="grid grid-cols-12 items-center gap-10">
				{/* Header Section */}
				<div className="lg:col-span-6 col-span-12">
					<SectionHeader
						subtitle="Categorías"
						title="Explora las mejores propiedades con servicios expertos"
						description="Descubre una amplia gama de propiedades premium, desde apartamentos de lujo hasta villas espaciosas, adaptadas a tus necesidades"
						icon={
							<svg
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
								role="img"
								className="text-2xl text-primary"
								width="1em"
								height="1em"
								viewBox="0 0 256 256"
							>
								<path
									fill="currentColor"
									d="M224 120v96a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-96a15.87 15.87 0 0 1 4.69-11.32l80-80a16 16 0 0 1 22.62 0l80 80A15.87 15.87 0 0 1 224 120"
								/>
							</svg>
						}
						className="text-left mb-8"
						subtitleClassName="text-left justify-start"
						titleClassName="text-left text-3xl md:text-4xl lg:text-5xl"
						descriptionClassName="text-left max-w-none"
					/>
					<Skeleton className="h-10 w-40" />
				</div>

				{/* Categories Grid Skeleton */}
				{Array.from({ length: 4 }).map((_, index) => {
					const isLarge = index < 2;
					const colSpan = isLarge
						? "lg:col-span-6 col-span-12"
						: "lg:col-span-3 col-span-6";

					return (
						<div key={index} className={cn(colSpan, "w-full")}>
							<div className="relative rounded-2xl overflow-hidden group h-[25rem]">
								<Skeleton className="w-full h-full" />

								{/* Icon in top right */}
								<div className="absolute top-6 right-6">
									<Skeleton className="w-14 h-14 rounded-full" />
								</div>

								{/* Content at bottom */}
								<div className="absolute bottom-0 left-0 right-0 p-10">
									<div className="space-y-2.5">
										<Skeleton className="h-8 w-3/4 bg-white/20" />
										<Skeleton className="h-16 w-full bg-white/20" />
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</SectionWrapper>
	);
}
