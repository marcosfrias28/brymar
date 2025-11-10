import { useCallback, useRef, useState } from "react";
import type React from "react";

export const useDragAndDrop = (
	onFilesDrop: (files: FileList | File[]) => void,
	_isMobileDevice: boolean
) => {
	const [dragActive, setDragActive] = useState(false);
	const dragCounter = useRef(0);

	const handleDrag = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDragIn = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current += 1;
		if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
			setDragActive(true);
		}
	}, []);

	const handleDragOut = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current -= 1;
		if (dragCounter.current === 0) {
			setDragActive(false);
		}
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setDragActive(false);
			dragCounter.current = 0;

			if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
				onFilesDrop(e.dataTransfer.files);
			}
		},
		[onFilesDrop]
	);

	return {
		dragActive,
		handleDrag,
		handleDragIn,
		handleDragOut,
		handleDrop,
	};
};
