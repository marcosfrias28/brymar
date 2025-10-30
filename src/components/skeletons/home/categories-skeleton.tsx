import { cn } from "@/lib/utils";
import { SectionHeader, SectionWrapper } from "../../ui/section-wrapper";
import { Skeleton } from "../../ui/skeleton";

export function CategoriesSkeleton() {
	return (
		<SectionWrapper className="relative overflow-hidden">
			<div className="grid grid-cols-12 items-center gap-10">
				{/* Header Section */}
				<div className="col-span-12 lg:col-span-6">
					<SectionHeader
						className="mb-8 text-left"
						description="Descubre una amplia gama de propiedades premium, desde apartamentos de lujo hasta villas espaciosas, adaptadas a tus necesidades"
						descriptionClassName="text-left max-w-none"
						icon={
							<svg
								aria-hidden="true"
								className="text-2xl text-primary"
								height="1em"
								role="img"
								viewBox="0 0 256 256"
								width="1em"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M224 120v96a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-96a15.87 15.87 0 0 1 4.69-11.32l80-80a16 16 0 0 1 22.62 0l80 80A15.87 15.87 0 0 1 224 120"
									fill="currentColor"
								/>
							</svg>
						}
						subtitle="Categorías"
						subtitleClassName="text-left justify-start"
						title="Explora las mejores propiedades con servicios expertos"
						titleClassName="text-left text-3xl md:text-4xl lg:text-5xl"
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
						<div className={cn(colSpan, "w-full")} key={index}>
							<div className="group relative h-[25rem] overflow-hidden rounded-2xl">
								<Skeleton className="h-full w-full" />

								{/* Icon in top right */}
								<div className="absolute top-6 right-6">
									<Skeleton className="h-14 w-14 rounded-full" />
								</div>

								{/* Content at bottom */}
								<div className="absolute right-0 bottom-0 left-0 p-10">
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
