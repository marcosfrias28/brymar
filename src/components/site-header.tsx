"use client";

import { Separator } from "@/components/ui/separator";

export function SiteHeader() {
	return (
		<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
			<div className="flex items-center gap-2 flex-1">
				<span className="text-sm text-muted-foreground">
					Dashboard
				</span>
			</div>
		</header>
	);
}
