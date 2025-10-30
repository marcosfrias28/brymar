"use client";

import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function NewsSection() {
	const news = [
		{
			title: "Tendencias del Mercado 2024",
			description:
				"Análisis de las últimas tendencias del mercado inmobiliario y predicciones",
			date: "2024-03-15",
			image:
				"https://images.unsplash.com/photo-1460472178825-e5240623afd5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
		},
		{
			title: "Oportunidades de Inversión",
			description:
				"Descubre las mejores zonas para invertir en inmuebles este año",
			date: "2024-03-10",
			image:
				"https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
		},
	];

	return (
		<section className="bg-muted/50 px-4 py-16">
			<div className="container mx-auto">
				<h2 className="mb-4 text-center font-bold text-4xl">
					Últimas Noticias
				</h2>
				<p className="mb-12 text-center text-muted-foreground text-xl">
					Mantente actualizado con las tendencias del mercado inmobiliario
				</p>
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
					{news.map((item, index) => (
						<Card className="" key={index}>
							<img
								alt={item.title}
								className="h-48 w-full object-cover"
								src={item.image}
							/>
							<CardHeader>
								<div className="mb-2 flex items-center text-muted-foreground text-sm">
									<Calendar className="mr-2 h-4 w-4" />
									{new Date(item.date).toLocaleDateString("es")}
								</div>
								<CardTitle>{item.title}</CardTitle>
								<CardDescription>{item.description}</CardDescription>
							</CardHeader>
							<CardContent>
								<Button variant="outline">Leer Más</Button>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
