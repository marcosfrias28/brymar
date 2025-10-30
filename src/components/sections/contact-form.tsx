"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	getContactInfoValueHelper,
	useContactInfo,
} from "@/hooks/use-static-content";

export function ContactForm() {
	const { data: contactInfo, loading: isLoading } = useContactInfo();

	return (
		<section className="bg-gray-50 px-4 py-16">
			<div className="container mx-auto">
				<h2 className="mb-4 text-center font-bold text-4xl text-gray-800">
					Contáctanos
				</h2>
				<p className="mb-12 text-center text-gray-600 text-xl">
					Estamos aquí para ayudarte a encontrar tu propiedad ideal
				</p>
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
					<Card className="border-gray-200 bg-white shadow-lg">
						<CardHeader>
							<CardTitle className="text-gray-800">
								Información de Contacto
							</CardTitle>
							<CardDescription className="text-gray-600">
								Estamos aquí para ayudarte a encontrar tu propiedad ideal
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{isLoading ? (
								<div className="space-y-4">
									<div className="flex items-center">
										<div className="mr-3 h-5 w-5 animate-pulse rounded bg-gray-200" />
										<div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
									</div>
									<div className="flex items-center">
										<div className="mr-3 h-5 w-5 animate-pulse rounded bg-gray-200" />
										<div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
									</div>
									<div className="flex items-center">
										<div className="mr-3 h-5 w-5 animate-pulse rounded bg-gray-200" />
										<div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
									</div>
								</div>
							) : (
								<>
									<div className="flex items-center text-gray-700">
										<MapPin className="mr-3 h-5 w-5 text-gray-500" />
										<p>
											{getContactInfoValueHelper(
												contactInfo,
												"address",
												"Av. Principal 123, Ciudad, País"
											)}
										</p>
									</div>
									<div className="flex items-center text-gray-700">
										<Phone className="mr-3 h-5 w-5 text-gray-500" />
										<p>
											{getContactInfoValueHelper(
												contactInfo,
												"phone",
												"+1 (555) 123-4567"
											)}
										</p>
									</div>
									<div className="flex items-center text-gray-700">
										<Mail className="mr-3 h-5 w-5 text-gray-500" />
										<p>
											{getContactInfoValueHelper(
												contactInfo,
												"email",
												"contacto@brymar.com"
											)}
										</p>
									</div>
								</>
							)}
						</CardContent>
					</Card>

					<Card className="border-gray-200 bg-white shadow-lg">
						<CardHeader>
							<CardTitle className="text-gray-800">
								Envíanos un Mensaje
							</CardTitle>
							<CardDescription className="text-gray-600">
								Completa el formulario y nos pondremos en contacto contigo
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form className="space-y-4">
								<div>
									<Input
										className="border-gray-300 focus:border-gray-500"
										placeholder="Nombre completo"
									/>
								</div>
								<div>
									<Input
										className="border-gray-300 focus:border-gray-500"
										placeholder="Correo electrónico"
										type="email"
									/>
								</div>
								<div>
									<Textarea
										className="border-gray-300 focus:border-gray-500"
										placeholder="Tu mensaje"
										rows={4}
									/>
								</div>
								<Button className="w-full bg-gray-800 text-white hover:bg-gray-700">
									Enviar Mensaje
								</Button>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}
