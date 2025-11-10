"use client";

import { motion } from "framer-motion";
import { Globe, Home, Key, Search, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const services = [
	{
		title: "Búsqueda Global de Propiedades",
		description:
			"Accede a nuestro portafolio curado de las propiedades más prestigiosas del mundo, desde villas frente al mar hasta áticos urbanos.",
		icon: Search,
		color: "bg-blue-500",
	},
	{
		title: "Gestión de Propiedades de Lujo",
		description:
			"Servicios integrales de gestión para mantener y mejorar el valor de tus propiedades de alta gama.",
		icon: Home,
		color: "bg-green-500",
	},
	{
		title: "Experiencia VIP de Compra",
		description:
			"Orientación personalizada durante tu adquisición de propiedades de lujo, incluyendo visitas privadas y negociaciones.",
		icon: Key,
		color: "bg-purple-500",
	},
	{
		title: "Asesoría de Inversión",
		description:
			"Consejos expertos sobre oportunidades de inversión inmobiliaria premium y estrategias de diversificación de portafolio.",
		icon: TrendingUp,
		color: "bg-red-500",
	},
	{
		title: "Reubicación Internacional",
		description:
			"Servicios de reubicación sin problemas para clientes globales, incluyendo asistencia con visas y orientación local.",
		icon: Globe,
		color: "bg-chart-3",
	},
	{
		title: "Transacciones Seguras",
		description:
			"Garantiza la confidencialidad y seguridad de tus transacciones inmobiliarias de alto valor con nuestro equipo legal especializado.",
		icon: Shield,
		color: "bg-chart-4",
	},
];

export function Services() {
	return (
		<section className="bg-white px-4 py-24">
			<div className="container mx-auto">
				<motion.h2
					animate={{ opacity: 1, y: 0 }}
					className="mb-4 text-center font-bold text-4xl text-gray-800 xl:text-5xl"
					initial={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.8 }}
				>
					Nuestros Servicios
				</motion.h2>
				<motion.p
					animate={{ opacity: 1, y: 0 }}
					className="mx-auto mb-16 max-w-3xl text-center text-gray-600 text-xl"
					initial={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.8, delay: 0.2 }}
				>
					Servicios exclusivos diseñados para satisfacer todas tus necesidades
					inmobiliarias de lujo
				</motion.p>
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-3 xl:grid-cols-2">
					{services.map(({ title, description, icon: Icon, color }, index) => (
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							initial={{ opacity: 0, y: 20 }}
							key={index}
							transition={{ duration: 0.8, delay: 0.2 * (index + 1) }}
						>
							<Card className="bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl">
								<CardHeader>
									<div
										className={`${color} mb-4 flex h-16 w-16 items-center justify-center rounded-full`}
									>
										<Icon />
									</div>
									<CardTitle className="font-bold text-2xl text-foreground">
										{title}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<CardDescription className="mb-6 text-muted-foreground">
										{description}
									</CardDescription>
									<Button
										className="border-gray-300 text-gray-800 hover:bg-gray-100"
										variant="outline"
									>
										Saber Más
									</Button>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
