/**
 * Enhanced Mobile Responsive Hooks
 * Provides comprehensive mobile detection and responsive utilities
 */

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

// Breakpoint definitions
export const BREAKPOINTS = {
	mobile: 640,
	tablet: 1024,
	desktop: 1280,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
export type Orientation = "portrait" | "landscape";

// Enhanced responsive hook with comprehensive mobile features
export interface UseResponsiveOptions {
	trackKeyboard?: boolean;
	trackOrientation?: boolean;
	debounceMs?: number;
}

export interface ResponsiveState {
	isMobile: boolean;
	isTablet: boolean;
	isDesktop: boolean;
	isTouchDevice: boolean;
	breakpoint: Breakpoint;
	viewportWidth: number;
	viewportHeight: number;
	isKeyboardOpen: boolean;
	orientation: Orientation;
	devicePixelRatio: number;
}

export function useResponsive(options: UseResponsiveOptions = {}) {
	const {
		trackKeyboard = false,
		trackOrientation = false,
		debounceMs = 100,
	} = options;

	const [state, setState] = useState<ResponsiveState>({
		isMobile: false,
		isTablet: false,
		isDesktop: true,
		isTouchDevice: false,
		breakpoint: "desktop",
		viewportWidth: 1280,
		viewportHeight: 800,
		isKeyboardOpen: false,
		orientation: "landscape",
		devicePixelRatio: 1,
	});

	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const initialViewportHeight = useRef<number>(0);

	const updateState = useCallback(() => {
		if (typeof window === "undefined") return;

		const width = window.innerWidth;
		const height = window.innerHeight;
		const isTouchDevice =
			"ontouchstart" in window || navigator.maxTouchPoints > 0;

		// Determine breakpoint
		let breakpoint: Breakpoint = "desktop";
		if (width < BREAKPOINTS.mobile) {
			breakpoint = "mobile";
		} else if (width < BREAKPOINTS.tablet) {
			breakpoint = "tablet";
		}

		const isMobile = breakpoint === "mobile";
		const isTablet = breakpoint === "tablet";
		const isDesktop = breakpoint === "desktop";

		// Track orientation
		const orientation: Orientation = width > height ? "landscape" : "portrait";

		// Detect virtual keyboard (mobile only)
		let isKeyboardOpen = false;
		if (trackKeyboard && isMobile) {
			if (initialViewportHeight.current === 0) {
				initialViewportHeight.current = height;
			}
			// Keyboard is likely open if viewport height decreased significantly
			isKeyboardOpen = height < initialViewportHeight.current * 0.75;
		}

		setState({
			isMobile,
			isTablet,
			isDesktop,
			isTouchDevice,
			breakpoint,
			viewportWidth: width,
			viewportHeight: height,
			isKeyboardOpen,
			orientation,
			devicePixelRatio: window.devicePixelRatio || 1,
		});
	}, [trackKeyboard]);

	const debouncedUpdate = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		timeoutRef.current = setTimeout(updateState, debounceMs);
	}, [updateState, debounceMs]);

	useEffect(() => {
		updateState();

		window.addEventListener("resize", debouncedUpdate);
		if (trackOrientation) {
			window.addEventListener("orientationchange", updateState);
		}

		return () => {
			window.removeEventListener("resize", debouncedUpdate);
			if (trackOrientation) {
				window.removeEventListener("orientationchange", updateState);
			}
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [debouncedUpdate, trackOrientation, updateState]);

	// Utility functions
	const getColumns = useCallback(
		(mobile: number, tablet: number, desktop: number) => {
			if (state.isMobile) return mobile;
			if (state.isTablet) return tablet;
			return desktop;
		},
		[state.isMobile, state.isTablet],
	);

	const getSpacing = useCallback(
		(mobile: string, tablet: string, desktop: string) => {
			if (state.isMobile) return mobile;
			if (state.isTablet) return tablet;
			return desktop;
		},
		[state.isMobile, state.isTablet],
	);

	return {
		...state,
		getColumns,
		getSpacing,
	};
}

// Mobile keyboard detection hook
export function useMobileKeyboard() {
	const [keyboardHeight, setKeyboardHeight] = useState(0);
	const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
	const initialViewportHeight = useRef<number>(0);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const updateKeyboardState = () => {
			const currentHeight = window.innerHeight;

			if (initialViewportHeight.current === 0) {
				initialViewportHeight.current = currentHeight;
				return;
			}

			const heightDifference = initialViewportHeight.current - currentHeight;
			const isOpen = heightDifference > 150; // Threshold for keyboard detection

			setIsKeyboardOpen(isOpen);
			setKeyboardHeight(isOpen ? heightDifference : 0);
		};

		// Use visualViewport API if available (more accurate)
		if (window.visualViewport) {
			const handleViewportChange = () => {
				const heightDifference =
					window.innerHeight - (window.visualViewport?.height || window.innerHeight);
				const isOpen = heightDifference > 150;

				setIsKeyboardOpen(isOpen);
				setKeyboardHeight(isOpen ? heightDifference : 0);
			};

			window.visualViewport.addEventListener("resize", handleViewportChange);
			return () => {
				window.visualViewport?.removeEventListener(
					"resize",
					handleViewportChange,
				);
			};
		} else {
			// Fallback to window resize
			window.addEventListener("resize", updateKeyboardState);
			updateKeyboardState();

			return () => {
				window.removeEventListener("resize", updateKeyboardState);
			};
		}
	}, []);

	return {
		keyboardHeight,
		isKeyboardOpen,
	};
}

