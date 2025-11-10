"use client";

import Image from "next/image";
import Logo from "@/components/ui/logo";

type AuthWrapperLayoutProps = {
	children: React.ReactNode;
};

export function AuthWrapperLayout({ children }: AuthWrapperLayoutProps) {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 xl:p-10">
				<div className="flex justify-center gap-2 xl:justify-start">
					<Logo />
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">{children}</div>
				</div>
			</div>
			<div className="relative hidden bg-muted lg:block">
				<div className="absolute z-10 h-full w-full bg-gradient-to-l from-70% from-black/40 to-transparent" />
				<Image
					alt="Real Estate Properties"
					className="object-cover"
					fill
					priority
					src="/optimized_villa/1.webp"
				/>
			</div>
		</div>
	);
}
