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

const CATEGORY_LABEL: Record<string, string> = {
  hygiene: "수면 위생",
  cognitive: "인지",
  relaxation: "이완",
  restriction: "수면 제한",
};

const CATEGORY_COLOR: Record<string, string> = {
  hygiene: "bg-emerald-500/15 text-emerald-400",
  cognitive: "bg-blue-500/15 text-blue-400",
  relaxation: "bg-purple-500/15 text-purple-400",
  restriction: "bg-orange-500/15 text-orange-400",
};

const DIFFICULTY_DOT: Record<string, string> = {
  easy: "text-[var(--color-success)]",
  medium: "text-[var(--color-warning)]",
  hard: "text-red-400",
};

export default function MissionPage() {
  const { user } = useAuth();
  const { toasts, close, success } = useToast();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [completedMissions, setCompletedMissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

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

  async function toggleMission(mission: Mission) {
    const newCompleted = !completedMissions[mission.id];
    const updated = { ...completedMissions, [mission.id]: newCompleted };
    if (!newCompleted) delete updated[mission.id];
    setCompletedMissions(updated);
    localStorage.setItem("missionLog", JSON.stringify(updated));

    if (user) {
      await toggleMissionDb(user.id, mission.id, newCompleted);
    }
    if (newCompleted) success("미션 완료!");
  }

  if (loading) return <PageSkeleton cards={5} />;

  return (
    <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-20 animate-fade-in">
      <ToastContainer toasts={toasts} onClose={close} />
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold mb-1">오늘의 미션</h1>
        <p className="text-sm text-[var(--color-muted)]">
          매일 하나씩, 작은 변화가 쌓여요
        </p>
      </div>

      {/* 주차 선택 */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto">
        {PROGRAM_WEEKS.map((week) => (
          <button
            key={week.week}
            onClick={() => setCurrentWeek(week.week)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors cursor-pointer",
              currentWeek === week.week
                ? "bg-[var(--color-primary)] text-white font-medium"
                : "bg-[var(--color-surface)] text-[var(--color-muted)] hover:bg-[var(--color-surface-light)]",
            )}
          >
            {week.week}주차
          </button>
        ))}
      </div>

      {/* 주차 정보 */}
      <div className="bg-[var(--color-surface)] rounded-2xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">{weekInfo.title}</p>
            <p className="text-sm text-[var(--color-muted)]">{weekInfo.theme}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[var(--color-primary-light)]">
              {completedCount}/{weekMissions.length}
            </p>
            <p className="text-xs text-[var(--color-muted)]">완료</p>
          </div>
        </div>
        {/* 진행 바 */}
        <div className="w-full h-2 bg-[var(--color-surface-light)] rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
            style={{ width: `${weekMissions.length === 0 ? 0 : (completedCount / weekMissions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 미션 리스트 */}
      <div className="space-y-3">
        {weekMissions.map((mission) => {
          const isDone = completedMissions[mission.id];
          return (
            <div
              key={mission.id}
              className={cn(
                "bg-[var(--color-surface)] rounded-2xl p-4 transition-all duration-200",
                isDone && "opacity-60",
              )}
            >
              <div className="flex gap-3">
                {/* 체크 버튼 */}
                <button
                  onClick={() => toggleMission(mission)}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-colors",
                    isDone
                      ? "bg-[var(--color-success)] border-[var(--color-success)] text-white"
                      : "border-[var(--color-muted)] hover:border-[var(--color-primary)]",
                  )}
                >
                  {isDone && <span className="text-sm">✓</span>}
                </button>

                {/* 미션 내용 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[var(--color-muted)]">
                      Day {mission.day}
                    </span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", CATEGORY_COLOR[mission.category])}>
                      {CATEGORY_LABEL[mission.category]}
                    </span>
                    <span className={cn("text-xs", DIFFICULTY_DOT[mission.difficulty])}>
                      {"●".repeat(mission.difficulty === "easy" ? 1 : mission.difficulty === "medium" ? 2 : 3)}
                    </span>
                  </div>
                  <p className={cn("font-medium text-sm", isDone && "line-through")}>
                    {mission.title}
                  </p>
                  <p className="text-xs text-[var(--color-muted)] mt-1 leading-relaxed">
                    {mission.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
