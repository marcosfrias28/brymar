import {
	Activity,
	AlertTriangle,
	BarChart3,
	Building2,
	CheckCircle,
	Clock,
	Database,
	Eye,
	FileText,
	Heart,
	MapPin,
	MessageSquare,
	Search,
	Server,
	Settings,
	Shield,
	TrendingUp,
	Users,
} from "lucide-react";
import type { StatCard } from "@/types/layout";

// Base adapter interface
export type StatsAdapter<T = any> = {
	generateStats(data: T): StatCard[];
	isLoading?: boolean;
};

// Properties stats adapter
export class PropertiesStatsAdapter implements StatsAdapter {
	generateStats(data: { properties?: any[]; lands?: any[] }): StatCard[] {
		const properties = data.properties || [];
		const lands = data.lands || [];

		const soldProperties = properties.filter((p) => p.status === "sold").length;
		const activeProperties = properties.filter(
			(p) => p.status === "active"
		).length;

		return [
			{
				title: "Total Propiedades",
				value: properties.length,
				change: "+12%",
				icon: Building2,
				color: "bg-primary",
				description: "desde el mes pasado",
			},
			{
				title: "Propiedades Activas",
				value: activeProperties,
				change: "+8%",
				icon: Eye,
				color: "bg-green-500",
				description: "disponibles",
			},
			{
				title: "Total Terrenos",
				value: lands.length,
				change: "+5%",
				icon: MapPin,
				color: "bg-blue-500",
				description: "registrados",
			},
			{
				title: "Ventas del Mes",
				value: soldProperties,
				change: "+23%",
				icon: TrendingUp,
				color: "bg-purple-500",
				description: "propiedades vendidas",
			},
		];
	}
}

// Blog stats adapter
export class BlogStatsAdapter implements StatsAdapter {
	generateStats(data: { posts?: any[]; categories?: any[] }): StatCard[] {
		const posts = data.posts || [];
		const publishedPosts = posts.filter((p) => p.status === "published").length;
		const draftPosts = posts.filter((p) => p.status === "draft").length;

		return [
			{
				title: "Total Posts",
				value: posts.length,
				change: "+15%",
				icon: FileText,
				color: "bg-blue-500",
				description: "artículos creados",
			},
			{
				title: "Posts Publicados",
				value: publishedPosts,
				change: "+18%",
				icon: CheckCircle,
				color: "bg-green-500",
				description: "visibles al público",
			},
			{
				title: "Borradores",
				value: draftPosts,
				change: "-5%",
				icon: Clock,
				color: "bg-orange-500",
				description: "pendientes",
			},
			{
				title: "Categorías",
				value: data.categories?.length || 0,
				icon: BarChart3,
				color: "bg-purple-500",
				description: "organizadas",
			},
		];
	}
}

// Users stats adapter
export class UsersStatsAdapter implements StatsAdapter {
	generateStats(data: { users?: any[] }): StatCard[] {
		const users = data.users || [];
		const activeUsers = users.filter((u) => u.status === "active").length;
		const adminUsers = users.filter((u) => u.role === "admin").length;
		const agentUsers = users.filter((u) => u.role === "agent").length;

		return [
			{
				title: "Total Usuarios",
				value: users.length,
				change: "+7%",
				icon: Users,
				color: "bg-primary",
				description: "registrados",
			},
			{
				title: "Usuarios Activos",
				value: activeUsers,
				change: "+12%",
				icon: Activity,
				color: "bg-green-500",
				description: "este mes",
			},
			{
				title: "Administradores",
				value: adminUsers,
				icon: Shield,
				color: "bg-red-500",
				description: "con acceso completo",
			},
			{
				title: "Agentes",
				value: agentUsers,
				change: "+3%",
				icon: Building2,
				color: "bg-blue-500",
				description: "inmobiliarios",
			},
		];
	}
}

// Database stats adapter
export class DatabaseStatsAdapter implements StatsAdapter {
	generateStats(data: {
		totalSize?: string;
		usedSpace?: number;
		totalTables?: number;
		connections?: number;
	}): StatCard[] {
		return [
			{
				title: "Tamaño Total",
				value: data.totalSize || "0 MB",
				icon: Database,
				color: "bg-primary",
				description: "espacio utilizado",
			},
			{
				title: "Uso del Espacio",
				value: `${data.usedSpace || 0}%`,
				change: data.usedSpace && data.usedSpace > 80 ? "Alto" : "Normal",
				icon: Server,
				color:
					data.usedSpace && data.usedSpace > 80 ? "bg-red-500" : "bg-green-500",
				description: "capacidad",
			},
			{
				title: "Tablas Activas",
				value: data.totalTables || 0,
				icon: BarChart3,
				color: "bg-blue-500",
				description: "en la base de datos",
			},
			{
				title: "Conexiones",
				value: data.connections || 0,
				change: "+5%",
				icon: Activity,
				color: "bg-purple-500",
				description: "activas",
			},
		];
	}
}

