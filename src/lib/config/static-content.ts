/**
 * Static content configuration
 * This replaces the dynamic CMS with static content
 */

export interface ContactInfo {
	type: "phone" | "email" | "address" | "social";
	label: string;
	value: string;
	icon?: string;
	href?: string;
}

export interface PageSection {
	id: string;
	title?: string;
	subtitle?: string;
	description?: string;
	content?: Record<string, any>;
	images?: string[];
}

// Static contact information
export const CONTACT_INFO: ContactInfo[] = [
	{
		type: "phone",
		label: "Teléfono Principal",
		value: "+1 (555) 123-4567",
		icon: "phone",
		href: "tel:+15551234567",
	},
	{
		type: "email",
		label: "Email de Contacto",
		value: "contacto@brymar.com",
		icon: "mail",
		href: "mailto:contacto@brymar.com",
	},
	{
		type: "address",
		label: "Oficina Principal",
		value: "123 Main Street, Ciudad, Estado 12345",
		icon: "map-pin",
	},
	{
		type: "social",
		label: "Facebook",
		value: "facebook.com/brymar",
		icon: "facebook",
		href: "https://facebook.com/brymar",
	},
	{
		type: "social",
		label: "Instagram",
		value: "@brymar_properties",
		icon: "instagram",
		href: "https://instagram.com/brymar_properties",
	},
];

