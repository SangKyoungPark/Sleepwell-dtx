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
import { HeaderStars } from "@/components/ui/SleepIllustrations";

type View = "list" | "detail";

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
        <p className="text-4xl mb-4">📚</p>
        <p className="text-lg font-bold mb-2">세션을 찾을 수 없습니다</p>
        <button
          onClick={() => { setCurrentWeek(1); setView("list"); }}
          className="mt-3 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm cursor-pointer"
        >
          세션 목록으로
        </button>
      </main>
    );
  }

  // 리스트 뷰 (주차 목록)
  if (view === "list") {
    return (
      <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-20 animate-fade-in">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <h1 className="text-xl font-bold">CBT-I 주간 세션</h1>
            <HeaderStars />
          </div>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            6주간의 인지행동치료 교육 프로그램
          </p>
        </div>

        <div className="space-y-3">
          {SESSIONS.map((s) => {
            const progress = getWeekProgress(s.week);
            return (
              <button
                key={s.week}
                onClick={() => {
                  setCurrentWeek(s.week);
                  setView("detail");
                  setExpandedSection(null);
                }}
                className="w-full text-left bg-[var(--color-surface)] rounded-2xl p-4 transition-all cursor-pointer hover:scale-[1.01]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-surface-light)] flex items-center justify-center text-2xl shrink-0">
                    {s.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-[var(--color-primary-light)] font-medium">
                        {s.week}주차
                      </span>
                      <span className="text-xs text-[var(--color-muted)]">
                        {s.theme}
                      </span>
                    </div>
                    <p className="font-semibold text-sm">{s.title}</p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5 truncate">
                      {s.summary}
                    </p>
                    {/* 진행률 바 */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[var(--color-surface-light)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[var(--color-muted)] w-8 text-right">
                        {progress}%
                      </span>
                    </div>
                  </div>
                  <span className="text-[var(--color-muted)]">→</span>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    );
  }

  // 디테일 뷰 (세션 상세)
  const weekProgress = getWeekProgress(currentWeek);
  const isSectionRead = completedSections[`w${currentWeek}`];

  return (
    <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-20">
      {/* 헤더 */}
      <button
        onClick={() => setView("list")}
        className="self-start text-[var(--color-muted)] mb-4 cursor-pointer"
      >
        ← 세션 목록
      </button>

      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{session.emoji}</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-primary-light)] font-medium">
              {session.week}주차
            </span>
            <span className="text-xs text-[var(--color-muted)]">
              {session.duration}
            </span>
          </div>
          <h2 className="text-lg font-bold">{session.title}</h2>
        </div>
      </div>
      <p className="text-sm text-[var(--color-muted)] mb-4">{session.summary}</p>

      {/* 진행률 */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] rounded-full transition-all"
            style={{ width: `${weekProgress}%` }}
          />
        </div>
        <span className="text-xs text-[var(--color-muted)]">{weekProgress}%</span>
      </div>

      {/* 교육 콘텐츠 */}
      <div className="space-y-2 mb-6">
        <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-2">
          📖 교육 내용
        </h3>
        {session.sections.map((section, i) => (
          <div key={i} className="bg-[var(--color-surface)] rounded-xl overflow-hidden">
            <button
              onClick={() =>
                setExpandedSection(expandedSection === i ? null : i)
              }
              className="w-full text-left p-4 flex items-center justify-between cursor-pointer"
            >
              <span className="text-sm font-medium">{section.heading}</span>
              <span
                className={cn(
                  "text-[var(--color-muted)] transition-transform text-xs",
                  expandedSection === i && "rotate-180",
                )}
              >
                ▼
              </span>
            </button>
            {expandedSection === i && (
              <div className="px-4 pb-4">
                <p className="text-sm text-[var(--color-muted)] leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            )}
          </div>
        ))}
        {!isSectionRead && (
          <button
            onClick={() => markSectionRead(`w${currentWeek}`)}
            className="w-full mt-2 py-2.5 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white cursor-pointer"
          >
            교육 내용 읽기 완료
          </button>
        )}
        {isSectionRead && (
          <p className="text-xs text-[var(--color-success)] text-center mt-2">
            ✅ 교육 내용 읽기 완료
          </p>
        )}
      </div>

      {/* 핵심 포인트 */}
      <div className="bg-[var(--color-surface)] rounded-2xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
          💡 핵심 포인트
        </h3>
        <ul className="space-y-2">
          {session.keyPoints.map((point, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-[var(--color-primary-light)] shrink-0">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 실습 체크리스트 */}
      <div className="bg-[var(--color-surface)] rounded-2xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
          ✏️ 이번 주 실습
        </h3>
        <div className="space-y-3">
          {session.practices.map((practice) => (
            <button
              key={practice.id}
              onClick={() => togglePractice(practice.id)}
              className="w-full text-left flex items-start gap-3 cursor-pointer"
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                  practiceChecks[practice.id]
                    ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                    : "border-[var(--color-muted)]",
                )}
              >
                {practiceChecks[practice.id] && (
                  <span className="text-white text-xs">✓</span>
                )}
              </div>
              <div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    practiceChecks[practice.id] && "line-through text-[var(--color-muted)]",
                  )}
                >
                  {practice.label}
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  {practice.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 주간 성찰 */}
      <div className="bg-[var(--color-surface)] rounded-2xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-2">
          🪞 주간 성찰
        </h3>
        <p className="text-sm text-[var(--color-primary-light)] mb-3">
          {session.reflection}
        </p>
        <textarea
          value={reflectionText[currentWeek] || ""}
          onChange={(e) => updateReflection(currentWeek, e.target.value)}
          placeholder="여기에 자유롭게 적어보세요..."
          className="w-full h-24 bg-[var(--color-background)] rounded-xl p-3 text-sm resize-none outline-none border border-[var(--color-surface-light)] focus:border-[var(--color-primary)] transition-colors"
        />
      </div>

      {/* 주차 이동 */}
      <div className="flex gap-3">
        {currentWeek > 1 && (
          <button
            onClick={() => {
              setCurrentWeek(currentWeek - 1);
              setExpandedSection(null);
            }}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[var(--color-surface)] text-[var(--color-muted)] cursor-pointer"
          >
            ← {currentWeek - 1}주차
          </button>
        )}
        {currentWeek < 6 && (
          <button
            onClick={() => {
              setCurrentWeek(currentWeek + 1);
              setExpandedSection(null);
            }}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white cursor-pointer"
          >
            {currentWeek + 1}주차 →
          </button>
        )}
      </div>
    </main>
  );
}
