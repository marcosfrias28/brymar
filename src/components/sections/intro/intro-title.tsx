import { motion } from "framer-motion";
import type React from "react";

type IntroTitleProps = {
	name: string;
	subtitle: string;
};

export const IntroTitle: React.FC<IntroTitleProps> = ({ name, subtitle }) => (
	<div className="z-10 h-fit w-full bg-background px-4 pt-20 pb-10 text-center text-foreground">
		<motion.h1
			animate={{ opacity: 1, y: 0 }}
			className="font-extrabold font-serif text-4xl uppercase"
			initial={{ opacity: 0, y: 100 }}
			transition={{
				duration: 0.5,
				ease: "easeInOut",
			}}
		>
			{name}
		</motion.h1>
		<motion.h2
			animate={{ opacity: 1, y: 0 }}
			className="font-extrabold font-sans text-sm uppercase opacity-50"
			initial={{ opacity: 0, y: 100 }}
			transition={{
				duration: 0.5,
				delay: 0.5,
				ease: "easeInOut",
			}}
		>
			{subtitle}
		</motion.h2>
	</div>
);
