"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const sizes = {
  sm: { width: 256, height: 256 },
  md: { width: 384, height: 384 },
  lg: { width: 600, height: 400 },
  xl: { width: 800, height: 500 },
  "2xl": { width: 1000, height: 600 },
  "4xl": { width: 1200, height: 800 },
  "6xl": { width: 1800, height: 800 },
};

type Size = keyof typeof sizes;
interface ImageContainerProps {
  src: string;
  alt: string;
  title?: string;
  overlay?: boolean;
  rotation?: number;
  size?: Size;
  className?: string;
  imageClassName?: string;
  children?: React.ReactNode;
  animateOnScroll?: boolean;
  initialSize?: Size;
}

export function ImageContainer({
  src,
  alt,
  title,
  overlay = true,
  rotation = 0,
  size = "lg",
  className,
  imageClassName,
  children,
  animateOnScroll = false,
  initialSize = "2xl",
}: ImageContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  // Parallax effect for the image
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  const containerStyle =
    rotation !== 0 ? { transform: `rotate(${rotation}deg)` } : {};

  // Animation variants for scroll-based size change
  const animationVariants = {
    initial: {
      width: sizes[initialSize].width,
      height: sizes[initialSize].height,
    },
    animate: {
      width: sizes[size].width,
      height: sizes[size].height,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  if (animateOnScroll) {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative overflow-hidden border-4 border-white",
          "rounded-[297px]",
          className
        )}
        style={containerStyle}
        initial="initial"
        animate={isInView ? "animate" : "initial"}
        variants={animationVariants}
      >
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{ y, scale }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className={cn("object-cover", imageClassName)}
          />
        </motion.div>

        {overlay && (
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 h-3/5",
              "rounded-[216px]",
              "bg-gradient-to-t from-black/80 to-transparent"
            )}
          />
        )}

        {title && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <h3 className="font-satoshi text-white text-7xl md:text-8xl lg:text-9xl font-normal leading-tight text-center uppercase tracking-tight">
              {title}
            </h3>
          </div>
        )}

        {children}
      </motion.div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden border-4 border-white",
        "rounded-[297px]",
        sizes[size],
        className
      )}
      style={containerStyle}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("object-cover", imageClassName)}
      />

      {overlay && (
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 h-3/5",
            "rounded-[216px]", // Smaller radius for overlay
            "bg-gradient-to-t from-black/80 to-transparent"
          )}
        />
      )}

      {title && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <h3 className="font-satoshi text-white text-7xl md:text-8xl lg:text-9xl font-normal leading-tight text-center uppercase tracking-tight">
            {title}
          </h3>
        </div>
      )}

      {children}
    </div>
  );
}
