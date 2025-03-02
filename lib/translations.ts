import { SignFormTranslationsType } from "@/utils/types/types";
import { Search, Home, Key, TrendingUp, Globe, Shield, MapPin } from "lucide-react";

export const ForgotPasswordTranslations = {
  en: {
    title: "Forgot your password?",
    subtitle: "Enter your email address below to reset your password.",
    verify: "Send Reset Link",
    loading: "Sending...",
    alreadyVerified: "You have already reset your password.",
    signIn: "Sign in",
  },
  es: {
    title: "¿Olvidaste tu contraseña?",
    subtitle: "Ingrese su correo electrónico para restablecer su contraseña.",
    verify: "Enviar Enlace de Restablecimiento",
    loading: "Enviando...",
    alreadyVerified: "Ya has restablecido tu contraseña.",
    signIn: "Iniciar Sesión",
  },
  it: {
    title: "Hai dimenticato la tua password?",
    subtitle: "Inserisci la tua email per reimpostare la password.",
    verify: "Invia Link di Reset",
    loading: "Invio...",
    alreadyVerified: "Hai già reimpostato la tua password.",
    signIn: "Accedi",
  },
};

export const VerifyEmailTranslations = {
  en: {
    title: "Verify your email",
    subtitle:
      "Please check your email inbox and click the verification link to complete your registration.",
  },
  es: {
    title: "Verifica tu correo electrónico",
    subtitle:
      "Por favor, revisa tu bandeja de entrada de correo electrónico y haz clic en el enlace de verificación para completar tu registro.",
  },
  it: {
    title: "Verifica il tuo indirizzo email",
    subtitle:
      "Si prega di controllare la sua casella di posta elettronica e fare clic sul link di verifica per completare il tuo registro.",
  },
};

export const TestimonialsTranslations = {
  en: {
    title: "What Our Esteemed Clients Say",
    subtitle: "Hear from those who have experienced our unparalleled service",
  },
  es: {
    title: "Lo Que Dicen Nuestros Estimados Clientes",
    subtitle:
      "Escuche a quienes han experimentado nuestro servicio sin igual",
  },
  it: {
    title: "Cosa Dicono i Nostri Stimati Clienti",
    subtitle: "Ascolta chi ha sperimentato il nostro servizio senza pari",
  },
};
// Consolidated translations
export const NavbarTranslations = {
  en: {
    menuLabels: ["Home", "Properties", "Land", "About Us", "Contact"],
    buttons: {
      languages: "English",
      theme: { dark: "Dark", light: "Light" },
      login: "Login",
      dashboard: "Dashboard",
      profile: "Profile",
      logout: "Logout",
    },
  },
  es: {
    menuLabels: ["Inicio", "Propiedades", "Terrenos", "Sobre Nosotros", "Contacto"],
    buttons: {
      languages: "Español",
      theme: { dark: "Oscuro", light: "Claro" },
      login: "Iniciar Sesión",
      dashboard: "Panel de Control",
      profile: "Perfil",
      logout: "Cerrar Sesión",
    },
  },
  it: {
    menuLabels: ["Inizio", "Proprietà", "Terreni", "Chi Siamo", "Contatti"],
    buttons: {
      languages: "Italiano",
      theme: { dark: "Scuro", light: "Chiaro" },
      login: "Accedi",
      dashboard: "Dashboard",
      profile: "Profilo",
      logout: "Esci",
    },
  },
};

