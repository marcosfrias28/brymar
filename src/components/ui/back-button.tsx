"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

type BackButtonProps = {
	href?: string;
	label?: string;
	className?: string;
	variant?: "link" | "button";
	onClick?: () => void;
};

export function BackButton({
	href,
	label = "Volver",
	className,
	variant = "button",
	onClick,
}: BackButtonProps) {
	const router = useRouter();

	const handleClick = () => {
		if (onClick) {
			onClick();
		} else if (href) {
			// Will be handled by Link component
			return;
		} else {
			router.back();
		}
	};

	const buttonClasses = cn(
		"inline-flex items-center gap-2 font-medium text-sm transition-colors",
		"rounded-md focus-visible:outline-none",
		secondaryColorClasses.focusRing,
		variant === "button" && [
			"border border-input bg-background px-3 py-2",
			secondaryColorClasses.interactive,
			"hover:text-foreground",
		],
		variant === "link" && [
			"px-1 py-1 text-muted-foreground",
			secondaryColorClasses.navHover,
			"hover:text-foreground",
		],
		className
	);

	if (href) {
		return (
			<Link className={buttonClasses} href={href}>
				<ArrowLeft className="h-4 w-4" />
				<span>{label}</span>
			</Link>
		);
	}

	return (
		<button className={buttonClasses} onClick={handleClick}>
			<ArrowLeft className="h-4 w-4" />
			<span>{label}</span>
		</button>
	);
}
