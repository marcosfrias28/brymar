"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from '@/lib/utils';

export interface CustomButtonProps {
  label?: string;
  icon?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
  handleClick?: () => void;
  [x: string]: any;
}

export function CustomButton({
  label,
  icon: Icon,
  className,
  children,
  handleClick,
  ...props
}: CustomButtonProps) {
  return (
    <div
      onClick={handleClick}
      className={cn(
        "inline-flex items-center  justify-center gap-2 whitespace-nowrap rounded-lg text-lg font-normal transition-all duration-300 ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        "h-10 w-10 px-3 hover:text-black hover:scale-110 hover:bg-accent-foreground",
        "w-full justify-start flex items-center gap-1",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-10 h-10 font-bold" />}
      <AnimatePresence>
        {label && (
          <motion.p
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            exit={{ opacity: 0, x: -10 }}
          >
            {label}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
