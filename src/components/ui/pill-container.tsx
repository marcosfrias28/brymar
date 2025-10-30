import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Stili condivisi per tutti i componenti pill
const PILL_CONTAINER_STYLES =
	"flex items-center justify-center bg-black/30 backdrop-blur-xl rounded-full shadow-lg border border-white/20 p-1.5 gap-2";

const PILL_BASE_STYLES =
	"text-center font-sofia-pro font-medium transition-all rounded-full whitespace-nowrap px-3 py-2 text-sm";

const PILL_ACTIVE_STYLES =
	"bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm";

const PILL_INACTIVE_STYLES =
	"text-white hover:bg-white/20 hover:text-white hover:shadow-sm";

type PillContainerProps = {
	children: ReactNode;
	className?: string;
};

export function PillContainer({ children, className }: PillContainerProps) {
	return <div className={cn(PILL_CONTAINER_STYLES, className)}>{children}</div>;
}

type PillLinkProps = {
	children: ReactNode;
	isActive?: boolean;
	className?: string;
};

export function PillLink({
	children,
	isActive = false,
	className,
}: PillLinkProps) {
	return (
		<div
			className={cn(
				PILL_BASE_STYLES,
				isActive ? PILL_ACTIVE_STYLES : PILL_INACTIVE_STYLES,
				className
			)}
		>
			{children}
		</div>
	);
}
