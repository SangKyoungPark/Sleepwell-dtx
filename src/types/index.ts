// ============================================
// SleepWell DTx - Core Data Types
// ============================================

// --- User ---
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  programWeek: number; // 현재 몇 주차
}

// --- ISI Assessment (불면증 심각도 자가진단) ---
export type InsomniaSeverity = "none" | "mild" | "moderate" | "severe";

export interface Assessment {
  id: string;
  userId: string;
  date: Date;
  scores: number[]; // 7문항, 각 0~4
  totalScore: number; // 0~28
  severity: InsomniaSeverity;
}

// ISI 점수 기준:
// 0~7: none (정상)
// 8~14: mild (경미)
// 15~21: moderate (중등도)
// 22~28: severe (중증)

// --- Sleep Diary (수면 일지) ---
export type MorningMood = "terrible" | "bad" | "neutral" | "good" | "great";

export interface SleepDiary {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD

  // 아침 기록
  bedtime: string; // HH:mm (취침 시각)
  wakeTime: string; // HH:mm (기상 시각)
  sleepOnsetLatency: number; // 입면 잠복기 (분)
  awakenings: number; // 밤중 깬 횟수
  waso: number; // 중간 깨어있던 시간 (분)
  sleepQuality: number; // 1~5
  morningMood: MorningMood;

  // 자동 계산
  totalSleepTime: number; // 총 수면시간 (분)
  sleepEfficiency: number; // 수면효율 (%)

  // 저녁 기록
  stressLevel: number; // 1~10
  caffeine: boolean;
  caffeineLastTime?: string; // HH:mm
  exercise: boolean;
  exerciseType?: string;
  nap: boolean;
  napDuration?: number; // 분
  worryNote?: string;
  missionCompleted: boolean;
}

// --- Mission (오늘의 미션) ---
export type MissionCategory =
  | "hygiene"
  | "cognitive"
  | "relaxation"
  | "restriction";

export type MissionDifficulty = "easy" | "medium" | "hard";

export interface Mission {
  id: string;
  week: number;
  day: number;
  title: string;
  description: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
}

export interface MissionLog {
  id: string;
  userId: string;
  missionId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  note?: string;
}

// --- CBT-I Session (주간 세션) ---
export type PracticeType =
  | "sleep_diary"
  | "checklist"
  | "audio_guide"
  | "thought_record"
  | "schedule"
  | "reassessment";

export interface Session {
  id: string;
  week: number;
  title: string;
  educationContent: string; // markdown
  practiceType: PracticeType;
  practiceContent: string;
}

export interface SessionProgress {
  id: string;
  userId: string;
  sessionId: string;
  completedAt: Date;
  reflection?: string;
}

// --- Chat Message (AI 코치 채팅) ---
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  status?: "sending" | "done" | "error";
}

// --- Report (리포트 관련) ---
export interface WeeklyReport {
  weekStart: string; // YYYY-MM-DD
  avgSleepTime: number; // 분
  avgSleepEfficiency: number; // %
  avgSleepQuality: number; // 1~5
  avgStressLevel: number; // 1~10
  missionCompletionRate: number; // %
  sleepTimeChange: number; // 전주 대비 변화 (분)
  efficiencyChange: number; // 전주 대비 변화 (%)
}

export interface CorrelationData {
  stressLevel: number;
  sleepQuality: number;
  date: string;
}