// Static page sections
export const PAGE_SECTIONS = {
	home: {
		hero: {
			id: "hero",
			title: "Encuentra tu Hogar Ideal",
			subtitle: "Propiedades Premium en las Mejores Ubicaciones",
			description:
				"Descubre una amplia selección de propiedades exclusivas, desde apartamentos modernos hasta casas de lujo.",
			content: {
				ctaText: "Explorar Propiedades",
				ctaLink: "/properties",
				backgroundImage:
					"https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop",
			},
		},
		"featured-properties": {
			id: "featured-properties",
			title: "Últimas Propiedades Destacadas",
			subtitle: "Propiedades Destacadas",
			description:
				"Descubre nuestra selección cuidadosamente elegida de propiedades premium - cada una seleccionada por su valor excepcional y características únicas.",
		},
		team: {
			id: "team",
			title: "Conoce a los Visionarios Detrás de Tu Éxito",
			subtitle: "Nuestro Equipo",
			description:
				"Un equipo poderoso de expertos inmobiliarios, cada uno aportando experiencia única y pasión para transformar tus sueños de propiedad en realidad.",
		},
		categories: {
			id: "categories",
			title: "Explora las mejores propiedades con servicios expertos",
			subtitle: "Categorías",
			description:
				"Descubre una amplia gama de propiedades premium, desde apartamentos de lujo hasta villas espaciosas, adaptadas a tus necesidades",
		},
		faq: {
			id: "faq",
			title: "Todo sobre Marbry Inmobiliaria",
			subtitle: "FAQs",
			description:
				"Sabemos que comprar, vender o invertir en bienes raíces puede ser abrumador. Aquí tienes las preguntas más frecuentes para guiarte en el proceso.",
			content: {
				faqs: [
					{
						id: "faq-1",
						question: "¿Puedo personalizar mi propiedad ideal?",
						answer:
							"Absolutamente. En Marbry Inmobiliaria trabajamos contigo para encontrar propiedades que se adapten perfectamente a tus necesidades específicas, desde apartamentos de lujo hasta villas espaciosas, todo personalizado según tus preferencias y presupuesto.",
					},
					{
						id: "faq-3",
						question: "¿Cuáles son los pasos para comprar con Marbry?",
						answer:
							"Nuestro proceso es simple: 1) Consulta inicial gratuita para entender tus necesidades, 2) Búsqueda personalizada de propiedades, 3) Visitas guiadas a propiedades seleccionadas, 4) Negociación y asesoría legal, 5) Cierre exitoso con soporte completo.",
					},
					{
						id: "faq-4",
						question: "¿Qué hace diferente a Marbry Inmobiliaria?",
						answer:
							"Nuestra combinación única de experiencia local, tecnología avanzada, servicio personalizado y red de contactos exclusiva. Cada cliente recibe atención VIP con acceso a propiedades off-market y asesoría experta durante todo el proceso.",
					},
				],
			},
		},
		features: {
			id: "features",
			title: "¿Por qué Elegir Brymar?",
			subtitle: "Experiencia y Confianza en Bienes Raíces",
			description:
				"Más de 10 años ayudando a familias a encontrar su hogar perfecto.",
			content: {
				features: [
					{
						icon: "home",
						title: "Propiedades Verificadas",
						description:
							"Todas nuestras propiedades pasan por un riguroso proceso de verificación.",
					},
					{
						icon: "users",
						title: "Asesoría Personalizada",
						description:
							"Nuestro equipo de expertos te acompaña en todo el proceso.",
					},
					{
						icon: "shield-check",
						title: "Transacciones Seguras",
						description:
							"Garantizamos la seguridad y transparencia en cada transacción.",
					},
					{
						icon: "clock",
						title: "Disponibilidad 24/7",
						description:
							"Estamos disponibles cuando nos necesites, cualquier día de la semana.",
					},
				],
			},
		},
		testimonials: {
			id: "testimonials",
			title: "Lo que Dicen Nuestros Clientes",
			subtitle: "Testimonios Reales de Familias Satisfechas",
			content: {
				testimonials: [
					{
						name: "María González",
						role: "Propietaria",
						content:
							"Excelente servicio, encontramos nuestra casa ideal en tiempo récord.",
						rating: 5,
						image:
							"https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=150&h=150&auto=format&fit=crop",
					},
					{
						name: "Carlos Rodríguez",
						role: "Inversionista",
						content:
							"Profesionales confiables que me ayudaron a hacer una excelente inversión.",
						rating: 5,
						image:
							"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&h=150&auto=format&fit=crop",
					},
					{
						name: "Ana Martínez",
						role: "Primera Compradora",
						content:
							"Me guiaron paso a paso en mi primera compra. Muy recomendados.",
						rating: 5,
						image:
							"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&h=150&auto=format&fit=crop",
					},
				],
			},
		},
	},
	about: {
		mission: {
			id: "mission",
			title: "Nuestra Misión",
			description:
				"Conectar a las personas con sus hogares ideales a través de un servicio excepcional y tecnología innovadora.",
			content: {
				values: [
					"Transparencia en cada transacción",
					"Compromiso con la excelencia",
					"Innovación tecnológica",
					"Servicio personalizado",
				],
			},
		},
		team: {
			id: "team",
			title: "Nuestro Equipo",
			subtitle: "Profesionales Comprometidos con tu Éxito",
			content: {
				members: [
					{
						name: "Roberto Brymar",
						role: "Director General",
						experience: "15 años de experiencia",
						image:
							"https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&h=300&auto=format&fit=crop",
					},
					{
						name: "Laura Sánchez",
						role: "Gerente de Ventas",
						experience: "10 años de experiencia",
						image:
							"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&h=300&auto=format&fit=crop",
					},
				],
			},
		},
	},
};

// Helper functions to get static content
export function getContactInfo(): ContactInfo[] {
	return CONTACT_INFO;
}

export function getContactInfoByType(type: ContactInfo["type"]): ContactInfo[] {
	return CONTACT_INFO.filter((info) => info.type === type);
}

export function getContactInfoValue(
	type: ContactInfo["type"],
	fallback: string = "",
): string {
	const info = CONTACT_INFO.find((item) => item.type === type);
	return info?.value || fallback;
}

export function getPageSection(
	page: string,
	section: string,
): PageSection | null {
	const pageData = PAGE_SECTIONS[page as keyof typeof PAGE_SECTIONS];
	if (!pageData) return null;

	return pageData[section as keyof typeof pageData] || null;
}

export function getPageSections(page: string): PageSection[] {
	const pageData = PAGE_SECTIONS[page as keyof typeof PAGE_SECTIONS];
	if (!pageData) return [];

	return Object.values(pageData);
}
