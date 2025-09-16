"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { signIn } from "@/lib/actions/auth-actions";
import { ActionState } from "@/lib/validations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      router.push(state?.url);
    }
  }, [state, router]);

  const title = "Iniciar Sesión";
  const subtitle = "Ingresa tu email para acceder a tu cuenta";
  const signInText = "Iniciar Sesión";
  const forgotPassword = "¿Olvidaste tu contraseña?";
  const noAccount = "¿No tienes cuenta?";
  const createAccount = "Registrarse";
  const loading = "Iniciando sesión...";



  return (
    <form action={formAction} className={cn("flex flex-col gap-6")}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-balance text-sm text-muted-foreground">
          {subtitle}
        </p>
      </div>
      <div className="grid gap-6">
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
          <div className="flex items-center">
            <Label htmlFor="password">Contraseña</Label>
            <Link
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              {forgotPassword}
            </Link>
          </div>
          <Input 
            id="password" 
            name="password"
            type="password" 
            required 
          />
        </div>
        
        {state?.error && (
          <div className="text-destructive text-sm text-center">{state.error}</div>
        )}
        
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              {loading}
            </>
          ) : (
            signInText
          )}
        </Button>
      </div>
      <div className="text-center text-sm">
        {noAccount}{" "}
        <Link href="/sign-up" className="underline underline-offset-4">
          {createAccount}
        </Link>
      </div>
    </form>
  );
}