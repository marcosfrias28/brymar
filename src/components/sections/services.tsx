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
		<section className="py-24 px-4 bg-white">
			<div className="container mx-auto">
				<motion.h2
					className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-800"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					Nuestros Servicios
				</motion.h2>
				<motion.p
					className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
				>
					Servicios exclusivos diseñados para satisfacer todas tus necesidades
					inmobiliarias de lujo
				</motion.p>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
					{services.map(({ title, description, icon: Icon, color }, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.2 * (index + 1) }}
						>
							<Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
								<CardHeader>
									<div
										className={`${color} w-16 h-16 rounded-full flex items-center justify-center mb-4`}
									>
										<Icon />
									</div>
									<CardTitle className="text-2xl font-bold text-foreground">
										{title}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<CardDescription className="text-muted-foreground mb-6">
										{description}
									</CardDescription>
									<Button
										variant="outline"
										className="text-gray-800 border-gray-300 hover:bg-gray-100"
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
