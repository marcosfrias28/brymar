"use client";

import { LogInIcon, UserCheck2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";
import LogOutButton from "../../auth/logout-button";

export type ProfileItem = {
	icon: React.ComponentType<{ className?: string }>;
	href: string;
	label: string;
};

type UserSectionProps = {
	user: User | null;
	role: string | null;
	profileItems: ProfileItem[];
	className?: string;
	linkClassName?: string;
	iconClassName?: string;
	closeMenu?: () => void;
	isMobile?: boolean;
};

const getRoleDisplayText = (role: string | null) => {
	switch (role) {
		case "admin":
			return "Administrador";
		case "agent":
			return "Agente";
		default:
			return "Usuario";
	}
};

export function UserSection({
	user,
	role,
	profileItems,
	className,
	linkClassName = "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50",
	iconClassName = "h-5 w-5 text-muted-foreground",
	closeMenu,
	isMobile = false,
}: UserSectionProps) {
	const handleClick = () => {
		if (closeMenu) {
			closeMenu();
		}
	};

	return (
		<div className={cn("space-y-2", className)}>
			{user ? (
				<>
					{isMobile ? (
						<div className="rounded-lg bg-muted/50 px-3 py-2">
							<div className="truncate font-medium text-sm">
								{user.name ||
									`${user.firstName || ""} ${user.lastName || ""}`.trim() ||
									user.email}
							</div>
							<div className="text-muted-foreground text-xs capitalize">
								{getRoleDisplayText(role)}
							</div>
						</div>
					) : (
						<div className="border-border/50 border-b px-3 py-2 text-muted-foreground text-sm">
							<Link href={role === "admin" ? "/dashboard" : "/profile"}>
								<div className="truncate whitespace-nowrap font-medium text-card-foreground">
									{user.name ||
										`${user.firstName || ""} ${user.lastName || ""}`.trim() ||
										user.email}
								</div>
								<div className="whitespace-nowrap text-xs capitalize">
									{getRoleDisplayText(role)}
								</div>
							</Link>
						</div>
					)}

					{profileItems.map(({ icon: Icon, href, label }) => (
						<Link
							className={linkClassName}
							href={href}
							key={href}
							onClick={handleClick}
						>
							<Icon className={iconClassName} />
							<span className="font-medium">{label}</span>
						</Link>
					))}

					{profileItems.length > 0 && !isMobile && (
						<div className="my-1 border-border/50 border-t" />
					)}

					<LogOutButton user={null} />
				</>
			) : (
				<div className="space-y-3">
					<Link
						className={cn(
							"flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 transition-colors hover:bg-secondary/60 hover:text-secondary-foreground",
							isMobile && "w-full"
						)}
						href="/sign-in"
						onClick={handleClick}
					>
						<LogInIcon className="h-4 w-4" />
						<span className="font-medium">Iniciar Sesión</span>
					</Link>
					<Link
						className={cn(
							"flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-accent-foreground transition-colors hover:bg-accent/90",
							isMobile && "w-full"
						)}
						href="/sign-up"
						onClick={handleClick}
					>
						<UserCheck2 className="h-4 w-4" />
						<span className="font-medium">Registrarse</span>
					</Link>
				</div>
			)}
		</div>
	);
}
