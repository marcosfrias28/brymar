"use client";

import { cn } from "@/lib/utils";
import { FigmaStatsSection } from "@/components/ui/figma-stats-card";
import { FigmaButton } from "@/components/ui/figma-button";

export function FigmaAboutSection() {
  const stats = [
    {
      number: "10",
      label: "Awards Gained",
      accent: true
    },
    {
      number: "20",
      label: "Years of Experience",
      accent: true
    },
    {
      number: "598",
      label: "Rented Home Stay",
      accent: true
    }
  ];

  return (
    <section className="relative w-full bg-figma-black py-20 lg:py-32">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 gap-1 h-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-px bg-gradient-to-b from-white/10 to-black/10" />
          ))}
        </div>
      </div>

      <div className="relative z-10 px-4 lg:px-20">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-16 lg:gap-32">
          {/* Left side - Section title and description */}
          <div className="flex-1 max-w-md">
            {/* Section title with star icon */}
            <div className="flex items-center gap-7 mb-16">
              {/* Decorative circles */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full border border-white/50" />
                <div className="absolute top-2 left-2 w-28 h-28 rounded-full border border-white/50" />
                
                {/* Star icon */}
                <div className="absolute top-4 left-4">
                  <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M25.474 38.6734L21.8137 27.8592L10.6868 25.8972L21.428 21.8873L23.6556 10.5217L27.3159 21.3359L38.4429 23.2979L27.7017 27.3078L25.474 38.6734Z"
                      fill="#E09B6B"
                    />
                    <path
                      d="M22.2132 27.7127L22.1359 27.4846L21.8984 27.4422L12.2858 25.7472L21.5652 22.283L21.7944 22.1978L21.8415 21.9571L23.7618 12.1612L26.9169 21.4818L26.9943 21.7108L27.2318 21.7523L36.8444 23.4473L27.565 26.9115L27.3358 26.9977L27.2887 27.2374L25.3685 37.0352L22.2132 27.7127Z"
                      stroke="white"
                      strokeOpacity="0.5"
                      strokeWidth="0.844444"
                    />
                  </svg>
                </div>
              </div>
              
              <h2 className="font-satoshi text-4xl lg:text-5xl font-normal text-figma-white">
                About Us
              </h2>
            </div>

            {/* Description */}
            <p className="text-figma-medium-gray font-sofia-pro text-lg leading-relaxed mb-16">
              We take great pride in ensuring the satisfaction of our customers. That's why we proudly guarantee the quality and reliability of our products.
            </p>

            {/* Get Started button */}
            <FigmaButton variant="primary" size="lg" className="font-inter font-bold">
              Get Started
            </FigmaButton>
          </div>

          {/* Right side - Stats section */}
          <div className="flex-1">
            <FigmaStatsSection
              title="We've found luxury homes for clients for a decade."
              description="We take great pride in ensuring the satisfaction of our customers, which is why we guarantee that the products we sell will bring happiness to each and every customer. Our genuine care for customer satisfaction is what sets us apart."
              stats={stats}
              className="max-w-4xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
