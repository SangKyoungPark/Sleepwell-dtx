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
import {
  HeaderStars,
  DiaryIllustration,
  StarsBackground,
  SleepEfficiencyGauge,
  CelebrationParticles,
  SleepyCharacter,
} from "@/components/ui/SleepIllustrations";

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

  // 기존 오늘 기록 불러오기 (Supabase 우선 -> localStorage 폴백)
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

  // ── 효율 상태 텍스트 ──
  function getEfficiencyLabel(eff: number): string {
    if (eff >= 85) return "우수한 수면이에요!";
    if (eff >= 70) return "조금만 더 개선해봐요";
    return "수면 습관 점검이 필요해요";
  }

  // ── 아침 완료 화면 ──
  if (tab === "morning" && morningSaved) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto animate-fade-in relative overflow-hidden">
        {/* 별/파티클 배경 */}
        <CelebrationParticles />
        <StarsBackground className="opacity-40" />

        <div className="relative text-center z-10">
          {/* 축하 일러스트 */}
          <div className="animate-celebrate-pop mb-2">
            <SleepyCharacter size={100} />
          </div>

          <h2
            className="text-2xl font-bold mb-1 animate-slide-up"
            style={{
              background: "linear-gradient(135deg, #818cf8, #a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            아침 기록 완료!
          </h2>
          <p className="text-sm text-[var(--color-muted)] mb-6 animate-slide-up delay-100">
            오늘 밤도 좋은 잠이 되길 바라요
          </p>

          {/* 수면 효율 게이지 */}
          <div className="animate-scale-in delay-200 mb-6">
            <SleepEfficiencyGauge
              efficiency={sleepEfficiency}
              totalSleepMinutes={totalSleepTime}
              size={160}
            />
          </div>

          {/* 효율 상태 라벨 */}
          <p
            className="text-sm font-medium mb-6 animate-slide-up delay-300"
            style={{
              color: sleepEfficiency >= 85 ? "#34d399" : sleepEfficiency >= 70 ? "#fbbf24" : "#f87171",
            }}
          >
            {getEfficiencyLabel(sleepEfficiency)}
          </p>

          {/* 상세 지표 카드 */}
          <div
            className="rounded-2xl p-5 mb-8 animate-slide-up delay-400"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(20,25,39,0.95))",
              border: "1px solid rgba(99,102,241,0.15)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-[10px] text-[var(--color-muted)] mb-1">수면시간</p>
                <p className="text-lg font-bold text-[var(--color-primary-light)]">
                  {formatMinutesToHM(totalSleepTime)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-[var(--color-muted)] mb-1">깬 횟수</p>
                <p className="text-lg font-bold text-[var(--color-foreground)]">
                  {awakenings}회
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-[var(--color-muted)] mb-1">수면의 질</p>
                <div className="flex justify-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className="text-sm"
                      style={{ opacity: s <= sleepQuality ? 1 : 0.2 }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3 animate-slide-up delay-500">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setTab("evening")}
              className="flex-1"
            >
              저녁 기록하기
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/home")}
              className="flex-1"
            >
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
      <main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto animate-fade-in relative overflow-hidden">
        {/* 별 배경 */}
        <StarsBackground className="opacity-30" />
        <CelebrationParticles />

        <div className="relative text-center z-10">
          {/* 축하 일러스트 */}
          <div className="animate-celebrate-pop mb-2">
            <SleepyCharacter size={100} />
          </div>

          <h2
            className="text-2xl font-bold mb-1 animate-slide-up"
            style={{
              background: "linear-gradient(135deg, #a78bfa, #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            저녁 기록 완료!
          </h2>
          <p className="text-sm text-[var(--color-muted)] mb-6 animate-slide-up delay-100">
            편안한 밤 보내세요
          </p>

          {/* 요약 카드 */}
          <div
            className="rounded-2xl p-5 mb-8 text-left animate-slide-up delay-200"
            style={{
              background: "linear-gradient(135deg, rgba(167,139,250,0.08), rgba(20,25,39,0.95))",
              border: "1px solid rgba(167,139,250,0.15)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="space-y-3">
              {[
                {
                  icon: "💆",
                  label: "스트레스",
                  value: `${stressLevel}/10`,
                  color: stressLevel <= 3 ? "#34d399" : stressLevel <= 6 ? "#fbbf24" : "#f87171",
                },
                {
                  icon: "☕",
                  label: "카페인",
                  value: caffeine ? `마심 (마지막 ${caffeineLastTime})` : "안 마심",
                  color: caffeine ? "#fbbf24" : "#34d399",
                },
                {
                  icon: "🏃",
                  label: "운동",
                  value: exercise ? (exerciseType || "함") : "안 함",
                  color: exercise ? "#34d399" : "var(--color-muted)",
                },
                {
                  icon: "💤",
                  label: "낮잠",
                  value: nap ? `${napDuration}분` : "안 잠",
                  color: nap ? "#fbbf24" : "#34d399",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-sm text-[var(--color-muted)]">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: item.color }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3 animate-slide-up delay-400">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setEveningSaved(false)}
              className="flex-1"
            >
              수정하기
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/home")}
              className="flex-1"
            >
              홈으로
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col max-w-md mx-auto pb-36 animate-fade-in overflow-x-hidden">
      <ToastContainer toasts={toasts} onClose={close} />

      {/* ━━━━━ 헤더 영역 ━━━━━ */}
      <section
        className="relative px-6 pt-6 pb-4"
        style={{
          background: "linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%)",
        }}
        aria-label="수면 일지 헤더"
      >
        {/* 별 배경 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <StarsBackground className="opacity-30" />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold">수면 일지</h1>
              <HeaderStars />
            </div>
            <p className="text-sm text-[var(--color-muted)]">{today}</p>
          </div>
          <DiaryIllustration size={72} className="opacity-90 -mr-1" />
        </div>
      </section>

      <div className="px-6 space-y-6 mt-2">

        {/* ━━━━━ 세그먼트 탭 ━━━━━ */}
        <div
          className="relative flex rounded-2xl p-1"
          style={{
            background: "rgba(20,25,39,0.8)",
            border: "1px solid rgba(99,102,241,0.12)",
            backdropFilter: "blur(8px)",
          }}
          role="tablist"
          aria-label="기록 유형 선택"
        >
          {/* 슬라이딩 인디케이터 */}
          <div
            className="absolute top-1 bottom-1 rounded-xl transition-all duration-300 ease-out"
            style={{
              width: "calc(50% - 4px)",
              left: tab === "morning" ? "4px" : "calc(50% + 0px)",
              background: "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(129,140,248,0.2))",
              border: "1px solid rgba(99,102,241,0.3)",
              boxShadow: "0 0 12px rgba(99,102,241,0.15)",
            }}
            aria-hidden="true"
          />

          <button
            role="tab"
            aria-selected={tab === "morning"}
            aria-controls="panel-morning"
            onClick={() => setTab("morning")}
            className={cn(
              "relative flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer z-10 flex items-center justify-center gap-1.5",
              tab === "morning" ? "text-white" : "text-[var(--color-muted)]",
            )}
          >
            <span className="text-base">🌅</span>
            <span>아침 기록</span>
            {morningSaved && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] inline-block" />
            )}
          </button>
          <button
            role="tab"
            aria-selected={tab === "evening"}
            aria-controls="panel-evening"
            onClick={() => setTab("evening")}
            className={cn(
              "relative flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer z-10 flex items-center justify-center gap-1.5",
              tab === "evening" ? "text-white" : "text-[var(--color-muted)]",
            )}
          >
            <span className="text-base">🌙</span>
            <span>저녁 기록</span>
            {eveningSaved && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] inline-block" />
            )}
          </button>
        </div>

        {/* ── 아침 기록 폼 ── */}
        {tab === "morning" && (
          <div id="panel-morning" role="tabpanel" className="space-y-5 flex-1 animate-fade-in">

            {/* 시간 입력 카드 */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(20,25,39,0.9))",
                border: "1px solid rgba(99,102,241,0.12)",
              }}
            >
              <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[var(--color-primary)] inline-block" />
                취침 / 기상 시각
              </h3>
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
            </div>

            {/* 수면 방해 카드 */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "linear-gradient(135deg, rgba(167,139,250,0.06), rgba(20,25,39,0.9))",
                border: "1px solid rgba(167,139,250,0.12)",
              }}
            >
              <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[var(--color-accent)] inline-block" />
                수면 방해 요소
              </h3>
              <div className="space-y-5">
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
              </div>
            </div>

            {/* 수면 평가 카드 */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "linear-gradient(135deg, rgba(129,140,248,0.06), rgba(20,25,39,0.9))",
                border: "1px solid rgba(129,140,248,0.12)",
              }}
            >
              <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[var(--color-primary-light)] inline-block" />
                수면 평가
              </h3>
              <div className="space-y-5">
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
              </div>
            </div>

            {/* 실시간 계산 미리보기 */}
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(20,25,39,0.95))",
                border: "1px solid rgba(99,102,241,0.2)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* 배경 글로우 */}
              <div
                className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
                }}
                aria-hidden="true"
              />

              <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4 relative">
                계산된 수면 데이터
              </h3>

              <div className="relative flex items-center gap-4">
                {/* 미니 링 게이지 */}
                <div className="flex-shrink-0 relative">
                  <SleepEfficiencyGauge
                    efficiency={sleepEfficiency}
                    totalSleepMinutes={totalSleepTime}
                    size={100}
                  />
                </div>

                {/* 우측 수치 */}
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-[10px] text-[var(--color-muted)]">총 수면시간</p>
                    <p className="text-lg font-bold text-[var(--color-primary-light)]">
                      {formatMinutesToHM(totalSleepTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--color-muted)]">상태</p>
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: sleepEfficiency >= 85 ? "#34d399" : sleepEfficiency >= 70 ? "#fbbf24" : "#f87171",
                      }}
                    >
                      {sleepEfficiency >= 85 ? "우수" : sleepEfficiency >= 70 ? "보통" : "개선 필요"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 저녁 기록 폼 ── */}
        {tab === "evening" && (
          <div id="panel-evening" role="tabpanel" className="space-y-5 flex-1 animate-fade-in">

            {/* 스트레스 수준 카드 */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "linear-gradient(135deg, rgba(167,139,250,0.06), rgba(20,25,39,0.9))",
                border: "1px solid rgba(167,139,250,0.12)",
              }}
            >
              <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[var(--color-accent)] inline-block" />
                스트레스 수준
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--color-muted)]">낮음</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  className="flex-1 accent-[var(--color-accent)]"
                  aria-label="스트레스 수준"
                />
                <span className="text-xs text-[var(--color-muted)]">높음</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-2xl">
                  {stressLevel <= 3 ? "😌" : stressLevel <= 6 ? "😐" : "😫"}
                </span>
                <p className="text-2xl font-bold" style={{
                  color: stressLevel <= 3 ? "#34d399" : stressLevel <= 6 ? "#fbbf24" : "#f87171",
                }}>
                  {stressLevel}
                  <span className="text-sm text-[var(--color-muted)] font-normal"> / 10</span>
                </p>
              </div>
            </div>

            {/* 카페인 카드 */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(20,25,39,0.9))",
                border: "1px solid rgba(99,102,241,0.12)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">☕</span>
                  <span className="text-sm font-medium">카페인 섭취</span>
                </div>
                <button
                  onClick={() => setCaffeine(!caffeine)}
                  aria-label={caffeine ? "카페인 섭취 해제" : "카페인 섭취 선택"}
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
                <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)] animate-slide-up">
                  <TimeSelector
                    label="마지막 카페인 시각"
                    value={caffeineLastTime}
                    onChange={setCaffeineLastTime}
                  />
                </div>
              )}
            </div>

            {/* 운동 카드 */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "linear-gradient(135deg, rgba(52,211,153,0.06), rgba(20,25,39,0.9))",
                border: "1px solid rgba(52,211,153,0.12)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏃</span>
                  <span className="text-sm font-medium">운동 여부</span>
                </div>
                <button
                  onClick={() => setExercise(!exercise)}
                  aria-label={exercise ? "운동 여부 해제" : "운동 여부 선택"}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors cursor-pointer relative",
                    exercise ? "bg-[var(--color-success)]" : "bg-[var(--color-surface-light)]",
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
                <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)] animate-slide-up">
                  <label className="text-xs text-[var(--color-muted)] mb-2 block">운동 종류</label>
                  <div className="flex flex-wrap gap-2">
                    {["걷기", "달리기", "헬스", "요가", "수영", "기타"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setExerciseType(type)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all active:scale-95",
                          exerciseType === type
                            ? "text-white font-medium"
                            : "text-[var(--color-muted)]",
                        )}
                        style={{
                          background: exerciseType === type
                            ? "linear-gradient(135deg, rgba(52,211,153,0.4), rgba(52,211,153,0.2))"
                            : "var(--color-surface-light)",
                          border: exerciseType === type
                            ? "1px solid rgba(52,211,153,0.4)"
                            : "1px solid transparent",
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 낮잠 카드 */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "linear-gradient(135deg, rgba(251,191,36,0.06), rgba(20,25,39,0.9))",
                border: "1px solid rgba(251,191,36,0.12)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">💤</span>
                  <span className="text-sm font-medium">낮잠 여부</span>
                </div>
                <button
                  onClick={() => setNap(!nap)}
                  aria-label={nap ? "낮잠 여부 해제" : "낮잠 여부 선택"}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors cursor-pointer relative",
                    nap ? "bg-[var(--color-warning)]" : "bg-[var(--color-surface-light)]",
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
                <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)] animate-slide-up">
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

            {/* 걱정 메모 카드 */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "linear-gradient(135deg, rgba(129,140,248,0.06), rgba(20,25,39,0.9))",
                border: "1px solid rgba(129,140,248,0.12)",
              }}
            >
              <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[var(--color-primary-light)] inline-block" />
                오늘의 걱정거리
              </h3>
              <p className="text-xs text-[var(--color-muted)] mb-3">
                잠들기 전 머릿속을 비우세요. 여기에 적어두면 내일 처리하면 됩니다.
              </p>
              <textarea
                value={worryNote}
                onChange={(e) => setWorryNote(e.target.value)}
                placeholder="오늘 신경 쓰이는 일이 있다면 적어보세요..."
                className="w-full h-24 rounded-xl p-3 text-sm resize-none outline-none transition-all"
                style={{
                  background: "var(--color-surface-light)",
                  border: "1px solid rgba(129,140,248,0.15)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(129,140,248,0.15)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                aria-label="오늘의 걱정거리 메모"
              />
            </div>
          </div>
        )}
      </div>

      {/* ━━━━━ 저장 버튼 (하단 고정) ━━━━━ */}
      <div
        className="fixed bottom-14 left-0 right-0 p-4"
        style={{
          background: "linear-gradient(180deg, transparent 0%, var(--color-background) 30%)",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
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
