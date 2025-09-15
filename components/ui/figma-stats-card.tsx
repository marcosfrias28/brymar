import { cn } from "@/lib/utils";

interface FigmaStatsCardProps {
  number: string;
  label: string;
  accent?: boolean;
  className?: string;
}

export function FigmaStatsCard({ number, label, accent = false, className }: FigmaStatsCardProps) {
  return (
    <div className={cn("flex flex-col items-start gap-3", className)}>
      <div className="font-helvetica-neue text-6xl md:text-7xl font-bold leading-tight tracking-tight">
        <span className="text-figma-white">{number}</span>
        {accent && <span className="text-figma-orange"> +</span>}
      </div>
      <div className="text-figma-medium-gray font-inter text-xl font-medium leading-relaxed">
        {label}
      </div>
    </div>
  );
}

// Stats section component that displays multiple stats
interface FigmaStatsSectionProps {
  title?: string;
  description?: string;
  stats: Array<{
    number: string;
    label: string;
    accent?: boolean;
  }>;
  className?: string;
}

export function FigmaStatsSection({ title, description, stats, className }: FigmaStatsSectionProps) {
  return (
    <div className={cn("flex flex-col items-start gap-16", className)}>
      {(title || description) && (
        <div className="flex flex-col items-start gap-5 max-w-4xl">
          {title && (
            <h2 className="font-satoshi text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-figma-about-gradient uppercase">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-figma-medium-gray font-sofia-pro text-xl font-medium leading-relaxed max-w-3xl">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="flex flex-wrap items-start gap-20">
        {stats.map((stat, index) => (
          <FigmaStatsCard
            key={index}
            number={stat.number}
            label={stat.label}
            accent={stat.accent}
          />
        ))}
      </div>
    </div>
  );
}
