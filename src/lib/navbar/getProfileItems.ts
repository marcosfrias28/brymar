import {
	Landmark,
	Mail,
	Settings,
	Shield,
	UserIcon,
	Users,
} from "lucide-react";

// Tipo para los elementos del menú
type MenuItem = {
	icon: any;
	href: string;
	label: string;
};

// Función para obtener elementos del menú basados en el rol del usuario
export const getProfileItems = (
	userRole: string | null,
	permissions?: any
): MenuItem[] => {
	const items: MenuItem[] = [];

	if (!userRole) {
		return items;
	}

	// Elementos comunes para usuarios autenticados
	if (permissions?.canAccessDashboard) {
		items.push({
			icon: UserIcon,
			href: "/dashboard/properties",
			label: "Mi Perfil",
		});
	}

	// Elementos específicos por rol
	if (userRole === "admin") {
		items.push(
			{ icon: Shield, href: "/dashboard/properties", label: "Propiedades" },
			{ icon: Landmark, href: "/dashboard/lands", label: "Terrenos" },
			{ icon: Mail, href: "/dashboard/blog", label: "Blog" },
			{ icon: Users, href: "/dashboard/users", label: "Usuarios" },
			{ icon: Settings, href: "/dashboard/settings", label: "Configuración" }
		);
	} else if (userRole === "agent") {
		items.push(
			{ icon: Shield, href: "/dashboard/properties", label: "Propiedades" },
			{ icon: Landmark, href: "/dashboard/lands", label: "Terrenos" },
			{ icon: Settings, href: "/dashboard/settings", label: "Configuración" }
		);
	}

	return items;
};

export default getProfileItems;
