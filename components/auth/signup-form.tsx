"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { signUp } from "@/lib/actions/auth-actions";
import { ActionState } from "@/lib/validations";
import { toast } from "sonner";

export function SignUpForm() {
  const title = "Crear Cuenta";
  const subtitle = "Ingresa tus datos para crear una nueva cuenta";
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

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Juan Pérez"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" name="password" type="password" required />
        </div>

        {state?.error && (
          <div className="text-destructive text-sm text-center">
            {state.error}
          </div>
        )}
      </div>

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

      <div className="text-center text-sm">
        {alreadyHaveAccount}{" "}
        <Link href="/sign-in" className="underline underline-offset-4">
          {signInLinkText}
        </Link>
      </div>
    </form>
  );
}
