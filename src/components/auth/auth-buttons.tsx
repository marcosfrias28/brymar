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

interface AuthButtonsProps {
	className?: string;
	showModeToggle?: boolean;
}

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
								<NavigationMenuTrigger className="text-foreground text-center font-sofia-pro font-medium transition-all hover:bg-white/20 hover:text-white rounded-full flex items-center gap-2 h-auto whitespace-nowrap px-3 py-2 text-sm">
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
								<NavigationMenuContent className="backdrop-blur-sm border border-border/50 shadow-xl w-80 sm:w-96">
									{/* Información del usuario */}
									<div className="px-3 py-2 text-sm text-muted-foreground border-b border-border/50">
										<Link href={role === "admin" ? "/dashboard" : "/profile"}>
											<div className="font-medium text-card-foreground whitespace-nowrap truncate">
												{user.name ||
													`${user.firstName || ""} ${
														user.lastName || ""
													}`.trim() ||
													user.email}
											</div>
											<div className="text-xs capitalize whitespace-nowrap">
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
										<NavigationMenuLink key={href} asChild>
											<Link href={href}>
												<div className="flex items-center flex-nowrap gap-2 px-3 py-2 hover:bg-secondary/60 hover:text-secondary-foreground transition-colors rounded-sm whitespace-nowrap">
													<Icon className="h-4 w-4" />
													<span className="truncate">{label}</span>
												</div>
											</Link>
										</NavigationMenuLink>
									))}

									{profileItems.length > 0 && (
										<div className="border-t border-border/50 my-1" />
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
