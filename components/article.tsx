"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface ArticleProps {
  index: number;
  imageSrc: string;
  title: string;
  description: string;
  className?: string;
  imageClassName?: string;
  imageRef?: React.RefObject<HTMLImageElement>;
}

export function Article({
  imageSrc,
  title,
  description,
  className,
  imageClassName,
  imageRef,
}: ArticleProps) {
  return (
    <article
      ref={imageRef}
      className={cn("flex flex-col", "h-full w-full", "rounded-2xl", className)}
    >
      <div className="relative w-full h-full">
        <img
          src={imageSrc}
          alt={title}
          className={cn("object-cover", "h-full w-full", imageClassName)}
        />
        <div
          className={cn(
            "absolute inset-0",
            "bg-linear-to-t from-black/70 to-transparent",
            "flex flex-col justify-end",
            "p-4 md:p-6",
            "rounded-2xl"
          )}
        >
          <h3
            className={cn(
              "text-white font-serif",
              "text-xl md:text-2xl lg:text-3xl mb-1 md:mb-2"
            )}
          >
            {title}
          </h3>
          <p className={cn("text-white/80", "text-xs md:text-sm lg:text-base")}>
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}
