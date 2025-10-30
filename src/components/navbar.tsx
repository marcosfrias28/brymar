"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { useAvoidRoutes } from "@/hooks/use-avoid-routes";
import { useUser } from "@/hooks/use-user";
import getProfileItems from "@/lib/navbar/getProfileItems";
import { cn } from "@/lib/utils";
import { AuthButtons } from "./auth/auth-buttons";
import { ModeToggle } from "./mode-toggle";
import { MobileNavbar } from "./navigation/mobile-navbar";
import { NavigationPills } from "./navigation/navigation-pills";
import Logo from "./ui/logo";

type NavbarProps = {
	className?: string;
};

export function Navbar({ className }: NavbarProps) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
	const shouldAvoid = useAvoidRoutes();
	const { role, permissions } = useAdmin();
	const { user } = useUser();

	if (shouldAvoid) {
		return null;
	}

	const profileItems = user && role ? getProfileItems(role, permissions) : [];

	return (
		<nav
			className={cn(
				"-translate-x-1/2 fixed top-4 left-1/2 z-50 w-full max-w-7xl transform px-4",
				className
			)}
		>
			{/* Desktop Navigation */}
			<div className="hidden w-full items-center justify-between rounded-2xl border border-white/20 bg-black/20 p-4 shadow-2xl backdrop-blur-xl md:flex">
				<div>
					<Logo />
				</div>
				<NavigationPills />
				<div>
					<AuthButtons />
				</div>
			</div>

			{/* Mobile Navigation */}
			<div className="flex w-full items-center justify-between rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-xl md:hidden">
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
						profileItems={profileItems}
						role={role || null}
						user={user}
					/>
				</div>
			</div>
		</nav>
	);
}
