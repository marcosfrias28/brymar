"use client";

import type { LucideIcon } from "lucide-react";
import {
	BookOpenIcon,
	ExternalLinkIcon,
	FileTextIcon,
	HelpCircleIcon,
	LifeBuoyIcon,
	MailIcon,
	MessageCircleIcon,
	PhoneIcon,
	VideoIcon,
} from "lucide-react";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
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
import { getStatsAdapter } from "@/lib/adapters/stats-adapters";

// Data constants
const HELP_SECTIONS = [
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

const CONTACT_OPTIONS = [
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

const FILTER_TABS = [
	{ label: "Todo", value: "all" },
	{ label: "Guías", value: "guides" },
	{ label: "Videos", value: "videos" },
	{ label: "FAQ", value: "faq" },
	{ label: "Documentación", value: "docs" },
	{ label: "Soporte", value: "support" },
];

// Helper components
type HelpSection = {
	title: string;
	description: string;
	icon: LucideIcon;
	items: Array<{ title: string; type: string }>;
};

function HelpSectionCard({ section }: { section: HelpSection }) {
	const IconComponent = section.icon;
	return (
		<Card>
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
							className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-muted/50"
							key={`${item.title}-${item.type}`}
						>
							<span className="text-sm">{item.title}</span>
							<div className="flex items-center gap-2">
								<Badge className="text-xs" variant="secondary">
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
}

type ContactOption = {
	title: string;
	description: string;
	icon: LucideIcon;
	action: string;
	available: boolean;
};

function ContactOptionCard({ option }: { option: ContactOption }) {
	const IconComponent = option.icon;
	return (
		<div
			className="flex flex-col items-center rounded-lg border p-4 text-center"
			key={option.title}
		>
			<IconComponent className="mb-2 h-8 w-8 text-primary" />
			<h3 className="mb-1 font-medium">{option.title}</h3>
			<p className="mb-3 text-muted-foreground text-sm">{option.description}</p>
			<Button
				disabled={!option.available}
				size="sm"
				variant={option.available ? "default" : "secondary"}
			>
				{option.action}
			</Button>
			{!option.available && (
				<Badge className="mt-2 text-xs" variant="outline">
					Próximamente
				</Badge>
			)}
		</div>
	);
}

export default function HelpPage() {
	// Generate stats from help sections
	const statsAdapter = getStatsAdapter("admin");
	const helpStatsData = {
		totalGuides: HELP_SECTIONS.reduce(
			(sum, section) => sum + section.items.length,
			0
		),
		totalVideos:
			HELP_SECTIONS.find((s) => s.title === "Tutoriales en Video")?.items
				.length || 0,
		totalFAQs:
			HELP_SECTIONS.find((s) => s.title === "Preguntas Frecuentes")?.items
				.length || 0,
		totalDocs:
			HELP_SECTIONS.find((s) => s.title === "Documentación")?.items.length || 0,
		supportTickets: 12,
		avgResponseTime: 2.5,
	};
	const statsCards = statsAdapter
		? statsAdapter.generateStats(helpStatsData)
		: [];

	return (
		<DashboardPageLayout
			actions={
				<Button variant="outline">
					<LifeBuoyIcon className="mr-2 h-4 w-4" />
					Contactar Soporte
				</Button>
			}
			description="Encuentra respuestas, guías y soporte para usar la plataforma"
			headerExtras={<FilterTabs className="mb-4" tabs={FILTER_TABS} />}
			stats={statsCards}
			statsLoading={false}
			title="Centro de Ayuda"
		>
			<div className="space-y-6">
				<div className="grid gap-6 xl:grid-cols-2">
					{HELP_SECTIONS.map((section) => (
						<HelpSectionCard key={section.title} section={section} />
					))}
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Contactar Soporte</CardTitle>
						<CardDescription>
							¿No encuentras lo que buscas? Nuestro equipo está aquí para
							ayudarte
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 xl:grid-cols-3">
							{CONTACT_OPTIONS.map((option) => (
								<ContactOptionCard key={option.title} option={option} />
							))}
						</div>
					</CardContent>
				</Card>

				{/* Quick Links */}
				<Card>
					<CardHeader>
						<CardTitle>Enlaces Rápidos</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-2 xl:grid-cols-2">
							<Button className="justify-start" variant="outline">
								<BookOpenIcon className="mr-2 h-4 w-4" />
								Guía de Inicio Rápido
							</Button>
							<Button className="justify-start" variant="outline">
								<VideoIcon className="mr-2 h-4 w-4" />
								Tour de la Plataforma
							</Button>
							<Button className="justify-start" variant="outline">
								<HelpCircleIcon className="mr-2 h-4 w-4" />
								Preguntas Frecuentes
							</Button>
							<Button className="justify-start" variant="outline">
								<MessageCircleIcon className="mr-2 h-4 w-4" />
								Comunidad de Usuarios
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</DashboardPageLayout>
	);
}
