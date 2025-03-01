"use client";

import { LoginWrapper } from "../login-wrapper";
import { useLangStore } from "@/utils/store/lang-store";
import { VerifyEmailTranslations as translations } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

const VerifyEmailPage = () => {
  const language = useLangStore((prev) => prev.language);
  const params = useSearchParams();
  const email = params?.get("email");

  const { title, subtitle } = translations[language];

  if (!language || !translations[language]) return null;

  return (
    <LoginWrapper>
      <div
        className={cn(
          "space-y-6 max-w-md p-10 rounded-lg shadow-2xl shadow-black/40 dark:shadow-white/10",
          "backdrop-blur-sm backdrop-saturate-180 bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10",
          "text-gray-800 dark:text-gray-100"
        )}
      >
        <h1 className="text-4xl font-black">{title}</h1>
        <p className="text-lg text-pretty">{subtitle}</p>
      </div>
    </LoginWrapper>
  );
};

export default VerifyEmailPage;