// Analytics stats adapter
export class AnalyticsStatsAdapter implements StatsAdapter {
	generateStats(data: {
		totalSessions?: number;
		completionRate?: number;
		aiSuccessRate?: number;
		uploadSuccessRate?: number;
	}): StatCard[] {
		return [
			{
				title: "Sesiones Totales",
				value: data.totalSessions || 0,
				change: "+25%",
				icon: Activity,
				color: "bg-primary",
				description: "este mes",
			},
			{
				title: "Tasa de Finalización",
				value: `${data.completionRate || 0}%`,
				change: "+8%",
				icon: CheckCircle,
				color: "bg-green-500",
				description: "completadas",
			},
			{
				title: "Éxito de IA",
				value: `${data.aiSuccessRate || 0}%`,
				change: "+12%",
				icon: BarChart3,
				color: "bg-blue-500",
				description: "respuestas correctas",
			},
			{
				title: "Éxito de Carga",
				value: `${data.uploadSuccessRate || 0}%`,
				change: "+5%",
				icon: TrendingUp,
				color: "bg-purple-500",
				description: "archivos subidos",
			},
		];
	}
}

// Profile stats adapter
export class ProfileStatsAdapter implements StatsAdapter {
	generateStats(data: {
		favoriteProperties?: number;
		totalViews?: number;
		searchesMade?: number;
		propertiesContacted?: number;
	}): StatCard[] {
		return [
			{
				title: "Propiedades Favoritas",
				value: data.favoriteProperties || 0,
				change: "+3",
				icon: Heart,
				color: "bg-red-500",
				description: "guardadas",
			},
			{
				title: "Vistas Totales",
				value: data.totalViews || 0,
				change: "+15%",
				icon: Eye,
				color: "bg-blue-500",
				description: "este mes",
			},
			{
				title: "Búsquedas Realizadas",
				value: data.searchesMade || 0,
				change: "+8",
				icon: Search,
				color: "bg-green-500",
				description: "consultas",
			},
			{
				title: "Propiedades Contactadas",
				value: data.propertiesContacted || 0,
				change: "+2",
				icon: MessageSquare,
				color: "bg-purple-500",
				description: "interacciones",
			},
		];
	}
}

// Admin stats adapter
export class AdminStatsAdapter implements StatsAdapter {
	generateStats(data: {
		totalUsers?: number;
		totalProperties?: number;
		totalPosts?: number;
		systemHealth?: "good" | "warning" | "critical";
	}): StatCard[] {
		const healthColor =
			data.systemHealth === "good"
				? "bg-green-500"
				: data.systemHealth === "warning"
					? "bg-orange-500"
					: "bg-red-500";

		return [
			{
				title: "Total Usuarios",
				value: data.totalUsers || 0,
				change: "+12%",
				icon: Users,
				color: "bg-primary",
				description: "registrados",
			},
			{
				title: "Total Propiedades",
				value: data.totalProperties || 0,
				change: "+8%",
				icon: Building2,
				color: "bg-blue-500",
				description: "en el sistema",
			},
			{
				title: "Total Posts",
				value: data.totalPosts || 0,
				change: "+15%",
				icon: FileText,
				color: "bg-green-500",
				description: "publicados",
			},
			{
				title: "Estado del Sistema",
				value:
					data.systemHealth === "good"
						? "Óptimo"
						: data.systemHealth === "warning"
							? "Advertencia"
							: "Crítico",
				icon: data.systemHealth === "good" ? CheckCircle : AlertTriangle,
				color: healthColor,
				description: "rendimiento",
			},
		];
	}
}

// Settings stats adapter
export class SettingsStatsAdapter implements StatsAdapter {
	generateStats(data: {
		configuredSections?: number;
		activeIntegrations?: number;
		lastBackup?: string;
		securityScore?: number;
	}): StatCard[] {
		return [
			{
				title: "Secciones Configuradas",
				value: data.configuredSections || 0,
				icon: Settings,
				color: "bg-primary",
				description: "del sitio web",
			},
			{
				title: "Integraciones Activas",
				value: data.activeIntegrations || 0,
				change: "+2",
				icon: Activity,
				color: "bg-blue-500",
				description: "servicios conectados",
			},
			{
				title: "Último Respaldo",
				value: data.lastBackup || "N/A",
				icon: Database,
				color: "bg-green-500",
				description: "hace 2 horas",
			},
			{
				title: "Puntuación de Seguridad",
				value: `${data.securityScore || 0}%`,
				change:
					data.securityScore && data.securityScore > 80
						? "Excelente"
						: "Mejorar",
				icon: Shield,
				color:
					data.securityScore && data.securityScore > 80
						? "bg-green-500"
						: "bg-orange-500",
				description: "nivel de protección",
			},
		];
	}
}

// Factory function to get the appropriate adapter
export function getStatsAdapter(pageType: string): StatsAdapter | null {
	switch (pageType) {
		case "properties":
			return new PropertiesStatsAdapter();
		case "blog":
			return new BlogStatsAdapter();
		case "users":
			return new UsersStatsAdapter();
		case "database":
			return new DatabaseStatsAdapter();
		case "analytics":
			return new AnalyticsStatsAdapter();
		case "profile":
			return new ProfileStatsAdapter();
		case "admin":
			return new AdminStatsAdapter();
		case "settings":
			return new SettingsStatsAdapter();
		default:
			return null;
	}
}
