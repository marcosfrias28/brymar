import { cn } from "@/lib/utils";
import Image from "next/image";

interface FigmaImageContainerProps {
  src: string;
  alt: string;
  title?: string;
  overlay?: boolean;
  rotation?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  imageClassName?: string;
  children?: React.ReactNode;
}

export function FigmaImageContainer({
  src,
  alt,
  title,
  overlay = true,
  rotation = 0,
  size = "lg",
  className,
  imageClassName,
  children
}: FigmaImageContainerProps) {
  const sizes = {
    sm: "w-64 h-64",
    md: "w-96 h-96",
    lg: "w-[600px] h-[400px]",
    xl: "w-[800px] h-[500px]"
  };

  const containerStyle = rotation !== 0 ? { transform: `rotate(${rotation}deg)` } : {};

  return (
    <div 
      className={cn(
        "relative overflow-hidden border border-white",
        "rounded-[297px]", // Figma's large border radius
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

// Circular text component for property features
interface CircularTextProps {
  text: string;
  className?: string;
}

export function CircularText({ text, className }: CircularTextProps) {
  const letters = text.split('');
  
  return (
    <div className={cn("relative w-44 h-44", className)}>
      <svg className="w-full h-full animate-spin" style={{ animationDuration: '20s' }}>
        <defs>
          <path
            id="circle"
            d="M 88,88 m -70,0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0"
          />
        </defs>
        <text className="fill-white font-poppins text-lg font-light">
          <textPath href="#circle">
            {text.toUpperCase()}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="74" height="74" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M38.1109 0.666626L44.4804 31.5194L75.3331 37.8888L44.4804 44.2583L38.1109 75.1111L31.7414 44.2583L0.888672 37.8888L31.7414 31.5194L38.1109 0.666626Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
}
