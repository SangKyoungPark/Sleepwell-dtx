"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
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
import { useAuth } from "@/hooks/useAuth";
import { saveDiaryEntry, getDiaryEntries, diaryToDb, dbToDiary } from "@/lib/supabase/db";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import type { MorningMood } from "@/types";

type DiaryTab = "morning" | "evening";

export default function DiaryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toasts, close, success, error: showError } = useToast();
  const [tab, setTab] = useState<DiaryTab>("morning");
  const [saving, setSaving] = useState(false);

  // ── 아침 기록 상태 ──
  const [bedtime, setBedtime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepOnsetLatency, setSleepOnsetLatency] = useState(20);
  const [awakenings, setAwakenings] = useState(1);
  const [waso, setWaso] = useState(10);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [morningMood, setMorningMood] = useState<MorningMood | null>(null);
  const [morningSaved, setMorningSaved] = useState(false);

  // ── 저녁 기록 상태 ──
  const [stressLevel, setStressLevel] = useState(5);
  const [caffeine, setCaffeine] = useState(false);
  const [caffeineLastTime, setCaffeineLastTime] = useState("14:00");
  const [exercise, setExercise] = useState(false);
  const [exerciseType, setExerciseType] = useState("");
  const [nap, setNap] = useState(false);
  const [napDuration, setNapDuration] = useState(20);
  const [worryNote, setWorryNote] = useState("");
  const [eveningSaved, setEveningSaved] = useState(false);

  // 오늘 날짜
  const today = new Date().toISOString().split("T")[0];

  // 아침 자동 계산
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

  // 기존 오늘 기록 불러오기 (Supabase 우선 → localStorage 폴백)
  useEffect(() => {
    async function loadTodayEntry() {
      let todayEntry: Record<string, unknown> | null = null;

      if (user) {
        // Supabase에서 로드
        const { data } = await getDiaryEntries(user.id);
        if (data) {
          // DB 데이터를 localStorage에 동기화
          const entries = data.map((row: Record<string, unknown>) => dbToDiary(row));
          localStorage.setItem("sleepDiary", JSON.stringify(entries));
          todayEntry = entries.find((e: Record<string, unknown>) => e.date === today) || null;
        }
      } else {
        // localStorage 폴백
        let existing: Record<string, unknown>[] = [];
        try { existing = JSON.parse(localStorage.getItem("sleepDiary") || "[]"); } catch { /* ignore */ }
        todayEntry = existing.find((e) => e.date === today) || null;
      }

      if (todayEntry) {
        // 아침 기록 복원
        if (todayEntry.bedtime) setBedtime(todayEntry.bedtime as string);
        if (todayEntry.wakeTime) setWakeTime(todayEntry.wakeTime as string);
        if (todayEntry.sleepOnsetLatency != null) setSleepOnsetLatency(todayEntry.sleepOnsetLatency as number);
        if (todayEntry.awakenings != null) setAwakenings(todayEntry.awakenings as number);
        if (todayEntry.waso != null) setWaso(todayEntry.waso as number);
        if (todayEntry.sleepQuality != null) setSleepQuality(todayEntry.sleepQuality as number);
        if (todayEntry.morningMood) {
          setMorningMood(todayEntry.morningMood as MorningMood);
          setMorningSaved(true);
        }

        // 저녁 기록 복원
        if (todayEntry.stressLevel != null) {
          setStressLevel(todayEntry.stressLevel as number);
          setCaffeine(todayEntry.caffeine as boolean);
          if (todayEntry.caffeineLastTime) setCaffeineLastTime(todayEntry.caffeineLastTime as string);
          setExercise(todayEntry.exercise as boolean);
          if (todayEntry.exerciseType) setExerciseType(todayEntry.exerciseType as string);
          setNap(todayEntry.nap as boolean);
          if (todayEntry.napDuration) setNapDuration(todayEntry.napDuration as number);
          if (todayEntry.worryNote) setWorryNote(todayEntry.worryNote as string);
          setEveningSaved(true);
        }
      }
    }
    loadTodayEntry();
  }, [today, user]);

  // localStorage에 diary entry 병합 저장
  function saveToLocalStorage(entry: Record<string, unknown>) {
    const existing = JSON.parse(localStorage.getItem("sleepDiary") || "[]");
    const idx = existing.findIndex((e: { date: string }) => e.date === today);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...entry };
    } else {
      existing.push(entry);
    }
    localStorage.setItem("sleepDiary", JSON.stringify(existing));
  }

  // ── 아침 저장 ──
  async function handleMorningSave() {
    setSaving(true);
    try {
      const entry = {
        date: today,
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

      if (user) {
        const { error } = await saveDiaryEntry(user.id, today, diaryToDb(entry));
        if (error) { showError("저장 중 오류가 발생했습니다"); return; }
      }

      saveToLocalStorage(entry);
      success("아침 기록이 저장되었습니다");
      setMorningSaved(true);
    } finally {
      setSaving(false);
    }
  }

  // ── 저녁 저장 ──
  async function handleEveningSave() {
    setSaving(true);
    try {
      const eveningData = {
        date: today,
        stressLevel,
        caffeine,
        caffeineLastTime: caffeine ? caffeineLastTime : undefined,
        exercise,
        exerciseType: exercise ? exerciseType : undefined,
        nap,
        napDuration: nap ? napDuration : undefined,
        worryNote: worryNote.trim() || undefined,
      };

      if (user) {
        const { error } = await saveDiaryEntry(user.id, today, diaryToDb(eveningData));
        if (error) { showError("저장 중 오류가 발생했습니다"); return; }
      }

      saveToLocalStorage(eveningData);
      success("저녁 기록이 저장되었습니다");
      setEveningSaved(true);
    } finally {
      setSaving(false);
    }
  }

  // ── 아침 완료 화면 ──
  if (tab === "morning" && morningSaved) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto animate-scale-in">
        <div className="text-center">
          <p className="text-5xl mb-4">🌅</p>
          <h2 className="text-xl font-bold mb-2">아침 기록 완료!</h2>

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

          <div className="flex gap-3">
            <Button variant="secondary" size="lg" onClick={() => setTab("evening")}>
              저녁 기록하기
            </Button>
            <Button variant="primary" size="lg" onClick={() => router.push("/home")}>
              홈으로
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // ── 저녁 완료 화면 ──
  if (tab === "evening" && eveningSaved) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto animate-scale-in">
        <div className="text-center">
          <p className="text-5xl mb-4">🌙</p>
          <h2 className="text-xl font-bold mb-2">저녁 기록 완료!</h2>

          <div className="bg-[var(--color-surface)] rounded-2xl p-6 mt-6 mb-8">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-muted)]">스트레스</span>
                <span className="font-medium">{stressLevel}/10</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-muted)]">카페인</span>
                <span className="font-medium">{caffeine ? `마침 (마지막 ${caffeineLastTime})` : "안 마심"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-muted)]">운동</span>
                <span className="font-medium">{exercise ? (exerciseType || "함") : "안 함"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-muted)]">낮잠</span>
                <span className="font-medium">{nap ? `${napDuration}분` : "안 잠"}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setEveningSaved(false);
              }}
            >
              수정하기
            </Button>
            <Button variant="primary" size="lg" onClick={() => router.push("/home")}>
              홈으로
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-36 animate-fade-in">
      <ToastContainer toasts={toasts} onClose={close} />
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold mb-1">수면 일지</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {today}
        </p>
      </div>

      {/* 탭 */}
      <div className="flex gap-1.5 mb-6">
        <button
          onClick={() => setTab("morning")}
          className={cn(
            "flex-1 py-2 rounded-xl text-sm transition-colors cursor-pointer",
            tab === "morning"
              ? "bg-[var(--color-primary)] text-white font-medium"
              : "bg-[var(--color-surface)] text-[var(--color-muted)]",
          )}
        >
          🌅 아침 기록
        </button>
        <button
          onClick={() => setTab("evening")}
          className={cn(
            "flex-1 py-2 rounded-xl text-sm transition-colors cursor-pointer",
            tab === "evening"
              ? "bg-[var(--color-primary)] text-white font-medium"
              : "bg-[var(--color-surface)] text-[var(--color-muted)]",
          )}
        >
          🌙 저녁 기록
        </button>
      </div>

      {/* ── 아침 기록 폼 ── */}
      {tab === "morning" && (
        <div className="space-y-6 flex-1">
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

          <Slider
            label="잠들기까지 걸린 시간"
            value={sleepOnsetLatency}
            min={0}
            max={120}
            step={5}
            unit="분"
            onChange={setSleepOnsetLatency}
          />

          <NumberSelector
            label="밤중 깬 횟수"
            value={awakenings}
            options={[0, 1, 2, 3, 4, 5]}
            onChange={setAwakenings}
          />

          <Slider
            label="밤중 깨어있던 총 시간"
            value={waso}
            min={0}
            max={120}
            step={5}
            unit="분"
            onChange={setWaso}
          />

          <StarRating
            label="수면의 질"
            value={sleepQuality}
            onChange={setSleepQuality}
          />

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
      )}

      {/* ── 저녁 기록 폼 ── */}
      {tab === "evening" && (
        <div className="space-y-6 flex-1">
          {/* 스트레스 수준 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              오늘의 스트레스 수준
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--color-muted)]">낮음</span>
              <input
                type="range"
                min={1}
                max={10}
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className="flex-1 accent-[var(--color-primary)]"
              />
              <span className="text-xs text-[var(--color-muted)]">높음</span>
            </div>
            <p className="text-center text-2xl font-bold text-[var(--color-accent)] mt-1">
              {stressLevel}<span className="text-sm text-[var(--color-muted)] font-normal"> / 10</span>
            </p>
          </div>

          {/* 카페인 */}
          <div className="bg-[var(--color-surface)] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">카페인 섭취</span>
              <button
                onClick={() => setCaffeine(!caffeine)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors cursor-pointer relative",
                  caffeine ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-light)]",
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                    caffeine ? "left-6" : "left-0.5",
                  )}
                />
              </button>
            </div>
            {caffeine && (
              <div className="mt-3 pt-3 border-t border-[var(--color-surface-light)]">
                <TimeSelector
                  label="마지막 카페인 시각"
                  value={caffeineLastTime}
                  onChange={setCaffeineLastTime}
                />
              </div>
            )}
          </div>

          {/* 운동 */}
          <div className="bg-[var(--color-surface)] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">운동 여부</span>
              <button
                onClick={() => setExercise(!exercise)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors cursor-pointer relative",
                  exercise ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-light)]",
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                    exercise ? "left-6" : "left-0.5",
                  )}
                />
              </button>
            </div>
            {exercise && (
              <div className="mt-3 pt-3 border-t border-[var(--color-surface-light)]">
                <label className="text-xs text-[var(--color-muted)] mb-1 block">운동 종류</label>
                <div className="flex flex-wrap gap-2">
                  {["걷기", "달리기", "헬스", "요가", "수영", "기타"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setExerciseType(type)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors",
                        exerciseType === type
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-[var(--color-surface-light)] text-[var(--color-muted)]",
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 낮잠 */}
          <div className="bg-[var(--color-surface)] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">낮잠 여부</span>
              <button
                onClick={() => setNap(!nap)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors cursor-pointer relative",
                  nap ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-light)]",
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                    nap ? "left-6" : "left-0.5",
                  )}
                />
              </button>
            </div>
            {nap && (
              <div className="mt-3 pt-3 border-t border-[var(--color-surface-light)]">
                <Slider
                  label="낮잠 시간"
                  value={napDuration}
                  min={5}
                  max={120}
                  step={5}
                  unit="분"
                  onChange={setNapDuration}
                />
              </div>
            )}
          </div>

          {/* 걱정 메모 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              오늘의 걱정거리
            </label>
            <p className="text-xs text-[var(--color-muted)] mb-2">
              잠들기 전 머릿속을 비우세요. 여기에 적어두면 내일 처리하면 됩니다.
            </p>
            <textarea
              value={worryNote}
              onChange={(e) => setWorryNote(e.target.value)}
              placeholder="오늘 신경 쓰이는 일이 있다면 적어보세요..."
              className="w-full h-24 bg-[var(--color-surface)] rounded-xl p-3 text-sm resize-none outline-none border border-[var(--color-surface-light)] focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
        </div>
      )}

      {/* 저장 버튼 */}
      <div className="fixed bottom-14 left-0 right-0 p-4 bg-[var(--color-background)] border-t border-[var(--color-surface-light)]">
        <div className="max-w-md mx-auto">
          {tab === "morning" ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleMorningSave}
              disabled={morningMood === null || saving}
            >
              {saving ? "저장 중..." : "아침 기록 완료"}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleEveningSave}
              disabled={saving}
            >
              {saving ? "저장 중..." : "저녁 기록 완료"}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
