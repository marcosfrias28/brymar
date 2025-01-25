"use client";

import Link from "next/link";
import { JSX, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { signIn } from "@/lib/actions/user-actions";
import { useLangStore } from "@/utils/store/lang-store";
import { ActionState } from "@/lib/validations";
import { SignFormTranslations } from "@/lib/translations";
import { CustomInput } from "../../components/custom-input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SignInForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signIn,
    {
      error: "",
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (state?.error == "Email not verified") {
      router.push("/verify-email");
    }
    if (state?.redirect) {
      toast.success(state?.message);
      setTimeout(() => {
        window.location.href = state?.url;
      }, 1000);
    }
  }, [state]);

  const language = useLangStore((prev) => prev.language);

  const {
    title,
    subtitle,
    fields,
    signIn: signInText,
    forgotPassword,
    noAccount,
    createAccount,
    loading,
  } = SignFormTranslations.signin[language];

  return (
    <form
      action={formAction}
      className={cn(
        "space-y-6 w-4/5 max-w-md p-10 rounded-lg shadow-2xl shadow-black/40 dark:shadow-white/10",
        "backdrop-blur-sm backdrop-saturate-180 bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10",
        "text-gray-800 dark:text-gray-100"
      )}
    >
      <h2 className="text-center text-2xl font-bold mb-4 pointer-events-none">
        {title}
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6 pointer-events-none">
        {subtitle}
      </p>

      {fields.map((field) => (
        <CustomInput key={field.id} {...field} />
      ))}

      {state?.error && (
        <div className="text-red-500 text-sm">{state.error}</div>
      )}

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
          signInText
        )}
      </Button>

      <div className="text-center mt-6 flex flex-col items-center">
        <Link
          href="/forgot-password"
          className="text-blue-500 group hover:underline pb-4"
        >
          {forgotPassword}
          <Link2 className="inline-block h-4 w-4 ml-1 group-hover:-rotate-45 transition-all duration-500" />
        </Link>
        <p className="text-sm">
          <span className=" pointer-events-none">{`${noAccount} `}</span>
          <Link href="/sign-up" className="text-blue-500 group hover:underline">
            {createAccount}
            <Link2 className="inline-block h-4 w-4 ml-1 group-hover:-rotate-45 transition-all duration-500" />
          </Link>
        </p>
      </div>
    </form>
  );
}
