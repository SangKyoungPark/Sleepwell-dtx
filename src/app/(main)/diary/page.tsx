"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TimeSelector } from "@/components/ui/TimeSelector";
import { Slider } from "@/components/ui/Slider";
import { NumberSelector } from "@/components/ui/NumberSelector";
import { StarRating } from "@/components/ui/StarRating";
import { MoodSelector } from "@/components/ui/MoodSelector";
import {
  calculateTotalSleepTime,
  calculateSleepEfficiency,
  formatMinutesToHM,
} from "@/lib/utils";
import type { MorningMood } from "@/types";

export default function DiaryPage() {
  const router = useRouter();

  const [bedtime, setBedtime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepOnsetLatency, setSleepOnsetLatency] = useState(20);
  const [awakenings, setAwakenings] = useState(1);
  const [waso, setWaso] = useState(10);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [morningMood, setMorningMood] = useState<MorningMood | null>(null);
  const [saved, setSaved] = useState(false);

  const totalSleepTime = calculateTotalSleepTime(
    bedtime,
    wakeTime,
    sleepOnsetLatency,
    waso,
  );
  const sleepEfficiency = calculateSleepEfficiency(
    totalSleepTime,
    bedtime,
    wakeTime,
  );

  function handleSave() {
    const entry = {
      date: new Date().toISOString().split("T")[0],
      bedtime,
      wakeTime,
      sleepOnsetLatency,
      awakenings,
      waso,
      sleepQuality,
      morningMood,
      totalSleepTime,
      sleepEfficiency,
    };

    // localStorage에 저장 (추후 DB 연동)
    const existing = JSON.parse(localStorage.getItem("sleepDiary") || "[]");
    existing.push(entry);
    localStorage.setItem("sleepDiary", JSON.stringify(existing));

    setSaved(true);
  }

  if (saved) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto">
        <div className="text-center">
          <p className="text-5xl mb-4">🌙</p>
          <h2 className="text-xl font-bold mb-2">기록 완료!</h2>

          <div className="bg-[var(--color-surface)] rounded-2xl p-6 mt-6 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--color-muted)]">총 수면시간</p>
                <p className="text-2xl font-bold text-[var(--color-primary-light)]">
                  {formatMinutesToHM(totalSleepTime)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted)]">수면효율</p>
                <p className="text-2xl font-bold text-[var(--color-success)]">
                  {sleepEfficiency}%
                </p>
              </div>
            </div>
          </div>

          <Button variant="primary" size="lg" onClick={() => router.push("/home")}>
            홈으로
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1">아침 수면 기록</h1>
        <p className="text-sm text-[var(--color-muted)]">
          어젯밤은 어떠셨나요?
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6 flex-1">
        {/* 취침/기상 시각 */}
        <div className="grid grid-cols-2 gap-4">
          <TimeSelector
            label="취침 시각"
            value={bedtime}
            onChange={setBedtime}
          />
          <TimeSelector
            label="기상 시각"
            value={wakeTime}
            onChange={setWakeTime}
          />
        </div>

        {/* 잠들기까지 시간 */}
        <Slider
          label="잠들기까지 걸린 시간"
          value={sleepOnsetLatency}
          min={0}
          max={120}
          step={5}
          unit="분"
          onChange={setSleepOnsetLatency}
        />

        {/* 밤중 깬 횟수 */}
        <NumberSelector
          label="밤중 깬 횟수"
          value={awakenings}
          options={[0, 1, 2, 3, 4, 5]}
          onChange={setAwakenings}
        />

        {/* 밤중 깨어있던 시간 */}
        <Slider
          label="밤중 깨어있던 총 시간"
          value={waso}
          min={0}
          max={120}
          step={5}
          unit="분"
          onChange={setWaso}
        />

        {/* 수면의 질 */}
        <StarRating
          label="수면의 질"
          value={sleepQuality}
          onChange={setSleepQuality}
        />

        {/* 기상 시 기분 */}
        <MoodSelector
          label="기상 시 기분"
          value={morningMood}
          onChange={setMorningMood}
        />

        {/* 실시간 계산 미리보기 */}
        <div className="bg-[var(--color-surface)] rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
            계산된 수면 데이터
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--color-surface-light)] rounded-xl p-3 text-center">
              <p className="text-xs text-[var(--color-muted)]">총 수면시간</p>
              <p className="text-xl font-bold text-[var(--color-primary-light)]">
                {formatMinutesToHM(totalSleepTime)}
              </p>
            </div>
            <div className="bg-[var(--color-surface-light)] rounded-xl p-3 text-center">
              <p className="text-xs text-[var(--color-muted)]">수면효율</p>
              <p
                className={`text-xl font-bold ${
                  sleepEfficiency >= 85
                    ? "text-[var(--color-success)]"
                    : sleepEfficiency >= 70
                      ? "text-[var(--color-warning)]"
                      : "text-red-400"
                }`}
              >
                {sleepEfficiency}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--color-background)] border-t border-[var(--color-surface-light)]">
        <div className="max-w-md mx-auto">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSave}
            disabled={morningMood === null}
          >
            기록 완료
          </Button>
        </div>
      </div>
    </main>
  );
}
