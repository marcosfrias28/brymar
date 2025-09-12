"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { signUp } from "@/lib/actions/auth-actions";
import { ActionState } from "@/lib/validations";
import { CustomInput } from "@/components/custom-input";
import { toast } from "sonner";


export function SignUpForm() {
  const title = "Crear Cuenta";
  const subtitle = "Completa los datos para registrarte";
  const fields = [
    {
      id: "name",
      name: "name",
      type: "text",
      placeholder: "Nombre completo",
      label: "Nombre completo",
      children: "Nombre completo",
      required: true
    },
    {
      id: "email",
      name: "email",
      type: "email",
      placeholder: "Correo electrónico",
      label: "Correo electrónico",
      children: "Correo electrónico",
      required: true
    },
    {
      id: "password",
      name: "password",
      type: "password",
      placeholder: "Contraseña",
      label: "Contraseña",
      children: "Contraseña",
      required: true
    }
  ];
  const signUpText = "Crear Cuenta";
  const loading = "Creando cuenta...";
  const alreadyHaveAccount = "¿Ya tienes cuenta?";
  const signInLinkText = "Iniciar sesión";


  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signUp,
    { error: "" }
  );

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    else if (state?.redirect) {
      toast.success(state.message);
      setTimeout(() => {
        window.location.href = state.url;
      }, 200);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      className={cn(
        "space-y-6 w-4/5 max-w-md p-10 rounded-lg shadow-2xl shadow-black/40 dark:shadow-white/10",
        "backdrop-blur-xs backdrop-saturate-180 bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10",
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
          signUpText
        )}
      </Button>

      <div className="text-center mt-6">
        <p className="text-sm">
          {alreadyHaveAccount}{" "}
          <Link href="/sign-in" className="text-blue-500 hover:underline">
            {signInLinkText}
          </Link>
        </p>
      </div>
    </form>
  );
}