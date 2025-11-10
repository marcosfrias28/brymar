"use client";

import { LogInIcon, UserCheck2, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { PillContainer, PillLink } from "@/components/ui/pill-container";
import { useAdmin } from "@/hooks/use-admin";
import { useUser } from "@/hooks/use-user";
import getProfileItems from "@/lib/navbar/getProfileItems";
import { UserSection } from "@/components/navigation/shared/user-section";

type AuthButtonsProps = {
	className?: string;
	showModeToggle?: boolean;
};

export function AuthButtons({
	className = "",
	showModeToggle = true,
}: AuthButtonsProps) {
	const { user } = useUser();
	const { role, permissions } = useAdmin();
	const profileItems = user && role ? getProfileItems(role, permissions) : [];

	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<PillContainer>
				{user ? (
					<NavigationMenu viewport={false}>
						<NavigationMenuList>
							<NavigationMenuItem>
								<NavigationMenuTrigger className="flex h-auto items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-center font-medium font-sofia-pro text-foreground text-sm transition-all hover:bg-white/20 hover:text-white">
									{role === "user" ? (
										<>
											<UserIcon className="h-4 w-4" />
											<span className="hidden sm:inline">Perfil</span>
										</>
									) : (
										<>
											<UserCheck2 className="h-4 w-4" />
											<span className="hidden lg:inline">Dashboard</span>
										</>
									)}
								</NavigationMenuTrigger>
								<NavigationMenuContent className="w-80 border border-border/50 shadow-xl backdrop-blur-sm sm:w-96">
									<UserSection
										className="p-0"
										isMobile={false}
										linkClassName="flex flex-nowrap items-center gap-2 whitespace-nowrap rounded-sm px-3 py-2 transition-colors hover:bg-secondary/60 hover:text-secondary-foreground"
										profileItems={profileItems}
										role={role || null}
										user={user}
									/>
								</NavigationMenuContent>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
				) : (
					<>
						<Link href="/sign-in">
							<PillLink>
								<span className="hidden sm:inline">Iniciar sesión</span>
								<LogInIcon className="h-4 w-4 xl:hidden" />
							</PillLink>
						</Link>
						<Link href="/sign-up">
							<PillLink isActive={true}>
								<span className="hidden sm:inline">Registrarse</span>
								<UserCheck2 className="h-4 w-4 xl:hidden" />
							</PillLink>
						</Link>
					</>
				)}
			</PillContainer>
			{showModeToggle && <ModeToggle />}
		</div>
	);
}
