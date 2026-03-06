"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import {
  BADGES,
  checkAchievements,
  calculateStreak,
  calculateEfficiencyStreak,
  type UnlockedBadge,
} from "@/lib/badges";
import { getDiaryEntries, getMissionLogs, getSessionProgress, dbToDiary } from "@/lib/supabase/db";

const STORAGE_KEY = "unlockedBadges";
const RELAX_COUNT_KEY = "relaxUsageCount";
const COACH_COUNT_KEY = "coachChatCount";

interface AchievementState {
  unlockedBadges: UnlockedBadge[];
  newBadges: string[]; // 방금 새로 획득한 배지 ID
  totalBadges: number;
  loading: boolean;
}

export function useAchievements() {
  const { user } = useAuth();
  const [state, setState] = useState<AchievementState>({
    unlockedBadges: [],
    newBadges: [],
    totalBadges: BADGES.length,
    loading: true,
  });
  const checkedRef = useRef(false);

  // 업적 로드 및 체크
  const refreshAchievements = useCallback(async () => {
    // 기존 달성 배지 로드
    let existing: UnlockedBadge[] = [];
    try {
      existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      existing = [];
    }

    const existingIds = existing.map((b) => b.badgeId);

    // 통계 수집
    let diaryDates: string[] = [];
    let diaryEntries: { date: string; sleepEfficiency: number }[] = [];
    let completedMissions = 0;
    let completedWeeks = 0;

    if (user) {
      // Supabase에서 로드
      const { data: diaryData } = await getDiaryEntries(user.id);
      if (diaryData) {
        const entries = diaryData.map((row: Record<string, unknown>) => dbToDiary(row));
        diaryDates = entries.map((e) => String(e.date));
        diaryEntries = entries.map((e) => ({
          date: String(e.date),
          sleepEfficiency: Number(e.sleepEfficiency) || 0,
        }));
      }

      const { data: missionData } = await getMissionLogs(user.id);
      if (missionData) {
        completedMissions = Object.values(missionData).filter(Boolean).length;
      }

      const { data: sessionData } = await getSessionProgress(user.id);
      if (sessionData?.completed_sections) {
        const sections = sessionData.completed_sections as Record<string, boolean>;
        completedWeeks = Object.keys(sections).filter((k) => sections[k]).length;
      }
    } else {
      // localStorage 폴백
      try {
        const diary = JSON.parse(localStorage.getItem("sleepDiary") || "[]");
        diaryDates = diary.map((e: Record<string, unknown>) => String(e.date));
        diaryEntries = diary.map((e: Record<string, unknown>) => ({
          date: String(e.date),
          sleepEfficiency: Number(e.sleepEfficiency) || 0,
        }));
      } catch { /* ignore */ }

      try {
        const missions = JSON.parse(localStorage.getItem("missionLog") || "{}");
        completedMissions = Object.values(missions).filter(Boolean).length;
      } catch { /* ignore */ }

      try {
        const session = JSON.parse(localStorage.getItem("sessionProgress") || "{}");
        if (session.completedSections) {
          completedWeeks = Object.values(session.completedSections).filter(Boolean).length;
        }
      } catch { /* ignore */ }
    }

    const relaxCount = Number(localStorage.getItem(RELAX_COUNT_KEY) || "0");
    const coachChats = Number(localStorage.getItem(COACH_COUNT_KEY) || "0");

    const stats = {
      diaryStreak: calculateStreak(diaryDates),
      totalDiaryDays: diaryDates.length,
      completedMissions,
      efficiencyStreak85: calculateEfficiencyStreak(diaryEntries),
      maxEfficiency: diaryEntries.reduce((max, e) => Math.max(max, e.sleepEfficiency), 0),
      completedWeeks,
      relaxCount,
      coachChats,
    };

    const newBadgeIds = checkAchievements(existingIds, stats);

    // 새 배지 저장
    if (newBadgeIds.length > 0) {
      const now = new Date().toISOString();
      const newBadges = newBadgeIds.map((id) => ({ badgeId: id, unlockedAt: now }));
      const all = [...existing, ...newBadges];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

      setState({
        unlockedBadges: all,
        newBadges: newBadgeIds,
        totalBadges: BADGES.length,
        loading: false,
      });
    } else {
      setState({
        unlockedBadges: existing,
        newBadges: [],
        totalBadges: BADGES.length,
        loading: false,
      });
    }
  }, [user]);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    refreshAchievements();
  }, [refreshAchievements]);

  // 새 배지 알림 확인 후 클리어
  const clearNewBadges = useCallback(() => {
    setState((prev) => ({ ...prev, newBadges: [] }));
  }, []);

  return {
    ...state,
    refreshAchievements,
    clearNewBadges,
  };
}

/** 이완 도구 사용 횟수 증가 */
export function incrementRelaxCount() {
  const current = Number(localStorage.getItem(RELAX_COUNT_KEY) || "0");
  localStorage.setItem(RELAX_COUNT_KEY, String(current + 1));
}

/** 코치 채팅 횟수 증가 */
export function incrementCoachCount() {
  const current = Number(localStorage.getItem(COACH_COUNT_KEY) || "0");
  localStorage.setItem(COACH_COUNT_KEY, String(current + 1));
}
