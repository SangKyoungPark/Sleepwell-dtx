"use client";

import { useState, useEffect } from "react";

const BANNER_DISMISS_KEY = "sleepwell-notification-banner-dismissed";

interface NotificationBannerProps {
	onEnable: () => Promise<void>;
}

export function NotificationBanner({ onEnable }: NotificationBannerProps) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		// 알림 미지원, 이미 허용, 이미 닫음 → 안 보임
		if (typeof window === "undefined" || !("Notification" in window)) return;
		if (Notification.permission === "granted") return;
		if (Notification.permission === "denied") return;
		if (localStorage.getItem(BANNER_DISMISS_KEY)) return;

		setVisible(true);
	}, []);

	if (!visible) return null;

	function handleDismiss() {
		localStorage.setItem(BANNER_DISMISS_KEY, Date.now().toString());
		setVisible(false);
	}

	async function handleEnable() {
		await onEnable();
		setVisible(false);
	}

	return (
		<div className="bg-[var(--color-surface)] rounded-2xl p-4 animate-slide-up">
			<div className="flex items-start gap-3">
				<span className="text-xl mt-0.5">🔔</span>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium">알림을 켜보세요</p>
					<p className="text-xs text-[var(--color-muted)] mt-0.5">
						취침 시간과 수면일지 리마인더를 받을 수 있어요
					</p>
					<div className="flex gap-2 mt-3">
						<button
							onClick={handleDismiss}
							className="px-3 py-1.5 rounded-lg text-xs text-[var(--color-muted)] bg-[var(--color-surface-light)] cursor-pointer"
						>
							나중에
						</button>
						<button
							onClick={handleEnable}
							className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white cursor-pointer"
						>
							알림 켜기
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
