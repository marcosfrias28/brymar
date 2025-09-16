"use client";

import React, { useActionState, useEffect } from "react";
import { ActionState } from "@/lib/validations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/lib/actions/auth-actions";
import { AuthWrapperLayout } from "@/components/auth/auth-wrapper-layout";
import Link from "next/link";

const ForgotPasswordPage = () => {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    forgotPassword,
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

  const title = "Recuperar Contraseña";
  const subtitle = "Ingresa tu correo para recibir un enlace de recuperación";
  const verifyText = "Enviar enlace";
  const loading = "Enviando...";
  const alreadyVerified = "¿Ya tienes cuenta?";
  const signInLinkText = "Iniciar sesión";

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
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email"
              type="email" 
              placeholder="m@example.com" 
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
              verifyText
            )}
          </Button>
        </div>
        <div className="text-center text-sm">
          {alreadyVerified}{" "}
          <Link href="/sign-in" className="underline underline-offset-4">
            {signInLinkText}
          </Link>
        </div>
      </form>
    </AuthWrapperLayout>
  );
};

export default ForgotPasswordPage;