import { useCallback, useRef } from "react";

/**
 * Hook para debounce de funciones
 * @param callback - Función a ejecutar después del delay
 * @param delay - Tiempo de espera en milisegundos
 * @returns Función debounced
 */
export function useDebounce<T extends (...args: any[]) => any>(
	callback: T,
	delay: number,
): T {
	const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const callbackRef = useRef(callback);

	// Update callback ref when callback changes
	callbackRef.current = callback;

	const debouncedCallback = useCallback(
		(...args: Parameters<T>) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			timeoutRef.current = setTimeout(() => {
				callbackRef.current(...args);
			}, delay);
		},
		[delay], // Only depend on delay, not callback
	) as T;

	return debouncedCallback;
}
