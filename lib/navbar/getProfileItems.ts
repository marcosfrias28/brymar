import { UserIcon, Shield, Landmark, Mail, Users, Settings } from "lucide-react";

// Función para obtener elementos del menú basados en el rol del usuario
const getProfileItems = (userRole: string, permissions: any) => {
  const items = [];

  // Elementos comunes para usuarios autenticados
  if (permissions?.canAccessDashboard) {
    items.push({ icon: UserIcon, href: "/dashboard/properties", label: "Mi Perfil" });
  }

  // Elementos específicos por rol
  if (userRole === 'admin') {
    items.push(
      { icon: Shield, href: "/dashboard/properties", label: "Propiedades" },
      { icon: Landmark, href: "/dashboard/lands", label: "Terrenos" },
      { icon: Mail, href: "/dashboard/blog", label: "Blog" },
      { icon: Users, href: "/dashboard/users", label: "Usuarios" },
      { icon: Settings, href: "/dashboard/settings", label: "Configuración" }
    );
  } else if (userRole === 'agent') {
    items.push(
      { icon: Shield, href: "/dashboard/properties", label: "Propiedades" },
      { icon: Landmark, href: "/dashboard/lands", label: "Terrenos" },
      { icon: Settings, href: "/dashboard/settings", label: "Configuración" }
    );
  }

  return items;
};

export default getProfileItems;