import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

type SectionWrapperProps = {
	children: React.ReactNode;
	className?: string;
	containerClassName?: string;
	id?: string;
};

export function SectionWrapper({
	children,
	className,
	containerClassName,
	id,
}: SectionWrapperProps) {
	return (
		<section className={cn("px-4 py-32", inter.className, className)} id={id}>
			<div className={cn("container mx-auto", containerClassName)}>
				{children}
			</div>
		</section>
	);
}

type SectionHeaderProps = {
	title: string;
	subtitle?: string;
	description?: string;
	icon?: React.ReactNode;
	className?: string;
	titleClassName?: string;
	subtitleClassName?: string;
	descriptionClassName?: string;
};

export function SectionHeader({
	title,
	subtitle,
	description,
	icon,
	className,
	titleClassName,
	subtitleClassName,
	descriptionClassName,
}: SectionHeaderProps) {
	return (
		<div className={cn("mb-12 pt-24 text-center", className)}>
			{subtitle && (
				<p
					className={cn(
						"mb-2 flex items-center justify-center gap-2.5 font-medium text-primary text-sm uppercase tracking-wide",
						subtitleClassName
					)}
				>
					{icon && icon}
					{subtitle}
				</p>
			)}
			<h2
				className={cn(
					"mb-4 font-bold text-3xl text-foreground lg:text-5xl xl:text-4xl",
					titleClassName
				)}
			>
				{title}
			</h2>
			{description && (
				<p
					className={cn(
						"mx-auto max-w-3xl text-lg text-muted-foreground leading-relaxed",
						descriptionClassName
					)}
				>
					{description}
				</p>
			)}
		</div>
	);
}
