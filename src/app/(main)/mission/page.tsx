"use client";

import { useState, useEffect } from "react";
import { getWeekMissions } from "@/lib/missions";
import { PROGRAM_WEEKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { getMissionLogs, toggleMission as toggleMissionDb } from "@/lib/supabase/db";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import { PageSkeleton } from "@/components/ui/Skeleton";
import type { Mission } from "@/types";
import {
  HeaderStars,
  StarsBackground,
  MissionIllustration,
} from "@/components/ui/SleepIllustrations";

const CATEGORY_LABEL: Record<string, string> = {
  hygiene: "수면 위생",
  cognitive: "인지",
  relaxation: "이완",
  restriction: "수면 제한",
};

const CATEGORY_CONFIG: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  hygiene: {
    bg: "rgba(52,211,153,0.1)",
    text: "#34d399",
    border: "rgba(52,211,153,0.25)",
    icon: "🌿",
  },
  cognitive: {
    bg: "rgba(99,102,241,0.1)",
    text: "#818cf8",
    border: "rgba(99,102,241,0.25)",
    icon: "🧠",
  },
  relaxation: {
    bg: "rgba(167,139,250,0.1)",
    text: "#a78bfa",
    border: "rgba(167,139,250,0.25)",
    icon: "🧘",
  },
  restriction: {
    bg: "rgba(251,191,36,0.1)",
    text: "#fbbf24",
    border: "rgba(251,191,36,0.25)",
    icon: "⏰",
  },
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; dots: number }> = {
  easy: { label: "쉬움", color: "#34d399", dots: 1 },
  medium: { label: "보통", color: "#fbbf24", dots: 2 },
  hard: { label: "어려움", color: "#f87171", dots: 3 },
};

