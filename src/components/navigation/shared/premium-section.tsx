"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type PremiumSectionProps = {
	className?: string;
	linkClassName?: string;
	badgeClassName?: string;
	closeMenu?: () => void;
	isMobile?: boolean;
};

export function PremiumSection({
	className,
	linkClassName = "block",
	badgeClassName = "rounded-full bg-accent px-2 py-1 font-medium text-accent-foreground text-xs",
	closeMenu,
	isMobile = false,
}: PremiumSectionProps) {
	const handleClick = () => {
		if (closeMenu) {
			closeMenu();
		}
	};

	return (
		<div className={cn(
			isMobile 
				? "mt-6 rounded-lg border border-accent/20 bg-gradient-to-r from-accent/20 to-primary/20 p-4"
				: "border-border border-t pt-4",
			className
		)}>
			<Link 
				className={cn(
					linkClassName,
					isMobile 
						? "" 
						: "flex items-center rounded-lg border border-accent/20 bg-gradient-to-r from-accent/20 to-primary/20 p-3 transition-all hover:from-accent/30 hover:to-primary/30"
				)} 
				href="/premium" 
				onClick={handleClick}
			>
				<div className={cn(
					isMobile ? "flex items-center justify-between" : "flex-1"
				)}>
					<div>
						<div className="font-semibold text-card-foreground text-sm">
							Servicios Premium
						</div>
						<div className="text-muted-foreground text-xs">
							{isMobile ? "Herramientas avanzadas" : "Acceso exclusivo a herramientas avanzadas"}
						</div>
					</div>
					<div className={cn(
						badgeClassName,
						isMobile && "ml-2"
					)}>
						Nuevo
					</div>
				</div>
			</Link>
		</div>
	);
}
