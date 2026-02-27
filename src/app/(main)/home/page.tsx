"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMinutesToHM } from "@/lib/utils";
import { PROGRAM_WEEKS } from "@/lib/constants";
import { getMission } from "@/lib/missions";
import { useAuth } from "@/hooks/useAuth";
import { getDiaryEntries, dbToDiary } from "@/lib/supabase/db";
import { PageSkeleton } from "@/components/ui/Skeleton";
import {
  StarsBackground,
  HeaderStars,
  HeroMoonAura,
  SleepScoreRing,
} from "@/components/ui/SleepIllustrations";
import { NotificationBanner } from "@/components/ui/NotificationBanner";
import { useNotification } from "@/hooks/useNotification";

interface DiaryEntry {
  date: string;
  totalSleepTime: number;
  sleepEfficiency: number;
  sleepQuality: number;
  morningMood: string;
}

const MOOD_EMOJI: Record<string, string> = {
  terrible: "\uD83D\uDE2B",
  bad: "\uD83D\uDE15",
  neutral: "\uD83D\uDE10",
  good: "\uD83D\uDE42",
  great: "\uD83D\uDE0A",
};

const MOOD_LABEL: Record<string, string> = {
  terrible: "최악",
  bad: "안좋음",
  neutral: "무난",
  good: "좀좋음",
  great: "좋음",
};

/** 퀵 액션 카드 설정 */
interface QuickAction {
  href: string;
  icon: string;
  label: string;
  sub: string;
  gradient: string;
  glow: string;
}

function getQuickActions(weekInfo: (typeof PROGRAM_WEEKS)[number]): QuickAction[] {
  return [
    {
      href: "/diary",
      icon: "📝",
      label: "수면 기록",
      sub: "아침 기록하기",
      gradient: "from-indigo-500/20 to-violet-500/20",
      glow: "rgba(99,102,241,0.3)",
    },
    {
      href: "/coach",
      icon: "🤖",
      label: "AI 코치",
      sub: "수면 상담",
      gradient: "from-violet-500/20 to-purple-500/20",
      glow: "rgba(139,92,246,0.3)",
    },
    {
      href: "/relax",
      icon: "🧘",
      label: "이완 도구",
      sub: "호흡법 · 명상",
      gradient: "from-cyan-500/20 to-teal-500/20",
      glow: "rgba(6,182,212,0.3)",
    },
    {
      href: "/session",
      icon: "📚",
      label: `${weekInfo.week}주차 세션`,
      sub: weekInfo.title,
      gradient: "from-amber-500/20 to-orange-500/20",
      glow: "rgba(245,158,11,0.3)",
    },
    {
      href: "/report",
      icon: "📊",
      label: "나의 리포트",
      sub: "수면 트렌드",
      gradient: "from-emerald-500/20 to-green-500/20",
      glow: "rgba(52,211,153,0.3)",
    },
  ];
}

function getGreeting(): { emoji: string; text: string; bgGradient: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12)
    return {
      emoji: "🌅",
      text: "좋은 아침이에요",
      bgGradient: "from-amber-900/20 via-transparent to-transparent",
    };
  if (hour >= 12 && hour < 18)
    return {
      emoji: "☀️",
      text: "좋은 오후에요",
      bgGradient: "from-sky-900/20 via-transparent to-transparent",
    };
  if (hour >= 18 && hour < 22)
    return {
      emoji: "🌇",
      text: "편안한 저녁이에요",
      bgGradient: "from-orange-900/20 via-transparent to-transparent",
    };
  return {
    emoji: "🌙",
    text: "오늘 밤도 함께해요",
    bgGradient: "from-indigo-900/30 via-violet-900/10 to-transparent",
  };
}

function getSleepEfficiencyLabel(eff: number): string {
  if (eff >= 85) return "우수";
  if (eff >= 70) return "보통";
  return "부족";
}

function getSleepEfficiencyColor(eff: number): string {
  if (eff >= 85) return "text-[var(--color-success)]";
  if (eff >= 70) return "text-[var(--color-warning)]";
  return "text-red-400";
}

