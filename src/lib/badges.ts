// ============================================
// SleepWell DTx - 업적/배지 시스템
// ============================================

export type BadgeCategory = "streak" | "mission" | "efficiency" | "program" | "relax" | "coach";
export type BadgeRarity = "bronze" | "silver" | "gold" | "platinum";

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  /** 달성 조건 체크 함수에서 사용하는 임계값 */
  threshold: number;
}

export interface UnlockedBadge {
  badgeId: string;
  unlockedAt: string; // ISO date
}

/** 배지 카테고리 설정 */
export const BADGE_CATEGORY_CONFIG: Record<BadgeCategory, { label: string; icon: string; color: string; bg: string }> = {
  streak: { label: "연속 기록", icon: "🔥", color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  mission: { label: "미션 달성", icon: "🎯", color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  efficiency: { label: "수면 효율", icon: "💤", color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  program: { label: "프로그램", icon: "📚", color: "#818cf8", bg: "rgba(99,102,241,0.12)" },
  relax: { label: "이완 활동", icon: "🧘", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  coach: { label: "AI 코치", icon: "🤖", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
};

/** 배지 등급 설정 */
export const BADGE_RARITY_CONFIG: Record<BadgeRarity, { label: string; color: string; border: string; glow: string }> = {
  bronze: { label: "브론즈", color: "#cd7f32", border: "rgba(205,127,50,0.4)", glow: "rgba(205,127,50,0.2)" },
  silver: { label: "실버", color: "#c0c0c0", border: "rgba(192,192,192,0.4)", glow: "rgba(192,192,192,0.2)" },
  gold: { label: "골드", color: "#ffd700", border: "rgba(255,215,0,0.4)", glow: "rgba(255,215,0,0.2)" },
  platinum: { label: "플래티넘", color: "#e5e4e2", border: "rgba(229,228,226,0.5)", glow: "rgba(229,228,226,0.3)" },
};

/** 전체 배지 목록 */
export const BADGES: BadgeDefinition[] = [
  // ── 연속 기록 (Streak) ──
  { id: "streak_3", name: "첫 걸음", description: "3일 연속 수면 기록", icon: "🌱", category: "streak", rarity: "bronze", threshold: 3 },
  { id: "streak_7", name: "일주일 도전", description: "7일 연속 수면 기록", icon: "🌿", category: "streak", rarity: "silver", threshold: 7 },
  { id: "streak_14", name: "2주 마라톤", description: "14일 연속 수면 기록", icon: "🌳", category: "streak", rarity: "gold", threshold: 14 },
  { id: "streak_30", name: "한 달의 습관", description: "30일 연속 수면 기록", icon: "🏆", category: "streak", rarity: "platinum", threshold: 30 },

  // ── 미션 달성 ──
  { id: "mission_1", name: "미션 시작", description: "첫 미션 완료", icon: "⭐", category: "mission", rarity: "bronze", threshold: 1 },
  { id: "mission_10", name: "미션 수행자", description: "10개 미션 완료", icon: "🌟", category: "mission", rarity: "silver", threshold: 10 },
  { id: "mission_30", name: "미션 마스터", description: "30개 미션 완료", icon: "💫", category: "mission", rarity: "gold", threshold: 30 },
  { id: "mission_all", name: "올 클리어", description: "모든 미션 완료 (42개)", icon: "👑", category: "mission", rarity: "platinum", threshold: 42 },

  // ── 수면 효율 ──
  { id: "eff_85", name: "효율 달성", description: "수면 효율 85% 이상 달성", icon: "📈", category: "efficiency", rarity: "bronze", threshold: 1 },
  { id: "eff_85_3", name: "안정적인 수면", description: "3일 연속 수면 효율 85%+", icon: "📊", category: "efficiency", rarity: "silver", threshold: 3 },
  { id: "eff_85_7", name: "수면 우등생", description: "7일 연속 수면 효율 85%+", icon: "🥇", category: "efficiency", rarity: "gold", threshold: 7 },
  { id: "eff_90", name: "완벽한 밤", description: "수면 효율 90% 이상 달성", icon: "✨", category: "efficiency", rarity: "gold", threshold: 90 },

  // ── 프로그램 진행 ──
  { id: "prog_w1", name: "여정의 시작", description: "1주차 세션 완료", icon: "📖", category: "program", rarity: "bronze", threshold: 1 },
  { id: "prog_w3", name: "중간 지점", description: "3주차 세션 완료", icon: "📗", category: "program", rarity: "silver", threshold: 3 },
  { id: "prog_w6", name: "졸업", description: "6주차 프로그램 전체 완료", icon: "🎓", category: "program", rarity: "platinum", threshold: 6 },

  // ── 이완 활동 ──
  { id: "relax_1", name: "첫 이완", description: "이완 도구 첫 사용", icon: "🍃", category: "relax", rarity: "bronze", threshold: 1 },
  { id: "relax_10", name: "이완 습관", description: "이완 도구 10회 사용", icon: "🌊", category: "relax", rarity: "silver", threshold: 10 },
  { id: "relax_30", name: "마음의 평화", description: "이완 도구 30회 사용", icon: "🕊️", category: "relax", rarity: "gold", threshold: 30 },

  // ── AI 코치 ──
  { id: "coach_1", name: "첫 상담", description: "AI 코치와 첫 대화", icon: "💬", category: "coach", rarity: "bronze", threshold: 1 },
  { id: "coach_10", name: "대화의 힘", description: "AI 코치와 10회 대화", icon: "🗣️", category: "coach", rarity: "silver", threshold: 10 },
];

/** 배지 ID로 정의 조회 */
export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGES.find((b) => b.id === id);
}

/** 카테고리별 배지 조회 */
export function getBadgesByCategory(category: BadgeCategory): BadgeDefinition[] {
  return BADGES.filter((b) => b.category === category);
}

/**
 * 업적 달성 여부를 체크하고 새로 달성한 배지 목록을 반환
 */
export function checkAchievements(
  currentBadges: string[],
  stats: {
    diaryStreak: number;
    totalDiaryDays: number;
    completedMissions: number;
    efficiencyStreak85: number;
    maxEfficiency: number;
    completedWeeks: number;
    relaxCount: number;
    coachChats: number;
  },
): string[] {
  const newBadges: string[] = [];

  for (const badge of BADGES) {
    if (currentBadges.includes(badge.id)) continue;

    let earned = false;

    switch (badge.id) {
      // 연속 기록
      case "streak_3": earned = stats.diaryStreak >= 3; break;
      case "streak_7": earned = stats.diaryStreak >= 7; break;
      case "streak_14": earned = stats.diaryStreak >= 14; break;
      case "streak_30": earned = stats.diaryStreak >= 30; break;

      // 미션
      case "mission_1": earned = stats.completedMissions >= 1; break;
      case "mission_10": earned = stats.completedMissions >= 10; break;
      case "mission_30": earned = stats.completedMissions >= 30; break;
      case "mission_all": earned = stats.completedMissions >= 42; break;

      // 수면 효율
      case "eff_85": earned = stats.maxEfficiency >= 85; break;
      case "eff_85_3": earned = stats.efficiencyStreak85 >= 3; break;
      case "eff_85_7": earned = stats.efficiencyStreak85 >= 7; break;
      case "eff_90": earned = stats.maxEfficiency >= 90; break;

      // 프로그램
      case "prog_w1": earned = stats.completedWeeks >= 1; break;
      case "prog_w3": earned = stats.completedWeeks >= 3; break;
      case "prog_w6": earned = stats.completedWeeks >= 6; break;

      // 이완
      case "relax_1": earned = stats.relaxCount >= 1; break;
      case "relax_10": earned = stats.relaxCount >= 10; break;
      case "relax_30": earned = stats.relaxCount >= 30; break;

      // 코치
      case "coach_1": earned = stats.coachChats >= 1; break;
      case "coach_10": earned = stats.coachChats >= 10; break;
    }

    if (earned) newBadges.push(badge.id);
  }

  return newBadges;
}

/**
 * 수면 일지 날짜 배열에서 연속 기록일(streak)을 계산
 */
export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sorted = [...dates].sort().reverse();
  const today = new Date().toISOString().split("T")[0];

  // 오늘 또는 어제부터 시작
  let checkDate = today;
  if (sorted[0] !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    checkDate = yesterday.toISOString().split("T")[0];
    if (sorted[0] !== checkDate) return 0;
  }

  let streak = 0;
  const dateSet = new Set(sorted);

  const current = new Date(checkDate);
  while (dateSet.has(current.toISOString().split("T")[0])) {
    streak++;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

/**
 * 수면 효율 85% 이상 연속일 계산
 */
export function calculateEfficiencyStreak(
  entries: { date: string; sleepEfficiency: number }[],
): number {
  if (entries.length === 0) return 0;

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;

  for (const entry of sorted) {
    if (entry.sleepEfficiency >= 85) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
