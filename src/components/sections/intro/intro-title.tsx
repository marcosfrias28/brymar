import { motion } from "framer-motion";
import React from "react";

interface IntroTitleProps {
  name: string;
  subtitle: string;
}

export const IntroTitle: React.FC<IntroTitleProps> = ({ name, subtitle }) => {
  return (
    <div className="w-full h-fit text-center text-foreground px-4 z-10 pt-20 pb-10 bg-background">
      <motion.h1
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
        className="font-extrabold font-serif uppercase text-4xl"
      >
        {name}
      </motion.h1>
      <motion.h2
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.5,
          ease: "easeInOut",
        }}
        className="font-extrabold font-sans opacity-50 uppercase text-sm"
      >
        {subtitle}
      </motion.h2>
    </div>
  );
};
