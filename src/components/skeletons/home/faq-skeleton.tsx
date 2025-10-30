import { HelpCircle } from "lucide-react";
import { SectionHeader, SectionWrapper } from "../../ui/section-wrapper";
import { Skeleton } from "../../ui/skeleton";

export function FAQSkeleton() {
	return (
		<SectionWrapper className="bg-muted/30">
			{/* Header */}
			<SectionHeader
				description="Sabemos que comprar, vender o invertir en bienes raíces puede ser abrumador. Aquí tienes las preguntas más frecuentes para guiarte en el proceso."
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
				subtitle="FAQs"
				title="Todo sobre Marbry Inmobiliaria"
			/>

			{/* Grid with FAQ and Images */}
			<div className="mt-12 grid grid-cols-12 items-start gap-10">
				{/* FAQ Accordion - Left */}
				<div className="col-span-12 lg:col-span-7">
					<div className="w-full space-y-6">
						{Array.from({ length: 4 }).map((_, index) => (
							<div
								className="overflow-hidden rounded-2xl border-0 bg-background/60 shadow-sm backdrop-blur-sm"
								key={index}
							>
								<div className="px-6 py-6">
									<div className="flex w-full items-start gap-4">
										<Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
										<div className="flex-1 space-y-2">
											<Skeleton className="h-6 w-3/4" />
											<Skeleton className="h-16 w-full" />
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* CTA Section */}
					<div className="mt-12 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 p-8 backdrop-blur-sm">
						<div className="text-center">
							<div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
								<HelpCircle className="h-8 w-8 text-primary" />
							</div>
							<Skeleton className="mx-auto mb-3 h-8 w-64" />
							<Skeleton className="mx-auto mb-6 h-6 w-80" />
							<div className="flex flex-col justify-center gap-4 sm:flex-row">
								<Skeleton className="h-12 w-40" />
								<Skeleton className="h-12 w-32" />
							</div>
						</div>
					</div>
				</div>

				{/* Images Grid - Right */}
				<div className="col-span-12 lg:col-span-5">
					<div className="grid h-[800px] grid-cols-2 grid-rows-2 gap-10">
						<Skeleton className="col-span-1 row-span-1 rounded-2xl" />
						<Skeleton className="col-span-1 row-span-1 rounded-2xl" />
						<Skeleton className="col-span-2 row-span-1 rounded-2xl" />
					</div>
				</div>
			</div>
		</SectionWrapper>
	);
}
