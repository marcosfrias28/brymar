"use client";

import { cn } from "@/lib/utils";
import { FigmaImageContainer } from "@/components/ui/figma-image-container";
import { FigmaCircularButton, ArrowIcon } from "@/components/ui/figma-circular-button";

// Dream House Section
export function FigmaDreamHouseSection() {
  return (
    <section className="relative w-full bg-figma-dark-green py-20 lg:py-32">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 gap-1 h-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-px bg-gradient-to-b from-white/10 to-black/10" />
          ))}
        </div>
      </div>

      <div className="relative z-10 px-4 lg:px-20">
        <div className="flex justify-center">
          <div className="relative">
            <FigmaImageContainer
              src="/hero-grid/house-3.avif"
              alt="Dream house with modern architecture"
              title="DREAM HOUSE"
              size="xl"
              className="max-w-6xl"
            >
              {/* Play button overlay */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <button className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105">
                  <svg width="60" height="60" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M89.4446 44.5714C89.4446 69.1174 69.5462 89.0159 45.0001 89.0159C20.4541 89.0159 0.555664 69.1174 0.555664 44.5714C0.555664 20.0254 20.4541 0.126953 45.0001 0.126953C69.5462 0.126953 89.4446 20.0254 89.4446 44.5714ZM60.039 44.2589C60.4094 44.0451 60.4094 43.5105 60.039 43.2966L37.8961 30.5125C37.5257 30.2986 37.0628 30.5659 37.0628 30.9936V56.562C37.0628 56.9896 37.5257 57.2569 37.8961 57.0431L60.039 44.2589Z"
                      fill="white"
                    />
                  </svg>
                </button>
              </div>
            </FigmaImageContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

// The Project Section
export function FigmaProjectSection() {
  return (
    <section className="relative w-full bg-figma-dark-green py-20 lg:py-32">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 gap-1 h-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-px bg-gradient-to-b from-white/10 to-black/10" />
          ))}
        </div>
      </div>

      <div className="relative z-10 px-4 lg:px-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left side - Section title */}
          <div className="flex-1">
            <div className="flex items-center gap-7 mb-8">
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
                  </svg>
                </div>
              </div>
              
              <h2 className="font-satoshi text-4xl lg:text-5xl font-normal text-figma-white">
                The Project
              </h2>
            </div>

            <p className="text-figma-white font-sofia-pro text-xl leading-relaxed max-w-lg">
              Together, we can conquer challenges, utilize our strengths, and achieve remarkable success in this ambitious home project.
            </p>
          </div>

          {/* Right side - Navigation arrows */}
          <div className="flex items-center gap-4">
            <button className="w-16 h-16 rounded-full border border-white/50 flex items-center justify-center transition-all hover:bg-white/10">
              <svg width="20" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.1514 16.7069C9.76092 17.0974 9.12775 17.0974 8.73723 16.7069L2.73723 10.7069C2.34671 10.3163 2.34671 9.68317 2.73723 9.29265L8.73723 3.29265C9.12775 2.90212 9.76092 2.90212 10.1514 3.29265C10.542 3.68317 10.542 4.31634 10.1514 4.70686L5.85855 8.99976L17.4443 8.99976C17.9966 8.99976 18.4443 9.44747 18.4443 9.99976C18.4443 10.552 17.9966 10.9998 17.4443 10.9998L5.85855 10.9998L10.1514 15.2926C10.542 15.6832 10.542 16.3163 10.1514 16.7069Z"
                  fill="white"
                />
              </svg>
            </button>
            <button className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center transition-all hover:bg-white/10">
              <svg width="20" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.8486 3.29289C11.2391 2.90237 11.8722 2.90237 12.2628 3.29289L18.2628 9.29289C18.6533 9.68342 18.6533 10.3166 18.2628 10.7071L12.2628 16.7071C11.8722 17.0976 11.2391 17.0976 10.8486 16.7071C10.458 16.3166 10.458 15.6834 10.8486 15.2929L15.1414 11L3.55566 11C3.00338 11 2.55566 10.5523 2.55566 10C2.55566 9.44771 3.00338 9 3.55566 9L15.1414 9L10.8486 4.70711C10.458 4.31658 10.458 3.68342 10.8486 3.29289Z"
                  fill="white"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Project image */}
        <div className="mt-16 flex justify-center">
          <FigmaImageContainer
            src="/hero-grid/house-3.avif"
            alt="Modern villa project"
            size="xl"
            className="max-w-6xl rounded-[79px]"
          />
        </div>
      </div>
    </section>
  );
}

// Our Quality Section
export function FigmaQualitySection() {
  return (
    <section className="relative w-full bg-figma-dark-green py-20 lg:py-32">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 gap-1 h-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-px bg-gradient-to-b from-white/10 to-black/10" />
          ))}
        </div>
      </div>

      <div className="relative z-10 px-4 lg:px-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left side - Content */}
          <div className="flex-1 max-w-2xl">
            {/* Section title */}
            <div className="flex items-center gap-7 mb-16">
              <div className="relative">
                <div className="w-28 h-28 rounded-full border border-white/50" />
                <div className="absolute top-2 left-2 w-28 h-28 rounded-full border border-white/50" />
                <div className="absolute top-4 left-4">
                  <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25.474 38.6734L21.8137 27.8592L10.6868 25.8972L21.428 21.8873L23.6556 10.5217L27.3159 21.3359L38.4429 23.2979L27.7017 27.3078L25.474 38.6734Z" fill="#E09B6B" />
                  </svg>
                </div>
              </div>
              <h2 className="font-satoshi text-4xl lg:text-5xl font-normal text-figma-white">Our Quality</h2>
            </div>

            {/* Main title */}
            <h3 className="font-satoshi text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-figma-quality-gradient uppercase mb-8">
              Design a cozy and fresh interior.
            </h3>

            {/* Description */}
            <p className="text-figma-medium-gray font-sofia-pro text-xl leading-relaxed mb-16 max-w-lg">
              Crafting an Inviting Haven: Unveiling the Art of Designing a Cozy and Fresh Interior for Unmatched Comfort and Serenity
            </p>

            {/* Get Started button */}
            <FigmaButton variant="primary" size="lg" className="font-inter font-bold text-figma-dark-green">
              Get Started
            </FigmaButton>
          </div>

          {/* Right side - Kitchen images */}
          <div className="flex-1 relative">
            {/* Background blurred image */}
            <div className="absolute right-0 top-8">
              <FigmaImageContainer
                src="/hero-grid/house-3.avif"
                alt="Modern kitchen background"
                size="lg"
                className="blur-md opacity-60"
              />
            </div>

            {/* Foreground main image */}
            <div className="relative z-10">
              <FigmaImageContainer
                src="/hero-grid/house-3.avif"
                alt="Beautiful modern kitchen"
                size="xl"
                className="max-w-2xl"
              />
              
              {/* Circular action button */}
              <div className="absolute -bottom-8 -right-8">
                <FigmaCircularButton
                  icon={<ArrowIcon className="text-figma-dark-green" />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
