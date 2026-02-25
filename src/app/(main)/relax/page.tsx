"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BreathingExercise } from "@/components/relax/BreathingExercise";
import { PMRExercise } from "@/components/relax/PMRExercise";
import { BodyScanExercise } from "@/components/relax/BodyScanExercise";
import { SleepSoundMixer } from "@/components/relax/SleepSoundMixer";
import { CloudDecoration } from "@/components/ui/SleepIllustrations";

type Tool = "menu" | "breathing" | "pmr" | "bodyscan" | "sound";

const TOOLS = [
  {
    id: "sound" as Tool,
    emoji: "🎵",
    title: "수면 사운드",
    description: "백색소음 · 빗소리 · 파도 등 8종 믹싱",
    duration: "자유 설정",
    color: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    id: "breathing" as Tool,
    emoji: "🫁",
    title: "4-7-8 호흡법",
    description: "4초 들숨 · 7초 참기 · 8초 날숨",
    duration: "약 2분",
    color: "bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "pmr" as Tool,
    emoji: "💪",
    title: "점진적 근이완법",
    description: "발부터 머리까지 긴장-이완 반복",
    duration: "약 3분",
    color: "bg-red-500/10 border-red-500/20",
  },
  {
    id: "bodyscan" as Tool,
    emoji: "🧘‍♂️",
    title: "바디스캔 명상",
    description: "몸 전체를 천천히 관찰하는 명상",
    duration: "약 5분",
    color: "bg-purple-500/10 border-purple-500/20",
  },
];

export default function RelaxPage() {
  const [activeTool, setActiveTool] = useState<Tool>("menu");

  if (activeTool === "sound") {
    return (
      <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-20">
        <SleepSoundMixer onBack={() => setActiveTool("menu")} />
      </main>
    );
  }

  if (activeTool === "breathing") {
    return (
      <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-20">
        <BreathingExercise onBack={() => setActiveTool("menu")} />
      </main>
    );
  }

  if (activeTool === "pmr") {
    return (
      <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-20">
        <PMRExercise onBack={() => setActiveTool("menu")} />
      </main>
    );
  }

  if (activeTool === "bodyscan") {
    return (
      <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-20">
        <BodyScanExercise onBack={() => setActiveTool("menu")} />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold mb-1">이완 도구</h1>
            <p className="text-sm text-[var(--color-muted)]">
              취침 전 긴장을 풀어주는 도구들
            </p>
          </div>
          <CloudDecoration className="opacity-50 -mr-4" />
        </div>
      </div>

      {/* 도구 목록 */}
      <div className="space-y-4">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={cn(
              "w-full text-left rounded-2xl p-5 border-2 transition-all cursor-pointer hover:scale-[1.01]",
              tool.color,
            )}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{tool.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-base">{tool.title}</p>
                <p className="text-sm text-[var(--color-muted)] mt-0.5">
                  {tool.description}
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  ⏱ {tool.duration}
                </p>
              </div>
              <span className="text-[var(--color-muted)]">→</span>
            </div>
          </button>
        ))}
      </div>

      {/* 안내 */}
      <div className="bg-[var(--color-surface)] rounded-2xl p-4 mt-8">
        <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-2">🌙 추천 사용법</h3>
        <ul className="text-xs text-[var(--color-muted)] space-y-1">
          <li>• 취침 15~30분 전에 사용하면 효과적입니다</li>
          <li>• 조명을 어둡게 하고 편안한 자세로 해보세요</li>
          <li>• 매일 같은 이완법을 반복하면 수면 신호가 됩니다</li>
        </ul>
      </div>
    </main>
  );
}
