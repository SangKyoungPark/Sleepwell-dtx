"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastData {
	id: string;
	type: ToastType;
	message: string;
	duration?: number;
}

const TOAST_STYLE: Record<ToastType, { icon: string; color: string }> = {
	success: { icon: "✓", color: "bg-[var(--color-success)]/15 border-[var(--color-success)]/40 text-[var(--color-success)]" },
	error: { icon: "✕", color: "bg-red-400/15 border-red-400/40 text-red-400" },
	info: { icon: "ℹ", color: "bg-[var(--color-primary)]/15 border-[var(--color-primary)]/40 text-[var(--color-primary-light)]" },
	warning: { icon: "⚠", color: "bg-[var(--color-warning)]/15 border-[var(--color-warning)]/40 text-[var(--color-warning)]" },
};

export function Toast({
	id, type, message, duration = 3000, onClose,
}: ToastData & { onClose: (id: string) => void }) {
	useEffect(() => {
		if (duration > 0) {
			const timer = setTimeout(() => onClose(id), duration);
			return () => clearTimeout(timer);
		}
	}, [id, duration, onClose]);

	const s = TOAST_STYLE[type];
	return (
		<div className={cn(
			"pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm animate-toast-in",
			s.color,
		)}>
			<span className="text-base font-bold shrink-0">{s.icon}</span>
			<span className="text-sm font-medium flex-1">{message}</span>
			<button onClick={() => onClose(id)} className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-sm">✕</button>
		</div>
	);
}

export function ToastContainer({
	toasts, onClose,
}: { toasts: ToastData[]; onClose: (id: string) => void }) {
	if (toasts.length === 0) return null;
	return (
		<div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
			{toasts.map((t) => <Toast key={t.id} {...t} onClose={onClose} />)}
		</div>
	);
}
