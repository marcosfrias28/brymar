"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { cn } from "@/lib/utils";

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
type ImageContainerProps = {
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
};

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
				animate={isInView ? "animate" : "initial"}
				className={cn(
					"relative overflow-hidden border-4 border-white",
					"rounded-[297px]",
					className
				)}
				initial="initial"
				ref={ref}
				style={containerStyle}
				variants={animationVariants}
			>
				<motion.div
					className="absolute inset-0 h-full w-full"
					style={{ y, scale }}
				>
					<Image
						alt={alt}
						className={cn("object-cover", imageClassName)}
						fill
						src={src}
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
					<div className="-translate-x-1/2 absolute bottom-8 left-1/2 transform">
						<h3 className="text-center font-normal font-satoshi text-7xl text-white uppercase leading-tight tracking-tight md:text-8xl lg:text-9xl">
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
			className={cn(
				"relative overflow-hidden border-4 border-white",
				"rounded-[297px]",
				sizes[size],
				className
			)}
			ref={ref}
			style={containerStyle}
		>
			<Image
				alt={alt}
				className={cn("object-cover", imageClassName)}
				fill
				src={src}
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
				<div className="-translate-x-1/2 absolute bottom-8 left-1/2 transform">
					<h3 className="text-center font-normal font-satoshi text-7xl text-white uppercase leading-tight tracking-tight md:text-8xl lg:text-9xl">
						{title}
					</h3>
				</div>
			)}

			{children}
		</div>
	);
}