// Touch gesture detection hook
export interface TouchState {
	isPressed: boolean;
	startX: number;
	startY: number;
	currentX: number;
	currentY: number;
	deltaX: number;
	deltaY: number;
	direction: "up" | "down" | "left" | "right" | null;
	distance: number;
}

export function useTouchGestures() {
	const [touchState, setTouchState] = useState<TouchState>({
		isPressed: false,
		startX: 0,
		startY: 0,
		currentX: 0,
		currentY: 0,
		deltaX: 0,
		deltaY: 0,
		direction: null,
		distance: 0,
	});

	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		const touch = e.touches[0];
		setTouchState((prev) => ({
			...prev,
			isPressed: true,
			startX: touch.clientX,
			startY: touch.clientY,
			currentX: touch.clientX,
			currentY: touch.clientY,
			deltaX: 0,
			deltaY: 0,
			direction: null,
			distance: 0,
		}));
	}, []);

	const handleTouchMove = useCallback((e: React.TouchEvent) => {
		const touch = e.touches[0];
		setTouchState((prev) => {
			const deltaX = touch.clientX - prev.startX;
			const deltaY = touch.clientY - prev.startY;
			const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

			let direction: TouchState["direction"] = null;
			if (Math.abs(deltaX) > Math.abs(deltaY)) {
				direction = deltaX > 0 ? "right" : "left";
			} else {
				direction = deltaY > 0 ? "down" : "up";
			}

			return {
				...prev,
				currentX: touch.clientX,
				currentY: touch.clientY,
				deltaX,
				deltaY,
				direction,
				distance,
			};
		});
	}, []);

	const handleTouchEnd = useCallback(() => {
		setTouchState((prev) => ({
			...prev,
			isPressed: false,
		}));
	}, []);

	return {
		touchState,
		handlers: {
			onTouchStart: handleTouchStart,
			onTouchMove: handleTouchMove,
			onTouchEnd: handleTouchEnd,
		},
	};
}

// Mobile-specific performance hook
export function useMobilePerformance() {
	const [isLowEndDevice, setIsLowEndDevice] = useState(false);
	const [connectionType, setConnectionType] = useState<string>("unknown");

	useEffect(() => {
		if (typeof window === "undefined") return;

		// Detect low-end device based on hardware concurrency and memory
		const hardwareConcurrency = navigator.hardwareConcurrency || 1;
		const deviceMemory = (navigator as any).deviceMemory || 1;

		setIsLowEndDevice(hardwareConcurrency <= 2 || deviceMemory <= 2);

		// Detect connection type
		const connection = (navigator as any).connection;
		if (connection) {
			setConnectionType(connection.effectiveType || "unknown");

			const handleConnectionChange = () => {
				setConnectionType(connection.effectiveType || "unknown");
			};

			connection.addEventListener("change", handleConnectionChange);
			return () => {
				connection.removeEventListener("change", handleConnectionChange);
			};
		}
	}, []);

	return {
		isLowEndDevice,
		connectionType,
		shouldReduceAnimations:
			isLowEndDevice || connectionType === "slow-2g" || connectionType === "2g",
		shouldLazyLoad:
			isLowEndDevice || connectionType === "slow-2g" || connectionType === "2g",
	};
}

