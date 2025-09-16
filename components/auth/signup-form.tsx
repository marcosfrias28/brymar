"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
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
    <form action={formAction} className={cn("flex flex-col gap-6")}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-balance text-sm text-muted-foreground">
          {subtitle}
        </p>
      </div>
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
            signUpText
          )}
        </Button>
      </div>
      <div className="text-center text-sm">
        {alreadyHaveAccount}{" "}
        <Link href="/sign-in" className="underline underline-offset-4">
          {signInLinkText}
        </Link>
      </div>
    </form>
  );
}