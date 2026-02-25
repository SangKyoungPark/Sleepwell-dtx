"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { NotificationSettings, ReminderType, ReminderConfig } from "@/types";
import {
	DEFAULT_REMINDERS,
	NOTIFICATION_STORAGE_KEY,
	NOTIFICATION_LAST_FIRED_KEY,
} from "@/lib/constants";

// --- 브라우저 지원 여부 ---
function isNotificationSupported(): boolean {
	return typeof window !== "undefined" && "Notification" in window;
}

// --- localStorage 헬퍼 ---
function loadSettings(): NotificationSettings {
	try {
		const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
		if (raw) return JSON.parse(raw);
	} catch { /* 손상 시 기본값 */ }
	return {
		globalEnabled: false,
		permissionStatus: isNotificationSupported() ? Notification.permission : "default",
		reminders: DEFAULT_REMINDERS.map((r) => ({ ...r })),
	};
}

function saveSettings(settings: NotificationSettings) {
	localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(settings));
}

function loadLastFired(): Record<string, string> {
	try {
		const raw = localStorage.getItem(NOTIFICATION_LAST_FIRED_KEY);
		if (raw) return JSON.parse(raw);
	} catch { /* ignore */ }
	return {};
}

function saveLastFired(map: Record<string, string>) {
	localStorage.setItem(NOTIFICATION_LAST_FIRED_KEY, JSON.stringify(map));
}

// --- 현재 HH:mm ---
function getCurrentHHMM(): string {
	const now = new Date();
	return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

// --- 오늘 날짜 키 ---
function getTodayKey(): string {
	return new Date().toISOString().split("T")[0];
}

// --- 알림 발송 ---
function fireNotification(title: string, body: string, url: string = "/home") {
	try {
		if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
			navigator.serviceWorker.controller.postMessage({
				type: "SHOW_NOTIFICATION",
				title,
				options: {
					body,
					icon: "/icons/icon.svg",
					badge: "/icons/icon.svg",
					data: { url },
					tag: `sleepwell-${Date.now()}`,
				},
			});
		} else {
			new Notification(title, {
				body,
				icon: "/icons/icon.svg",
			});
		}
	} catch (err) {
		console.error("알림 발송 오류:", err);
	}
}

// --- URL 매핑 ---
function getReminderUrl(type: ReminderType): string {
	switch (type) {
		case "bedtime": return "/relax";
		case "morningDiary": return "/diary";
		case "eveningDiary": return "/diary";
		default: return "/home";
	}
}

// --- Hook ---
export interface UseNotificationReturn {
	supported: boolean;
	settings: NotificationSettings;
	bedtimePromptVisible: boolean;
	dismissBedtimePrompt: () => void;
	requestPermission: () => Promise<NotificationPermission>;
	toggleGlobal: (enabled: boolean) => Promise<void>;
	toggleReminder: (type: ReminderType, enabled: boolean) => void;
	updateReminderTime: (type: ReminderType, time: string) => void;
}

export function useNotification(): UseNotificationReturn {
	const supported = isNotificationSupported();
	const [settings, setSettings] = useState<NotificationSettings>(loadSettings);
	const [bedtimePromptVisible, setBedtimePromptVisible] = useState(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// 설정 변경 시 저장
	useEffect(() => {
		saveSettings(settings);
	}, [settings]);

	// --- 스케줄러: 30초 주기 체크 ---
	useEffect(() => {
		if (!supported || !settings.globalEnabled || settings.permissionStatus !== "granted") {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			return;
		}

		function checkReminders() {
			const currentTime = getCurrentHHMM();
			const todayKey = getTodayKey();
			const lastFired = loadLastFired();

			for (const reminder of settings.reminders) {
				if (!reminder.enabled) continue;
				if (reminder.time !== currentTime) continue;

				const firedKey = `${reminder.type}-${todayKey}`;
				if (lastFired[firedKey]) continue;

				// 발송
				fireNotification("SleepWell", reminder.message, getReminderUrl(reminder.type));

				// 취침 리마인더일 때 인앱 프롬프트 표시
				if (reminder.type === "bedtime") {
					setBedtimePromptVisible(true);
				}

				// 중복 방지 기록
				lastFired[firedKey] = new Date().toISOString();
				saveLastFired(lastFired);
			}
		}

		// 즉시 1회 + 30초 주기
		checkReminders();
		intervalRef.current = setInterval(checkReminders, 30_000);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [supported, settings]);

	// --- 권한 요청 ---
	const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
		if (!supported) return "denied";
		try {
			const result = await Notification.requestPermission();
			setSettings((prev) => ({ ...prev, permissionStatus: result }));
			return result;
		} catch {
			return "denied";
		}
	}, [supported]);

	// --- 전역 토글 ---
	const toggleGlobal = useCallback(async (enabled: boolean) => {
		if (enabled) {
			const perm = await requestPermission();
			setSettings((prev) => ({
				...prev,
				globalEnabled: perm === "granted",
				permissionStatus: perm,
			}));
		} else {
			setSettings((prev) => ({ ...prev, globalEnabled: false }));
		}
	}, [requestPermission]);

	// --- 취침 프롬프트 닫기 ---
	const dismissBedtimePrompt = useCallback(() => {
		setBedtimePromptVisible(false);
	}, []);

	// --- 개별 리마인더 토글 ---
	const toggleReminder = useCallback((type: ReminderType, enabled: boolean) => {
		setSettings((prev) => ({
			...prev,
			reminders: prev.reminders.map((r) =>
				r.type === type ? { ...r, enabled } : r
			),
		}));
	}, []);

	// --- 시간 변경 ---
	const updateReminderTime = useCallback((type: ReminderType, time: string) => {
		setSettings((prev) => ({
			...prev,
			reminders: prev.reminders.map((r) =>
				r.type === type ? { ...r, time } : r
			),
		}));
	}, []);

	return {
		supported,
		settings,
		bedtimePromptVisible,
		dismissBedtimePrompt,
		requestPermission,
		toggleGlobal,
		toggleReminder,
		updateReminderTime,
	};
}
