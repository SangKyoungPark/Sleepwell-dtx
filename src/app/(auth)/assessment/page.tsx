"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ISI_QUESTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScoreSelector } from "@/components/ui/ScoreSelector";

export default function AssessmentPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<(number | null)[]>(
    Array(ISI_QUESTIONS.length).fill(null),
  );

  const isLastQuestion = currentQuestion === ISI_QUESTIONS.length - 1;
  const currentScore = scores[currentQuestion];
  const allAnswered = scores.every((s) => s !== null);

  function handleSelect(value: number) {
    const newScores = [...scores];
    newScores[currentQuestion] = value;
    setScores(newScores);
  }

  function handleNext() {
    if (currentScore === null) return;

    if (isLastQuestion) {
      const totalScore = scores.reduce<number>((sum, s) => sum + (s ?? 0), 0);
      const params = new URLSearchParams({
        scores: scores.join(","),
        total: totalScore.toString(),
      });
      router.push(`/assessment/result?${params.toString()}`);
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  }

  return (
    <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-1">불면증 자가진단</h1>
        <p className="text-sm text-[var(--color-muted)]">
          ISI (Insomnia Severity Index)
        </p>
      </div>

      {/* Progress */}
      <ProgressBar
        current={currentQuestion + 1}
        total={ISI_QUESTIONS.length}
        className="mb-8"
      />

      {/* Question */}
      <div className="flex-1">
        <div className="mb-6">
          <span className="text-sm text-[var(--color-primary-light)] font-medium">
            Q{currentQuestion + 1}
          </span>
          <h2 className="text-lg font-semibold mt-1">
            {ISI_QUESTIONS[currentQuestion]}
          </h2>
          <p className="text-sm text-[var(--color-muted)] mt-2">
            최근 2주간의 경험을 기준으로 선택해주세요
          </p>
        </div>

        <ScoreSelector value={currentScore} onChange={handleSelect} />
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8 pt-4 border-t border-[var(--color-surface-light)]">
        {currentQuestion > 0 && (
          <Button variant="secondary" size="md" onClick={handlePrev}>
            이전
          </Button>
        )}
        <Button
          variant="primary"
          size="lg"
          onClick={handleNext}
          disabled={currentScore === null}
        >
          {isLastQuestion ? "결과 보기" : "다음"}
        </Button>
      </div>
    </main>
  );
}