export const translations = {
  en: {
    dashboardPropertiesTitle: "Gestione Proprietà",
    dashboardLandsTitle: "Gestione Terreni",
    dashboardBlogTitle: "Gestione Blog",
    dashboard: {
      title: "Real Estate Dashboard",
      properties: "Properties",
      lands: "Lands",
      blog: "Blog",
    },
    propertyForm: {
      title: "Property Management",
      addProperty: "Add Property",
      propertyTitle: "Title",
      description: "Description",
      price: "Price",
      type: "Type",
      forRent: "For Rent",
      forSale: "For Sale",
      images: "Images (max 10)",
      selectedImages: "Selected images",
      submit: "Add Property",
      success: "Property added successfully!",
    },
    landForm: {
      title: "Land Management",
      addLand: "Add Land",
      landName: "Land Name",
      description: "Description",
      area: "Area (m²)",
      price: "Price",
      images: "Images (max 10)",
      selectedImages: "Selected images",
      submit: "Add Land",
      success: "Land added successfully!",
    },
    blogForm: {
      title: "Blog Management",
      addPost: "Add Post",
      postTitle: "Post Title",
      content: "Content",
      author: "Author",
      coverImage: "Cover Image",
      submit: "Publish Post",
      success: "Blog post published successfully!",
    },
  },
  es: {
    dashboardPropertiesTitle: "Gestión de Propiedades",
    dashboardLandsTitle: "Gestión de Terrenos",
    dashboardBlogTitle: "Gestión de Blog",
    dashboard: {
      title: "Panel de Control Inmobiliario",
      properties: "Propiedades",
      lands: "Terrenos",
      blog: "Blog",
    },
    propertyForm: {
      title: "Gestión de Propiedades",
      addProperty: "Añadir Propiedad",
      propertyTitle: "Título",
      description: "Descripción",
      price: "Precio",
      type: "Tipo",
      forRent: "En Alquiler",
      forSale: "En Venta",
      images: "Imágenes (máx. 10)",
      selectedImages: "Imágenes seleccionadas",
      submit: "Añadir Propiedad",
      success: "¡Propiedad añadida con éxito!",
    },
    landForm: {
      title: "Gestión de Terrenos",
      addLand: "Añadir Terreno",
      landName: "Nombre del Terreno",
      description: "Descripción",
      area: "Superficie (m²)",
      price: "Precio",
      images: "Imágenes (máx. 10)",
      selectedImages: "Imágenes seleccionadas",
      submit: "Añadir Terreno",
      success: "¡Terreno añadido con éxito!",
    },
    blogForm: {
      title: "Gestión del Blog",
      addPost: "Añadir Publicación",
      postTitle: "Título de la Publicación",
      content: "Contenido",
      author: "Autor",
      coverImage: "Imagen de Portada",
      submit: "Publicar",
      success: "¡Publicación del blog añadida con éxito!",
    },
  },
  it: {
    dashboardPropertiesTitle: "Gestione Proprietà",
    dashboardLandsTitle: "Gestione Terreni",
    dashboardBlogTitle: "Gestione Blog",
    dashboard: {
      title: "Dashboard Immobiliare",
      properties: "Proprietà",
      lands: "Terreni",
      blog: "Blog",
    },
    propertyForm: {
      title: "Gestione Proprietà",
      addProperty: "Aggiungi Proprietà",
      propertyTitle: "Titolo",
      description: "Descrizione",
      price: "Prezzo",
      type: "Tipo",
      forRent: "In Affitto",
      forSale: "In Vendita",
      images: "Immagini (max 10)",
      selectedImages: "Immagini selezionate",
      submit: "Aggiungi Proprietà",
      success: "Proprietà aggiunta con successo!",
    },
    landForm: {
      title: "Gestione Terreni",
      addLand: "Aggiungi Terreno",
      landName: "Nome del Terreno",
      description: "Descrizione",
      area: "Superficie (m²)",
      price: "Prezzo",
      images: "Immagini (max 10)",
      selectedImages: "Immagini selezionate",
      submit: "Aggiungi Terreno",
      success: "Terreno aggiunto con successo!",
    },
    blogForm: {
      title: "Gestione Blog",
      addPost: "Aggiungi Post",
      postTitle: "Titolo del Post",
      content: "Contenuto",
      author: "Autore",
      coverImage: "Immagine di Copertina",
      submit: "Pubblica Post",
      success: "Post del blog pubblicato con successo!",
    },
  },
};

export const HeroSectionTranslations = {
  es: {
    name: "Marbry inmobiliaria",
    title: "Hacemos que sea fácil encontrar tu nueva casa.",
    subtitle:
      "Propiedades exclusivas en la República Dominicana.",
    cta: "Explorar Listados",
    stats: [
      { icon: MapPin, value: "50+", label: "Ubicaciones Prime" },
      { icon: Home, value: "1000+", label: "Propiedades de Lujo" },
      { icon: TrendingUp, value: "2000M€+", label: "Valor de Propiedades" },
    ],
  },
  en: {
    name: "Marbry inmobiliaria",
    title: "We make it easier to find your new home.",
    subtitle: "Specialized real estate in the Dominican Republic",
    cta: "Explore Listings",
    stats: [
      { icon: MapPin, value: "50+", label: "Prime Locations" },
      { icon: Home, value: "1000+", label: "Luxury Properties" },
      { icon: TrendingUp, value: "$2B+", label: "Property Value" },
    ],
  },
  it: {
    name: "Marbry inmobiliaria",
    title: "Renderemo semplice trovare la tua nuova casa.",
    subtitle: "Proprietà esclusive nella Repubblica Dominicana",
    search: "Cerca la tua proprietà da sogno",
    cta: "Esplora gli Annunci",
    stats: [
      { icon: MapPin, value: "50+", label: "Location di Prestigio" },
      { icon: Home, value: "1000+", label: "Proprietà di Lusso" },
      { icon: TrendingUp, value: "2000M€+", label: "Valore Immobiliare" },
    ],
  },
};

