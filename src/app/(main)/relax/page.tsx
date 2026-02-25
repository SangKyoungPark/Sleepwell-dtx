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
    emoji: "\uD83C\uDFB5",
    title: "\uC218\uBA74 \uC0AC\uC6B4\uB4DC",
    description: "\uBC31\uC0C9\uC18C\uC74C \xB7 \uBE57\uC18C\uB9AC \xB7 \uD30C\uB3C4 \uB4F1 8\uC885 \uBF40\uC2F1",
    duration: "\uC790\uC720 \uC124\uC815",
    color: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    id: "breathing" as Tool,
    emoji: "\uD83E\uDEC1",
    title: "4-7-8 \uD638\uD761\uBC95",
    description: "4\uCD08 \uB4E4\uC228 \xB7 7\uCD08 \uCC38\uAE30 \xB7 8\uCD08 \uB0A0\uC228",
    duration: "\uC57D 2\uBD84",
    color: "bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "pmr" as Tool,
    emoji: "\uD83D\uDCAA",
    title: "\uC810\uC9C4\uC801 \uADFC\uC774\uC644\uBC95",
    description: "\uBC1C\uBD80\uD130 \uBA38\uB9AC\uAE4C\uC9C0 \uAE34\uC7A5-\uC774\uC644 \uBC18\uBCF5",
    duration: "\uC57D 3\uBD84",
    color: "bg-red-500/10 border-red-500/20",
  },
  {
    id: "bodyscan" as Tool,
    emoji: "\uD83E\uDDD8\u200D\u2642\uFE0F",
    title: "\uBC14\uB514\uC2A4\uCE94 \uBA85\uC0C1",
    description: "\uBAB8 \uC804\uCCB4\uB97C \uCC9C\uCC9C\uD788 \uAD00\uCC30\uD558\uB294 \uBA85\uC0C1",
    duration: "\uC57D 5\uBD84",
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
