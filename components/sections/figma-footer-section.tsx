"use client";

import { cn } from "@/lib/utils";
import { FigmaImageContainer } from "@/components/ui/figma-image-container";
import { FigmaCircularButton, ArrowIcon } from "@/components/ui/figma-circular-button";

// Let's Combine Our Strengths Section
export function FigmaCombineSection() {
  return (
    <section className="relative w-full bg-figma-black py-20 lg:py-32">
      <div className="relative z-10 px-4 lg:px-20">
        {/* Main title */}
        <div className="text-center mb-16">
          <h2 className="font-satoshi text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-medium leading-tight text-figma-combine-gradient uppercase tracking-tight">
            Let's combine our strengths
          </h2>
        </div>

        {/* Property showcase */}
        <div className="flex justify-center">
          <div className="relative">
            <FigmaImageContainer
              src="/hero-grid/house-3.avif"
              alt="Luxury property exterior"
              size="lg"
              rotation={-3.9}
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
    </section>
  );
}

// Footer Section
export function FigmaFooterSection() {
  return (
    <footer className="relative w-full bg-figma-dark-green py-16">
      <div className="relative z-10 px-4 lg:px-20">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-8">
            <svg
              width="62"
              height="63"
              viewBox="0 0 63 63"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16"
            >
              <path
                d="M30.3848 49.4033V25.1646L40.5494 15L50.714 25.1646L52.2778 26.7284"
                stroke="white"
                strokeWidth="11.1111"
              />
              <path
                d="M10.0557 49.4033V25.1646L20.2203 15L30.3849 25.1646V49.4033"
                stroke="white"
                strokeWidth="11.1111"
              />
            </svg>
            <span className="text-figma-white font-encode-sans text-2xl font-bold">
              SK BUILDERS
            </span>
          </div>

          {/* Description */}
          <p className="text-figma-white/50 font-sofia-pro text-xl lg:text-2xl font-medium leading-relaxed max-w-2xl mb-12">
            We take great pride in ensuring the satisfaction of our customers, which
          </p>

          {/* Social media icons */}
          <div className="flex items-center gap-7 mb-16">
            {/* Facebook */}
            <a href="#" className="w-6 h-6 text-white/80 hover:text-white transition-colors">
              <svg viewBox="0 0 23 23" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.7779 11.5554C22.7779 5.41895 17.8033 0.444336 11.6668 0.444336C5.53027 0.444336 0.555664 5.41895 0.555664 11.5554C0.555664 17.1012 4.61881 21.698 9.93066 22.5316V14.7673H7.10948V11.5554H9.93066V9.10753C9.93066 6.32281 11.5895 4.78461 14.1275 4.78461C15.3428 4.78461 16.6147 5.00163 16.6147 5.00163V7.736H15.2137C13.8334 7.736 13.4029 8.59256 13.4029 9.47211V11.5554H16.4845L15.9919 14.7673H13.4029V22.5316C18.7147 21.698 22.7779 17.1012 22.7779 11.5554Z" />
              </svg>
            </a>
            
            {/* Twitter */}
            <a href="#" className="w-6 h-6 text-white/80 hover:text-white transition-colors">
              <svg viewBox="0 0 23 23" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.43547 20.5836C15.8191 20.5836 20.406 13.6361 20.406 7.61308C20.406 7.41777 20.4016 7.21811 20.3929 7.0228C21.2852 6.37752 22.0552 5.57826 22.6668 4.66256C21.8358 5.03228 20.9535 5.27375 20.05 5.3787C21.0013 4.80849 21.7136 3.91272 22.0548 2.85744C21.1599 3.3878 20.1812 3.76192 19.1607 3.96377C18.4731 3.23317 17.564 2.74943 16.5739 2.58733C15.5838 2.42523 14.5679 2.59381 13.6832 3.067C12.7986 3.54019 12.0944 4.29164 11.6796 5.20516C11.2649 6.11869 11.1626 7.14341 11.3886 8.12089C9.57652 8.02996 7.80378 7.55923 6.1853 6.73922C4.56683 5.91922 3.13874 4.76824 1.99363 3.36091C1.41162 4.36436 1.23352 5.55177 1.49553 6.68181C1.75755 7.81185 2.44001 8.79973 3.40422 9.44468C2.68035 9.42169 1.97234 9.2268 1.33868 8.8761V8.93252C1.33803 9.98557 1.70208 11.0063 2.36894 11.8213C3.0358 12.6363 3.96432 13.1952 4.99666 13.403C4.32611 13.5865 3.62234 13.6132 2.93981 13.4811C3.23111 14.3868 3.79789 15.1788 4.56103 15.7468C5.32418 16.3149 6.24562 16.6304 7.19675 16.6495C5.58201 17.9179 3.58733 18.6059 1.53399 18.6027C1.16985 18.6021 0.806061 18.5798 0.44458 18.5358C2.53056 19.8741 4.95711 20.5849 7.43547 20.5836Z" />
              </svg>
            </a>
            
            {/* Instagram */}
            <a href="#" className="w-6 h-6 text-white/80 hover:text-white transition-colors">
              <svg viewBox="0 0 23 23" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.4446 2.4452C14.4134 2.4452 14.7649 2.45822 15.9325 2.51031C17.0175 2.55805 17.6035 2.74034 17.9941 2.89225C18.5106 3.09191 18.8838 3.33496 19.2701 3.72125C19.6608 4.11187 19.8995 4.48079 20.0991 4.99729C20.251 5.38791 20.4333 5.97819 20.4811 7.05892C20.5332 8.23079 20.5462 8.58236 20.5462 11.5468C20.5462 14.5155 20.5332 14.8671 20.4811 16.0346C20.4333 17.1197 20.251 17.7056 20.0991 18.0962C19.8995 18.6127 19.6564 18.986 19.2701 19.3723C18.8795 19.7629 18.5106 20.0016 17.9941 20.2013C17.6035 20.3532 17.0132 20.5355 15.9325 20.5832C14.7606 20.6353 14.409 20.6483 11.4446 20.6483C8.47586 20.6483 8.1243 20.6353 6.95676 20.5832C5.87169 20.5355 5.28575 20.3532 4.89513 20.2013C4.37864 20.0016 4.00537 19.7586 3.61909 19.3723C3.22846 18.9817 2.98975 18.6127 2.79009 18.0962C2.63818 17.7056 2.45589 17.1153 2.40815 16.0346C2.35607 14.8627 2.34304 14.5112 2.34304 11.5468C2.34304 8.57802 2.35607 8.22645 2.40815 7.05892C2.45589 5.97385 2.63818 5.38791 2.79009 4.99729C2.98975 4.48079 3.2328 4.10753 3.61909 3.72125C4.00971 3.33062 4.37864 3.09191 4.89513 2.89225C5.28575 2.74034 5.87603 2.55805 6.95676 2.51031C8.1243 2.45822 8.47586 2.4452 11.4446 2.4452ZM11.4446 0.444336C8.42811 0.444336 8.05051 0.457357 6.86561 0.50944C5.68506 0.561523 4.87343 0.752496 4.1703 1.02593C3.43679 1.31239 2.81614 1.69 2.19982 2.31066C1.57916 2.92698 1.20155 3.54764 0.915093 4.2768C0.641656 4.98427 0.450684 5.79156 0.3986 6.97211C0.346517 8.16135 0.333496 8.53895 0.333496 11.5554C0.333496 14.5719 0.346517 14.9495 0.3986 16.1344C0.450684 17.315 0.641656 18.1266 0.915093 18.8298C1.20155 19.5633 1.57916 20.1839 2.19982 20.8002C2.81614 21.4166 3.4368 21.7985 4.16596 22.0806C4.87343 22.3541 5.68072 22.545 6.86127 22.5971C8.04617 22.6492 8.42377 22.6622 11.4403 22.6622C14.4568 22.6622 14.8344 22.6492 16.0193 22.5971C17.1998 22.545 18.0114 22.3541 18.7146 22.0806C19.4437 21.7985 20.0644 21.4166 20.6807 20.8002C21.297 20.1839 21.679 19.5633 21.9611 18.8341C22.2345 18.1266 22.4255 17.3193 22.4776 16.1388C22.5297 14.9539 22.5427 14.5763 22.5427 11.5598C22.5427 8.54329 22.5297 8.16569 22.4776 6.98079C22.4255 5.80024 22.2345 4.98861 21.9611 4.28548C21.6877 3.54763 21.3101 2.92698 20.6894 2.31066C20.0731 1.69434 19.4524 1.31239 18.7233 1.03027C18.0158 0.756836 17.2085 0.565864 16.0279 0.51378C14.8387 0.457357 14.4611 0.444336 11.4446 0.444336Z" />
                <path d="M11.4445 5.84814C8.29348 5.84814 5.73706 8.40457 5.73706 11.5556C5.73706 14.7067 8.29348 17.2631 11.4445 17.2631C14.5956 17.2631 17.152 14.7067 17.152 11.5556C17.152 8.40457 14.5956 5.84814 11.4445 5.84814ZM11.4445 15.2579C9.40026 15.2579 7.74227 13.5999 7.74227 11.5556C7.74227 9.51134 9.40026 7.85335 11.4445 7.85335C13.4888 7.85335 15.1468 9.51134 15.1468 11.5556C15.1468 13.5999 13.4888 15.2579 11.4445 15.2579Z" />
                <path d="M18.7103 5.62251C18.7103 6.36035 18.1114 6.95497 17.3779 6.95497C16.64 6.95497 16.0454 6.35601 16.0454 5.62251C16.0454 4.88466 16.6444 4.29004 17.3779 4.29004C18.1114 4.29004 18.7103 4.889 18.7103 5.62251Z" />
              </svg>
            </a>
            
            {/* LinkedIn */}
            <a href="#" className="w-6 h-6 text-white/80 hover:text-white transition-colors">
              <svg viewBox="0 0 23 23" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.7997 0.444336H1.86304C0.955919 0.444336 0.222412 1.16048 0.222412 2.0459V21.0607C0.222412 21.9461 0.955919 22.6666 1.86304 22.6666H20.7997C21.7068 22.6666 22.4446 21.9461 22.4446 21.065V2.0459C22.4446 1.16048 21.7068 0.444336 20.7997 0.444336ZM6.81529 19.381H3.51668V8.77333H6.81529V19.381ZM5.16599 7.32802C4.10696 7.32802 3.25193 6.47298 3.25193 5.41829C3.25193 4.36361 4.10696 3.50857 5.16599 3.50857C6.22068 3.50857 7.07571 4.36361 7.07571 5.41829C7.07571 6.46864 6.22068 7.32802 5.16599 7.32802ZM19.159 19.381H15.8648V14.2247C15.8648 12.9964 15.8431 11.4122 14.1504 11.4122C12.436 11.4122 12.1755 12.7534 12.1755 14.1379V19.381H8.88561V8.77333H12.0453V10.223H12.0887C12.5271 9.38965 13.6035 8.50857 15.2051 8.50857C18.5427 8.50857 19.159 10.7048 19.159 13.5607V19.381Z" />
              </svg>
            </a>
          </div>

          {/* Navigation links */}
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 text-figma-white font-jakarta-sans text-xl font-medium mb-16">
            <a href="#" className="hover:text-figma-orange transition-colors">HOME</a>
            <div className="w-px h-6 bg-white/50" />
            <a href="#" className="hover:text-figma-orange transition-colors">ABOUT</a>
            <div className="w-px h-6 bg-white/50" />
            <a href="#" className="hover:text-figma-orange transition-colors">PROPERTIES</a>
            <div className="w-px h-6 bg-white/50" />
            <a href="#" className="hover:text-figma-orange transition-colors">BLOG</a>
            <div className="w-px h-6 bg-white/50" />
            <a href="#" className="hover:text-figma-orange transition-colors">PRICING</a>
          </div>

          {/* Divider line */}
          <div className="w-full h-px bg-white/50 mb-8" />

          {/* Copyright */}
          <p className="text-figma-white/70 font-sofia-pro text-lg">
            © 2024 SK Builders. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
