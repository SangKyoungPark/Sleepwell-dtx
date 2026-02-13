// ============================================
// SleepWell DTx - Constants
// ============================================

// ISI (Insomnia Severity Index) 문항
export const ISI_QUESTIONS = [
  "잠들기 어려운 정도",
  "수면 유지의 어려움 (자주 깸)",
  "너무 일찍 깨는 문제",
  "현재 수면 패턴에 대한 만족도",
  "수면 문제가 낮 동안의 기능에 미치는 영향",
  "수면 문제로 인한 삶의 질 저하",
  "수면 문제에 대한 걱정/고통 정도",
] as const;

export const ISI_OPTIONS = [
  { value: 0, label: "없음" },
  { value: 1, label: "약간" },
  { value: 2, label: "보통" },
  { value: 3, label: "심함" },
  { value: 4, label: "매우 심함" },
] as const;

export const ISI_SEVERITY_RANGES = {
  none: { min: 0, max: 7, label: "정상", description: "임상적 불면증 없음" },
  mild: { min: 8, max: 14, label: "경미한 불면증", description: "가벼운 수면 어려움" },
  moderate: { min: 15, max: 21, label: "중등도 불면증", description: "전문가 상담을 권장합니다" },
  severe: { min: 22, max: 28, label: "중증 불면증", description: "반드시 전문가 상담이 필요합니다" },
} as const;

// 수면 일지 기본값
export const SLEEP_DIARY_DEFAULTS = {
  minBedtime: "20:00",
  maxBedtime: "04:00",
  minWakeTime: "04:00",
  maxWakeTime: "14:00",
  maxSleepOnsetLatency: 180, // 분
  maxAwakenings: 10,
  maxWaso: 300, // 분
} as const;

// 기분 이모지 매핑
export const MOOD_EMOJI: Record<string, string> = {
  terrible: "\uD83D\uDE2B",
  bad: "\uD83D\uDE15",
  neutral: "\uD83D\uDE10",
  good: "\uD83D\uDE42",
  great: "\uD83D\uDE0A",
} as const;

// 프로그램 주차 구성
export const PROGRAM_WEEKS = [
  { week: 1, title: "수면의 이해", theme: "관찰 & 인식" },
  { week: 2, title: "수면 위생", theme: "환경 개선" },
  { week: 3, title: "이완 훈련", theme: "긴장 해소" },
  { week: 4, title: "인지 재구성", theme: "생각 바꾸기" },
  { week: 5, title: "수면 제한", theme: "수면효율 높이기" },
  { week: 6, title: "유지 & 재발 방지", theme: "장기 전략" },
] as const;
