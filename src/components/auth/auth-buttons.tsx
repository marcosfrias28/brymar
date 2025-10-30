"use client";

import { LogInIcon, UserCheck2, User as UserIcon } from "lucide-react";
import Link from "next/link";
import LogOutButton from "@/components/auth/logout-button";
import { ModeToggle } from "@/components/mode-toggle";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { PillContainer, PillLink } from "@/components/ui/pill-container";
import { useAdmin } from "@/hooks/use-admin";
import { useUser } from "@/hooks/use-user";
import getProfileItems from "@/lib/navbar/getProfileItems";

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
									{/* Información del usuario */}
									<div className="border-border/50 border-b px-3 py-2 text-muted-foreground text-sm">
										<Link href={role === "admin" ? "/dashboard" : "/profile"}>
											<div className="truncate whitespace-nowrap font-medium text-card-foreground">
												{user.name ||
													`${user.firstName || ""} ${
														user.lastName || ""
													}`.trim() ||
													user.email}
											</div>
											<div className="whitespace-nowrap text-xs capitalize">
												{role === "admin"
													? "Administrador"
													: role === "agent"
														? "Agente"
														: "Usuario"}
											</div>
										</Link>
									</div>

									{/* Elementos del menú basados en rol */}
									{profileItems.map(({ icon: Icon, href, label }) => (
										<NavigationMenuLink asChild key={href}>
											<Link href={href}>
												<div className="flex flex-nowrap items-center gap-2 whitespace-nowrap rounded-sm px-3 py-2 transition-colors hover:bg-secondary/60 hover:text-secondary-foreground">
													<Icon className="h-4 w-4" />
													<span className="truncate">{label}</span>
												</div>
											</Link>
										</NavigationMenuLink>
									))}

									{profileItems.length > 0 && (
										<div className="my-1 border-border/50 border-t" />
									)}

									{/* Cerrar sesión */}
									<NavigationMenuLink asChild>
										<LogOutButton user={null} />
									</NavigationMenuLink>
								</NavigationMenuContent>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
				) : (
					<>
						<Link href="/sign-in">
							<PillLink>
								<span className="hidden sm:inline">Iniciar sesión</span>
								<LogInIcon className="h-4 w-4 sm:hidden" />
							</PillLink>
						</Link>
						<Link href="/sign-up">
							<PillLink isActive={true}>
								<span className="hidden sm:inline">Registrarse</span>
								<UserCheck2 className="h-4 w-4 sm:hidden" />
							</PillLink>
						</Link>
					</>
				)}
			</PillContainer>
			{showModeToggle && <ModeToggle />}
		</div>
	);
}
