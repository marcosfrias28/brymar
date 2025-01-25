"use client";

import { signOut } from "@/lib/actions/user-actions";
import { ActionState } from "@/lib/validations";
import { LucideLogOut } from "lucide-react";
import Image from "next/image";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLangStore } from "@/utils/store/lang-store";
import { CustomButton } from "@/components/custom-buttom";
import { User } from "@/lib/db/schema";

const translations = {
  en: {
    logout: "Logout",
    pending: "Logging out...",
  },
  es: {
    logout: "Cerrar Sesión",
    pending: "Cerrando sesión...",
  },
  it: {
    logout: "Esci",
    pending: "Disconnessione...",
  },
};

const LogOutButton = ({ user }: { user: User | null }) => {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signOut,
    { error: "" }
  );

  const language = useLangStore((prev) => prev.language);
  const { logout: logoutText, pending: pendingText } = translations[language];

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
      <button
        className={cn(
          "inline-flex items-center  justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          "hover:bg-accent hover:text-accent-foreground",
          "h-10 w-10",
          "w-full justify-start flex items-center gap-2 pl-2"
        )}
      >
        <CustomButton
          className="m-0 px-4"
          icon={LucideLogOut}
          label={pending ? pendingText : logoutText}
        />
      </button>
    </form>
  );
};

export default LogOutButton;
