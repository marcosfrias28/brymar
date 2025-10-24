import { CategoriesSection } from "@/components/sections/categories-section";
import { FAQSection } from "@/components/sections/faq-section";
import { FeaturedPropertiesSection } from "@/components/sections/featured-properties-section";
import { Footer } from "@/components/sections/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { PropertyShowcaseSection } from "@/components/sections/property-showcase-section";
import { TeamSection } from "@/components/sections/team-section";

export default function Home() {
	return (
		<>
			<HeroSection />
			<CategoriesSection />
			<FeaturedPropertiesSection />
			<PropertyShowcaseSection />
			<TeamSection />
			<FAQSection />
			<Footer />
		</>
	);
}
