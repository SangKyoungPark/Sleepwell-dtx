"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import Link from "next/link";
import { getInsomniaSeverity } from "@/lib/utils";
import { ISI_SEVERITY_RANGES, ISI_QUESTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { saveAssessment } from "@/lib/supabase/db";

const SEVERITY_COLORS = {
  none: "text-[var(--color-success)]",
  mild: "text-[var(--color-warning)]",
  moderate: "text-orange-400",
  severe: "text-red-400",
} as const;

const SEVERITY_BG = {
  none: "bg-[var(--color-success)]/10 border-[var(--color-success)]/30",
  mild: "bg-[var(--color-warning)]/10 border-[var(--color-warning)]/30",
  moderate: "bg-orange-400/10 border-orange-400/30",
  severe: "bg-red-400/10 border-red-400/30",
} as const;

function AssessmentResult() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const scoresParam = searchParams.get("scores");
  const totalParam = searchParams.get("total");

  // Supabase에 ISI 결과 저장
  useEffect(() => {
    if (user && scoresParam && totalParam) {
      const scores = scoresParam.split(",").map(Number);
      const totalScore = parseInt(totalParam, 10);
      const severity = getInsomniaSeverity(totalScore);
      saveAssessment(user.id, scores, totalScore, severity);
    }
  }, [user, scoresParam, totalParam]);

  if (!scoresParam || !totalParam) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-[var(--color-muted)]">진단 데이터가 없습니다.</p>
        <Link href="/assessment" className="mt-4 text-[var(--color-primary-light)] underline">
          진단하러 가기
        </Link>
      </main>
    );
  }

  const scores = scoresParam.split(",").map(Number);
  const totalScore = parseInt(totalParam, 10);
  const severity = getInsomniaSeverity(totalScore);
  const severityInfo = ISI_SEVERITY_RANGES[severity];

  return (
    <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-1">진단 결과</h1>
        <p className="text-sm text-[var(--color-muted)]">
          ISI (Insomnia Severity Index)
        </p>
      </div>

      {/* Score Card */}
      <div
        className={`rounded-2xl border-2 p-6 mb-6 text-center ${SEVERITY_BG[severity]}`}
      >
        <p className="text-sm text-[var(--color-muted)] mb-2">총점</p>
        <p className={`text-5xl font-bold mb-1 ${SEVERITY_COLORS[severity]}`}>
          {totalScore}
        </p>
        <p className="text-sm text-[var(--color-muted)]">/ 28점</p>
        <div className="mt-4">
          <p className={`text-xl font-bold ${SEVERITY_COLORS[severity]}`}>
            {severityInfo.label}
          </p>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            {severityInfo.description}
          </p>
        </div>
      </div>

      {/* Score Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-[var(--color-muted)] mb-1">
          <span>0</span>
          <span>7</span>
          <span>14</span>
          <span>21</span>
          <span>28</span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden flex">
          <div className="bg-[var(--color-success)] h-full" style={{ width: "25%" }} />
          <div className="bg-[var(--color-warning)] h-full" style={{ width: "25%" }} />
          <div className="bg-orange-400 h-full" style={{ width: "25%" }} />
          <div className="bg-red-400 h-full" style={{ width: "25%" }} />
        </div>
        {/* Indicator */}
        <div className="relative h-4">
          <div
            className="absolute top-0 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-white"
            style={{
              left: `${(totalScore / 28) * 100}%`,
              transform: "translateX(-50%)",
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-[var(--color-muted)]">
          <span>정상</span>
          <span>경미</span>
          <span>중등도</span>
          <span>중증</span>
        </div>
      </div>

      {/* Detail Scores */}
      <div className="bg-[var(--color-surface)] rounded-2xl p-4 mb-8">
        <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
          문항별 응답
        </h3>
        <div className="space-y-2">
          {ISI_QUESTIONS.map((question, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-foreground)] flex-1 mr-3">
                {question}
              </span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((val) => (
                  <div
                    key={val}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      scores[index] === val
                        ? "bg-[var(--color-primary)] text-white font-bold"
                        : "bg-[var(--color-surface-light)] text-[var(--color-muted)]"
                    }`}
                  >
                    {val}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 mt-auto">
        <Link href="/home">
          <Button variant="primary" size="lg">
            프로그램 시작하기
          </Button>
        </Link>
        <Link href="/assessment">
          <Button variant="ghost" size="lg">
            다시 진단하기
          </Button>
        </Link>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-[var(--color-muted)] text-center mt-6">
        본 결과는 참고용이며, 정확한 진단은 전문가 상담이 필요합니다.
      </p>
    </main>
  );
}

export default function AssessmentResultPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-[var(--color-muted)]">결과 불러오는 중...</p>
        </main>
      }
    >
      <AssessmentResult />
    </Suspense>
  );
}
