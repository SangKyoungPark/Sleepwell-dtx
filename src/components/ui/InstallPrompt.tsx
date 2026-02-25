"use client";

import { useState, useEffect } from "react";

interface InstallPromptProps {
	canInstall: boolean;
	onInstall: () => Promise<boolean>;
}

const DISMISS_KEY = "sleepwell-install-dismissed";

export function InstallPrompt({ canInstall, onInstall }: InstallPromptProps) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (!canInstall) return;
		const dismissed = localStorage.getItem(DISMISS_KEY);
		if (!dismissed) {
			setVisible(true);
		}
	}, [canInstall]);

	if (!visible) return null;

	function handleDismiss() {
		localStorage.setItem(DISMISS_KEY, Date.now().toString());
		setVisible(false);
	}

	async function handleInstall() {
		const accepted = await onInstall();
		if (accepted) {
			setVisible(false);
		}
	}

	return (
		<div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto animate-slide-up">
			<div className="bg-[var(--color-surface)] rounded-2xl p-4 shadow-lg border border-[var(--color-surface-light)]">
				<div className="flex items-center gap-3">
					<span className="text-2xl">🌙</span>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium">SleepWell 앱 설치</p>
						<p className="text-xs text-[var(--color-muted)] mt-0.5">
							홈 화면에 추가하면 더 빠르게 이용할 수 있어요
						</p>
					</div>
				</div>
				<div className="flex gap-2 mt-3">
					<button
						onClick={handleDismiss}
						className="flex-1 py-2 rounded-xl text-sm text-[var(--color-muted)] bg-[var(--color-surface-light)] cursor-pointer"
					>
						나중에
					</button>
					<button
						onClick={handleInstall}
						className="flex-1 py-2 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white cursor-pointer"
					>
						설치
					</button>
				</div>
			</div>
		</div>
	);
}
