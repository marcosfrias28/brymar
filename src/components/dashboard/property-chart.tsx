"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
	{ month: "Ene", propiedades: 12, terrenos: 8 },
	{ month: "Feb", propiedades: 15, terrenos: 6 },
	{ month: "Mar", propiedades: 18, terrenos: 10 },
	{ month: "Abr", propiedades: 22, terrenos: 12 },
	{ month: "May", propiedades: 25, terrenos: 9 },
	{ month: "Jun", propiedades: 20, terrenos: 15 },
];

const chartConfig = {
	propiedades: {
		label: "Propiedades",
		color: "hsl(213, 12%, 25%)", // arsenic
	},
	terrenos: {
		label: "Terrenos",
		color: "hsl(24, 24%, 75%)", // darkVanilla
	},
};

export function PropertyChart() {
	return (
		<Card className="border-blackCoral shadow-lg">
			<CardHeader>
				<CardTitle className="text-arsenic">Actividad Mensual</CardTitle>
				<CardDescription className="text-blackCoral">
					Propiedades y terrenos agregados por mes
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<ResponsiveContainer height={300} width="100%">
						<BarChart data={chartData}>
							<XAxis
								axisLine={false}
								className="text-blackCoral"
								dataKey="month"
								tickLine={false}
							/>
							<YAxis
								axisLine={false}
								className="text-blackCoral"
								tickLine={false}
							/>
							<ChartTooltip content={<ChartTooltipContent />} cursor={false} />
							<Bar
								dataKey="propiedades"
								fill="var(--color-propiedades)"
								radius={[4, 4, 0, 0]}
							/>
							<Bar
								dataKey="terrenos"
								fill="var(--color-terrenos)"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