export default function MissionPage() {
  const { user } = useAuth();
  const { toasts, close, success } = useToast();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [completedMissions, setCompletedMissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMissions() {
      if (user) {
        const { data } = await getMissionLogs(user.id);
        if (data) {
          setCompletedMissions(data);
          localStorage.setItem("missionLog", JSON.stringify(data));
        }
      } else {
        try {
          const saved = JSON.parse(localStorage.getItem("missionLog") || "{}");
          setCompletedMissions(saved);
        } catch { /* ignore */ }
      }
      setLoading(false);
    }
    loadMissions();
  }, [user]);

  const weekMissions = getWeekMissions(currentWeek);
  const weekInfo = PROGRAM_WEEKS[currentWeek - 1];
  const completedCount = weekMissions.filter((m) => completedMissions[m.id]).length;
  const progressPercent = weekMissions.length === 0 ? 0 : Math.round((completedCount / weekMissions.length) * 100);

  async function toggleMission(mission: Mission) {
    const newCompleted = !completedMissions[mission.id];
    const updated = { ...completedMissions, [mission.id]: newCompleted };
    if (!newCompleted) delete updated[mission.id];

    // 체크 애니메이션 트리거
    if (newCompleted) {
      setAnimatingId(mission.id);
      setTimeout(() => setAnimatingId(null), 600);
    }

    setCompletedMissions(updated);
    localStorage.setItem("missionLog", JSON.stringify(updated));

    if (user) {
      await toggleMissionDb(user.id, mission.id, newCompleted);
    }
    if (newCompleted) success("미션 완료!");
  }

  if (loading) return <PageSkeleton cards={5} />;

  return (
    <main className="min-h-screen flex flex-col max-w-md mx-auto pb-24 animate-fade-in overflow-x-hidden">
      <ToastContainer toasts={toasts} onClose={close} />

      {/* ━━━━━ 헤더 영역 ━━━━━ */}
      <section
        className="relative px-6 pt-6 pb-4"
        style={{
          background: "linear-gradient(180deg, rgba(167,139,250,0.08) 0%, transparent 100%)",
        }}
        aria-label="미션 헤더"
      >
        {/* 별 배경 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <StarsBackground className="opacity-25" />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold">오늘의 미션</h1>
              <HeaderStars />
            </div>
            <p className="text-sm text-[var(--color-muted)]">
              매일 하나씩, 작은 변화가 쌓여요
            </p>
          </div>
          <MissionIllustration size={72} className="opacity-90 -mr-1" />
        </div>
      </section>

      <div className="px-6 space-y-5 mt-2">

        {/* ━━━━━ 주차 선택 탭 ━━━━━ */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          role="tablist"
          aria-label="주차 선택"
          style={{ scrollbarWidth: "none" }}
        >
          {PROGRAM_WEEKS.map((week) => {
            const isActive = currentWeek === week.week;
            return (
              <button
                key={week.week}
                role="tab"
                aria-selected={isActive}
                onClick={() => setCurrentWeek(week.week)}
                className={cn(
                  "relative px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all cursor-pointer flex-shrink-0 active:scale-95",
                  isActive ? "text-white font-semibold" : "text-[var(--color-muted)]",
                )}
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(167,139,250,0.3))"
                    : "var(--color-surface)",
                  border: isActive
                    ? "1px solid rgba(99,102,241,0.4)"
                    : "1px solid rgba(255,255,255,0.04)",
                  boxShadow: isActive
                    ? "0 0 16px rgba(99,102,241,0.2), 0 4px 8px rgba(99,102,241,0.15)"
                    : "none",
                }}
              >
                {/* 활성 상태 글로우 */}
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-xl animate-glow-pulse pointer-events-none"
                    style={{
                      boxShadow: "0 0 12px rgba(99,102,241,0.25)",
                    }}
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{week.week}주차</span>
              </button>
            );
          })}
        </div>

        {/* ━━━━━ 주차 정보 + 진행률 카드 ━━━━━ */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(20,25,39,0.95))",
            border: "1px solid rgba(99,102,241,0.18)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* 배경 글로우 */}
          <div
            className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            }}
            aria-hidden="true"
          />

          <div className="relative flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">
                {currentWeek}주차 프로그램
              </p>
              <p className="font-bold text-lg">{weekInfo.title}</p>
              <p className="text-sm text-[var(--color-muted)] mt-0.5">{weekInfo.theme}</p>
            </div>

            {/* 완료 비율 원형 */}
            <div className="flex-shrink-0 relative">
              <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
                <circle
                  cx="32" cy="32" r="26"
                  fill="none" stroke="#1e2438" strokeWidth="5"
                />
                <circle
                  cx="32" cy="32" r="26"
                  fill="none"
                  stroke={progressPercent >= 80 ? "#34d399" : progressPercent >= 40 ? "#818cf8" : "#6366f1"}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 26}
                  strokeDashoffset={2 * Math.PI * 26 - (progressPercent / 100) * 2 * Math.PI * 26}
                  style={{
                    transition: "stroke-dashoffset 0.8s ease-out",
                    filter: `drop-shadow(0 0 4px ${progressPercent >= 80 ? "rgba(52,211,153,0.4)" : "rgba(99,102,241,0.3)"})`,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-[var(--color-foreground)]">
                  {progressPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* 프로그레스 바 */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-[var(--color-surface-light)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPercent}%`,
                  background: progressPercent >= 80
                    ? "linear-gradient(90deg, #34d399, #10b981)"
                    : "linear-gradient(90deg, #6366f1, #818cf8)",
                }}
              />
            </div>
            <span className="text-xs font-semibold text-[var(--color-muted)] whitespace-nowrap">
              {completedCount}/{weekMissions.length}
            </span>
          </div>

          {/* 100% 달성 축하 메시지 */}
          {progressPercent === 100 && (
            <div
              className="mt-3 pt-3 flex items-center gap-2 animate-slide-up"
              style={{ borderTop: "1px solid rgba(52,211,153,0.15)" }}
            >
              <span className="text-base">🎉</span>
              <span className="text-sm font-medium text-[var(--color-success)]">
                이번 주 미션을 모두 완료했어요!
              </span>
            </div>
          )}
        </div>

        {/* ━━━━━ 미션 리스트 ━━━━━ */}
        <div className="space-y-3">
          {weekMissions.map((mission, index) => {
            const isDone = completedMissions[mission.id];
            const isAnimating = animatingId === mission.id;
            const catConfig = CATEGORY_CONFIG[mission.category];
            const diffConfig = DIFFICULTY_CONFIG[mission.difficulty];

            return (
              <div
                key={mission.id}
                className={cn(
                  "rounded-2xl p-4 relative overflow-hidden transition-all duration-300 group",
                  isDone ? "opacity-70" : "",
                )}
                style={{
                  background: isDone
                    ? "linear-gradient(135deg, rgba(52,211,153,0.06), rgba(20,25,39,0.9))"
                    : `linear-gradient(135deg, ${catConfig.bg}, rgba(20,25,39,0.95))`,
                  border: isDone
                    ? "1px solid rgba(52,211,153,0.15)"
                    : `1px solid ${catConfig.border}`,
                  animationDelay: `${index * 60}ms`,
                }}
              >
                {/* 좌측 카테고리 컬러 라인 */}
                <div
                  className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
                  style={{
                    background: isDone ? "#34d399" : catConfig.text,
                    opacity: isDone ? 0.6 : 0.8,
                  }}
                  aria-hidden="true"
                />

                <div className="flex gap-3 pl-2">
                  {/* 체크 버튼 */}
                  <button
                    onClick={() => toggleMission(mission)}
                    aria-label={isDone ? `${mission.title} 완료 해제` : `${mission.title} 완료 처리`}
                    className={cn(
                      "w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-all duration-200",
                      isDone
                        ? "border-[var(--color-success)]"
                        : "border-[var(--color-muted)] hover:border-[var(--color-primary)] hover:shadow-[0_0_8px_rgba(99,102,241,0.3)]",
                    )}
                    style={{
                      background: isDone
                        ? "linear-gradient(135deg, #34d399, #10b981)"
                        : "transparent",
                    }}
                  >
                    {isDone && (
                      <span className={cn("text-sm text-white", isAnimating && "animate-check-bounce")}>
                        ✓
                      </span>
                    )}
                  </button>

                  {/* 미션 내용 */}
                  <div className="flex-1 min-w-0">
                    {/* 상단 메타 정보 */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs text-[var(--color-muted)]">
                        Day {mission.day}
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                        style={{
                          background: catConfig.bg,
                          color: catConfig.text,
                        }}
                      >
                        <span className="text-xs">{catConfig.icon}</span>
                        {CATEGORY_LABEL[mission.category]}
                      </span>
                      {/* 난이도 도트 */}
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background: i < diffConfig.dots ? diffConfig.color : "rgba(255,255,255,0.1)",
                            }}
                          />
                        ))}
                      </span>
                    </div>

                    {/* 미션 제목 */}
                    <p className={cn(
                      "font-medium text-sm leading-snug transition-all",
                      isDone && "line-through text-[var(--color-muted)]",
                    )}>
                      {mission.title}
                    </p>

                    {/* 미션 설명 */}
                    <p className="text-xs text-[var(--color-muted)] mt-1.5 leading-relaxed">
                      {mission.description}
                    </p>

                    {/* 완료 상태 바 */}
                    {isDone && (
                      <div className="mt-2 flex items-center gap-1.5 animate-slide-up">
                        <div className="flex-1 h-1 rounded-full bg-[var(--color-surface-light)] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: "100%",
                              background: "linear-gradient(90deg, #34d399, #10b981)",
                              transition: "width 0.5s ease-out",
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-[var(--color-success)] font-medium">완료</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ━━━━━ 주차별 한줄 팁 ━━━━━ */}
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{
            background: "linear-gradient(135deg, rgba(251,191,36,0.06), rgba(20,25,39,0.9))",
            border: "1px solid rgba(251,191,36,0.12)",
          }}
        >
          <span className="text-lg flex-shrink-0">💡</span>
          <div>
            <p className="text-xs font-semibold text-[var(--color-warning)] mb-1">이번 주 팁</p>
            <p className="text-xs text-[var(--color-muted)] leading-relaxed">
              {currentWeek === 1 && "관찰이 변화의 시작이에요. 판단 없이 기록하는 것만으로도 충분합니다."}
              {currentWeek === 2 && "작은 환경 변화가 큰 수면 개선을 만들어요. 하나씩 시도해보세요."}
              {currentWeek === 3 && "이완법은 연습할수록 효과가 커져요. 매일 짧게라도 실천해보세요."}
              {currentWeek === 4 && "생각을 바꾸면 잠이 달라져요. 수면에 대한 불안을 줄여보세요."}
              {currentWeek === 5 && "수면 제한은 처음엔 힘들지만, 수면 효율이 빠르게 개선됩니다."}
              {currentWeek === 6 && "6주간의 노력을 유지하는 것이 핵심이에요. 꾸준함이 답입니다."}
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
