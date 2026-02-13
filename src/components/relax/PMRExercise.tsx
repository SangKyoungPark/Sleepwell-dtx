"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const PMR_STEPS = [
  { part: "발", instruction: "발가락을 꽉 움켜쥐세요", emoji: "🦶" },
  { part: "종아리", instruction: "종아리에 힘을 주세요", emoji: "🦵" },
  { part: "허벅지", instruction: "허벅지를 긴장시키세요", emoji: "🦵" },
  { part: "복부", instruction: "배에 힘을 주세요", emoji: "💪" },
  { part: "주먹", instruction: "양손을 꽉 쥐세요", emoji: "✊" },
  { part: "팔", instruction: "팔뚝에 힘을 주세요", emoji: "💪" },
  { part: "어깨", instruction: "어깨를 귀까지 올리세요", emoji: "🤷" },
  { part: "얼굴", instruction: "얼굴 전체에 힘을 주세요", emoji: "😤" },
];

const TENSION_SEC = 5;
const RELAX_SEC = 10;

interface Props {
  onBack: () => void;
}

export function PMRExercise({ onBack }: Props) {
  const [stepIndex, setStepIndex] = useState(-1);
  const [mode, setMode] = useState<"idle" | "tension" | "relax" | "done">("idle");
  const [count, setCount] = useState(0);
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

  function startCountdown(seconds: number, onComplete: () => void) {
    cleanup();
    setCount(seconds);
    let remaining = seconds;
    intervalRef.current = setInterval(() => {
      remaining -= 1;
      setCount(remaining);
      if (remaining <= 0) {
        cleanup();
        onComplete();
      }
    }, 1000);
  }

  function startStep(index: number) {
    if (index >= PMR_STEPS.length) {
      setMode("done");
      return;
    }
    setStepIndex(index);
    setMode("tension");
    startCountdown(TENSION_SEC, () => {
      setMode("relax");
      startCountdown(RELAX_SEC, () => {
        startStep(index + 1);
      });
    });
  }

  function start() {
    startStep(0);
  }

  function stop() {
    cleanup();
    setMode("idle");
    setStepIndex(-1);
    setCount(0);
  }

  const currentStep = stepIndex >= 0 ? PMR_STEPS[stepIndex] : null;
  const isRunning = mode === "tension" || mode === "relax";

  return (
    <div className="flex flex-col items-center">
      <button onClick={onBack} className="self-start text-[var(--color-muted)] mb-6 cursor-pointer">
        ← 이완 도구
      </button>

      <h2 className="text-xl font-bold mb-2">점진적 근이완법 (PMR)</h2>
      <p className="text-sm text-[var(--color-muted)] mb-8 text-center">
        각 부위를 5초 긴장 → 10초 이완<br />
        발부터 머리까지 온몸의 긴장을 풀어줍니다
      </p>

      {/* 메인 영역 */}
      <div className="w-full bg-[var(--color-surface)] rounded-2xl p-6 mb-6 text-center min-h-[200px] flex flex-col items-center justify-center">
        {mode === "idle" && (
          <>
            <p className="text-5xl mb-3">🧘</p>
            <p className="text-sm text-[var(--color-muted)]">편안한 자세로 시작하세요</p>
          </>
        )}
        {mode === "done" && (
          <>
            <p className="text-5xl mb-3">🌙</p>
            <p className="text-lg font-bold text-[var(--color-success)]">완료!</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">온몸이 이완되었습니다</p>
          </>
        )}
        {isRunning && currentStep && (
          <>
            <p className="text-5xl mb-3">{currentStep.emoji}</p>
            <p className="text-lg font-bold">{currentStep.part}</p>
            <p
              className={cn(
                "text-3xl font-bold mt-2",
                mode === "tension" ? "text-red-400" : "text-[var(--color-success)]",
              )}
            >
              {count}초
            </p>
            <p className={cn(
              "text-sm mt-1 font-medium",
              mode === "tension" ? "text-red-400" : "text-[var(--color-success)]",
            )}>
              {mode === "tension" ? "긴장! " + currentStep.instruction : "이완... 힘을 빼세요"}
            </p>
          </>
        )}
      </div>

      {/* 진행도 */}
      {isRunning && (
        <div className="flex gap-1.5 mb-6">
          {PMR_STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-6 h-2 rounded-full transition-colors",
                i < stepIndex
                  ? "bg-[var(--color-success)]"
                  : i === stepIndex
                    ? mode === "tension" ? "bg-red-400" : "bg-[var(--color-success)]"
                    : "bg-[var(--color-surface-light)]",
              )}
            />
          ))}
        </div>
      )}

      {/* 컨트롤 */}
      {isRunning ? (
        <Button variant="secondary" size="lg" onClick={stop}>중단</Button>
      ) : (
        <Button variant="primary" size="lg" onClick={start}>
          {mode === "done" ? "다시 하기" : "시작"}
        </Button>
      )}
    </div>
  );
}
