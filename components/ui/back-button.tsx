"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
  variant?: "link" | "button";
  onClick?: () => void;
}

export function BackButton({
  href,
  label = "Volver",
  className,
  variant = "button",
  onClick,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      // Will be handled by Link component
      return;
    } else {
      router.back();
    }
  };

  const buttonClasses = cn(
    "inline-flex items-center gap-2 text-sm font-medium transition-colors",
    "focus-visible:outline-none rounded-md",
    secondaryColorClasses.focusRing,
    variant === "button" && [
      "px-3 py-2 border border-input bg-background",
      secondaryColorClasses.interactive,
      "hover:text-foreground",
    ],
    variant === "link" && [
      "text-muted-foreground px-1 py-1",
      secondaryColorClasses.navHover,
      "hover:text-foreground",
    ],
    className
  );

  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        <ArrowLeft className="h-4 w-4" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button onClick={handleClick} className={buttonClasses}>
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
