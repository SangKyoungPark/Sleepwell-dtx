"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface UseServiceWorkerReturn {
	registration: ServiceWorkerRegistration | null;
	updateAvailable: boolean;
	applyUpdate: () => void;
	canInstall: boolean;
	isInstalled: boolean;
	promptInstall: () => Promise<boolean>;
}

export function useServiceWorker(): UseServiceWorkerReturn {
	const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
	const [updateAvailable, setUpdateAvailable] = useState(false);
	const [canInstall, setCanInstall] = useState(false);
	const [isInstalled, setIsInstalled] = useState(false);
	const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

	useEffect(() => {
		if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

		// standalone 모드 감지
		const isStandalone =
			window.matchMedia("(display-mode: standalone)").matches ||
			(navigator as unknown as { standalone?: boolean }).standalone === true;
		setIsInstalled(isStandalone);

		// SW 등록
		navigator.serviceWorker
			.register("/sw.js")
			.then((reg) => {
				setRegistration(reg);

				// 업데이트 감지
				reg.addEventListener("updatefound", () => {
					const newWorker = reg.installing;
					if (!newWorker) return;

					newWorker.addEventListener("statechange", () => {
						if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
							setUpdateAvailable(true);
						}
					});
				});
			})
			.catch((err) => {
				console.error("SW 등록 실패:", err);
			});

		// A2HS 프롬프트 캡처
		function handleBeforeInstall(e: Event) {
			e.preventDefault();
			deferredPromptRef.current = e as BeforeInstallPromptEvent;
			setCanInstall(true);
		}

		window.addEventListener("beforeinstallprompt", handleBeforeInstall);

		return () => {
			window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
		};
	}, []);

	const applyUpdate = useCallback(() => {
		if (registration?.waiting) {
			registration.waiting.postMessage({ type: "SKIP_WAITING" });
			window.location.reload();
		}
	}, [registration]);

	const promptInstall = useCallback(async (): Promise<boolean> => {
		const prompt = deferredPromptRef.current;
		if (!prompt) return false;

		try {
			await prompt.prompt();
			const { outcome } = await prompt.userChoice;
			if (outcome === "accepted") {
				setCanInstall(false);
				setIsInstalled(true);
				deferredPromptRef.current = null;
				return true;
			}
		} catch (err) {
			console.error("설치 프롬프트 오류:", err);
		}
		return false;
	}, []);

	return {
		registration,
		updateAvailable,
		applyUpdate,
		canInstall,
		isInstalled,
		promptInstall,
	};
}
