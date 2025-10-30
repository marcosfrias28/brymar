import type { ReactNode } from "react";

type StatItem = {
	label: string;
	value: number | string;
	icon: ReactNode; // Cambiado de LucideIcon a ReactNode para aceptar elementos JSX
	color: string;
};

type CompactStatsProps = {
	stats: StatItem[];
	className?: string;
};

export function CompactStats({ stats, className = "" }: CompactStatsProps) {
	return (
		<div
			className={`rounded-lg border border-blackCoral bg-white p-4 ${className}`}
		>
			<div className="flex flex-wrap items-center justify-between gap-4">
				{stats.map((stat, index) => (
					<div className="flex min-w-0 items-center gap-3" key={index}>
						<div className="rounded-lg bg-blackCoral/10 p-2">
							<div className={stat.color}>{stat.icon}</div>
						</div>
						<div className="min-w-0">
							<p className="truncate text-blackCoral/70 text-xs">
								{stat.label}
							</p>
							<p className={`font-bold text-lg ${stat.color} truncate`}>
								{stat.value}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
