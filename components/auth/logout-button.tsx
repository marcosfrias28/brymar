"use client";

import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/db/schema";
import { useUser } from "@/hooks/use-user";

const logoutText = "Cerrar Sesión";
const pendingText = "Cerrando sesión...";

const LogOutButton = ({ user }: { user: User | null }) => {
  const { signOut, loading } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      // Don't reset isLoggingOut here since we're redirecting
    }
  };

  const pending = loading || isLoggingOut;
  const text = pending ? pendingText : logoutText;

  return (
      <Button
        onClick={handleLogout}
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
            {text}
          </>
        ) : (
          <>
            <LogOut className="h-4 w-4" />
            {text}
          </>
        )}
      </Button>
  );
};

export default LogOutButton;