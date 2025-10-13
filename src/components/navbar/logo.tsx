"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center space-x-2", className)}>
      <Building2 className="h-6 w-6" />
      <span className="font-bold text-xl">BryMar</span>
    </Link>
  );
}