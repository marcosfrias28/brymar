"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
	{
		name: "Sarah Johnson",
		role: "CEO, Global Investments Ltd.",
		image:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
		quote: {
			en: "Their expertise in luxury real estate is unmatched. They found us a stunning penthouse that exceeded all our expectations.",
			es: "Su experiencia en bienes raíces de lujo no tiene comparación. Nos encontraron un ático impresionante que superó todas nuestras expectativas.",
			it: "La loro esperienza nel settore immobiliare di lusso è impareggiabile. Ci hanno trovato un attico straordinario che ha superato tutte le nostre aspettative.",
		},
	},
	{
		name: "Marco Rossi",
		role: "International Property Investor",
		image:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
		quote: {
			en: "Their global network and market insights have been invaluable for diversifying my property portfolio across continents.",
			es: "Su red global y conocimientos del mercado han sido invaluables para diversificar mi cartera de propiedades en varios continentes.",
			it: "La loro rete globale e le intuizioni di mercato sono state inestimabili per diversificare il mio portafoglio immobiliare in diversi continenti.",
		},
	},
	{
		name: "Elena García",
		role: "Luxury Home Owner",
		image:
			"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
		quote: {
			en: "The personalized attention and discretion they provided throughout the buying process was exemplary. Truly a white-glove service.",
			es: "La atención personalizada y la discreción que proporcionaron durante todo el proceso de compra fue ejemplar. Verdaderamente un servicio de guante blanco.",
			it: "L'attenzione personalizzata e la discrezione che hanno fornito durante tutto il processo di acquisto sono state esemplari. Davvero un servizio di altissimo livello.",
		},
	},
];

export function Testimonials() {
	const [activeIndex, setActiveIndex] = useState(0);

	const title = "Lo que dicen nuestros clientes";
	const subtitle = "Testimonios de clientes satisfechos con nuestros servicios";

	return (
		<section className="bg-muted px-4 py-24">
			<div className="container mx-auto">
				<motion.h2
					animate={{ opacity: 1, y: 0 }}
					className="mb-4 text-center font-bold text-4xl text-foreground md:text-5xl"
					initial={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.8 }}
				>
					{title}
				</motion.h2>
				<motion.p
					animate={{ opacity: 1, y: 0 }}
					className="mx-auto mb-16 max-w-3xl text-center text-muted-foreground text-xl"
					initial={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.8, delay: 0.2 }}
				>
					{subtitle}
				</motion.p>
				<div className="relative">
					<motion.div
						animate={{ x: `-${activeIndex * 100}%` }}
						className="flex"
						transition={{ duration: 0.5 }}
					>
						{testimonials.map((testimonial, index) => (
							<div className="w-full shrink-0" key={index}>
								<Card className="mx-auto max-w-4xl bg-background shadow-xl">
									<CardContent className="p-12">
										<Quote className="mb-8 h-12 w-12 text-muted-foreground" />
										<p className="mb-8 text-2xl text-foreground italic">
											{testimonial.quote.es}
										</p>
										<div className="flex items-center">
											<Avatar className="mr-4 h-16 w-16">
												<AvatarImage
													alt={testimonial.name}
													src={testimonial.image}
												/>
												<AvatarFallback>{testimonial.name[0]}</AvatarFallback>
											</Avatar>
											<div>
												<p className="font-semibold text-foreground text-xl">
													{testimonial.name}
												</p>
												<p className="text-muted-foreground">
													{testimonial.role}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						))}
					</motion.div>
					<div className="mt-8 flex justify-center">
						{testimonials.map((_, index) => (
							<button
								className={`mx-2 h-3 w-3 rounded-full ${
									index === activeIndex
										? "bg-foreground"
										: "bg-muted-foreground/30"
								}`}
								key={index}
								onClick={() => setActiveIndex(index)}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
