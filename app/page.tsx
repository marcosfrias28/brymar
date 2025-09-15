import { FigmaHeroSection } from "@/components/sections/figma-hero-section";
import { FigmaAboutSection } from "@/components/sections/figma-about-section";
import { 
  FigmaDreamHouseSection, 
  FigmaProjectSection, 
  FigmaQualitySection 
} from "@/components/sections/figma-property-sections";
import { 
  FigmaCombineSection, 
  FigmaFooterSection 
} from "@/components/sections/figma-footer-section";

export default function Home() {
  return (
    <>
      <FigmaHeroSection />
      <FigmaAboutSection />
      <FigmaDreamHouseSection />
      <FigmaProjectSection />
      <FigmaQualitySection />
      <FigmaCombineSection />
      <FigmaFooterSection />
    </>
  );
}
