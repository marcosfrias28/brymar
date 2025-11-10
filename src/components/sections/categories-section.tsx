"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// Using static categories instead of database categories
export type Category = {
	id: number;
	name: string;
	slug: string;
	title: string;
	description: string;
	image: string;
	href: string;
	status: string;
	order: number;
	createdAt: Date;
	updatedAt: Date;
};

import { Briefcase, Building, Home, MapPin } from "lucide-react";
import { useSection } from "@/hooks/use-static-content";
import { cn } from "@/lib/utils";
import { CategoriesSkeleton } from "../skeletons/home/categories-skeleton";
import { Button } from "../ui/button";
import { SectionHeader, SectionWrapper } from "../ui/section-wrapper";

type CategoriesSectionProps = {
	categories?: Category[];
};

// Componente separado para el header que usa el hook
function CategoriesSectionHeader() {
	const { data: section, loading: isLoading } = useSection(
		"home",
		"categories"
	);

	if (isLoading) {
		return (
			<div className="animate-pulse space-y-4">
				<div className="h-4 w-1/4 rounded bg-muted" />
				<div className="h-8 w-3/4 rounded bg-muted" />
				<div className="h-4 w-full rounded bg-muted" />
			</div>
		);
	}

	const subtitle = section?.subtitle || "Categorías";
	const title =
		section?.title || "Explora las mejores propiedades con servicios expertos";
	const description =
		section?.description ||
		"Descubre una amplia gama de propiedades premium, desde apartamentos de lujo hasta villas espaciosas, adaptadas a tus necesidades";

	return (
		<SectionHeader
			className="mb-8 text-left"
			description={description}
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
			subtitle={subtitle}
			subtitleClassName="text-left justify-start"
			title={title}
			titleClassName="text-left text-3xl xl:text-4xl lg:text-5xl"
		/>
	);
}

export function CategoriesSection({ categories = [] }: CategoriesSectionProps) {
	const [mounted, setMounted] = useState(false);
	const { loading: isLoading } = useSection("home", "categories");

	useEffect(() => {
		setMounted(true);
	}, []);

	// Show skeleton while loading or not mounted
	if (!mounted || isLoading) {
		return <CategoriesSkeleton />;
	}

	// Mappa delle icone per categoria
	const categoryIcons: Record<string, React.ComponentType<any>> = {
		"residential-home": Home,
		"luxury-villa": Building,
		apartment: Building,
		"office-spaces": Briefcase,
		default: MapPin,
	};

	// Datos de respaldo preparados para i18n
	const fallbackCategories = [
		{
			id: 1,
			name: "residential-home",
			slug: "residential-home",
			title: "Casas Residenciales",
			description:
				"Experimenta elegancia y comodidad con nuestras exclusivas villas de lujo, diseñadas para una vida sofisticada.",
			image: "/residencial/1.webp",
			href: "/properties?category=residential-home",
			status: "active",
			order: 1,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: 2,
			name: "luxury-villa",
			slug: "luxury-villa",
			title: "Villas de Lujo",
			description:
				"Experimenta elegancia y comodidad con nuestras exclusivas villas de lujo, diseñadas para una vida sofisticada.",
			image: "/residencial/2.webp",
			href: "/properties?category=luxury-villa",
			status: "active",
			order: 2,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: 3,
			name: "apartment",
			slug: "apartment",
			title: "Apartamentos",
			description:
				"Experimenta elegancia y comodidad con nuestros exclusivos apartamentos de lujo, diseñados para una vida sofisticada.",
			image: "/residencial/3.webp",
			href: "/properties?category=apartment",
			status: "active",
			order: 3,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: 4,
			name: "office-spaces",
			slug: "office-spaces",
			title: "Espacios de Oficina",
			description:
				"Espacios comerciales premium diseñados para el éxito empresarial con ubicaciones estratégicas y amenidades modernas.",
			image: "/residencial/4.webp",
			href: "/properties?category=office-spaces",
			status: "active",
			order: 4,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];

	const displayCategories =
		categories.length > 0 ? categories : fallbackCategories;
	const activeCategories = displayCategories
		.filter((cat) => cat.status === "active")
		.sort((a, b) => (a.order || 0) - (b.order || 0));

	return (
		<SectionWrapper className="relative overflow-hidden">
			<div className="grid grid-cols-12 items-center gap-10">
				{/* Header Section */}
				<div className="col-span-12 lg:col-span-6">
					<CategoriesSectionHeader />
					<Button asChild>
						<Link href="/properties">Ver Propiedades</Link>
					</Button>
				</div>

				{/* Categories Grid */}
				{activeCategories.map((category, index) => {
					const isLarge = index < 2;
					const _width = isLarge ? 680 : 300;
					const colSpan = isLarge
						? "lg:col-span-6 col-span-12"
						: "lg:col-span-3 col-span-6";

					return (
						<div
							className={cn(colSpan, "w-full bg-background")}
							key={category.id}
						>
							<Link className="w-full" href={category.href}>
								<div
									className={cn("group relative overflow-hidden rounded-2xl")}
									style={{
										height: "25rem",
									}}
								>
									<Image
										alt={category.title}
										className="object-cover"
										fill
										src={category.image}
									/>
									<div className="absolute top-full flex h-full w-full flex-col justify-between bg-gradient-to-b from-black/0 to-black/80 pb-10 pl-10 transition-all duration-500 group-hover:top-0">
										<div className="mt-6 mr-6 flex justify-end">
											<div className="w-fit rounded-full bg-background p-4 text-foreground">
												{(() => {
													const IconComponent =
														categoryIcons[category.name] ||
														categoryIcons.default;
													return <IconComponent size={24} />;
												})()}
											</div>
										</div>
										<div className="flex flex-col gap-2.5">
											<h3 className="text-2xl text-white">{category.title}</h3>
											<p className="text-base text-white/80 leading-6">
												{category.description}
											</p>
										</div>
									</div>
								</div>
							</Link>
						</div>
					);
				})}
			</div>
		</SectionWrapper>
	);
}

export default CategoriesSection;