export default function HomePage() {
  const { user } = useAuth();
  const [lastEntry, setLastEntry] = useState<DiaryEntry | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [missionDone, setMissionDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const notification = useNotification();

  useEffect(() => {
    async function loadData() {
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
  const quickActions = getQuickActions(weekInfo);

  if (loading) return <PageSkeleton cards={4} />;

  const greeting = getGreeting();

  return (
    <main className="min-h-screen flex flex-col max-w-md mx-auto pb-24 animate-fade-in overflow-x-hidden">

      {/* ━━━━━ 히어로 섹션 ━━━━━ */}
      <section
        className={`relative px-6 pt-8 pb-6 bg-gradient-to-b ${greeting.bgGradient}`}
        aria-label="포탈 헤더"
      >
        {/* 별 배경 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <StarsBackground />
        </div>

        {/* 상단 바 */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">{greeting.emoji}</span>
            <span className="text-xs text-[var(--color-muted)]">{greeting.text}</span>
          </div>
          <div className="flex items-center gap-2">
            <HeaderStars />
            <Link
              href="/settings"
              className="text-lg hover:opacity-70 transition-opacity"
              aria-label="설정"
            >
              ⚙️
            </Link>
          </div>
        </div>

        {/* 히어로 콘텐츠 */}
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Sleep
              <span
                className="animate-gradient-shift"
                style={{
                  background: "linear-gradient(135deg, #818cf8, #a78bfa, #6366f1)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Well
              </span>
            </h1>
            <p className="text-sm text-[var(--color-muted)] mt-1">
              {currentWeek}주차 · {weekInfo.theme}
            </p>
            <div
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                color: "var(--color-primary-light)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-light)] animate-pulse-ring inline-block" />
              {weekInfo.title} 프로그램 진행 중
            </div>
          </div>

          {/* 달 일러스트 */}
          <div className="flex-shrink-0 -mr-2">
            <HeroMoonAura className="opacity-90" />
          </div>
        </div>
      </section>

      <div className="px-6 space-y-6">

        {/* 알림 유도 배너 */}
        {notification.supported && notification.settings.permissionStatus === "default" && (
          <section>
            <NotificationBanner onEnable={() => notification.toggleGlobal(true)} />
          </section>
        )}

        {/* ━━━━━ 어젯밤 수면 요약 ━━━━━ */}
        <section className="animate-slide-up" aria-label="어젯밤 수면 요약">
          <h2 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">
            어젯밤 수면
          </h2>

          {lastEntry ? (
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(20,25,39,0.95))",
                border: "1px solid rgba(99,102,241,0.2)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* 배경 그라데이션 오라 */}
              <div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
                }}
              />

              <div className="relative flex items-center gap-5">
                {/* 원형 프로그레스 - 수면 효율 */}
                <div className="flex-shrink-0 relative">
                  <SleepScoreRing value={lastEntry.sleepEfficiency} size={88} strokeWidth={7} />
                  {/* 중앙 텍스트 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={`text-lg font-bold leading-none ${getSleepEfficiencyColor(lastEntry.sleepEfficiency)}`}
                    >
                      {lastEntry.sleepEfficiency}%
                    </span>
                    <span className="text-[9px] text-[var(--color-muted)] mt-0.5">
                      효율
                    </span>
                  </div>
                </div>

                {/* 우측 지표들 */}
                <div className="flex-1 space-y-3">
                  {/* 수면시간 */}
                  <div>
                    <p className="text-[10px] text-[var(--color-muted)] mb-1">수면시간</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-[var(--color-primary-light)]">
                        {formatMinutesToHM(lastEntry.totalSleepTime)}
                      </span>
                      {/* 미니 바 */}
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[var(--color-surface-light)]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (lastEntry.totalSleepTime / 480) * 100)}%`,
                            background: "linear-gradient(90deg, #6366f1, #818cf8)",
                            transition: "width 1s ease-out",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 수면효율 상태 + 기분 */}
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[10px] text-[var(--color-muted)] mb-1">상태</p>
                      <span
                        className={`text-sm font-semibold ${getSleepEfficiencyColor(lastEntry.sleepEfficiency)}`}
                      >
                        {getSleepEfficiencyLabel(lastEntry.sleepEfficiency)}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--color-muted)] mb-1">기분</p>
                      <div className="flex items-center gap-1">
                        <span className="text-base">{MOOD_EMOJI[lastEntry.morningMood] || "—"}</span>
                        <span className="text-xs text-[var(--color-muted)]">
                          {MOOD_LABEL[lastEntry.morningMood] || ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 하단 CTA */}
              <Link
                href="/diary"
                className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[var(--color-primary-light)] hover:text-white transition-colors"
              >
                <span>상세 기록 보기</span>
                <span>→</span>
              </Link>
            </div>
          ) : (
            <Link
              href="/diary"
              className="block rounded-2xl p-6 text-center relative overflow-hidden group transition-all active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(20,25,39,0.9))",
                border: "1px solid rgba(99,102,241,0.15)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-sm text-[var(--color-muted)] mb-1">
                  아직 수면 기록이 없어요
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{
                    background: "linear-gradient(90deg, #818cf8, #a78bfa)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  첫 수면 기록하기 →
                </p>
              </div>
            </Link>
          )}
        </section>

        {/* ━━━━━ 오늘의 미션 ━━━━━ */}
        <section className="animate-slide-up delay-75" aria-label="오늘의 미션">
          <h2 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">
            오늘의 미션
          </h2>
          <Link
            href="/mission"
            className="block rounded-2xl p-5 relative overflow-hidden group transition-all active:scale-[0.98]"
            style={{
              background: missionDone
                ? "linear-gradient(135deg, rgba(52,211,153,0.1), rgba(20,25,39,0.95))"
                : "linear-gradient(135deg, rgba(167,139,250,0.12), rgba(20,25,39,0.95))",
              border: missionDone
                ? "1px solid rgba(52,211,153,0.25)"
                : "1px solid rgba(167,139,250,0.25)",
            }}
          >
            {/* hover 오버레이 */}
            <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex items-center gap-4">
              {/* 미션 아이콘 */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  background: missionDone
                    ? "rgba(52,211,153,0.15)"
                    : "rgba(167,139,250,0.15)",
                }}
              >
                {missionDone ? "✅" : "🎯"}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium text-sm leading-snug ${
                    missionDone ? "line-through opacity-50" : ""
                  }`}
                >
                  {todayMission?.title || "미션 준비 중"}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: missionDone
                        ? "rgba(52,211,153,0.15)"
                        : "rgba(167,139,250,0.15)",
                      color: missionDone ? "#34d399" : "#a78bfa",
                    }}
                  >
                    {currentWeek}주차 Day {currentDay}
                  </span>
                  <span className="text-[10px] text-[var(--color-muted)]">
                    {weekInfo.theme}
                  </span>
                </div>

                {/* 진행 상태 바 */}
                {missionDone && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="flex-1 h-1 rounded-full bg-[var(--color-surface-light)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: "100%",
                          background: "linear-gradient(90deg, #34d399, #10b981)",
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-[var(--color-success)]">완료</span>
                  </div>
                )}
              </div>

              <span className="text-[var(--color-muted)] text-sm">›</span>
            </div>
          </Link>
        </section>

        {/* ━━━━━ 퀵 액션 그리드 ━━━━━ */}
        <section className="animate-slide-up delay-150" aria-label="바로가기">
          <h2 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">
            바로가기
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Link
                key={action.href}
                href={action.href}
                className={`rounded-2xl p-4 relative overflow-hidden group transition-all active:scale-[0.97] ${
                  index === 4 ? "col-span-2" : ""
                }`}
                style={{
                  background: `linear-gradient(135deg, var(--color-surface), var(--color-surface-light))`,
                  border: "1px solid rgba(255,255,255,0.05)",
                  animationDelay: `${(index + 3) * 50}ms`,
                }}
              >
                {/* hover glow 레이어 */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${action.glow.replace("0.3", "0.08")}, transparent)`,
                    boxShadow: `inset 0 0 20px ${action.glow.replace("0.3", "0.05")}`,
                  }}
                />

                <div className={`relative flex ${index === 4 ? "flex-row items-center gap-4" : "flex-col"}`}>
                  {/* 아이콘 원형 배경 */}
                  <div
                    className={`rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-transform group-hover:scale-110 ${
                      index === 4 ? "w-10 h-10" : "w-10 h-10 mb-2"
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${action.glow.replace("0.3", "0.25")}, ${action.glow.replace("0.3", "0.1")})`,
                      boxShadow: `0 4px 12px ${action.glow.replace("0.3", "0.2")}`,
                    }}
                  >
                    {action.icon}
                  </div>

                  <div>
                    <p className="text-sm font-semibold">{action.label}</p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">{action.sub}</p>
                  </div>

                  {index === 4 && (
                    <span className="ml-auto text-[var(--color-muted)] text-sm">›</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ━━━━━ 프로그램 진행도 (스텝퍼) ━━━━━ */}
        <section className="animate-slide-up delay-300 pb-4" aria-label="프로그램 진행도">
          <h2 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">
            프로그램 진행
          </h2>

          <div
            className="rounded-2xl p-5"
            style={{
              background: "linear-gradient(135deg, rgba(20,25,39,0.95), rgba(30,36,56,0.8))",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {/* 스텝퍼 */}
            <div className="relative flex items-start justify-between">
              {/* 배경 연결선 (전체) */}
              <div
                className="absolute top-4 left-4 right-4 h-px"
                style={{ background: "rgba(255,255,255,0.07)" }}
                aria-hidden="true"
              />

              {/* 완료된 연결선 */}
              {currentWeek > 1 && (
                <div
                  className="absolute top-4 left-4 h-px transition-all duration-1000"
                  style={{
                    background: "linear-gradient(90deg, #34d399, #6366f1)",
                    width: `${((currentWeek - 1) / (PROGRAM_WEEKS.length - 1)) * (100 - (8 / (PROGRAM_WEEKS.length)))}%`,
                    maxWidth: "calc(100% - 32px)",
                  }}
                  aria-hidden="true"
                />
              )}

              {PROGRAM_WEEKS.map((week) => {
                const isDone = week.week < currentWeek;
                const isCurrent = week.week === currentWeek;
                const isFuture = week.week > currentWeek;

                return (
                  <div
                    key={week.week}
                    className="relative flex flex-col items-center gap-2"
                    style={{ flex: 1 }}
                  >
                    {/* 스텝 원형 */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all duration-500 ${
                        isCurrent ? "animate-pulse-ring" : ""
                      }`}
                      style={{
                        background: isDone
                          ? "linear-gradient(135deg, #34d399, #10b981)"
                          : isCurrent
                          ? "linear-gradient(135deg, #818cf8, #6366f1)"
                          : "var(--color-surface-light)",
                        color: isFuture ? "var(--color-muted)" : "white",
                        boxShadow: isCurrent
                          ? "0 0 0 3px rgba(99,102,241,0.2), 0 4px 12px rgba(99,102,241,0.3)"
                          : isDone
                          ? "0 4px 8px rgba(52,211,153,0.2)"
                          : "none",
                      }}
                    >
                      {isDone ? "✓" : week.week}
                    </div>

                    {/* 라벨 */}
                    <div className="text-center">
                      <span
                        className={`text-[9px] leading-tight block ${
                          isFuture
                            ? "text-[var(--color-muted)] opacity-60"
                            : isCurrent
                            ? "text-[var(--color-primary-light)] font-semibold"
                            : "text-[var(--color-muted)]"
                        }`}
                      >
                        {week.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 현재 주차 상태 텍스트 */}
            <div
              className="mt-4 pt-3 flex items-center justify-between"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div>
                <p className="text-xs text-[var(--color-muted)]">현재 진행</p>
                <p className="text-sm font-semibold text-[var(--color-primary-light)] mt-0.5">
                  {currentWeek}주차 · {weekInfo.title}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--color-muted)]">진행률</p>
                <p className="text-sm font-semibold text-[var(--color-success)] mt-0.5">
                  {Math.round(((currentWeek - 1) / PROGRAM_WEEKS.length) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
