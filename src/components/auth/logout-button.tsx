"use client";

import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/presentation/server-actions/auth-actions";

const logoutText = "Cerrar Sesión";
const pendingText = "Cerrando sesión...";

const LogOutButton = ({ user }: { user: any }) => {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setLoading(false);
    }
  };

  const text = loading ? pendingText : logoutText;

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
      disabled={loading}
    >
      {loading ? (
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
