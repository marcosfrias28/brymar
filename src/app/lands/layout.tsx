"use client";

import { ReactNode } from "react";
import { SectionHeader, SectionWrapper } from "@/components/ui/section-wrapper";
import { TreePine } from "lucide-react";

export default function LandsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SectionWrapper>
        <SectionHeader
          subtitle="Terrenos"
          title="Explora terrenos disponibles"
          description="Encuentra el terreno perfecto con información completa y filtros avanzados."
          icon={<TreePine />}
        />
      </SectionWrapper>
      {children}
    </>
  );
}

