"use client";

import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/presentation/server-actions/auth-actions";

const logoutText = "Cerrar Sesión";
const pendingText = "Cerrando sesión...";

const LogOutButton = ({ user }: { user: any }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      const result = await signOut();

      if (result.success) {
        // Show success message
        if (result.message) {
          toast.success(result.message);
        }

        // Handle redirect if specified
        if (result.redirect && result.url) {
          router.push(result.url);
        }
      } else {
        // Show error message
        toast.error(result.error || "Error al cerrar sesión");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión. Inténtalo de nuevo.");
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
