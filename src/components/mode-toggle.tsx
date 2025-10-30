"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export const ModeToggle = () => {
	const { theme, setTheme } = useTheme();

	const handleToggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return (
		<Button
			className="h-10 w-10"
			onClick={handleToggleTheme}
			size="icon"
			variant="ghost"
		>
			<Sun className="dark:-rotate-90 h-5 w-5 rotate-0 scale-100 transition-all dark:scale-0" />
			<Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
};
