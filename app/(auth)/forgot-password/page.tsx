"use client";

import React, { useActionState, useEffect } from "react";
import { LoginWrapper } from "../login-wrapper";
import { useLangStore } from "@/utils/store/lang-store";
import { ForgotPasswordTranslations as translations } from "@/lib/translations";
import { ActionState } from "@/lib/validations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { CustomInput } from "@/components/custom-input";
import { forgotPassword } from "@/lib/actions/user-actions";

const ForgotPasswordPage = () => {
  const language = useLangStore((prev) => prev.language);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    forgotPassword,
    { error: "" }
  );

  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.redirect) {
      toast.success(state.message);
      setTimeout(() => {
        window.location.href = state.url;
      }, 200);
    }
  }, [state]);

  const {
    title,
    subtitle,
    verify: verifyText,
    loading,
    alreadyVerified,
    signIn: signInLinkText,
  } = translations[language];

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
        <form action={formAction} className="flex flex-col gap-4">
          <CustomInput
            type="email"
            name="email"
            id="email"
            placeholder="example@example.com"
            required
            label="Email"
          />
          <Button
            type="submit"
            variant="outline"
            className={cn(
              "w-full py-2 px-4 rounded-lg text-sm font-medium",
              "bg-green-600/50 hover:bg-green-600/70",
              "dark:bg-green-950/50 dark:hover:bg-green-950"
            )}
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                {loading}
              </>
            ) : (
              verifyText
            )}
          </Button>
          {state?.success ? (
            <p className="text-sm text-gray-500">{alreadyVerified}</p>
          ) : (
            <p className="text-sm text-red-500">{state.error}</p>
          )}
        </form>
      </div>
    </LoginWrapper>
  );
};

export default ForgotPasswordPage;