export const FeaturedPropertiesTranslations = {
  en: {
    title: "Featured Luxury Properties",
    subtitle:
      "Discover our handpicked selection of the world's most extraordinary homes",
    viewDetails: "View Details",
    viewAll: "View All Properties",
  },
  es: {
    title: "Propiedades de Lujo Destacadas",
    subtitle:
      "Descubre nuestra selección de las casas más extraordinarias del mundo",
    viewDetails: "Ver Detalles",
    viewAll: "Ver Todas las Propiedades",
  },
  it: {
    title: "Proprietà di Lusso in Evidenza",
    subtitle:
      "Scopri la nostra selezione delle case più straordinarie del mondo",
    viewDetails: "Visualizza Dettagli",
    viewAll: "Visualizza Tutte le Proprietà",
  },
};

export const ServicesTranslations = {
  en: {
    title: "Our Exclusive Services",
    subtitle:
      "Tailored solutions for discerning clients in the luxury real estate market",
    learnMore: "Learn More",
    services: [
      {
        title: "Global Property Search",
        description:
          "Access our curated portfolio of the world's most prestigious properties, from beachfront villas to urban penthouses.",
        icon: Search,
        color: "bg-blue-500",
      },
      {
        title: "Luxury Property Management",
        description:
          "Comprehensive management services to maintain and enhance the value of your high-end properties.",
        icon: Home,
        color: "bg-green-500",
      },
      {
        title: "VIP Buying Experience",
        description:
          "Personalized guidance throughout your luxury property acquisition, including private viewings and negotiations.",
        icon: Key,
        color: "bg-purple-500",
      },
      {
        title: "Investment Advisory",
        description:
          "Expert advice on prime real estate investment opportunities and portfolio diversification strategies.",
        icon: TrendingUp,
        color: "bg-red-500",
      },
      {
        title: "International Relocation",
        description:
          "Seamless relocation services for global clients, including visa assistance and local orientation.",
        icon: Globe,
        color: "bg-yellow-500",
      },
      {
        title: "Secure Transactions",
        description:
          "Ensure the confidentiality and security of your high-value property transactions with our specialized legal team.",
        icon: Shield,
        color: "bg-indigo-500",
      },
    ],
  },
  es: {
    title: "Nuestros Servicios Exclusivos",
    subtitle:
      "Soluciones a medida para clientes exigentes en el mercado inmobiliario de lujo",
    learnMore: "Más Información",
    services: [
      {
        title: "Búsqueda Global de Propiedades",
        description:
          "Acceda a nuestro portafolio seleccionado de las propiedades más prestigiosas del mundo, desde villas frente al mar hasta áticos urbanos.",
        icon: Search,
        color: "bg-blue-500",
      },
      {
        title: "Gestión de Propiedades de Lujo",
        description:
          "Servicios integrales de gestión para mantener y mejorar el valor de sus propiedades de alta gama.",
        icon: Home,
        color: "bg-green-500",
      },
      {
        title: "Experiencia de Compra VIP",
        description:
          "Orientación personalizada durante la adquisición de su propiedad de lujo, incluyendo visitas privadas y negociaciones.",
        icon: Key,
        color: "bg-purple-500",
      },
      {
        title: "Asesoría de Inversiones",
        description:
          "Asesoramiento experto sobre oportunidades de inversión inmobiliaria prime y estrategias de diversificación de cartera.",
        icon: TrendingUp,
        color: "bg-red-500",
      },
      {
        title: "Reubicación Internacional",
        description:
          "Servicios de reubicación sin problemas para clientes globales, incluyendo asistencia con visados y orientación local.",
        icon: Globe,
        color: "bg-yellow-500",
      },
      {
        title: "Transacciones Seguras",
        description:
          "Garantice la confidencialidad y seguridad de sus transacciones inmobiliarias de alto valor con nuestro equipo legal especializado.",
        icon: Shield,
        color: "bg-indigo-500",
      },
    ],
  },
  it: {
    title: "I Nostri Servizi Esclusivi",
    subtitle:
      "Soluzioni su misura per clienti esigenti nel mercato immobiliare di lusso",
    learnMore: "Scopri di Più",
    services: [
      {
        title: "Ricerca Globale di Proprietà",
        description:
          "Accedi al nostro portfolio curato delle proprietà più prestigiose al mondo, dalle ville fronte mare ai attici urbani.",
        icon: Search,
        color: "bg-blue-500",
      },
      {
        title: "Gestione Proprietà di Lusso",
        description:
          "Servizi di gestione completi per mantenere e aumentare il valore delle tue proprietà di alta gamma.",
        icon: Home,
        color: "bg-green-500",
      },
      {
        title: "Esperienza di Acquisto VIP",
        description:
          "Guida personalizzata durante l'acquisizione della tua proprietà di lusso, incluse visite private e negoziazioni.",
        icon: Key,
        color: "bg-purple-500",
      },
      {
        title: "Consulenza sugli Investimenti",
        description:
          "Consulenza esperta su opportunità di investimento immobiliare di prima classe e strategie di diversificazione del portafoglio.",
        icon: TrendingUp,
        color: "bg-red-500",
      },
      {
        title: "Trasferimento Internazionale",
        description:
          "Servizi di trasferimento senza problemi per clienti globali, inclusa assistenza per i visti e orientamento locale.",
        icon: Globe,
        color: "bg-yellow-500",
      },
      {
        title: "Transazioni Sicure",
        description:
          "Garantisci la riservatezza e la sicurezza delle tue transazioni immobiliari di alto valore con il nostro team legale specializzato.",
        icon: Shield,
        color: "bg-indigo-500",
      },
    ],
  },
};

