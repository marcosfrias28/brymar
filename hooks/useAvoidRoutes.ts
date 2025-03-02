import { usePathname } from "next/navigation";

export const useAvoidRoutes = () => {
    const avoidRoutes = ["/dashboard", "/sign-in", "/sign-up"];
    const pathname = usePathname();

    const shouldAvoid = avoidRoutes.some((route) => pathname.includes(route));

    return shouldAvoid;
};
