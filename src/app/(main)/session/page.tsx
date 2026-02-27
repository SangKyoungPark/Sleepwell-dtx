"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { SESSIONS, type SessionContent } from "@/lib/sessions";
import { useAuth } from "@/hooks/useAuth";
import {
  saveSessionProgress as saveSessionProgressDb,
  getSessionProgress,
} from "@/lib/supabase/db";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { HeaderStars, StarsBackground } from "@/components/ui/SleepIllustrations";

type View = "list" | "detail";

/** 원형 프로그레스 (미니) */
function CircleProgress({ value, size = 44 }: { value: number; size?: number }) {
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  const ringColor = value >= 100 ? "#34d399" : value > 0 ? "#6366f1" : "#1e2438";
  const glowColor = value >= 100 ? "rgba(52,211,153,0.3)" : "rgba(99,102,241,0.2)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* 트랙 */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#1e2438" strokeWidth={strokeWidth}
        />
        {/* 프로그레스 */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={ringColor} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: value > 0 ? `drop-shadow(0 0 4px ${glowColor})` : "none",
            transition: "stroke-dashoffset 0.8s ease-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {value >= 100 ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l3.5 3.5L13 5" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span
            className="text-[10px] font-bold"
            style={{ color: value > 0 ? "var(--color-primary-light)" : "var(--color-muted)" }}
          >
            {value}%
          </span>
        )}
      </div>
    </div>
  );
}

/** 세션 카드의 주차 아이콘 배경 */
function WeekIconBadge({ emoji, progress }: { emoji: string; progress: number }) {
  const bgColor = progress >= 100
    ? "rgba(52,211,153,0.15)"
    : progress > 0
    ? "rgba(99,102,241,0.15)"
    : "rgba(30,36,56,0.8)";
  const borderColor = progress >= 100
    ? "rgba(52,211,153,0.25)"
    : progress > 0
    ? "rgba(99,102,241,0.25)"
    : "rgba(255,255,255,0.05)";

  return (
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-all"
      style={{
        background: `linear-gradient(135deg, ${bgColor}, rgba(20,25,39,0.8))`,
        border: `1px solid ${borderColor}`,
        boxShadow: progress >= 100 ? "0 4px 12px rgba(52,211,153,0.15)" : progress > 0 ? "0 4px 12px rgba(99,102,241,0.1)" : "none",
      }}
    >
      {emoji}
    </div>
  );
}

