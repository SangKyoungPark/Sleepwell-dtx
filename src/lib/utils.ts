import type { InsomniaSeverity } from "@/types";

/**
 * ISI 총점으로 불면증 심각도 분류
 */
export function getInsomniaSeverity(totalScore: number): InsomniaSeverity {
  if (totalScore <= 7) return "none";
  if (totalScore <= 14) return "mild";
  if (totalScore <= 21) return "moderate";
  return "severe";
}

/**
 * 취침/기상 시각으로 총 침대 시간(분) 계산
 * 자정 넘김 처리 포함
 */
export function calculateTimeInBed(bedtime: string, wakeTime: string): number {
  const bParts = bedtime?.split(":").map(Number);
  const wParts = wakeTime?.split(":").map(Number);

  if (!bParts || bParts.length < 2 || !wParts || wParts.length < 2) return 0;

  const [bH, bM] = bParts;
  const [wH, wM] = wParts;

  if (isNaN(bH) || isNaN(bM) || isNaN(wH) || isNaN(wM)) return 0;

  let bedMinutes = bH * 60 + bM;
  let wakeMinutes = wH * 60 + wM;

  // 자정 넘김: 예) 23:30 → 07:00
  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 24 * 60;
  }

  return wakeMinutes - bedMinutes;
}

/**
 * 총 수면시간(분) 계산
 * TST = 침대시간 - 입면잠복기 - WASO
 */
export function calculateTotalSleepTime(
  bedtime: string,
  wakeTime: string,
  sleepOnsetLatency: number,
  waso: number,
): number {
  const timeInBed = calculateTimeInBed(bedtime, wakeTime);
  const tst = timeInBed - sleepOnsetLatency - waso;
  return Math.max(0, tst);
}

/**
 * 수면효율(%) 계산
 * SE = (TST / 침대시간) × 100
 */
export function calculateSleepEfficiency(
  totalSleepTime: number,
  bedtime: string,
  wakeTime: string,
): number {
  const timeInBed = calculateTimeInBed(bedtime, wakeTime);
  if (timeInBed === 0) return 0;
  return Math.round((totalSleepTime / timeInBed) * 100);
}

/**
 * 분을 "Xh Ym" 형식으로 변환
 */
export function formatMinutesToHM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * CSS 클래스 병합 유틸리티
 */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
