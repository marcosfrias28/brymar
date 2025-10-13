"use client";

import { Home } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <section className="text-center bg-cover !pt-40 pb-20 relative overflow-x-hidden">
      <div className="flex gap-2.5 items-center justify-center">
        <span className="p-2 bg-secondary/20 rounded-full border border-secondary/30">
          {icon || <Home className="w-5 h-5 text-primary" />}
        </span>
        <p className="text-base font-semibold text-dark/75 dark:text-white/75">
          {title}
        </p>
      </div>
      <h2 className="text-dark text-6xl relative font-bold dark:text-white">
        Discover inspiring designed homes.
      </h2>
      <p className="text-lg text-dark/50 dark:text-white/50 font-normal w-full mx-auto">
        {subtitle}
      </p>
      <div className="absolute top-10 left-10 w-20 h-20 bg-secondary/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-16 h-16 bg-secondary/15 rounded-full blur-lg"></div>
    </section>
  );
}
