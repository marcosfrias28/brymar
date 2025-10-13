import { SectionWrapper, SectionHeader } from "../../ui/section-wrapper";
import { Skeleton } from "../../ui/skeleton";
import { HelpCircle } from "lucide-react";

export function FAQSkeleton() {
  return (
    <SectionWrapper className="bg-muted/30">
      {/* Header */}
      <SectionHeader
        subtitle="FAQs"
        title="Todo sobre Marbry Inmobiliaria"
        description="Sabemos que comprar, vender o invertir en bienes raíces puede ser abrumador. Aquí tienes las preguntas más frecuentes para guiarte en el proceso."
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
      />

      {/* Grid with FAQ and Images */}
      <div className="grid grid-cols-12 gap-10 items-start mt-12">
        {/* FAQ Accordion - Left */}
        <div className="col-span-12 lg:col-span-7">
          <div className="w-full space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-background/60 backdrop-blur-sm rounded-2xl border-0 shadow-sm overflow-hidden"
              >
                <div className="px-6 py-6">
                  <div className="flex items-start gap-4 w-full">
                    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
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
          <div className="mt-12 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 backdrop-blur-sm">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                <HelpCircle className="w-8 h-8 text-primary" />
              </div>
              <Skeleton className="h-8 w-64 mx-auto mb-3" />
              <Skeleton className="h-6 w-80 mx-auto mb-6" />
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Skeleton className="h-12 w-40" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
          </div>
        </div>

        {/* Images Grid - Right */}
        <div className="col-span-12 lg:col-span-5">
          <div className="grid grid-cols-2 grid-rows-2 gap-10 h-[800px]">
            <Skeleton className="col-span-1 row-span-1 rounded-2xl" />
            <Skeleton className="col-span-1 row-span-1 rounded-2xl" />
            <Skeleton className="col-span-2 row-span-1 rounded-2xl" />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