export const NewsSectionTranslations = {
  en: {
    title: "Latest News",
    subtitle: "Stay updated with real estate market trends",
    readMore: "Read More",
  },
  es: {
    title: "Últimas Noticias",
    subtitle:
      "Mantente actualizado con las tendencias del mercado inmobiliario",
    readMore: "Leer Más",
  },
  it: {
    title: "Ultime Notizie",
    subtitle: "Resta aggiornato sulle tendenze del mercato immobiliare",
    readMore: "Leggi di Più",
  },
};

export const ContactFormTranslations = {
  en: {
    title: "Contact Our Experts",
    subtitle: "Get in touch with our professional team",
    name: "Name",
    email: "Email",
    message: "Message",
    send: "Send Message",
    contact: "Contact Information",
    address: "123 Luxury Real Estate Ave, Prestige City",
    phone: "+1 234 567 890",
    emailAddress: "contact@luxuryrealestate.com",
  },
  es: {
    title: "Contacta a Nuestros Expertos",
    subtitle: "Ponte en contacto con nuestro equipo profesional",
    name: "Nombre",
    email: "Correo",
    message: "Mensaje",
    send: "Enviar Mensaje",
    contact: "Información de Contacto",
    address: "Av. Inmobiliaria de Lujo 123, Ciudad Prestigio",
    phone: "+34 123 456 789",
    emailAddress: "contacto@inmobiliariadelujo.com",
  },
  it: {
    title: "Contatta i Nostri Esperti",
    subtitle: "Mettiti in contatto con il nostro team professionale",
    name: "Nome",
    email: "Email",
    message: "Messaggio",
    send: "Invia Messaggio",
    contact: "Informazioni di Contatto",
    address: "Via Immobiliare di Lusso 123, Città Prestigio",
    phone: "+39 123 456 789",
    emailAddress: "contatto@immobiliaredilusso.com",
  },
};

