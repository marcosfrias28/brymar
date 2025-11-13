"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { useAvoidRoutes } from "@/hooks/use-avoid-routes";
import { useUser } from "@/hooks/use-user";
import getProfileItems from "@/lib/navbar/getProfileItems";
import { cn } from "@/lib/utils";
import { AuthButtons } from "./auth/auth-buttons";
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
		<div
			className={cn(
				"-translate-x-1/2 container fixed top-4 left-1/2 z-50 w-full transform",
				"rounded-full bg-background p-4 text-foreground",
				className
			)}
		>
			{/* Desktop Navigation */}
			<div className="hidden w-full items-center justify-between xl:flex">
				<div className="-mt-3 flex items-center gap-2">
					<Logo height="h-12" width="w-72" />
				</div>
				<NavigationPills />
				<AuthButtons showModeToggle={false} />
			</div>

			{/* Mobile Navigation */}
			<div className="flex w-full items-center justify-between xl:hidden">
				<Logo />
				<div className="flex items-center gap-2">
					<MobileNavbar
						isOpen={mobileMenuOpen}
						onOpenChange={setMobileMenuOpen}
						profileItems={profileItems}
						role={role || null}
						user={user}
					/>
				</div>
			</div>
		</div>
	);
}
