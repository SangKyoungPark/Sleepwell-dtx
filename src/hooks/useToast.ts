"use client";

import { useState, useCallback } from "react";
import type { ToastType } from "@/components/ui/Toast";

interface ToastItem {
	id: string;
	type: ToastType;
	message: string;
	duration?: number;
}

let counter = 0;

export function useToast() {
	const [toasts, setToasts] = useState<ToastItem[]>([]);

	const show = useCallback((type: ToastType, message: string, duration?: number) => {
		const id = `t-${++counter}`;
		setToasts((prev) => [...prev.slice(-2), { id, type, message, duration }]);
	}, []);

	const close = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	return {
		toasts,
		close,
		success: useCallback((msg: string) => show("success", msg), [show]),
		error: useCallback((msg: string) => show("error", msg), [show]),
		info: useCallback((msg: string) => show("info", msg), [show]),
		warning: useCallback((msg: string) => show("warning", msg), [show]),
	};
}
