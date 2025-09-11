import { useLangStore } from "@/utils/store/lang-store";
import { useEffect, useState } from "react";

export function useTranslation<T extends Record<string, any>>(
    translations: Record<string, T>
): T {
    const language = useLangStore((state) => state.language);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Durante la hidratación, usar 'en' como fallback para evitar mismatch
    const currentLanguage = isHydrated ? language : 'en';
    return translations[currentLanguage];
}
