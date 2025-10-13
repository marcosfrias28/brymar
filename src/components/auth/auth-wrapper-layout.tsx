"use client";

import Logo from '@/components/ui/logo';
import Image from "next/image";

interface AuthWrapperLayoutProps {
  children: React.ReactNode;
}

export function AuthWrapperLayout({ children }: AuthWrapperLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {children}
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <div className="bg-gradient-to-l from-black/40 from-70% to-transparent absolute w-full h-full z-10 "/>
        <Image
          src="/optimized_villa/1.webp"
          alt="Real Estate Properties"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}