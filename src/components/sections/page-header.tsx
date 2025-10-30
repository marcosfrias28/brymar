"use client";

import { Home } from "lucide-react";

type PageHeaderProps = {
	title: string;
	subtitle: string;
	icon?: React.ReactNode;
};

export function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
	return (
		<section className="!pt-40 relative overflow-x-hidden bg-cover pb-20 text-center">
			<div className="flex items-center justify-center gap-2.5">
				<span className="rounded-full border border-secondary/30 bg-secondary/20 p-2">
					{icon || <Home className="h-5 w-5 text-primary" />}
				</span>
				<p className="font-semibold text-base text-dark/75 dark:text-white/75">
					{title}
				</p>
			</div>
			<h2 className="relative font-bold text-6xl text-dark dark:text-white">
				Discover inspiring designed homes.
			</h2>
			<p className="mx-auto w-full font-normal text-dark/50 text-lg dark:text-white/50">
				{subtitle}
			</p>
			<div className="absolute top-10 left-10 h-20 w-20 rounded-full bg-secondary/10 blur-xl" />
			<div className="absolute right-10 bottom-10 h-16 w-16 rounded-full bg-secondary/15 blur-lg" />
		</section>
	);
}
