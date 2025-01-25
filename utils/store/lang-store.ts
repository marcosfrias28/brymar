import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LangStore {
    language: "en" | "es" | "it";
    setLanguage: (lang: "en" | "es" | "it") => void;
}

export const getDefaultLanguage = (): "en" | "es" | "it" => {
    if (typeof navigator !== 'undefined') {
        const lang = navigator.language;

        switch (lang) {
            case 'es-ES':
            case 'es':
                return 'es';
            case 'en-US':
            case 'en':
                return 'en';
            case 'it-IT':
            case 'it':
                return 'it';
            default:
                return 'en';
        }
    }
    return 'en';
};

export const useLangStore = create<LangStore>()(
    persist(
        (set) => ({
            language: getDefaultLanguage(),
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: "lang",
        }
    )
);
