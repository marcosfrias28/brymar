"use client";

import { Building2, Home, Landmark, Mail, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { PillContainer, PillLink } from "@/components/ui/pill-container";

const menuItems = [
	{ icon: Home, href: "/", label: "Inicio" },
	{
		icon: Building2,
		href: "/search?type=properties",
		label: "Propiedades",
	},
	{ icon: Landmark, href: "/search?type=lands", label: "Terrenos" },
	{ icon: Users, href: "/about", label: "Nosotros" },
	{ icon: Mail, href: "/contact", label: "Contacto" },
];

export function NavigationPills() {
	const pathname = usePathname();

	return (
		<PillContainer>
			{menuItems.map((item) => {
				const isActive =
					pathname === item.href ||
					(item.href !== "/" && pathname.startsWith(item.href));

				return (
					<Link key={item.href} href={item.href}>
						<PillLink isActive={isActive}>{item.label}</PillLink>
					</Link>
				);
			})}

			{/* Menú avanzado 'Más' con NavigationMenu */}
			<NavigationMenu>
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuTrigger className="text-foreground text-center font-sofia-pro font-medium transition-all rounded-full flex items-center gap-1 h-auto whitespace-nowrap px-3 py-2 text-sm">
							Más
						</NavigationMenuTrigger>
						<NavigationMenuContent className="p-4 backdrop-blur-xl border border-white/20 shadow-xl">
							<div className="grid grid-cols-2 gap-4 max-w-2xl w-full">
								{/* Sección Servicios */}
								<div className="space-y-3">
									<h4 className="text-sm font-semibold text-card-foreground whitespace-nowrap">
										Servicios
									</h4>
									<div className="space-y-2">
										<NavigationMenuLink asChild>
											<Link
												href="/services/valuation"
												className="block p-2 rounded-md hover:bg-secondary/60 hover:text-secondary-foreground transition-colors"
											>
												<div className="text-sm font-medium text-card-foreground whitespace-nowrap">
													Valuación
												</div>
												<div className="text-xs text-muted-foreground whitespace-nowrap">
													Evaluación profesional
												</div>
											</Link>
										</NavigationMenuLink>
										<NavigationMenuLink asChild>
											<Link
												href="/services/consulting"
												className="block p-2 rounded-md hover:bg-secondary/60 hover:text-secondary-foreground transition-colors"
											>
												<div className="text-sm font-medium text-card-foreground whitespace-nowrap">
													Consultoría
												</div>
												<div className="text-xs text-muted-foreground whitespace-nowrap">
													Asesoría especializada
												</div>
											</Link>
										</NavigationMenuLink>
										<NavigationMenuLink asChild>
											<Link
												href="/services/legal"
												className="block p-2 rounded-md hover:bg-secondary/60 hover:text-secondary-foreground transition-colors"
											>
												<div className="text-sm font-medium text-card-foreground whitespace-nowrap">
													Legal
												</div>
												<div className="text-xs text-muted-foreground whitespace-nowrap">
													Trámites legales
												</div>
											</Link>
										</NavigationMenuLink>
									</div>
								</div>

								{/* Sección Recursos */}
								<div className="space-y-3">
									<h4 className="text-sm font-semibold text-card-foreground whitespace-nowrap">
										Recursos
									</h4>
									<div className="space-y-2">
										<NavigationMenuLink asChild>
											<Link
												href="/blog"
												className="block p-2 rounded-md hover:bg-secondary/60 hover:text-secondary-foreground transition-colors"
											>
												<div className="text-sm font-medium text-card-foreground whitespace-nowrap">
													Blog
												</div>
												<div className="text-xs text-muted-foreground whitespace-nowrap">
													Artículos y noticias
												</div>
											</Link>
										</NavigationMenuLink>
										<NavigationMenuLink asChild>
											<Link
												href="/guides"
												className="block p-2 rounded-md hover:bg-secondary/60 hover:text-secondary-foreground transition-colors"
											>
												<div className="text-sm font-medium text-card-foreground whitespace-nowrap">
													Guías
												</div>
												<div className="text-xs text-muted-foreground whitespace-nowrap">
													Guías de compra/venta
												</div>
											</Link>
										</NavigationMenuLink>
										<NavigationMenuLink asChild>
											<Link
												href="/calculator"
												className="block p-2 rounded-md hover:bg-secondary/60 hover:text-secondary-foreground transition-colors"
											>
												<div className="text-sm font-medium text-card-foreground whitespace-nowrap">
													Calculadora
												</div>
												<div className="text-xs text-muted-foreground whitespace-nowrap">
													Calculadora hipotecaria
												</div>
											</Link>
										</NavigationMenuLink>
									</div>
								</div>
							</div>

							{/* Sección destacada */}
							<div className="mt-4 pt-4 border-t border-border">
								<NavigationMenuLink asChild>
									<Link
										href="/premium"
										className="flex items-center p-3 rounded-lg bg-gradient-to-r from-accent/20 to-primary/20 hover:from-accent/30 hover:to-primary/30 transition-all border border-accent/20"
									>
										<div className="flex-1">
											<div className="text-sm font-semibold text-card-foreground whitespace-nowrap">
												Servicios Premium
											</div>
											<div className="text-xs text-muted-foreground whitespace-nowrap">
												Acceso exclusivo a herramientas avanzadas
											</div>
										</div>
										<div className="ml-2 px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full whitespace-nowrap">
											Nuevo
										</div>
									</Link>
								</NavigationMenuLink>
							</div>
						</NavigationMenuContent>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
		</PillContainer>
	);
}
