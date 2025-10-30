/**
 * Mobile Utility Functions
 * Provides mobile detection, touch handling, and responsive utilities
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Mobile detection utilities
export function isMobile(): boolean {
	if (typeof window === "undefined") {
		return false;
	}
	return window.innerWidth < 640;
}

export function isTablet(): boolean {
	if (typeof window === "undefined") {
		return false;
	}
	return window.innerWidth >= 640 && window.innerWidth < 1024;
}

export function isDesktop(): boolean {
	if (typeof window === "undefined") {
		return true;
	}
	return window.innerWidth >= 1024;
}

export function isTouchDevice(): boolean {
	if (typeof window === "undefined") {
		return false;
	}
	return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function isIOS(): boolean {
	if (typeof window === "undefined") {
		return false;
	}
	return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isAndroid(): boolean {
	if (typeof window === "undefined") {
		return false;
	}
	return /Android/.test(navigator.userAgent);
}

export function isSafari(): boolean {
	if (typeof window === "undefined") {
		return false;
	}
	return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

// Viewport utilities
export function getViewportSize() {
	if (typeof window === "undefined") {
		return { width: 1280, height: 800 };
	}
	return {
		width: window.innerWidth,
		height: window.innerHeight,
	};
}

export function getDevicePixelRatio(): number {
	if (typeof window === "undefined") {
		return 1;
	}
	return window.devicePixelRatio || 1;
}

// Touch utilities
export function preventZoom(element: HTMLElement) {
	element.addEventListener(
		"touchstart",
		(e) => {
			if (e.touches.length > 1) {
				e.preventDefault();
			}
		},
		{ passive: false }
	);

	let lastTouchEnd = 0;
	element.addEventListener(
		"touchend",
		(e) => {
			const now = Date.now();
			if (now - lastTouchEnd <= 300) {
				e.preventDefault();
			}
			lastTouchEnd = now;
		},
		{ passive: false }
	);
}

export function enableSmoothScrolling(element: HTMLElement) {
	(element.style as any).webkitOverflowScrolling = "touch";
	element.style.scrollBehavior = "smooth";
}

// Mobile-specific CSS classes
export const mobileClasses = {
	// Container classes
	mobileContainer: "px-4 py-2 max-w-full",
	mobileCard: "rounded-lg shadow-sm border border-gray-200",
	mobileModal: "fixed inset-0 z-50 bg-white",
	mobileForm: "space-y-4 px-4",

	// Input classes
	mobileInput:
		"text-base px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
	mobileTextarea:
		"text-base px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none",
	mobileSelect:
		"text-base px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",

	// Button classes
	touchButton: "min-h-[48px] min-w-[48px] touch-manipulation",
	mobileButton: "px-6 py-3 text-base font-medium rounded-lg touch-manipulation",
	mobilePrimaryButton:
		"px-6 py-3 text-base font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 touch-manipulation",
	mobileSecondaryButton:
		"px-6 py-3 text-base font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 touch-manipulation",

	// Navigation classes
	mobileNav:
		"fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40",
	mobileNavButton: "flex-1 py-3 px-2 text-center touch-manipulation",

	// Grid classes
	mobileGrid: "grid grid-cols-1 gap-4",
	mobileGrid2: "grid grid-cols-2 gap-3",
	tabletGrid: "grid grid-cols-2 md:grid-cols-3 gap-4",

	// Spacing classes
	mobileSpacing: "space-y-4",
	mobileSpacingTight: "space-y-2",
	mobileSpacingLoose: "space-y-6",

	// Typography classes
	mobileTitle: "text-xl font-bold leading-tight",
	mobileSubtitle: "text-lg font-semibold leading-tight",
	mobileBody: "text-base leading-relaxed",
	mobileCaption: "text-sm text-gray-600",

	// Layout classes
	mobileStack: "flex flex-col space-y-4",
	mobileInline: "flex flex-row space-x-2 items-center",
	mobileCentered: "flex items-center justify-center",

	// Image classes
	mobileImage: "w-full h-auto rounded-lg",
	mobileAvatar: "w-12 h-12 rounded-full",
	mobileIcon: "w-6 h-6",

	// Animation classes
	mobileSlideUp: "animate-slide-up",
	mobileFadeIn: "animate-fade-in",
	mobileTransition: "transition-all duration-200 ease-out",
};

// Responsive class generator
export function responsiveClass(
	mobile: string,
	tablet?: string,
	desktop?: string
): string {
	const classes = [mobile];

	if (tablet) {
		classes.push(`md:${tablet}`);
	}

	if (desktop) {
		classes.push(`lg:${desktop}`);
	}

	return classes.join(" ");
}

// Mobile-optimized cn function
export function mobileCn(...inputs: ClassValue[]): string {
	const baseClasses = twMerge(clsx(inputs));

	// Add mobile-specific optimizations
	if (isMobile()) {
		return twMerge(baseClasses, "touch-manipulation");
	}

	return baseClasses;
}

// Image optimization utilities
export function getOptimizedImageUrl(
	url: string,
	width: number,
	height?: number,
	_quality = 80
): string {
	if (!url) {
		return "";
	}

	// For mobile devices, use smaller images
	const devicePixelRatio = getDevicePixelRatio();
	const _optimizedWidth = Math.round(width * devicePixelRatio);
	const _optimizedHeight = height
		? Math.round(height * devicePixelRatio)
		: undefined;

	// This would integrate with your image optimization service
	// For now, return the original URL
	return url;
}

// Performance utilities
export function shouldReduceMotion(): boolean {
	if (typeof window === "undefined") {
		return false;
	}
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function shouldUseHighContrast(): boolean {
	if (typeof window === "undefined") {
		return false;
	}
	return window.matchMedia("(prefers-contrast: high)").matches;
}

export function getConnectionSpeed(): string {
	if (typeof navigator === "undefined") {
		return "unknown";
	}
	const connection = (navigator as any).connection;
	return connection?.effectiveType || "unknown";
}

// Form utilities
export function preventIOSZoom() {
	if (!isIOS()) {
		return;
	}

	const viewport = document.querySelector("meta[name=viewport]");
	if (viewport) {
		viewport.setAttribute(
			"content",
			"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
		);
	}
}

export function restoreIOSZoom() {
	if (!isIOS()) {
		return;
	}

	const viewport = document.querySelector("meta[name=viewport]");
	if (viewport) {
		viewport.setAttribute("content", "width=device-width, initial-scale=1.0");
	}
}

// Haptic feedback (if supported)
export function triggerHapticFeedback(
	type: "light" | "medium" | "heavy" = "light"
) {
	if (typeof navigator === "undefined") {
		return;
	}

	const vibrator = (navigator as any).vibrate;
	if (vibrator) {
		const patterns = {
			light: [10],
			medium: [20],
			heavy: [30],
		};
		vibrator(patterns[type]);
	}
}

// Safe area utilities
export function getSafeAreaInsets() {
	if (typeof window === "undefined") {
		return { top: 0, right: 0, bottom: 0, left: 0 };
	}

	const computedStyle = getComputedStyle(document.documentElement);

	return {
		top: Number.parseInt(
			computedStyle.getPropertyValue("env(safe-area-inset-top)") || "0",
			10
		),
		right: Number.parseInt(
			computedStyle.getPropertyValue("env(safe-area-inset-right)") || "0",
			10
		),
		bottom: Number.parseInt(
			computedStyle.getPropertyValue("env(safe-area-inset-bottom)") || "0",
			10
		),
		left: Number.parseInt(
			computedStyle.getPropertyValue("env(safe-area-inset-left)") || "0",
			10
		),
	};
}

// Camera and media utilities
export function isCameraSupported(): boolean {
	return !!navigator.mediaDevices?.getUserMedia;
}

export function isFileAPISupported(): boolean {
	return !!(window.File && window.FileReader && window.FileList && window.Blob);
}

export async function requestCameraPermission(): Promise<boolean> {
	if (!isCameraSupported()) {
		return false;
	}

	try {
		const stream = await navigator.mediaDevices.getUserMedia({ video: true });
		stream.getTracks().forEach((track) => track.stop());
		return true;
	} catch (_error) {
		return false;
	}
}

// Keyboard utilities
export function isVirtualKeyboardOpen(): boolean {
	if (typeof window === "undefined") {
		return false;
	}

	// Use Visual Viewport API if available
	if (window.visualViewport) {
		return window.visualViewport.height < window.innerHeight * 0.75;
	}

	// Fallback: detect significant height change
	const heightRatio = window.innerHeight / screen.height;
	return heightRatio < 0.75;
}

// Scroll utilities
export function scrollToTop(smooth = true) {
	if (typeof window === "undefined") {
		return;
	}

	window.scrollTo({
		top: 0,
		behavior: smooth ? "smooth" : "auto",
	});
}

export function scrollIntoView(
	element: HTMLElement,
	options?: ScrollIntoViewOptions
) {
	if (!element) {
		return;
	}

	element.scrollIntoView({
		behavior: "smooth",
		block: "center",
		...options,
	});
}

// Local storage utilities for mobile
export function setMobilePreference(key: string, value: any) {
	if (typeof localStorage === "undefined") {
		return;
	}

	try {
		localStorage.setItem(`mobile_${key}`, JSON.stringify(value));
	} catch (_error) {}
}

export function getMobilePreference<T>(key: string, defaultValue: T): T {
	if (typeof localStorage === "undefined") {
		return defaultValue;
	}

	try {
		const stored = localStorage.getItem(`mobile_${key}`);
		return stored ? JSON.parse(stored) : defaultValue;
	} catch (_error) {
		return defaultValue;
	}
}

// Performance utilities object
export const performanceUtils = {
	// Memory management
	measureMemoryUsage: (): number => {
		if (typeof performance !== "undefined" && "memory" in performance) {
			return (performance as any).memory.usedJSHeapSize;
		}
		return 0;
	},

	// Performance timing
	measureRenderTime: (callback: () => void): number => {
		const start = performance.now();
		callback();
		return performance.now() - start;
	},

	// Frame rate monitoring
	measureFrameRate: (): Promise<number> =>
		new Promise((resolve) => {
			let frames = 0;
			const startTime = performance.now();

			function countFrames() {
				frames++;
				const elapsed = performance.now() - startTime;

				if (elapsed >= 1000) {
					resolve(frames);
				} else {
					requestAnimationFrame(countFrames);
				}
			}

			requestAnimationFrame(countFrames);
		}),

	// Network performance
	getConnectionInfo: () => {
		const connection = (navigator as any).connection;
		if (!connection) {
			return null;
		}

		return {
			effectiveType: connection.effectiveType,
			downlink: connection.downlink,
			rtt: connection.rtt,
			saveData: connection.saveData,
		};
	},

	// Device capabilities
	getDeviceCapabilities: () => ({
		hardwareConcurrency: navigator.hardwareConcurrency || 1,
		deviceMemory: (navigator as any).deviceMemory || 1,
		maxTouchPoints: navigator.maxTouchPoints || 0,
		devicePixelRatio: getDevicePixelRatio(),
	}),

	// Performance optimization
	shouldOptimizeForPerformance: (): boolean => {
		const capabilities = performanceUtils.getDeviceCapabilities();
		const connection = performanceUtils.getConnectionInfo();

		return (
			capabilities.hardwareConcurrency <= 2 ||
			capabilities.deviceMemory <= 2 ||
			connection?.effectiveType === "slow-2g" ||
			connection?.effectiveType === "2g"
		);
	},

	// Throttle function calls
	throttle: <T extends (...args: any[]) => any>(
		func: T,
		limit: number
	): ((...args: Parameters<T>) => void) => {
		let inThrottle: boolean;
		return function (this: any, ...args: Parameters<T>) {
			if (!inThrottle) {
				func.apply(this, args);
				inThrottle = true;
				setTimeout(() => (inThrottle = false), limit);
			}
		};
	},

	// Debounce function calls
	debounce: <T extends (...args: any[]) => any>(
		func: T,
		delay: number
	): ((...args: Parameters<T>) => void) => {
		let timeoutId: NodeJS.Timeout;
		return function (this: any, ...args: Parameters<T>) {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => func.apply(this, args), delay);
		};
	},

	// Lazy loading utilities
	createIntersectionObserver: (
		callback: (entries: IntersectionObserverEntry[]) => void,
		options?: IntersectionObserverInit
	): IntersectionObserver =>
		new IntersectionObserver(callback, {
			rootMargin: "50px",
			threshold: 0.1,
			...options,
		}),

	// Image optimization
	getOptimalImageSize: (containerWidth: number, containerHeight?: number) => {
		const dpr = getDevicePixelRatio();
		const isMobileDevice = isMobile();

		// Reduce image size on mobile to save bandwidth
		const maxWidth = isMobileDevice
			? Math.min(containerWidth * dpr, 800)
			: containerWidth * dpr;
		const maxHeight = containerHeight
			? isMobileDevice
				? Math.min(containerHeight * dpr, 800)
				: containerHeight * dpr
			: undefined;

		return {
			width: Math.round(maxWidth),
			height: maxHeight ? Math.round(maxHeight) : undefined,
		};
	},

	// Battery optimization
	getBatteryInfo: async () => {
		if ("getBattery" in navigator) {
			try {
				const battery = await (navigator as any).getBattery();
				return {
					level: battery.level,
					charging: battery.charging,
					chargingTime: battery.chargingTime,
					dischargingTime: battery.dischargingTime,
				};
			} catch (_error) {}
		}
		return null;
	},

	// Resource preloading
	preloadResource: (href: string, as = "script") => {
		const link = document.createElement("link");
		link.rel = "preload";
		link.href = href;
		link.as = as;
		document.head.appendChild(link);
	},

	// Critical resource hints
	addResourceHints: (
		urls: string[],
		type: "preload" | "prefetch" | "preconnect" = "preload"
	) => {
		urls.forEach((url) => {
			const link = document.createElement("link");
			link.rel = type;
			link.href = url;
			document.head.appendChild(link);
		});
	},

	// Memoization utility
	memoize: <T extends (...args: any[]) => any>(
		func: T,
		ttl = 60_000 // 1 minute default TTL
	): T => {
		const cache = new Map<
			string,
			{ value: ReturnType<T>; timestamp: number }
		>();

		return ((...args: Parameters<T>): ReturnType<T> => {
			const key = JSON.stringify(args);
			const now = Date.now();
			const cached = cache.get(key);

			if (cached && now - cached.timestamp < ttl) {
				return cached.value;
			}

			const result = func(...args);
			cache.set(key, { value: result, timestamp: now });

			// Clean up expired entries
			for (const [cacheKey, cacheValue] of cache.entries()) {
				if (now - cacheValue.timestamp >= ttl) {
					cache.delete(cacheKey);
				}
			}

			return result;
		}) as T;
	},
};
