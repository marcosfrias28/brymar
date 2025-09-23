import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
}

export function SectionWrapper({
  children,
  className,
  containerClassName,
  id,
}: SectionWrapperProps) {
  return (
    <section id={id} className={cn("py-24 px-4", inter.className, className)}>
      <div className={cn("container mx-auto", containerClassName)}>
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  descriptionClassName?: string;
}

export function SectionHeader({
  title,
  subtitle,
  description,
  icon,
  className,
  titleClassName,
  subtitleClassName,
  descriptionClassName,
}: SectionHeaderProps) {
  return (
    <div className={cn("text-center mb-12", className)}>
      {subtitle && (
        <p
          className={cn(
            "text-sm font-medium text-primary uppercase tracking-wide mb-2 flex items-center justify-center gap-2.5",
            subtitleClassName
          )}
        >
          {icon && icon}
          {subtitle}
        </p>
      )}
      <h2
        className={cn(
          "text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4",
          titleClassName
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed",
            descriptionClassName
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
