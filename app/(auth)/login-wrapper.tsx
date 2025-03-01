import { WavyBackground } from "@/components/ui/wavy-background";
import { cn } from "@/lib/utils";

export function LoginWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const colors = [
    "hsl(var(--color-2))",
    "hsl(var(--color-1))",
    "hsl(var(--color-5))",
    "hsl(var(--color-3))",
    "hsl(var(--color-4))",
  ];
  return (
    <div
      className={cn(
        "flex items-center justify-center w-screen min-h-screen h-auto bg-foreground dark:bg-foreground text-black",
        className
      )}
    >
      {children}
    </div>
  );
}