export const SignFormTranslations: SignFormTranslationsType = {
  signin: {
    en: {
      title: "Sign In",
      subtitle: "Sign in to your account",
      fields: [
        {
          id: "email",
          name: "email",
          type: "email",
          placeholder: "example@example.com",
          label: "Email",
          children: "Insert your email",
        },
        {
          id: "password",
          name: "password",
          type: "password",
          placeholder: "••••••••",
          label: "Password",
          children: "Insert your password",
        },
      ],
      signIn: "Sign In",
      forgotPassword: "Forgot Password?",
      noAccount: "Don't have an account?",
      createAccount: "Create Account",
      loading: "Signing In...",
    },
    es: {
      title: "Iniciar Sesión",
      subtitle: "Inicia sesión en tu cuenta",
      fields: [
        {
          id: "email",
          name: "email",
          type: "email",
          placeholder: "ejemplo@ejemplo.com",
          label: "Correo",
          children: "Ingrese su correo electrónico",
        },
        {
          id: "password",
          name: "password",
          type: "password",
          placeholder: "••••••••",
          label: "Contraseña",
          children: "Ingrese su contraseña",
        },
      ],
      signIn: "Iniciar Sesión",
      forgotPassword: "¿Olvidaste tu contraseña?",
      noAccount: "¿No tienes una cuenta?",
      createAccount: "Crear una cuenta",
      loading: "Iniciando sesión...",
    },
    it: {
      title: "Accedi",
      subtitle: "Accedi al tuo account",
      fields: [
        {
          id: "email",
          name: "email",
          type: "email",
          placeholder: "esempio@esempio.com",
          label: "Email",
          children: "Inserisci la tua email",
        },
        {
          id: "password",
          name: "password",
          type: "password",
          placeholder: "••••••••",
          label: "Password",
          children: "Inserisci la tua password",
        },
      ],
      signIn: "Accedi",
      forgotPassword: "Password dimenticata?",
      noAccount: "Non hai un account?",
      createAccount: "Crea un account",
      loading: "Accesso in corso...",
    },
  },
  signup: {
    en: {
      title: "Sign Up",
      subtitle: "Create an account",
      fields: [
        {
          id: "email",
          name: "email",
          type: "email",
          placeholder: "example@example.com",
          label: "Email",
          children: "Insert your email",
        },
        {
          id: "password",
          name: "password",
          type: "password",
          placeholder: "••••••••",
          label: "Password",
          children: "Insert your password",
        },
        {
          id: "name",
          name: "name",
          type: "text",
          placeholder: "John Doe",
          label: "Name",
          children: "Insert your name",
        },
        {
          id: "image",
          name: "image",
          type: "file",
          label: "Profile Image",
          children: "Upload your profile image",
        },
      ],
      signUp: "Sign Up",
      alreadyHaveAccount: "Already have an account?",
      signIn: "Sign In",
      loading: "Creating Account...",
    },
    es: {
      title: "Registrarse",
      subtitle: "Crea una cuenta",
      fields: [
        {
          id: "email",
          name: "email",
          type: "email",
          placeholder: "ejemplo@ejemplo.com",
          label: "Correo",
          children: "Ingrese su correo electrónico",
        },
        {
          id: "password",
          name: "password",
          type: "password",
          placeholder: "••••••••",
          label: "Contraseña",
          children: "Ingrese su contraseña",
        },
        {
          id: "name",
          name: "name",
          type: "text",
          placeholder: "Juan Pérez",
          label: "Nombre",
          children: "Ingrese su nombre",
        },
        {
          id: "image",
          name: "image",
          type: "file",
          label: "Imagen de Perfil",
          children: "Suba su imagen de perfil",
        },
      ],
      signUp: "Registrarse",
      alreadyHaveAccount: "¿Ya tienes una cuenta?",
      signIn: "Iniciar Sesión",
      loading: "Creando cuenta...",
    },
    it: {
      title: "Registrati",
      subtitle: "Crea un account",
      fields: [
        {
          id: "email",
          name: "email",
          type: "email",
          placeholder: "esempio@esempio.com",
          label: "Email",
          children: "Inserisci la tua email",
        },
        {
          id: "password",
          name: "password",
          type: "password",
          placeholder: "••••••••",
          label: "Password",
          children: "Inserisci la tua password",
        },
        {
          id: "name",
          name: "name",
          type: "text",
          placeholder: "Mario Rossi",
          label: "Nome",
          children: "Inserisci il tuo nome",
        },
        {
          id: "image",
          name: "image",
          type: "file",
          label: "Immagine del Profilo",
          children: "Carica la tua immagine del profilo",
        },
      ],
      signUp: "Registrati",
      alreadyHaveAccount: "Hai già un account?",
      signIn: "Accedi",
      loading: "Creazione account...",
    },
  }
};

