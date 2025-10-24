"use client";

import {
	BookOpenIcon,
	ExternalLinkIcon,
	FileTextIcon,
	HelpCircleIcon,
	MailIcon,
	MessageCircleIcon,
	PhoneIcon,
	VideoIcon,
} from "lucide-react";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function HelpPage() {
	const helpSections = [
		{
			title: "Guías de Usuario",
			description: "Aprende a usar todas las funciones de la plataforma",
			icon: BookOpenIcon,
			items: [
				{ title: "Crear una propiedad", type: "guide" },
				{ title: "Gestionar terrenos", type: "guide" },
				{ title: "Configurar perfil", type: "guide" },
				{ title: "Usar el blog", type: "guide" },
			],
		},
		{
			title: "Tutoriales en Video",
			description: "Videos paso a paso para dominar la plataforma",
			icon: VideoIcon,
			items: [
				{ title: "Introducción a la plataforma", type: "video" },
				{ title: "Subir fotos de propiedades", type: "video" },
				{ title: "Configurar notificaciones", type: "video" },
			],
		},
		{
			title: "Preguntas Frecuentes",
			description: "Respuestas a las dudas más comunes",
			icon: HelpCircleIcon,
			items: [
				{ title: "¿Cómo cambio mi contraseña?", type: "faq" },
				{ title: "¿Puedo eliminar una propiedad?", type: "faq" },
				{ title: "¿Cómo contacto soporte?", type: "faq" },
				{ title: "¿Qué formatos de imagen acepta?", type: "faq" },
			],
		},
		{
			title: "Documentación",
			description: "Documentación técnica y de referencia",
			icon: FileTextIcon,
			items: [
				{ title: "API de propiedades", type: "docs" },
				{ title: "Integración con terceros", type: "docs" },
				{ title: "Términos de servicio", type: "docs" },
			],
		},
	];

	const contactOptions = [
		{
			title: "Chat en Vivo",
			description: "Habla con nuestro equipo de soporte",
			icon: MessageCircleIcon,
			action: "Iniciar Chat",
			available: true,
		},
		{
			title: "Email",
			description: "Envíanos un correo electrónico",
			icon: MailIcon,
			action: "support@brymar.com",
			available: true,
		},
		{
			title: "Teléfono",
			description: "Llámanos durante horario de oficina",
			icon: PhoneIcon,
			action: "+1 (555) 123-4567",
			available: false,
		},
	];

	return (
		<DashboardPageLayout
			title="Centro de Ayuda"
			description="Encuentra respuestas, guías y soporte para usar la plataforma"
		>
			<div className="space-y-6">
				{/* Help Sections */}
				<div className="grid gap-6 md:grid-cols-2">
					{helpSections.map((section) => {
						const IconComponent = section.icon;
						return (
							<Card key={section.title}>
								<CardHeader>
									<div className="flex items-center gap-2">
										<IconComponent className="h-5 w-5 text-primary" />
										<CardTitle className="text-lg">{section.title}</CardTitle>
									</div>
									<CardDescription>{section.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{section.items.map((item) => (
											<div
												key={`${item.title}-${item.type}`}
												className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
											>
												<span className="text-sm">{item.title}</span>
												<div className="flex items-center gap-2">
													<Badge variant="secondary" className="text-xs">
														{item.type}
													</Badge>
													<ExternalLinkIcon className="h-3 w-3 text-muted-foreground" />
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{/* Contact Support */}
				<Card>
					<CardHeader>
						<CardTitle>Contactar Soporte</CardTitle>
						<CardDescription>
							¿No encuentras lo que buscas? Nuestro equipo está aquí para
							ayudarte
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-3">
							{contactOptions.map((option) => {
								const IconComponent = option.icon;
								return (
									<div
										key={option.title}
										className="flex flex-col items-center text-center p-4 border rounded-lg"
									>
										<IconComponent className="h-8 w-8 text-primary mb-2" />
										<h3 className="font-medium mb-1">{option.title}</h3>
										<p className="text-sm text-muted-foreground mb-3">
											{option.description}
										</p>
										<Button
											variant={option.available ? "default" : "secondary"}
											size="sm"
											disabled={!option.available}
										>
											{option.action}
										</Button>
										{!option.available && (
											<Badge variant="outline" className="mt-2 text-xs">
												Próximamente
											</Badge>
										)}
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>

				{/* Quick Links */}
				<Card>
					<CardHeader>
						<CardTitle>Enlaces Rápidos</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-2 md:grid-cols-2">
							<Button variant="outline" className="justify-start">
								<BookOpenIcon className="h-4 w-4 mr-2" />
								Guía de Inicio Rápido
							</Button>
							<Button variant="outline" className="justify-start">
								<VideoIcon className="h-4 w-4 mr-2" />
								Tour de la Plataforma
							</Button>
							<Button variant="outline" className="justify-start">
								<HelpCircleIcon className="h-4 w-4 mr-2" />
								Preguntas Frecuentes
							</Button>
							<Button variant="outline" className="justify-start">
								<MessageCircleIcon className="h-4 w-4 mr-2" />
								Comunidad de Usuarios
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</DashboardPageLayout>
	);
}
