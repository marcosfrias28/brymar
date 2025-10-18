"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAvoidRoutes } from "@/hooks/use-avoid-routes";
import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import Logo from "./ui/logo";
import getProfileItems from "@/lib/navbar/getProfileItems";
import { ModeToggle } from "./mode-toggle";
import { AuthButtons } from "./auth/auth-buttons";
import { NavigationPills } from "./navigation/navigation-pills";
import { MobileNavbar } from "./navigation/mobile-navbar";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const shouldAvoid = useAvoidRoutes();
  const { role, permissions } = useAdmin();
  const { user } = useAuth();

  if (shouldAvoid) return null;

  const profileItems = user && role ? getProfileItems(role, permissions) : [];

  return (
    <nav
      className={cn(
        "fixed left-1/2 transform -translate-x-1/2 z-50 w-full max-w-7xl px-4 top-4",
        className
      )}
    >
      {/* Desktop Navigation */}
      <div className="hidden md:flex justify-between items-center w-full bg-black/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4">
        <div>
          <Logo />
        </div>
        <NavigationPills />
        <div>
          <AuthButtons />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex justify-between items-center w-full bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4">
        <div>
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          <div>
            <ModeToggle />
          </div>
          <MobileNavbar
            isOpen={mobileMenuOpen}
            onOpenChange={setMobileMenuOpen}
            user={user}
            role={role || null}
            profileItems={profileItems}
          />
        </div>
      </div>
    </nav>
  );
}
