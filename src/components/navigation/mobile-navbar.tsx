"use client";

import {
	Building2,
	Home,
	Landmark,
	LogInIcon,
	Mail,
	Menu,
	Settings,
	Shield,
	UserCheck2,
	Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTrigger,
} from "@/components/ui/sheet";
import type { User } from "@/lib/types";
import LogOutButton from "../auth/logout-button";
import { ModeToggle } from "../mode-toggle";
import Logo from "../ui/logo";

type ProfileItem = {
	icon: React.ComponentType<{ className?: string }>;
	href: string;
	label: string;
};

type MobileNavbarProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	user: User | null;
	role: string | null;
	profileItems: ProfileItem[];
};

const menuItems = [
	{ icon: Home, href: "/", label: "Inicio" },
	{ icon: Building2, href: "/search", label: "Buscar Propiedad" },
	{ icon: Landmark, href: "/land", label: "Terrenos" },
	{ icon: Users, href: "/about", label: "Nosotros" },
	{ icon: Mail, href: "/contact", label: "Contacto" },
];

export function MobileNavbar({
	isOpen,
	onOpenChange,
	user,
	role,
	profileItems,
}: MobileNavbarProps) {
	const closeMenu = () => onOpenChange(false);

	return (
		<Sheet onOpenChange={onOpenChange} open={isOpen}>
			<SheetTrigger asChild>
				<Button
					className="h-10 w-10 rounded-full border border-white/20 bg-white/10 shadow-lg backdrop-blur-xl transition-all hover:bg-white/20 hover:text-secondary-foreground md:hidden"
					size="icon"
					variant="ghost"
				>
					<Menu className="h-5 w-5" />
					<span className="sr-only">Abrir menú</span>
				</Button>
			</SheetTrigger>
			<SheetContent className="w-80 p-0" side="right">
				<SheetHeader className="p-6 pb-4">
					<div className="flex items-center justify-between">
						<Logo />
						<ModeToggle />
					</div>
				</SheetHeader>

				<div className="space-y-6 px-6">
					{/* Navigation Links */}
					<div className="space-y-2">
						<h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">
							Navegación
						</h3>
						{menuItems.map((item) => {
							const Icon = item.icon;
							return (
								<Link
									className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
									href={item.href}
									key={item.href}
									onClick={closeMenu}
								>
									<Icon className="h-5 w-5 text-muted-foreground" />
									<span className="font-medium">{item.label}</span>
								</Link>
							);
						})}
					</div>

					<Separator />

					{/* Services Section */}
					<div className="space-y-2">
						<h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">
							Servicios
						</h3>
						<Link
							className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
							href="/services/valuation"
							onClick={closeMenu}
						>
							<Shield className="h-5 w-5 text-muted-foreground" />
							<div>
								<div className="font-medium">Valuación</div>
								<div className="text-muted-foreground text-xs">
									Evaluación profesional
								</div>
							</div>
						</Link>
						<Link
							className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
							href="/services/consulting"
							onClick={closeMenu}
						>
							<Users className="h-5 w-5 text-muted-foreground" />
							<div>
								<div className="font-medium">Consultoría</div>
								<div className="text-muted-foreground text-xs">
									Asesoría especializada
								</div>
							</div>
						</Link>
						<Link
							className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
							href="/services/legal"
							onClick={closeMenu}
						>
							<Settings className="h-5 w-5 text-muted-foreground" />
							<div>
								<div className="font-medium">Legal</div>
								<div className="text-muted-foreground text-xs">
									Trámites legales
								</div>
							</div>
						</Link>
					</div>

					<Separator />

					{/* Resources Section */}
					<div className="space-y-2">
						<h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">
							Recursos
						</h3>
						<Link
							className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
							href="/blog"
							onClick={closeMenu}
						>
							<Mail className="h-5 w-5 text-muted-foreground" />
							<span className="font-medium">Blog</span>
						</Link>
						<Link
							className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
							href="/guides"
							onClick={closeMenu}
						>
							<Building2 className="h-5 w-5 text-muted-foreground" />
							<span className="font-medium">Guías</span>
						</Link>
						<Link
							className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
							href="/calculator"
							onClick={closeMenu}
						>
							<Landmark className="h-5 w-5 text-muted-foreground" />
							<span className="font-medium">Calculadora</span>
						</Link>
					</div>

					<Separator />

					{/* User Section */}
					{user ? (
						<div className="space-y-2">
							<div className="rounded-lg bg-muted/50 px-3 py-2">
								<div className="truncate font-medium text-sm">
									{user.name ||
										`${user.firstName || ""} ${user.lastName || ""}`.trim() ||
										user.email}
								</div>
								<div className="text-muted-foreground text-xs capitalize">
									{role === "admin"
										? "Administrador"
										: role === "agent"
											? "Agente"
											: "Usuario"}
								</div>
							</div>

							{profileItems.map(({ icon: Icon, href, label }) => (
								<Link
									className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
									href={href}
									key={href}
									onClick={closeMenu}
								>
									<Icon className="h-5 w-5 text-muted-foreground" />
									<span className="font-medium">{label}</span>
								</Link>
							))}

							<LogOutButton user={null} />
						</div>
					) : (
						<div className="space-y-3">
							<Link
								className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 transition-colors hover:bg-secondary/60 hover:text-secondary-foreground"
								href="/sign-in"
								onClick={closeMenu}
							>
								<LogInIcon className="h-4 w-4" />
								<span className="font-medium">Iniciar Sesión</span>
							</Link>
							<Link
								className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-accent-foreground transition-colors hover:bg-accent/90"
								href="/sign-up"
								onClick={closeMenu}
							>
								<UserCheck2 className="h-4 w-4" />
								<span className="font-medium">Registrarse</span>
							</Link>
						</div>
					)}

					{/* Premium Section */}
					<div className="mt-6 rounded-lg border border-accent/20 bg-gradient-to-r from-accent/20 to-primary/20 p-4">
						<Link className="block" href="/premium" onClick={closeMenu}>
							<div className="flex items-center justify-between">
								<div>
									<div className="font-semibold text-card-foreground text-sm">
										Servicios Premium
									</div>
									<div className="text-muted-foreground text-xs">
										Herramientas avanzadas
									</div>
								</div>
								<div className="rounded-full bg-accent px-2 py-1 font-medium text-accent-foreground text-xs">
									Nuevo
								</div>
							</div>
						</Link>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
