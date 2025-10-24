"use client";

import { useEffect, useRef, useState } from "react";

interface BackgroundVideoProps {
	src: string;
	className?: string;
	fallbackGradient?: string;
}

export function BackgroundVideo({
	src,
	className = "",
	fallbackGradient = "bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20",
}: BackgroundVideoProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [videoLoaded, setVideoLoaded] = useState(false);
	const [videoError, setVideoError] = useState(false);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		const handleLoadedData = () => {
			setVideoLoaded(true);
			video.currentTime = 0;
			video.play().catch(console.error);
		};

		const handleError = () => {
			setVideoError(true);
			console.warn(`Video failed to load: ${src}`);
		};

		const handleTimeUpdate = () => {
			// Simple loop: when reaching 15 seconds, restart from 0
			if (video.currentTime >= 15) {
				video.currentTime = 0;
			}
		};

		video.addEventListener("loadeddata", handleLoadedData);
		video.addEventListener("error", handleError);
		video.addEventListener("timeupdate", handleTimeUpdate);

		// Initialize video if already loaded
		if (video.readyState >= 2) {
			handleLoadedData();
		}

		return () => {
			video.removeEventListener("loadeddata", handleLoadedData);
			video.removeEventListener("error", handleError);
			video.removeEventListener("timeupdate", handleTimeUpdate);
		};
	}, [src]);

	// Show fallback if video fails to load
	if (videoError) {
		return (
			<div
				className={`absolute inset-0 w-full h-full ${fallbackGradient} ${className}`}
			/>
		);
	}

	return (
		<>
			{/* Fallback background while video loads */}
			{!videoLoaded && (
				<div
					className={`absolute inset-0 w-full h-full ${fallbackGradient} ${className}`}
				/>
			)}

			{/* Video element */}
			<video
				ref={videoRef}
				className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
					videoLoaded ? "opacity-100" : "opacity-0"
				} ${className}`}
				src={src}
				muted
				playsInline
				preload="auto"
				style={{ pointerEvents: "none" }}
				tabIndex={-1}
			/>
		</>
	);
}