export default function SessionPage() {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [view, setView] = useState<View>("list");
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({});
  const [practiceChecks, setPracticeChecks] = useState<Record<string, boolean>>({});
  const [reflectionText, setReflectionText] = useState<Record<number, string>>({});
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function loadProgress() {
      if (user) {
        const { data } = await getSessionProgress(user.id);
        if (data) {
          if (data.completed_sections) setCompletedSections(data.completed_sections as Record<string, boolean>);
          if (data.practice_checks) setPracticeChecks(data.practice_checks as Record<string, boolean>);
          if (data.reflection_text) setReflectionText(data.reflection_text as Record<number, string>);
          // localStorage 동기화
          localStorage.setItem("sessionProgress", JSON.stringify({
            completedSections: data.completed_sections || {},
            practiceChecks: data.practice_checks || {},
            reflectionText: data.reflection_text || {},
          }));
          return;
        }
      }
      // localStorage 폴백
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let saved: any = {};
      try { saved = JSON.parse(localStorage.getItem("sessionProgress") || "{}"); } catch { /* ignore */ }
      if (saved.completedSections) setCompletedSections(saved.completedSections);
      if (saved.practiceChecks) setPracticeChecks(saved.practiceChecks);
      if (saved.reflectionText) setReflectionText(saved.reflectionText);
    }
    loadProgress().finally(() => setLoading(false));

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [user]);

  function saveProgress(
    sections: Record<string, boolean>,
    practices: Record<string, boolean>,
    reflections: Record<number, string>,
  ) {
    const data = {
      completedSections: sections,
      practiceChecks: practices,
      reflectionText: reflections,
    };
    localStorage.setItem("sessionProgress", JSON.stringify(data));

    // Supabase에 디바운스 저장 (300ms)
    if (user) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveSessionProgressDb(user.id, data);
      }, 300);
    }
  }

  function togglePractice(id: string) {
    const updated = { ...practiceChecks, [id]: !practiceChecks[id] };
    setPracticeChecks(updated);
    saveProgress(completedSections, updated, reflectionText);
  }

  function markSectionRead(weekKey: string) {
    const updated = { ...completedSections, [weekKey]: true };
    setCompletedSections(updated);
    saveProgress(updated, practiceChecks, reflectionText);
  }

  function updateReflection(week: number, text: string) {
    const updated = { ...reflectionText, [week]: text };
    setReflectionText(updated);
    saveProgress(completedSections, practiceChecks, updated);
  }

  function getWeekProgress(week: number): number {
    const session = SESSIONS.find((s) => s.week === week);
    if (!session) return 0;
    const sectionDone = completedSections[`w${week}`] ? 1 : 0;
    const practiceDone = session.practices.filter((p) => practiceChecks[p.id]).length;
    const reflectionDone = reflectionText[week]?.trim() ? 1 : 0;
    const total = 1 + session.practices.length + 1; // section + practices + reflection
    return Math.round(((sectionDone + practiceDone + reflectionDone) / total) * 100);
  }

  if (loading) return <PageSkeleton cards={3} />;

  const session = SESSIONS.find((s) => s.week === currentWeek);

  if (!session) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto pb-20">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(167,139,250,0.15))",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          📚
        </div>
        <p className="text-lg font-bold mb-2">세션을 찾을 수 없습니다</p>
        <button
          onClick={() => { setCurrentWeek(1); setView("list"); }}
          className="mt-3 px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all hover:scale-[1.02]"
          style={{
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            color: "white",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          }}
        >
          세션 목록으로
        </button>
      </main>
    );
  }

  // ━━━ 리스트 뷰 (주차 목록) ━━━
  if (view === "list") {
    return (
      <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-20 animate-fade-in">
        {/* 프리미엄 헤더 */}
        <div className="mb-6 relative">
          {/* 별 배경 */}
          <div className="absolute -top-4 -left-4 -right-4 h-24 pointer-events-none overflow-hidden opacity-20">
            <StarsBackground />
          </div>

          <div className="relative flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{
                background: "linear-gradient(135deg, rgba(167,139,250,0.2), rgba(99,102,241,0.2))",
                border: "1px solid rgba(167,139,250,0.15)",
              }}
            >
              📖
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">CBT-I 주간 세션</h1>
              <p className="text-xs text-[var(--color-muted)]">
                6주간의 인지행동치료 교육 프로그램
              </p>
            </div>
            <div className="ml-auto">
              <HeaderStars />
            </div>
          </div>
        </div>

        {/* 전체 진행도 바 */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{
            background: "linear-gradient(135deg, rgba(20,25,39,0.95), rgba(30,36,56,0.8))",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-semibold">
              전체 진행도
            </span>
            <span className="text-xs font-bold text-[var(--color-primary-light)]">
              {Math.round(SESSIONS.reduce((s, sess) => s + getWeekProgress(sess.week), 0) / SESSIONS.length)}%
            </span>
          </div>
          <div className="h-2 bg-[var(--color-surface-light)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.round(SESSIONS.reduce((s, sess) => s + getWeekProgress(sess.week), 0) / SESSIONS.length)}%`,
                background: "linear-gradient(90deg, #6366f1, #818cf8, #a78bfa)",
              }}
            />
          </div>
        </div>

        {/* 주차 카드 리스트 */}
        <div className="space-y-3">
          {SESSIONS.map((s, idx) => {
            const progress = getWeekProgress(s.week);
            return (
              <button
                key={s.week}
                onClick={() => {
                  setCurrentWeek(s.week);
                  setView("detail");
                  setExpandedSection(null);
                }}
                className="w-full text-left rounded-2xl p-4 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.98] animate-card-stagger group"
                style={{
                  background: "linear-gradient(135deg, rgba(20,25,39,0.95), rgba(30,36,56,0.7))",
                  border: progress >= 100
                    ? "1px solid rgba(52,211,153,0.2)"
                    : "1px solid rgba(255,255,255,0.05)",
                  animationDelay: `${idx * 60}ms`,
                }}
              >
                <div className="flex items-center gap-4">
                  {/* 이모지 아이콘 배경 */}
                  <WeekIconBadge emoji={s.emoji} progress={progress} />

                  {/* 정보 영역 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          background: progress >= 100
                            ? "rgba(52,211,153,0.12)"
                            : "rgba(99,102,241,0.12)",
                          color: progress >= 100
                            ? "var(--color-success)"
                            : "var(--color-primary-light)",
                        }}
                      >
                        {s.week}주차
                      </span>
                      <span className="text-[10px] text-[var(--color-muted)]">
                        {s.theme}
                      </span>
                    </div>
                    <p className="font-semibold text-sm mb-0.5">{s.title}</p>
                    <p className="text-[11px] text-[var(--color-muted)] truncate">
                      {s.summary}
                    </p>
                  </div>

                  {/* 원형 프로그레스 */}
                  <CircleProgress value={progress} />
                </div>
              </button>
            );
          })}
        </div>
      </main>
    );
  }

  // ━━━ 디테일 뷰 (세션 상세) ━━━
  const weekProgress = getWeekProgress(currentWeek);
  const isSectionRead = completedSections[`w${currentWeek}`];

  return (
    <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-20 animate-fade-in">
      {/* 뒤로가기 */}
      <button
        onClick={() => setView("list")}
        className="self-start text-[var(--color-muted)] mb-4 cursor-pointer flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--color-foreground)]"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        세션 목록
      </button>

      {/* 세션 헤더 */}
      <div
        className="rounded-2xl p-5 mb-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(20,25,39,0.95))",
          border: "1px solid rgba(99,102,241,0.15)",
        }}
      >
        {/* 배경 오라 */}
        <div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)" }}
        />

        <div className="relative flex items-center gap-4">
          <WeekIconBadge emoji={session.emoji} progress={weekProgress} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{
                  background: "rgba(99,102,241,0.15)",
                  color: "var(--color-primary-light)",
                }}
              >
                {session.week}주차
              </span>
              <span className="text-[10px] text-[var(--color-muted)]">
                {session.duration}
              </span>
            </div>
            <h2 className="text-lg font-bold">{session.title}</h2>
          </div>
        </div>

        <p className="text-xs text-[var(--color-muted)] mt-3 relative">{session.summary}</p>

        {/* 진행률 바 */}
        <div className="flex items-center gap-2 mt-4 relative">
          <div className="flex-1 h-2 bg-[var(--color-surface-light)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${weekProgress}%`,
                background: weekProgress >= 100
                  ? "linear-gradient(90deg, #34d399, #6ee7b7)"
                  : "linear-gradient(90deg, #6366f1, #818cf8)",
              }}
            />
          </div>
          <span
            className="text-xs font-bold min-w-[32px] text-right"
            style={{
              color: weekProgress >= 100 ? "var(--color-success)" : "var(--color-primary-light)",
            }}
          >
            {weekProgress}%
          </span>
        </div>
      </div>

      {/* ━━━ 교육 콘텐츠 ━━━ */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.15)" }}
          >
            <span className="text-sm">📖</span>
          </div>
          <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">
            교육 내용
          </h3>
        </div>

        {session.sections.map((section, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden transition-all"
            style={{
              background: expandedSection === i
                ? "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(20,25,39,0.95))"
                : "linear-gradient(135deg, rgba(20,25,39,0.8), rgba(30,36,56,0.6))",
              border: expandedSection === i
                ? "1px solid rgba(99,102,241,0.2)"
                : "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <button
              onClick={() =>
                setExpandedSection(expandedSection === i ? null : i)
              }
              className="w-full text-left p-4 flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{
                    background: expandedSection === i
                      ? "rgba(99,102,241,0.2)"
                      : "rgba(255,255,255,0.04)",
                    color: expandedSection === i
                      ? "var(--color-primary-light)"
                      : "var(--color-muted)",
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-medium">{section.heading}</span>
              </div>
              <svg
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                className={cn(
                  "transition-transform duration-300 flex-shrink-0",
                  expandedSection === i && "rotate-180",
                )}
              >
                <path d="M4 6l4 4 4-4" stroke="var(--color-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {expandedSection === i && (
              <div className="px-4 pb-4 animate-accordion-expand">
                <div className="pl-9">
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

        {!isSectionRead && (
          <button
            onClick={() => markSectionRead(`w${currentWeek}`)}
            className="w-full mt-3 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              color: "white",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}
          >
            교육 내용 읽기 완료
          </button>
        )}
        {isSectionRead && (
          <div
            className="flex items-center justify-center gap-2 mt-3 py-2.5 rounded-xl text-xs"
            style={{
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.15)",
              color: "var(--color-success)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7l2.5 2.5L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            교육 내용 읽기 완료
          </div>
        )}
      </div>

      {/* ━━━ 핵심 포인트 ━━━ */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{
          background: "linear-gradient(135deg, rgba(251,191,36,0.06), rgba(20,25,39,0.95))",
          border: "1px solid rgba(251,191,36,0.15)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(251,191,36,0.15)" }}
          >
            <span className="text-sm">💡</span>
          </div>
          <h3 className="text-xs font-semibold text-[var(--color-warning)] uppercase tracking-wider">
            핵심 포인트
          </h3>
        </div>
        <ul className="space-y-2.5">
          {session.keyPoints.map((point, i) => (
            <li key={i} className="flex gap-2.5 text-sm">
              <span className="text-[var(--color-primary-light)] shrink-0 mt-0.5">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ━━━ 실습 체크리스트 ━━━ */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(20,25,39,0.95))",
          border: "1px solid rgba(99,102,241,0.15)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.15)" }}
          >
            <span className="text-sm">✏️</span>
          </div>
          <h3 className="text-xs font-semibold text-[var(--color-primary-light)] uppercase tracking-wider">
            이번 주 실습
          </h3>
          <span
            className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{
              background: "rgba(99,102,241,0.1)",
              color: "var(--color-primary-light)",
            }}
          >
            {session.practices.filter((p) => practiceChecks[p.id]).length}/{session.practices.length}
          </span>
        </div>

        <div className="space-y-3">
          {session.practices.map((practice) => {
            const isChecked = practiceChecks[practice.id];
            return (
              <button
                key={practice.id}
                onClick={() => togglePractice(practice.id)}
                className="w-full text-left flex items-start gap-3 cursor-pointer group transition-all rounded-xl p-2.5 -mx-1"
                style={{
                  background: isChecked ? "rgba(52,211,153,0.04)" : "transparent",
                }}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                    isChecked
                      ? "border-[var(--color-success)]"
                      : "border-[var(--color-muted)] group-hover:border-[var(--color-primary-light)]",
                  )}
                  style={{
                    background: isChecked
                      ? "linear-gradient(135deg, #34d399, #6ee7b7)"
                      : "transparent",
                    boxShadow: isChecked ? "0 2px 8px rgba(52,211,153,0.3)" : "none",
                  }}
                >
                  {isChecked && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div>
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isChecked && "line-through text-[var(--color-muted)]",
                    )}
                  >
                    {practice.label}
                  </p>
                  <p className="text-[11px] text-[var(--color-muted)] mt-0.5">
                    {practice.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ━━━ 주간 성찰 ━━━ */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{
          background: "linear-gradient(135deg, rgba(167,139,250,0.06), rgba(20,25,39,0.95))",
          border: "1px solid rgba(167,139,250,0.15)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(167,139,250,0.15)" }}
          >
            <span className="text-sm">🪞</span>
          </div>
          <h3 className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wider">
            주간 성찰
          </h3>
          {reflectionText[currentWeek]?.trim() && (
            <span
              className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background: "rgba(52,211,153,0.1)",
                color: "var(--color-success)",
              }}
            >
              작성됨
            </span>
          )}
        </div>

        <p
          className="text-sm mb-3 py-2 px-3 rounded-lg"
          style={{
            background: "rgba(167,139,250,0.06)",
            color: "var(--color-primary-light)",
            border: "1px solid rgba(167,139,250,0.1)",
          }}
        >
          {session.reflection}
        </p>

        <textarea
          value={reflectionText[currentWeek] || ""}
          onChange={(e) => updateReflection(currentWeek, e.target.value)}
          placeholder="여기에 자유롭게 적어보세요..."
          className="w-full h-24 rounded-xl p-3 text-sm resize-none outline-none transition-all"
          style={{
            background: "rgba(10,14,26,0.6)",
            border: reflectionText[currentWeek]?.trim()
              ? "1px solid rgba(167,139,250,0.3)"
              : "1px solid rgba(30,36,56,0.8)",
          }}
        />
      </div>

      {/* ━━━ 주차 이동 ━━━ */}
      <div className="flex gap-3">
        {currentWeek > 1 && (
          <button
            onClick={() => {
              setCurrentWeek(currentWeek - 1);
              setExpandedSection(null);
            }}
            className="flex-1 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, rgba(20,25,39,0.95), rgba(30,36,56,0.8))",
              border: "1px solid rgba(255,255,255,0.05)",
              color: "var(--color-muted)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 3L4 7l5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {currentWeek - 1}주차
          </button>
        )}
        {currentWeek < 6 && (
          <button
            onClick={() => {
              setCurrentWeek(currentWeek + 1);
              setExpandedSection(null);
            }}
            className="flex-1 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              color: "white",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}
          >
            {currentWeek + 1}주차
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </main>
  );
}
