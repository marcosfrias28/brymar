"use client";

import { signOut } from "@/lib/actions/auth-actions";
import { ActionState } from "@/lib/validations";
import { LogOut, Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/db/schema";


const LogOutButton = ({ user }: { user: User | null }) => {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signOut,
    { error: "" }
  );

  const logoutText = "Cerrar Sesión";
  const pendingText = "Cerrando sesión...";

  useEffect(() => {
    if (state?.error) toast.error(state?.error);
    if (state?.success) {
      toast.success(state?.message);
      if (state?.redirect) {
        setTimeout(() => {
          window.location.reload();
        }, 200);
      }
    }
  }, [pending]);

  if (!user) {
    return null;
  }

  return (
    <form action={formAction}>
      <Button
        type="submit"
        variant="ghost"
        className={cn(
          "w-full justify-start flex items-center gap-2",
          "hover:bg-red-50 hover:text-red-600",
          "dark:hover:bg-red-900/20 dark:hover:text-red-400",
          "transition-colors duration-200"
        )}
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {pendingText}
          </>
        ) : (
          <>
            <LogOut className="h-4 w-4" />
            {logoutText}
          </>
        )}
      </Button>
    </form>
  );
};

export default LogOutButton;