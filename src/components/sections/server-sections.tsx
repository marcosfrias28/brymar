import { Suspense } from "react";
import type { Category } from "@/lib/db/schema";
import {
	CategoriesSkeleton,
	FAQSkeleton,
	FeaturedPropertiesSkeleton,
	TeamSkeleton,
} from "../skeletons/home";
import { CategoriesSection } from "./categories-section";
import { FAQSection } from "./faq-section";
import { FeaturedPropertiesSection } from "./featured-properties-section";
import { TeamSection } from "./team-section";

// Wrapper for FeaturedPropertiesSection
export function ServerFeaturedPropertiesSection() {
	return (
		<Suspense fallback={<FeaturedPropertiesSkeleton />}>
			<FeaturedPropertiesSection />
		</Suspense>
	);
}

// Wrapper for TeamSection
export function ServerTeamSection() {
	return (
		<Suspense fallback={<TeamSkeleton />}>
			<TeamSection />
		</Suspense>
	);
}

// Wrapper for FAQSection
export function ServerFAQSection() {
	return (
		<Suspense fallback={<FAQSkeleton />}>
			<FAQSection />
		</Suspense>
	);
}

// Wrapper for CategoriesSection
interface ServerCategoriesSectionProps {
	categories?: Category[];
}

export function ServerCategoriesSection({
	categories = [],
}: ServerCategoriesSectionProps) {
	return (
		<Suspense fallback={<CategoriesSkeleton />}>
			<CategoriesSection categories={categories} />
		</Suspense>
	);
}
