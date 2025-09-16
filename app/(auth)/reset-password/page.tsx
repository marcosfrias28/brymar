"use client";

import React, { useActionState, useEffect } from "react";
import { ActionState } from "@/lib/validations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthWrapperLayout } from "@/components/auth/auth-wrapper-layout";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Placeholder action - you'll need to implement this
const resetPassword = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
  // TODO: Implement reset password logic
  return { error: "Reset password functionality not implemented yet" };
};

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    resetPassword,
    { error: "" }
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.redirect) {
      toast.success(state.message);
      setTimeout(() => {
        window.location.href = state.url;
      }, 200);
    }
  }, [state]);

  const title = "Restablecer Contraseña";
  const subtitle = "Ingresa tu nueva contraseña";
  const resetText = "Restablecer Contraseña";
  const loading = "Restableciendo...";
  const backToLogin = "¿Recordaste tu contraseña?";
  const signInLinkText = "Iniciar sesión";

  if (!token) {
    return (
      <AuthWrapperLayout>
        <div className="flex flex-col gap-6 text-center">
          <h1 className="text-2xl font-bold text-destructive">Token Inválido</h1>
          <p className="text-balance text-sm text-muted-foreground">
            El enlace de restablecimiento de contraseña no es válido o ha expirado.
          </p>
          <Link href="/forgot-password" className="underline underline-offset-4">
            Solicitar nuevo enlace
          </Link>
        </div>
      </AuthWrapperLayout>
    );
  }

  return (
    <AuthWrapperLayout>
      <form action={formAction} className={cn("flex flex-col gap-6")}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-balance text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="password">Nueva Contraseña</Label>
            <Input 
              id="password" 
              name="password"
              type="password" 
              placeholder="Ingresa tu nueva contraseña" 
              required 
              minLength={8}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input 
              id="confirmPassword" 
              name="confirmPassword"
              type="password" 
              placeholder="Confirma tu nueva contraseña" 
              required 
              minLength={8}
            />
          </div>
          
          <input type="hidden" name="token" value={token} />
          
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
              resetText
            )}
          </Button>
        </div>
        <div className="text-center text-sm">
          {backToLogin}{" "}
          <Link href="/sign-in" className="underline underline-offset-4">
            {signInLinkText}
          </Link>
        </div>
      </form>
    </AuthWrapperLayout>
  );
};

export default ResetPasswordPage;