export const PropertySearchTranslations = {
  en: {
    title: "Properties for sale in the Dominican Republic",
    filters: {
      searchPlaceholder: "Enter street, city, ZIP, Property ID",
      anyState: "Any state",
      allProvinces: "All provinces",
      priceRange: "Price: from $ {min} to $ {max}",
      advancedSearch: "Advanced Search",
      reset: "Reset",
      search: "Search Properties",
      searching: "Searching...",
      mostRecent: "Most recent",
      propertyCount: "{count} Properties available",
      resultsFound: "{count} results found with your search!",
    },
    tabs: {
      all: "All",
      residential: "Residential",
      commercial: "Commercial",
      land: "Land",
    },
    property: {
      id: "ID",
      sqm: "m²",
      bedrooms: "bed",
      bathrooms: "bath",
    },
  },
  es: {
    title: "Propiedades en venta en la República Dominicana",
    filters: {
      searchPlaceholder: "Ingrese calle, ciudad, código postal, ID de propiedad",
      anyState: "Cualquier estado",
      allProvinces: "Todas las provincias",
      priceRange: "Precio: desde $ {min} hasta $ {max}",
      advancedSearch: "Búsqueda Avanzada",
      reset: "Restablecer",
      search: "Buscar Propiedades",
      searching: "Buscando...",
      mostRecent: "Más recientes",
      propertyCount: "{count} Propiedades disponibles",
      resultsFound: "¡{count} resultados encontrados con su búsqueda!",
    },
    tabs: {
      all: "Todos",
      residential: "Residenciales",
      commercial: "Comerciales",
      land: "Terrenos",
    },
    property: {
      id: "ID",
      sqm: "m²",
      bedrooms: "hab",
      bathrooms: "baños",
    },
  },
  it: {
    title: "Proprietà in vendita nella Repubblica Dominicana",
    filters: {
      searchPlaceholder: "Inserisci via, città, CAP, ID proprietà",
      anyState: "Qualsiasi stato",
      allProvinces: "Tutte le province",
      priceRange: "Prezzo: da $ {min} a $ {max}",
      advancedSearch: "Ricerca Avanzata",
      reset: "Reimposta",
      search: "Cerca proprietà",
      searching: "Ricerca in corso...",
      mostRecent: "Più recenti",
      propertyCount: "{count} Proprietà disponibili",
      resultsFound: "{count} risultati trovati con la vostra ricerca!",
    },
    tabs: {
      all: "Tutti",
      residential: "Residenziali",
      commercial: "Commerciali",
      land: "Terreni",
    },
    property: {
      id: "ID",
      sqm: "m²",
      bedrooms: "cam",
      bathrooms: "bagni",
    },
  },
};

export const FooterTranslations = {
  en: {
    companyName: "Luxury Real Estate",
    rights: "All rights reserved",
    cookies: "Cookie Policy",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    cookiesTitle: "Cookie Policy",
    cookiesContent: "This website uses cookies to enhance the user experience...",
    privacyTitle: "Privacy Policy",
    privacyContent: "At Luxury Real Estate, we take your privacy seriously...",
  },
  es: {
    companyName: "Inmobiliaria de Lujo",
    rights: "Todos los derechos reservados",
    cookies: "Política de Cookies",
    privacy: "Política de Privacidad",
    terms: "Términos de Servicio",
    cookiesTitle: "Política de Cookies",
    cookiesContent: "Este sitio web utiliza cookies para mejorar la experiencia del usuario...",
    privacyTitle: "Política de Privacidad",
    privacyContent: "En Inmobiliaria de Lujo, nos tomamos su privacidad muy en serio...",
  },
  it: {
    companyName: "Immobiliare di Lusso",
    rights: "Tutti i diritti riservati",
    cookies: "Politica dei Cookie",
    privacy: "Politica sulla Privacy",
    terms: "Termini di Servizio",
    cookiesTitle: "Politica dei Cookie",
    cookiesContent: "Questo sito web utilizza i cookie per migliorare l'esperienza dell'utente...",
    privacyTitle: "Politica sulla Privacy",
    privacyContent: "In Immobiliare di Lusso, prendiamo molto sul serio la tua privacy...",
  },
};

