import { useLangStore } from "@/utils/store/lang-store";

export function useTranslation<T extends Record<string, any>>(
    translations: Record<string, T>
): T {
    const language = useLangStore((state) => state.language);
    return translations[language];
}
