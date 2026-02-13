"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMinutesToHM } from "@/lib/utils";
import { PROGRAM_WEEKS } from "@/lib/constants";

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
  const [lastEntry, setLastEntry] = useState<DiaryEntry | null>(null);
  const [currentWeek] = useState(1);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("sleepDiary") || "[]");
    if (data.length > 0) {
      setLastEntry(data[data.length - 1]);
    }
  }, []);

  const weekInfo = PROGRAM_WEEKS[currentWeek - 1];

  return (
    <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-20">
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
      <section className="mb-6">
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
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
          오늘의 미션
        </h2>
        <Link
          href="/mission"
          className="block bg-[var(--color-surface)] rounded-2xl p-5 hover:bg-[var(--color-surface-light)] transition-colors"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">🎯</span>
            <div className="flex-1">
              <p className="font-medium">오늘 카페인 마지막 섭취 시각 기록하기</p>
              <p className="text-sm text-[var(--color-muted)] mt-1">
                1주차 · 관찰 & 인식
              </p>
            </div>
            <span className="text-[var(--color-muted)]">→</span>
          </div>
        </Link>
      </section>

      {/* 퀵 액션 */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
          바로가기
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/diary"
            className="bg-[var(--color-surface)] rounded-2xl p-4 hover:bg-[var(--color-surface-light)] transition-colors"
          >
            <span className="text-2xl">📝</span>
            <p className="text-sm font-medium mt-2">수면 기록</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">아침 기록하기</p>
          </Link>
          <Link
            href="/relax"
            className="bg-[var(--color-surface)] rounded-2xl p-4 hover:bg-[var(--color-surface-light)] transition-colors"
          >
            <span className="text-2xl">🧘</span>
            <p className="text-sm font-medium mt-2">이완 도구</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">호흡법 · 명상</p>
          </Link>
          <Link
            href="/session"
            className="bg-[var(--color-surface)] rounded-2xl p-4 hover:bg-[var(--color-surface-light)] transition-colors"
          >
            <span className="text-2xl">📖</span>
            <p className="text-sm font-medium mt-2">{weekInfo.week}주차 세션</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              {weekInfo.title}
            </p>
          </Link>
          <Link
            href="/report"
            className="bg-[var(--color-surface)] rounded-2xl p-4 hover:bg-[var(--color-surface-light)] transition-colors"
          >
            <span className="text-2xl">📊</span>
            <p className="text-sm font-medium mt-2">나의 리포트</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">수면 트렌드</p>
          </Link>
        </div>
      </section>

      {/* 프로그램 진행도 */}
      <section>
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
