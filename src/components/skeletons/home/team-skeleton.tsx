import { Users } from "lucide-react";
import { SectionHeader, SectionWrapper } from "../../ui/section-wrapper";
import { Skeleton } from "../../ui/skeleton";

export function TeamSkeleton() {
	return (
		<SectionWrapper className="relative overflow-hidden">
			{/* Background Elements */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
			<div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
			<div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

			<div className="relative z-10">
				<SectionHeader
					subtitle="Nuestro Equipo"
					title="Conoce a los Visionarios Detrás de Tu Éxito"
					description="Un equipo poderoso de expertos inmobiliarios, cada uno aportando experiencia única y pasión para transformar tus sueños de propiedad en realidad."
					icon={<Users className="w-5 h-5" />}
				/>

				{/* Team Grid Skeleton */}
				<div className="grid grid-cols-12 gap-6 mt-16">
					{/* Owner Card - Large */}
					<div className="col-span-12 lg:col-span-7">
						<div className="relative h-[600px] rounded-3xl overflow-hidden">
							<Skeleton className="w-full h-full" />

							{/* Floating Elements */}
							<div className="absolute top-6 right-6 flex gap-3">
								<Skeleton className="h-8 w-32 rounded-full" />
								<Skeleton className="h-8 w-28 rounded-full" />
							</div>

							{/* Content Overlay */}
							<div className="absolute inset-0 flex flex-col justify-end p-8">
								<div className="space-y-4">
									<Skeleton className="h-10 w-64 bg-white/20" />
									<Skeleton className="h-6 w-48 bg-white/20" />
									<Skeleton className="h-16 w-full max-w-lg bg-white/20" />

									{/* Stats Row */}
									<div className="flex gap-4">
										<Skeleton className="h-4 w-20 bg-white/20" />
										<Skeleton className="h-4 w-24 bg-white/20" />
										<Skeleton className="h-4 w-28 bg-white/20" />
									</div>

									{/* Specialties */}
									<div className="flex gap-2">
										<Skeleton className="h-6 w-24 rounded-full bg-white/20" />
										<Skeleton className="h-6 w-32 rounded-full bg-white/20" />
										<Skeleton className="h-6 w-28 rounded-full bg-white/20" />
									</div>

									{/* Action Buttons */}
									<div className="flex gap-3">
										<Skeleton className="h-10 w-40 rounded-md bg-white/20" />
										<Skeleton className="h-10 w-10 rounded-md bg-white/20" />
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Team Members - Stacked Cards */}
					<div className="col-span-12 lg:col-span-5 space-y-6">
						{Array.from({ length: 2 }).map((_, index) => (
							<div
								key={index}
								className="relative h-[285px] rounded-2xl overflow-hidden"
							>
								<Skeleton className="w-full h-full" />

								{/* Achievement Badge */}
								<div className="absolute top-4 right-4">
									<Skeleton className="h-6 w-24 rounded-full bg-white/20" />
								</div>

								{/* Content */}
								<div className="absolute inset-0 flex flex-col justify-end p-6">
									<div className="space-y-3">
										<Skeleton className="h-8 w-48 bg-white/20" />
										<Skeleton className="h-4 w-32 bg-white/20" />
										<Skeleton className="h-12 w-full bg-white/20" />

										{/* Quick Stats */}
										<div className="flex gap-4">
											<Skeleton className="h-3 w-16 bg-white/20" />
											<Skeleton className="h-3 w-20 bg-white/20" />
											<Skeleton className="h-3 w-12 bg-white/20" />
										</div>

										{/* Specialties */}
										<div className="flex gap-1">
											<Skeleton className="h-5 w-20 rounded-md bg-white/20" />
											<Skeleton className="h-5 w-24 rounded-md bg-white/20" />
											<Skeleton className="h-5 w-8 rounded-md bg-white/20" />
										</div>

										{/* Contact Button */}
										<Skeleton className="h-8 w-full rounded-md bg-white/20" />
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</SectionWrapper>
	);
}
