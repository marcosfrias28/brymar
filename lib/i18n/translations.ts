// Configuración preparada para i18n
// Este archivo contiene todas las traducciones del sitio

export const translations = {
    es: {
        // Navegación
        nav: {
            home: "Inicio",
            properties: "Propiedades",
            about: "Nosotros",
            contact: "Contacto",
            services: "Servicios"
        },

        // Sección Hero
        hero: {
            title: "Encuentra tu Hogar Perfecto",
            subtitle: "Propiedades Premium en Florida",
            description: "Descubre propiedades excepcionales con Marbry Inmobiliaria",
            cta: "Explorar Propiedades"
        },

        // Sección Categorías
        categories: {
            subtitle: "Categorías",
            title: "Explora las mejores propiedades con servicios expertos",
            description: "Descubre una amplia gama de propiedades premium, desde apartamentos de lujo hasta villas espaciosas, adaptadas a tus necesidades",
            cta: "Ver Propiedades",
            types: {
                "residential-home": "Casas Residenciales",
                "luxury-villa": "Villas de Lujo",
                "apartment": "Apartamentos",
                "office-spaces": "Espacios de Oficina"
            }
        },

        // Sección Propiedades Destacadas
        featured: {
            subtitle: "Propiedades Destacadas",
            title: "Últimas Propiedades Destacadas",
            description: "Descubre nuestra selección cuidadosamente elegida de propiedades premium - cada una seleccionada por su valor excepcional y características únicas.",
            placeholder: {
                title: "Propiedad Destacada",
                location: "Próximamente"
            }
        },

        // Sección Equipo
        team: {
            subtitle: "Nuestro Equipo",
            title: "Conoce a los Visionarios Detrás de Tu Éxito",
            description: "Un equipo poderoso de expertos inmobiliarios, cada uno aportando experiencia única y pasión para transformar tus sueños de propiedad en realidad.",
            roles: {
                owner: "Propietario y CEO",
                senior_agent: "Agente Inmobiliaria Senior",
                commercial_agent: "Agente Inmobiliario Comercial"
            },
            specialties: {
                luxury: "Propiedades de Lujo",
                investment: "Estrategia de Inversión",
                analysis: "Análisis de Mercado",
                residential: "Ventas Residenciales",
                first_buyers: "Primeros Compradores",
                negotiation: "Negociación",
                commercial: "Propiedades Comerciales",
                investment_props: "Propiedades de Inversión",
                business_dev: "Desarrollo de Negocios"
            },
            cta: {
                title: "¿Listo para Comenzar tu Viaje?",
                subtitle: "Hagamos Realidad tus Sueños Inmobiliarios",
                description: "Ya sea que estés comprando tu primera casa, vendiendo una propiedad o construyendo un portafolio de inversión, nuestro equipo experto está listo para guiarte en cada paso del camino.",
                consultation: "Agendar Consulta Gratuita",
                contact: "Ponerse en Contacto"
            }
        },

        // Sección FAQ
        faq: {
            subtitle: "FAQs",
            title: "Todo sobre Marbry Inmobiliaria",
            description: "Sabemos que comprar, vender o invertir en bienes raíces puede ser abrumador. Aquí tienes las preguntas más frecuentes para guiarte en el proceso.",
            cta: {
                title: "¿Tienes más preguntas?",
                description: "Nuestro equipo está listo para resolver todas tus dudas sobre bienes raíces.",
                contact_expert: "Contactar Experto",
                more_faqs: "Ver Más FAQs"
            }
        },

        // Elementos comunes
        common: {
            contact: "Contactar",
            phone: "Teléfono",
            email: "Email",
            experience: "Años",
            location: "Ubicación",
            rating: "Calificación",
            achievements: "Logros",
            loading: "Cargando...",
            error: "Error al cargar",
            coming_soon: "Próximamente"
        }
    },

    en: {
        // English translations (para futuro)
        nav: {
            home: "Home",
            properties: "Properties",
            about: "About",
            contact: "Contact",
            services: "Services"
        },

        hero: {
            title: "Find Your Perfect Home",
            subtitle: "Premium Properties in Florida",
            description: "Discover exceptional properties with Marbry Real Estate",
            cta: "Explore Properties"
        },

        categories: {
            subtitle: "Categories",
            title: "Explore best properties with expert services",
            description: "Discover a diverse range of premium properties, from luxurious apartments to spacious villas, tailored to your needs",
            cta: "View Properties"
        },

        // ... más traducciones en inglés
    }
};

// Hook para usar traducciones (preparado para futuro)
export function useTranslations(locale: string = 'es') {
    return translations[locale as keyof typeof translations] || translations.es;
}

// Función helper para obtener traducción específica
export function t(key: string, locale: string = 'es') {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations] || translations.es;

    for (const k of keys) {
        value = value?.[k];
    }

    return value || key;
}