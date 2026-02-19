"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMinutesToHM } from "@/lib/utils";
import { PROGRAM_WEEKS } from "@/lib/constants";
import { getMission } from "@/lib/missions";
import { useAuth } from "@/hooks/useAuth";
import { getDiaryEntries, dbToDiary } from "@/lib/supabase/db";
import { PageSkeleton } from "@/components/ui/Skeleton";

interface DiaryEntry {
  date: string;
  totalSleepTime: number;
  sleepEfficiency: number;
  sleepQuality: number;
  morningMood: string;
}

const MOOD_EMOJI: Record<string, string> = {
  terrible: "😫",
  bad: "😕",
  neutral: "😐",
  good: "🙂",
  great: "😊",
};

export default function HomePage() {
  const { user } = useAuth();
  const [lastEntry, setLastEntry] = useState<DiaryEntry | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [missionDone, setMissionDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // 프로필에서 currentWeek 로드
      try {
        const savedProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
        if (savedProfile.currentWeek) setCurrentWeek(savedProfile.currentWeek);
      } catch { /* ignore */ }

      let data: Record<string, unknown>[] = [];

      if (user) {
        const { data: dbData } = await getDiaryEntries(user.id);
        if (dbData) {
          data = dbData.map((row: Record<string, unknown>) => dbToDiary(row));
          localStorage.setItem("sleepDiary", JSON.stringify(data));
        }
      } else {
        try {
          data = JSON.parse(localStorage.getItem("sleepDiary") || "[]");
        } catch {
          data = [];
        }
      }

      if (data.length > 0) {
        setLastEntry(data[data.length - 1] as unknown as DiaryEntry);
      }
      const dayNum = Math.min((data.length % 7) + 1, 7);
      setCurrentDay(dayNum);
      const missionLog = JSON.parse(localStorage.getItem("missionLog") || "{}");
      const todayMission = getMission(currentWeek, dayNum);
      if (todayMission) {
        setMissionDone(!!missionLog[todayMission.id]);
      }
      setLoading(false);
    }
    loadData();
  }, [currentWeek, user]);

  const weekInfo = PROGRAM_WEEKS[currentWeek - 1];
  const todayMission = getMission(currentWeek, currentDay);

  if (loading) return <PageSkeleton cards={4} />;

  return (
    <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-20 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Sleep<span className="text-[var(--color-primary-light)]">Well</span>
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          {currentWeek}주차 · {weekInfo.theme}
        </p>
      </div>

      {/* 어젯밤 수면 요약 */}
      <section className="mb-6 animate-slide-up">
        <h2 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
          어젯밤 수면
        </h2>
        {lastEntry ? (
          <div className="bg-[var(--color-surface)] rounded-2xl p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-[var(--color-muted)] mb-1">수면시간</p>
                <p className="text-xl font-bold text-[var(--color-primary-light)]">
                  {formatMinutesToHM(lastEntry.totalSleepTime)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted)] mb-1">수면효율</p>
                <p
                  className={`text-xl font-bold ${
                    lastEntry.sleepEfficiency >= 85
                      ? "text-[var(--color-success)]"
                      : lastEntry.sleepEfficiency >= 70
                        ? "text-[var(--color-warning)]"
                        : "text-red-400"
                  }`}
                >
                  {lastEntry.sleepEfficiency}%
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted)] mb-1">기분</p>
                <p className="text-xl">
                  {MOOD_EMOJI[lastEntry.morningMood] || "—"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Link
            href="/diary"
            className="block bg-[var(--color-surface)] rounded-2xl p-5 text-center hover:bg-[var(--color-surface-light)] transition-colors"
          >
            <p className="text-3xl mb-2">📝</p>
            <p className="text-sm text-[var(--color-muted)]">
              아직 기록이 없어요
            </p>
            <p className="text-sm text-[var(--color-primary-light)] mt-1 font-medium">
              첫 수면 기록하기
            </p>
          </Link>
        )}
      </section>

      {/* 오늘의 미션 */}
      <section className="mb-6 animate-slide-up delay-75">
        <h2 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
          오늘의 미션
        </h2>
        <Link
          href="/mission"
          className="block bg-[var(--color-surface)] rounded-2xl p-5 hover:bg-[var(--color-surface-light)] transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">{missionDone ? "✅" : "🎯"}</span>
            <div className="flex-1">
              <p className={`font-medium ${missionDone ? "line-through opacity-60" : ""}`}>
                {todayMission?.title || "미션 준비 중"}
              </p>
              <p className="text-sm text-[var(--color-muted)] mt-1">
                {currentWeek}주차 Day {currentDay} · {weekInfo.theme}
              </p>
            </div>
            <span className="text-[var(--color-muted)]">→</span>
          </div>
        </Link>
      </section>

      {/* 퀵 액션 */}
      <section className="mb-6 animate-slide-up delay-150">
        <h2 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
          바로가기
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/diary"
            className="bg-[var(--color-surface)] rounded-2xl p-4 hover:bg-[var(--color-surface-light)] transition-all active:scale-[0.97]"
          >
            <span className="text-2xl">📝</span>
            <p className="text-sm font-medium mt-2">수면 기록</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">아침 기록하기</p>
          </Link>
          <Link
            href="/coach"
            className="bg-[var(--color-surface)] rounded-2xl p-4 hover:bg-[var(--color-surface-light)] transition-all active:scale-[0.97]"
          >
            <span className="text-2xl">🤖</span>
            <p className="text-sm font-medium mt-2">AI 코치</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">수면 상담</p>
          </Link>
          <Link
            href="/relax"
            className="bg-[var(--color-surface)] rounded-2xl p-4 hover:bg-[var(--color-surface-light)] transition-all active:scale-[0.97]"
          >
            <span className="text-2xl">🧘</span>
            <p className="text-sm font-medium mt-2">이완 도구</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">호흡법 · 명상</p>
          </Link>
          <Link
            href="/session"
            className="bg-[var(--color-surface)] rounded-2xl p-4 hover:bg-[var(--color-surface-light)] transition-all active:scale-[0.97]"
          >
            <span className="text-2xl">📖</span>
            <p className="text-sm font-medium mt-2">{weekInfo.week}주차 세션</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              {weekInfo.title}
            </p>
          </Link>
          <Link
            href="/report"
            className="bg-[var(--color-surface)] rounded-2xl p-4 hover:bg-[var(--color-surface-light)] transition-all active:scale-[0.97]"
          >
            <span className="text-2xl">📊</span>
            <p className="text-sm font-medium mt-2">나의 리포트</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">수면 트렌드</p>
          </Link>
        </div>
      </section>

      {/* 프로그램 진행도 */}
      <section className="animate-slide-up delay-200">
        <h2 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
          프로그램 진행
        </h2>
        <div className="bg-[var(--color-surface)] rounded-2xl p-4">
          <div className="flex gap-2">
            {PROGRAM_WEEKS.map((week) => (
              <div key={week.week} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    week.week < currentWeek
                      ? "bg-[var(--color-success)] text-white"
                      : week.week === currentWeek
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-surface-light)] text-[var(--color-muted)]"
                  }`}
                >
                  {week.week < currentWeek ? "✓" : week.week}
                </div>
                <span className="text-[10px] text-[var(--color-muted)] text-center leading-tight">
                  {week.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
