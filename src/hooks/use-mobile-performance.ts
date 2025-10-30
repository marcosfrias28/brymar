/**
 * Mobile Performance Optimization Hooks
 * Provides performance monitoring and optimization utilities for mobile devices
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useResponsive } from "./use-mobile-responsive";

// Performance metrics interface
export type PerformanceMetrics = {
	renderTime: number;
	memoryUsage: number;
	batteryLevel: number;
	connectionSpeed: string;
	deviceConcurrency: number;
	isLowEndDevice: boolean;
	frameRate: number;
	loadTime: number;
};

// Lazy loading hook
export function useLazyLoading<T>(
	loadFunction: () => Promise<T>,
	dependencies: any[] = [],
	options: {
		enabled?: boolean;
		delay?: number;
		retries?: number;
	} = {}
) {
	const { enabled = true, delay = 0, retries = 3 } = options;
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [retryCount, setRetryCount] = useState(0);
	const mountedRef = useRef(true);

	const load = useCallback(async () => {
		if (!enabled || loading) {
			return;
		}

		setLoading(true);
		setError(null);

		try {
			if (delay > 0) {
				await new Promise((resolve) => setTimeout(resolve, delay));
			}

			const result = await loadFunction();

			if (mountedRef.current) {
				setData(result);
				setRetryCount(0);
			}
		} catch (err) {
			if (mountedRef.current) {
				const error = err instanceof Error ? err : new Error("Load failed");
				setError(error);

				if (retryCount < retries) {
					setRetryCount((prev) => prev + 1);
					// Exponential backoff
					setTimeout(
						() => {
							if (mountedRef.current) {
								load();
							}
						},
						2 ** retryCount * 1000
					);
				}
			}
		} finally {
			if (mountedRef.current) {
				setLoading(false);
			}
		}
	}, [enabled, loading, loadFunction, delay, retryCount, retries]);

	useEffect(() => {
		load();
	}, [...dependencies, load]);

	useEffect(
		() => () => {
			mountedRef.current = false;
		},
		[]
	);

	const retry = useCallback(() => {
		setRetryCount(0);
		load();
	}, [load]);

	return {
		data,
		loading,
		error,
		retry,
		retryCount,
	};
}

// Image optimization hook
export function useImageOptimization() {
	const { isMobile, devicePixelRatio } = useResponsive();

	const getOptimizedImageProps = useCallback(
		(src: string, width: number, height?: number, _quality = 80) => {
			// Calculate optimal dimensions for device
			const dpr = devicePixelRatio || 1;
			const optimizedWidth = Math.round(width * dpr);
			const optimizedHeight = height ? Math.round(height * dpr) : undefined;

			// Use smaller images on mobile to save bandwidth
			const mobileWidth = isMobile
				? Math.min(optimizedWidth, 800)
				: optimizedWidth;
			const mobileHeight =
				optimizedHeight && isMobile
					? Math.min(optimizedHeight, 800)
					: optimizedHeight;

			return {
				src,
				width: mobileWidth,
				height: mobileHeight,
				loading: "lazy" as const,
				decoding: "async" as const,
				style: {
					maxWidth: "100%",
					height: "auto",
				},
			};
		},
		[isMobile, devicePixelRatio]
	);

	const preloadImage = useCallback(
		(src: string): Promise<void> =>
			new Promise((resolve, reject) => {
				const img = new Image();
				img.onload = () => resolve();
				img.onerror = reject;
				img.src = src;
			}),
		[]
	);

	return {
		getOptimizedImageProps,
		preloadImage,
	};
}

// Memory management hook
export function useMemoryManagement() {
	const [memoryInfo, setMemoryInfo] = useState<{
		used: number;
		total: number;
		limit: number;
	} | null>(null);

	const updateMemoryInfo = useCallback(() => {
		if ("memory" in performance) {
			const memory = (performance as any).memory;
			setMemoryInfo({
				used: memory.usedJSHeapSize,
				total: memory.totalJSHeapSize,
				limit: memory.jsHeapSizeLimit,
			});
		}
	}, []);

	useEffect(() => {
		updateMemoryInfo();
		const interval = setInterval(updateMemoryInfo, 5000);
		return () => clearInterval(interval);
	}, [updateMemoryInfo]);

	const isMemoryPressure = useMemo(() => {
		if (!memoryInfo) {
			return false;
		}
		return memoryInfo.used / memoryInfo.limit > 0.8;
	}, [memoryInfo]);

	const cleanup = useCallback(() => {
		// Force garbage collection if available
		if ("gc" in window) {
			(window as any).gc();
		}
	}, []);

	return {
		memoryInfo,
		isMemoryPressure,
		cleanup,
	};
}

// Virtual scrolling hook for large lists
export function useVirtualScrolling<T>(
	items: T[],
	itemHeight: number,
	containerHeight: number,
	overscan = 5
) {
	const [scrollTop, setScrollTop] = useState(0);

	const visibleRange = useMemo(() => {
		const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
		const visibleCount = Math.ceil(containerHeight / itemHeight);
		const end = Math.min(items.length, start + visibleCount + overscan * 2);

		return { start, end };
	}, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

	const visibleItems = useMemo(
		() =>
			items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
				item,
				index: visibleRange.start + index,
			})),
		[items, visibleRange]
	);

	const totalHeight = items.length * itemHeight;
	const offsetY = visibleRange.start * itemHeight;

	const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
		setScrollTop(e.currentTarget.scrollTop);
	}, []);

	return {
		visibleItems,
		totalHeight,
		offsetY,
		handleScroll,
	};
}

// Debounced state hook for performance
export function useDebouncedState<T>(
	initialValue: T,
	delay = 300
): [T, T, (value: T) => void] {
	const [immediateValue, setImmediateValue] = useState(initialValue);
	const [debouncedValue, setDebouncedValue] = useState(initialValue);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const setValue = useCallback(
		(value: T) => {
			setImmediateValue(value);

			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			timeoutRef.current = setTimeout(() => {
				setDebouncedValue(value);
			}, delay);
		},
		[delay]
	);

	useEffect(
		() => () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		},
		[]
	);

	return [immediateValue, debouncedValue, setValue];
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
	const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
	const frameCountRef = useRef(0);
	const lastFrameTimeRef = useRef(performance.now());

	const measureFrameRate = useCallback(() => {
		const now = performance.now();
		const delta = now - lastFrameTimeRef.current;

		if (delta >= 1000) {
			const fps = Math.round((frameCountRef.current * 1000) / delta);
			frameCountRef.current = 0;
			lastFrameTimeRef.current = now;

			setMetrics((prev) => (prev ? { ...prev, frameRate: fps } : null));
		}

		frameCountRef.current++;
		requestAnimationFrame(measureFrameRate);
	}, []);

	useEffect(() => {
		const updateMetrics = () => {
			const memory = (performance as any).memory;
			const connection = (navigator as any).connection;
			const battery = (navigator as any).battery;

			setMetrics({
				renderTime: performance.now(),
				memoryUsage: memory ? memory.usedJSHeapSize : 0,
				batteryLevel: battery ? battery.level : 1,
				connectionSpeed: connection ? connection.effectiveType : "unknown",
				deviceConcurrency: navigator.hardwareConcurrency || 1,
				isLowEndDevice: (navigator.hardwareConcurrency || 1) <= 2,
				frameRate: 60, // Will be updated by measureFrameRate
				loadTime: performance.timing
					? performance.timing.loadEventEnd - performance.timing.navigationStart
					: 0,
			});
		};

		updateMetrics();
		measureFrameRate();

		const interval = setInterval(updateMetrics, 5000);
		return () => clearInterval(interval);
	}, [measureFrameRate]);

	return metrics;
}

// Intersection observer hook for lazy loading
export function useIntersectionObserver(
	options: IntersectionObserverInit = {}
) {
	const [isIntersecting, setIsIntersecting] = useState(false);
	const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
	const elementRef = useRef<HTMLElement | null>(null);
	const observerRef = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		const element = elementRef.current;
		if (!element) {
			return;
		}

		observerRef.current = new IntersectionObserver(
			([entry]) => {
				setIsIntersecting(entry.isIntersecting);
				setEntry(entry);
			},
			{
				threshold: 0.1,
				rootMargin: "50px",
				...options,
			}
		);

		observerRef.current.observe(element);

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [options]);

	return {
		elementRef,
		isIntersecting,
		entry,
	};
}

// Optimized animation hook
export function useOptimizedAnimation(
	shouldAnimate = true,
	reducedMotionFallback: any = {}
) {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		setPrefersReducedMotion(mediaQuery.matches);

		const handleChange = (e: MediaQueryListEvent) => {
			setPrefersReducedMotion(e.matches);
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, []);

	const shouldUseAnimation = shouldAnimate && !prefersReducedMotion;

	return {
		shouldAnimate: shouldUseAnimation,
		prefersReducedMotion,
		animationProps: shouldUseAnimation ? {} : reducedMotionFallback,
	};
}

// Resource preloading hook
export function useResourcePreloading() {
	const preloadedResources = useRef(new Set<string>());

	const preloadResource = useCallback(
		(href: string, as: "script" | "style" | "image" | "font" = "script") => {
			if (preloadedResources.current.has(href)) {
				return;
			}

			const link = document.createElement("link");
			link.rel = "preload";
			link.href = href;
			link.as = as;

			if (as === "font") {
				link.crossOrigin = "anonymous";
			}

			document.head.appendChild(link);
			preloadedResources.current.add(href);
		},
		[]
	);

	const preloadImages = useCallback((urls: string[]) => {
		urls.forEach((url) => {
			if (!preloadedResources.current.has(url)) {
				const img = new Image();
				img.src = url;
				preloadedResources.current.add(url);
			}
		});
	}, []);

	return {
		preloadResource,
		preloadImages,
	};
}

// Bundle splitting hook
export function useDynamicImport<T>(
	importFunction: () => Promise<{ default: T }>,
	dependencies: any[] = []
) {
	const [component, setComponent] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		let cancelled = false;

		const loadComponent = async () => {
			setLoading(true);
			setError(null);

			try {
				const module = await importFunction();
				if (!cancelled) {
					setComponent(module.default);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err : new Error("Import failed"));
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		loadComponent();

		return () => {
			cancelled = true;
		};
	}, dependencies);

	return { component, loading, error };
}

// Main mobile performance hook that combines all performance optimizations
export function useMobilePerformance() {
	const { isMobile } = useResponsive();
	const memoryManagement = useMemoryManagement();
	const performanceMetrics = usePerformanceMonitoring();
	const { shouldAnimate } = useOptimizedAnimation();

	// Detect low-end device based on hardware concurrency and memory
	const isLowEndDevice = useMemo(() => {
		const hardwareConcurrency = navigator.hardwareConcurrency || 1;
		const deviceMemory = (navigator as any).deviceMemory || 1;
		return hardwareConcurrency <= 2 || deviceMemory <= 2;
	}, []);

	// Detect connection type
	const connectionType = useMemo(() => {
		const connection = (navigator as any).connection;
		return connection?.effectiveType || "unknown";
	}, []);

	const performanceConfig = useMemo(
		() => ({
			shouldReduceAnimations: isLowEndDevice || connectionType === "slow-2g",
			shouldLazyLoad: isMobile || isLowEndDevice,
			shouldPreloadImages: !isLowEndDevice && connectionType !== "slow-2g",
			maxConcurrentRequests: isLowEndDevice ? 2 : 6,
			imageQuality: isLowEndDevice ? 60 : 80,
			enableVirtualScrolling: isMobile && isLowEndDevice,
		}),
		[isMobile, isLowEndDevice, connectionType]
	);

	const optimizeForDevice = useCallback(() => {
		if (memoryManagement.isMemoryPressure) {
			memoryManagement.cleanup();
		}
	}, [memoryManagement]);

	return {
		isMobile,
		isLowEndDevice,
		connectionType,
		performanceConfig,
		memoryManagement,
		performanceMetrics,
		shouldAnimate,
		shouldReduceAnimations: performanceConfig.shouldReduceAnimations,
		shouldLazyLoad: performanceConfig.shouldLazyLoad,
		optimizeForDevice,
	};
}
