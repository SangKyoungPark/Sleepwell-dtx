"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    emoji: "🌙",
    title: "잠 못 드는 밤,\n이제 끝내볼까요?",
    description:
      "SleepWell은 인지행동치료(CBT-I)에 기반한\n6주 불면증 자가관리 프로그램입니다.",
    bg: "from-indigo-950 to-slate-900",
  },
  {
    emoji: "📊",
    title: "나의 수면을\n객관적으로 파악하기",
    description:
      "매일 수면 일지를 기록하면\n수면 패턴과 효율을 자동으로 분석해드려요.",
    bg: "from-blue-950 to-slate-900",
  },
  {
    emoji: "🧠",
    title: "과학적으로 검증된\nCBT-I 프로그램",
    description:
      "수면 위생, 이완 훈련, 인지 재구성, 수면 제한 등\n전문가 수준의 치료 기법을 안내합니다.",
    bg: "from-purple-950 to-slate-900",
  },
  {
    emoji: "✨",
    title: "6주 후,\n달라진 나를 만나세요",
    description:
      "먼저 간단한 자가진단(ISI)으로\n현재 수면 상태를 확인해볼까요?",
    bg: "from-emerald-950 to-slate-900",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const isLast = current === SLIDES.length - 1;
  const slide = SLIDES[current];

  function next() {
    if (isLast) {
      localStorage.setItem("onboardingDone", "true");
      router.push("/signup");
    } else {
      setCurrent(current + 1);
    }
  }

  function skip() {
    localStorage.setItem("onboardingDone", "true");
    router.push("/signup");
  }

  return (
    <main
      className={cn(
        "min-h-screen flex flex-col items-center justify-between p-6 max-w-md mx-auto transition-all duration-500 bg-gradient-to-b",
        slide.bg,
      )}
    >
      {/* 상단 skip */}
      <div className="w-full flex justify-end pt-2">
        {!isLast && (
          <button
            onClick={skip}
            className="text-sm text-[var(--color-muted)] cursor-pointer"
          >
            건너뛰기
          </button>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <p className="text-7xl mb-8">{slide.emoji}</p>
        <h1 className="text-2xl font-bold leading-snug whitespace-pre-line mb-4">
          {slide.title}
        </h1>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed whitespace-pre-line">
          {slide.description}
        </p>
      </div>

      {/* 하단 */}
      <div className="w-full pb-8">
        {/* 인디케이터 */}
        <div className="flex justify-center gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === current
                  ? "w-6 bg-[var(--color-primary-light)]"
                  : "w-1.5 bg-[var(--color-surface-light)]",
              )}
            />
          ))}
        </div>

        {/* 버튼 */}
        <button
          onClick={next}
          className="w-full py-4 rounded-xl text-base font-medium bg-[var(--color-primary)] text-white cursor-pointer transition-colors hover:bg-[var(--color-primary-light)]"
        >
          {isLast ? "자가진단 시작하기" : "다음"}
        </button>
      </div>
    </main>
  );
}
