import { usePathname } from "next/navigation";

export const useAvoidRoutes = () => {
    const avoidRoutes = ["/dashboard", "/profile", "/sign-in", "/sign-up", "/verify-email", "forgot-password", "reset-password"];
    const pathname = usePathname();

    // Verificar que pathname no sea null
    if (!pathname) {
        return false;
    }

    const shouldAvoid = avoidRoutes.some((route) => pathname.includes(route));

    return shouldAvoid;
};
