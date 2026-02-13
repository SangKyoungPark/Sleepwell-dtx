"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Phase = "idle" | "inhale" | "hold" | "exhale";

const PHASE_CONFIG = {
  inhale: { duration: 4, label: "들숨", color: "text-blue-400" },
  hold: { duration: 7, label: "참기", color: "text-[var(--color-warning)]" },
  exhale: { duration: 8, label: "날숨", color: "text-emerald-400" },
} as const;

const TOTAL_CYCLE = 4 + 7 + 8; // 19초

interface Props {
  onBack: () => void;
}

export function BreathingExercise({ onBack }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [targetCycles] = useState(3);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  function startBreathing() {
    setCycles(0);
    runPhase("inhale", 0);
  }

  function runPhase(nextPhase: Phase, completedCycles: number) {
    if (nextPhase === "idle") {
      cleanup();
      setPhase("idle");
      return;
    }

    const config = PHASE_CONFIG[nextPhase];
    setPhase(nextPhase);
    setCount(config.duration);

    cleanup();
    let remaining = config.duration;

    intervalRef.current = setInterval(() => {
      remaining -= 1;
      setCount(remaining);

      if (remaining <= 0) {
        cleanup();

        if (nextPhase === "inhale") {
          runPhase("hold", completedCycles);
        } else if (nextPhase === "hold") {
          runPhase("exhale", completedCycles);
        } else {
          const newCycles = completedCycles + 1;
          setCycles(newCycles);
          if (newCycles >= targetCycles) {
            setPhase("idle");
          } else {
            runPhase("inhale", newCycles);
          }
        }
      }
    }, 1000);
  }

  function stop() {
    cleanup();
    setPhase("idle");
    setCount(0);
    setCycles(0);
  }

  const isRunning = phase !== "idle";
  const circleScale =
    phase === "inhale" ? "scale-110" :
    phase === "hold" ? "scale-110" :
    phase === "exhale" ? "scale-75" : "scale-90";

  return (
    <div className="flex flex-col items-center">
      {/* 뒤로가기 */}
      <button onClick={onBack} className="self-start text-[var(--color-muted)] mb-6 cursor-pointer">
        ← 이완 도구
      </button>

      <h2 className="text-xl font-bold mb-2">4-7-8 호흡법</h2>
      <p className="text-sm text-[var(--color-muted)] mb-8 text-center">
        4초 들숨 → 7초 참기 → 8초 날숨<br />
        부교감 신경을 활성화하여 긴장을 풀어줍니다
      </p>

      {/* 원형 가이드 */}
      <div className="relative flex items-center justify-center mb-8">
        <div
          className={cn(
            "w-48 h-48 rounded-full flex items-center justify-center transition-all",
            isRunning ? "duration-1000" : "duration-300",
            circleScale,
            phase === "inhale" && "bg-blue-500/20 border-2 border-blue-400/50",
            phase === "hold" && "bg-[var(--color-warning)]/20 border-2 border-[var(--color-warning)]/50",
            phase === "exhale" && "bg-emerald-500/20 border-2 border-emerald-400/50",
            phase === "idle" && "bg-[var(--color-surface)] border-2 border-[var(--color-surface-light)]",
          )}
        >
          <div className="text-center">
            {isRunning ? (
              <>
                <p className={cn("text-5xl font-bold", PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG]?.color)}>
                  {count}
                </p>
                <p className={cn("text-sm mt-1 font-medium", PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG]?.color)}>
                  {PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG]?.label}
                </p>
              </>
            ) : (
              <>
                {cycles >= targetCycles && cycles > 0 ? (
                  <>
                    <p className="text-4xl mb-1">🌙</p>
                    <p className="text-sm text-[var(--color-success)]">완료!</p>
                  </>
                ) : (
                  <>
                    <p className="text-4xl mb-1">🫁</p>
                    <p className="text-xs text-[var(--color-muted)]">시작하기</p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 사이클 표시 */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: targetCycles }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
              i < cycles
                ? "bg-[var(--color-success)]"
                : "bg-[var(--color-surface-light)]",
            )}
          />
        ))}
      </div>

      {/* 컨트롤 */}
      {isRunning ? (
        <Button variant="secondary" size="lg" onClick={stop}>
          중단
        </Button>
      ) : (
        <Button variant="primary" size="lg" onClick={startBreathing}>
          {cycles >= targetCycles && cycles > 0 ? "다시 하기" : "시작"}
        </Button>
      )}

      {/* 팁 */}
      <div className="bg-[var(--color-surface)] rounded-2xl p-4 mt-8 w-full">
        <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-2">💡 팁</h3>
        <ul className="text-xs text-[var(--color-muted)] space-y-1">
          <li>• 코로 들이쉬고, 입으로 내쉬세요</li>
          <li>• 편안한 자세로 눈을 감고 해보세요</li>
          <li>• 취침 전에 하면 수면에 도움이 됩니다</li>
          <li>• 3회가 기본, 익숙해지면 5~7회로 늘려보세요</li>
        </ul>
      </div>
    </div>
  );
}
