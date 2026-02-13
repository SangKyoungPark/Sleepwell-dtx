"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";

const BODY_PARTS = [
  { part: "발끝", duration: 30, guide: "발가락 하나하나의 감각을 느껴보세요" },
  { part: "발바닥 → 발등", duration: 30, guide: "발바닥이 바닥에 닿는 느낌을 관찰하세요" },
  { part: "종아리 → 무릎", duration: 30, guide: "종아리의 무게와 온기를 느껴보세요" },
  { part: "허벅지 → 골반", duration: 30, guide: "허벅지가 바닥에 눌리는 감각에 집중하세요" },
  { part: "복부 → 허리", duration: 30, guide: "호흡에 따라 배가 오르내리는 것을 관찰하세요" },
  { part: "가슴 → 등", duration: 30, guide: "심장 박동을 느껴보세요" },
  { part: "양손 → 양팔", duration: 30, guide: "손끝부터 어깨까지 천천히 주의를 이동하세요" },
  { part: "어깨 → 목", duration: 30, guide: "긴장이 모이는 곳입니다. 부드럽게 내려놓으세요" },
  { part: "얼굴 → 두피", duration: 30, guide: "이마, 눈, 볼, 턱의 긴장을 풀어주세요" },
  { part: "온몸 전체", duration: 30, guide: "몸 전체를 하나로 느껴보세요. 편안합니다" },
];

const TOTAL_DURATION = BODY_PARTS.reduce((s, p) => s + p.duration, 0);

interface Props {
  onBack: () => void;
}

export function BodyScanExercise({ onBack }: Props) {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
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

  function start() {
    setDone(false);
    setStepIndex(0);
    setStepCount(BODY_PARTS[0].duration);
    setTotalElapsed(0);
    setRunning(true);

    let elapsed = 0;
    let currentStep = 0;
    let remaining = BODY_PARTS[0].duration;

    cleanup();
    intervalRef.current = setInterval(() => {
      elapsed += 1;
      remaining -= 1;
      setTotalElapsed(elapsed);
      setStepCount(remaining);

      if (remaining <= 0) {
        currentStep += 1;
        if (currentStep >= BODY_PARTS.length) {
          cleanup();
          setRunning(false);
          setDone(true);
        } else {
          remaining = BODY_PARTS[currentStep].duration;
          setStepIndex(currentStep);
          setStepCount(remaining);
        }
      }
    }, 1000);
  }

  function stop() {
    cleanup();
    setRunning(false);
    setStepIndex(0);
    setStepCount(0);
    setTotalElapsed(0);
  }

  const currentPart = BODY_PARTS[stepIndex];
  const progressPercent = (totalElapsed / TOTAL_DURATION) * 100;
  const minutes = Math.floor((TOTAL_DURATION - totalElapsed) / 60);
  const seconds = (TOTAL_DURATION - totalElapsed) % 60;

  return (
    <div className="flex flex-col items-center">
      <button onClick={onBack} className="self-start text-[var(--color-muted)] mb-6 cursor-pointer">
        ← 이완 도구
      </button>

      <h2 className="text-xl font-bold mb-2">바디스캔 명상</h2>
      <p className="text-sm text-[var(--color-muted)] mb-8 text-center">
        발끝부터 머리끝까지 천천히 주의를 이동하며<br />
        몸의 감각을 관찰합니다 · 약 5분
      </p>

      {/* 메인 영역 */}
      <div className="w-full bg-[var(--color-surface)] rounded-2xl p-6 mb-4 text-center min-h-[200px] flex flex-col items-center justify-center">
        {!running && !done && (
          <>
            <p className="text-5xl mb-3">🧘‍♂️</p>
            <p className="text-sm text-[var(--color-muted)]">편안히 눕거나 앉아서 시작하세요</p>
          </>
        )}
        {done && (
          <>
            <p className="text-5xl mb-3">🌙</p>
            <p className="text-lg font-bold text-[var(--color-success)]">명상 완료</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">마음이 편안해지셨길 바랍니다</p>
          </>
        )}
        {running && (
          <>
            <p className="text-sm text-[var(--color-primary-light)] font-medium mb-2">
              {stepIndex + 1} / {BODY_PARTS.length}
            </p>
            <p className="text-2xl font-bold mb-2">{currentPart.part}</p>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              {currentPart.guide}
            </p>
            <p className="text-3xl font-bold text-[var(--color-accent)] mt-4">{stepCount}초</p>
          </>
        )}
      </div>

      {/* 전체 진행 바 */}
      {running && (
        <div className="w-full mb-2">
          <div className="w-full h-2 bg-[var(--color-surface-light)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-[var(--color-muted)] text-right mt-1">
            남은 시간 {minutes}:{seconds.toString().padStart(2, "0")}
          </p>
        </div>
      )}

      {/* 컨트롤 */}
      <div className="mt-4">
        {running ? (
          <Button variant="secondary" size="lg" onClick={stop}>중단</Button>
        ) : (
          <Button variant="primary" size="lg" onClick={start}>
            {done ? "다시 하기" : "시작"}
          </Button>
        )}
      </div>
    </div>
  );
}