// Safe area hook for devices with notches
export function useSafeArea() {
	const [safeArea, setSafeArea] = useState({
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
	});

	useEffect(() => {
		if (typeof window === "undefined") return;

		const updateSafeArea = () => {
			const computedStyle = getComputedStyle(document.documentElement);

			setSafeArea({
				top: parseInt(
					computedStyle.getPropertyValue("env(safe-area-inset-top)") || "0",
					10,
				),
				right: parseInt(
					computedStyle.getPropertyValue("env(safe-area-inset-right)") || "0",
					10,
				),
				bottom: parseInt(
					computedStyle.getPropertyValue("env(safe-area-inset-bottom)") || "0",
					10,
				),
				left: parseInt(
					computedStyle.getPropertyValue("env(safe-area-inset-left)") || "0",
					10,
				),
			});
		};

		updateSafeArea();
		window.addEventListener("resize", updateSafeArea);
		window.addEventListener("orientationchange", updateSafeArea);

		return () => {
			window.removeEventListener("resize", updateSafeArea);
			window.removeEventListener("orientationchange", updateSafeArea);
		};
	}, []);

	return safeArea;
}

// Mobile form optimization hook
export function useMobileFormOptimization() {
	const { isMobile, isKeyboardOpen } = useResponsive({ trackKeyboard: true });
	const [formState, setFormState] = useState<{
		isOptimized: boolean;
		shouldAutoFocus: boolean;
		inputMode: "text" | "numeric" | "email" | "tel" | "url";
	}>({
		isOptimized: false,
		shouldAutoFocus: false,
		inputMode: "text",
	});

	useEffect(() => {
		if (isMobile) {
			setFormState((prev) => ({
				...prev,
				isOptimized: true,
				shouldAutoFocus: !isKeyboardOpen, // Don't auto-focus if keyboard is already open
			}));
		}
	}, [isMobile, isKeyboardOpen]);

	const optimizeInput = useCallback((inputType: string) => {
		let inputMode: "text" | "numeric" | "email" | "tel" | "url" = "text";

		switch (inputType) {
			case "number":
			case "price":
				inputMode = "numeric";
				break;
			case "email":
				inputMode = "email";
				break;
			case "phone":
			case "tel":
				inputMode = "tel";
				break;
			case "url":
				inputMode = "url";
				break;
			default:
				inputMode = "text";
		}

		setFormState((prev) => ({ ...prev, inputMode }));
		return inputMode;
	}, []);

	const getInputProps = useCallback(
		(inputType: string = "text") => {
			let inputMode: "text" | "numeric" | "email" | "tel" | "url" = "text";

			switch (inputType) {
				case "number":
				case "price":
					inputMode = "numeric";
					break;
				case "email":
					inputMode = "email";
					break;
				case "phone":
				case "tel":
					inputMode = "tel";
					break;
				case "url":
					inputMode = "url";
					break;
				default:
					inputMode = "text";
			}

			return {
				inputMode,
				autoComplete: "off",
				autoCapitalize: inputType === "email" ? "none" : "sentences",
				autoCorrect: inputType === "email" ? "off" : "on",
				spellCheck: !(inputType === "email" || inputType === "number"),
				className: isMobile ? "text-base px-4 py-3" : "text-sm px-3 py-2",
			};
		},
		[isMobile],
	);

	const getTextareaProps = useCallback(() => {
		return {
			autoComplete: "off",
			autoCapitalize: "sentences",
			autoCorrect: "on",
			spellCheck: true,
			className: isMobile
				? "text-base px-4 py-3 min-h-[120px]"
				: "text-sm px-3 py-2 min-h-[100px]",
		};
	}, [isMobile]);

	return {
		...formState,
		optimizeInput,
		getInputProps,
		getTextareaProps,
		isMobile,
		isKeyboardOpen,
	};
}
