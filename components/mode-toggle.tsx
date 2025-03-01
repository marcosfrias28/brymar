"use client";

import * as React from "react";
import { LucideProps, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { CustomButton } from "./custom-buttom";

type IconType = React.ElementType<LucideProps>;

export const ModeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [icon, setIcon] = React.useState<IconType>(Sun);

  React.useEffect(() => {
    setIcon(theme === "dark" ? Moon : Sun);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <CustomButton icon={icon} handleClick={handleToggleTheme} className="w-fit">
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </CustomButton>
  );
};
