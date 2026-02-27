"use client";

import { useState, useEffect } from "react";
import { cn, formatMinutesToHM } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { getDiaryEntries, dbToDiary } from "@/lib/supabase/db";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ScatterChart, Scatter, Cell,
  BarChart, Bar,
} from "recharts";
import { HeaderStars, SleepScoreRing, CoachCharacter } from "@/components/ui/SleepIllustrations";

interface DiaryEntry {
  date: string;
  bedtime: string;
  wakeTime: string;
  sleepOnsetLatency: number;
  awakenings: number;
  waso: number;
  sleepQuality: number;
  morningMood: string;
  totalSleepTime: number;
  sleepEfficiency: number;
  stressLevel?: number;
}

type Tab = "weekly" | "trend" | "correlation" | "ai";

interface AIAnalysis {
  score: number;
  grade: string;
  summary: string;
  highlights: string[];
  concerns: string[];
  tips: string[];
  weeklyTrend: "improving" | "stable" | "declining";
}

const MOOD_EMOJI: Record<string, string> = {
  terrible: "😫", bad: "😕", neutral: "😐", good: "🙂", great: "😊",
};

const TAB_CONFIG: { id: Tab; label: string; icon: string }[] = [
  { id: "weekly", label: "주간", icon: "📋" },
  { id: "trend", label: "트렌드", icon: "📈" },
  { id: "correlation", label: "상관", icon: "🔗" },
  { id: "ai", label: "AI분석", icon: "🤖" },
];

/** 통계 카드에 사용되는 아이콘 SVG */
function StatIcon({ type }: { type: "sleep" | "efficiency" | "quality" | "awake" }) {
  const iconMap = {
    sleep: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M17 10A7 7 0 107 3a5.5 5.5 0 0010 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    efficiency: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    quality: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2l2.5 5 5.5.8-4 3.9.9 5.5L10 14.7l-4.9 2.5.9-5.5-4-3.9 5.5-.8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    awake: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v5M10 14h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  };
  return iconMap[type];
}

export default function ReportPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("weekly");
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    async function loadEntries() {
      if (user) {
        const { data } = await getDiaryEntries(user.id);
        if (data) {
          const converted = data.map((row: Record<string, unknown>) => dbToDiary(row));
          localStorage.setItem("sleepDiary", JSON.stringify(converted));
          setEntries(converted.map((e) => ({
            date: String(e.date || ""),
            bedtime: String(e.bedtime || ""),
            wakeTime: String(e.wakeTime || ""),
            sleepOnsetLatency: Number(e.sleepOnsetLatency) || 0,
            awakenings: Number(e.awakenings) || 0,
            waso: Number(e.waso) || 0,
            sleepQuality: Number(e.sleepQuality) || 0,
            morningMood: String(e.morningMood || ""),
            totalSleepTime: Number(e.totalSleepTime) || 0,
            sleepEfficiency: Number(e.sleepEfficiency) || 0,
            stressLevel: e.stressLevel != null ? Number(e.stressLevel) : undefined,
          })));
          return;
        }
      }
      try {
        const raw = JSON.parse(localStorage.getItem("sleepDiary") || "[]");
        const data = (Array.isArray(raw) ? raw : []).map((e: Record<string, unknown>) => ({
          date: String(e.date || ""),
          bedtime: String(e.bedtime || ""),
          wakeTime: String(e.wakeTime || ""),
          sleepOnsetLatency: Number(e.sleepOnsetLatency) || 0,
          awakenings: Number(e.awakenings) || 0,
          waso: Number(e.waso) || 0,
          sleepQuality: Number(e.sleepQuality) || 0,
          morningMood: String(e.morningMood || ""),
          totalSleepTime: Number(e.totalSleepTime) || 0,
          sleepEfficiency: Number(e.sleepEfficiency) || 0,
          stressLevel: e.stressLevel != null ? Number(e.stressLevel) : undefined,
        }));
        setEntries(data);
      } catch {
        setEntries([]);
      }
    }
    loadEntries();
  }, [user]);

  async function fetchAIAnalysis() {
    if (aiAnalysis || aiLoading) return;
    setAiLoading(true);
    setAiError("");

    try {
      const diary = JSON.parse(localStorage.getItem("sleepDiary") || "[]");
      if (!diary.length) {
        setAiError("분석할 수면 데이터가 없습니다.");
        setAiLoading(false);
        return;
      }

      // 최근 7일 데이터 요약
      const recent = diary.slice(-7);
      const lines: string[] = [`총 ${diary.length}일 기록, 최근 ${recent.length}일 분석:`];
      for (const entry of recent) {
        const parts: string[] = [entry.date];
        if (entry.totalSleepTime) parts.push(`수면${Math.floor(entry.totalSleepTime / 60)}h${entry.totalSleepTime % 60}m`);
        if (entry.sleepEfficiency) parts.push(`효율${entry.sleepEfficiency}%`);
        if (entry.sleepQuality) parts.push(`품질${entry.sleepQuality}/5`);
        if (entry.sleepOnsetLatency) parts.push(`입면${entry.sleepOnsetLatency}분`);
        if (entry.awakenings) parts.push(`깬횟수${entry.awakenings}`);
        if (entry.stressLevel) parts.push(`스트레스${entry.stressLevel}/10`);
        if (entry.caffeine) parts.push(`카페인O`);
        if (entry.exercise) parts.push(`운동O`);
        lines.push(parts.join(" | "));
      }

      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sleepData: lines.join("\n") }),
      });

      if (!res.ok) throw new Error("분석 요청 실패");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiAnalysis(data);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "분석 중 오류가 발생했습니다.");
    } finally {
      setAiLoading(false);
    }
  }

  if (entries.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto pb-20">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(167,139,250,0.15))",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          📊
        </div>
        <p className="text-lg font-bold mb-2">아직 데이터가 없어요</p>
        <p className="text-sm text-[var(--color-muted)] text-center">
          수면 일지를 기록하면<br />리포트가 생성됩니다
        </p>
      </main>
    );
  }

  // 통계 계산
  const avgSleepTime = Math.round(entries.reduce((s, e) => s + e.totalSleepTime, 0) / entries.length);
  const avgEfficiency = Math.round(entries.reduce((s, e) => s + e.sleepEfficiency, 0) / entries.length);
  const avgQuality = (entries.reduce((s, e) => s + e.sleepQuality, 0) / entries.length).toFixed(1);
  const avgAwakenings = (entries.reduce((s, e) => s + e.awakenings, 0) / entries.length).toFixed(1);

  // 트렌드 차트 데이터
  const trendData = entries.map((e) => ({
    name: e.date.slice(5), // MM-DD
    수면효율: e.sleepEfficiency,
    수면시간: Math.round(e.totalSleepTime / 60 * 10) / 10, // 시간 단위
    수면품질: e.sleepQuality,
  }));

  // 요일별 평균 수면시간
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dayStats = dayNames.map((name, dayIndex) => {
    const dayEntries = entries.filter((e) => new Date(e.date).getDay() === dayIndex);
    const avg = dayEntries.length > 0
      ? Math.round(dayEntries.reduce((s, e) => s + e.totalSleepTime, 0) / dayEntries.length / 60 * 10) / 10
      : 0;
    return { name, 수면시간: avg };
  });

  // 상관관계 데이터 (스트레스 vs 수면품질)
  const correlationData = entries
    .filter((e) => e.stressLevel != null)
    .map((e) => ({
      스트레스: e.stressLevel!,
      수면품질: e.sleepQuality,
    }));

  /** 차트 카드 래퍼 */
  function ChartCard({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
    return (
      <div
        className="rounded-2xl p-4 animate-card-stagger"
        style={{
          background: "linear-gradient(135deg, rgba(20,25,39,0.95), rgba(30,36,56,0.8))",
          border: "1px solid rgba(99,102,241,0.12)",
          backdropFilter: "blur(8px)",
          animationDelay: `${delay}ms`,
        }}
      >
        <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">
          {title}
        </h3>
        {children}
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-20 animate-fade-in">
      {/* ━━━ 프리미엄 헤더 ━━━ */}
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{
              background: "linear-gradient(135deg, rgba(52,211,153,0.2), rgba(99,102,241,0.2))",
              border: "1px solid rgba(52,211,153,0.15)",
            }}
          >
            📊
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">나의 리포트</h1>
            <p className="text-xs text-[var(--color-muted)]">
              {entries.length}일간의 수면 데이터
            </p>
          </div>
          <div className="ml-auto">
            <HeaderStars />
          </div>
        </div>
      </div>

      {/* ━━━ 글래스모피즘 세그먼트 탭 ━━━ */}
      <div
        className="flex gap-1 p-1 mb-6 rounded-2xl"
        style={{
          background: "rgba(20,25,39,0.8)",
          border: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
        }}
        role="tablist"
        aria-label="리포트 탭"
      >
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === "ai" && !aiAnalysis && !aiLoading) fetchAIAnalysis();
            }}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1",
              activeTab === tab.id
                ? "text-white"
                : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
            )}
            style={
              activeTab === tab.id
                ? {
                    background: "linear-gradient(135deg, #6366f1, #818cf8)",
                    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                  }
                : {}
            }
          >
            <span className="text-xs">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ━━━ 주간 요약 ━━━ */}
      {activeTab === "weekly" && (
        <div className="space-y-4">
          {/* 핵심 수치 그리드 */}
          <div className="grid grid-cols-2 gap-3">
            {([
              {
                label: "평균 수면시간",
                value: formatMinutesToHM(avgSleepTime),
                icon: "sleep" as const,
                color: "var(--color-primary-light)",
                bg: "rgba(99,102,241,0.15)",
                border: "rgba(99,102,241,0.2)",
              },
              {
                label: "평균 수면효율",
                value: `${avgEfficiency}%`,
                icon: "efficiency" as const,
                color: avgEfficiency >= 85 ? "var(--color-success)" : avgEfficiency >= 70 ? "var(--color-warning)" : "#f87171",
                bg: avgEfficiency >= 85 ? "rgba(52,211,153,0.15)" : avgEfficiency >= 70 ? "rgba(251,191,36,0.15)" : "rgba(248,113,113,0.15)",
                border: avgEfficiency >= 85 ? "rgba(52,211,153,0.2)" : avgEfficiency >= 70 ? "rgba(251,191,36,0.2)" : "rgba(248,113,113,0.2)",
              },
              {
                label: "평균 수면 품질",
                value: avgQuality,
                unit: "/ 5",
                icon: "quality" as const,
                color: "var(--color-accent)",
                bg: "rgba(167,139,250,0.15)",
                border: "rgba(167,139,250,0.2)",
              },
              {
                label: "평균 깬 횟수",
                value: avgAwakenings,
                unit: "회",
                icon: "awake" as const,
                color: "var(--color-foreground)",
                bg: "rgba(100,116,139,0.15)",
                border: "rgba(100,116,139,0.2)",
              },
            ] as const).map((stat, i) => (
              <div
                key={stat.label}
                className="rounded-2xl p-4 relative overflow-hidden animate-card-stagger"
                style={{
                  background: `linear-gradient(135deg, ${stat.bg}, rgba(20,25,39,0.95))`,
                  border: `1px solid ${stat.border}`,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                {/* 배경 아이콘 */}
                <div
                  className="absolute -top-2 -right-2 opacity-10"
                  style={{ color: stat.color, transform: "scale(3)" }}
                >
                  <StatIcon type={stat.icon} />
                </div>

                <div className="relative">
                  {/* 미니 아이콘 */}
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
                    style={{ background: stat.bg, color: stat.color }}
                  >
                    <StatIcon type={stat.icon} />
                  </div>
                  <p className="text-[10px] text-[var(--color-muted)] mb-1 uppercase tracking-wider font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold animate-number-reveal" style={{ color: stat.color }}>
                    {stat.value}
                    {"unit" in stat && stat.unit && (
                      <span className="text-sm font-normal ml-1 text-[var(--color-muted)]">{stat.unit}</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 요일별 수면시간 */}
          <ChartCard title="요일별 평균 수면시간" delay={350}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dayStats}>
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 10]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#141927",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  }}
                  labelStyle={{ color: "#64748b" }}
                />
                <Bar dataKey="수면시간" radius={[6, 6, 0, 0]}>
                  {dayStats.map((entry, i) => (
                    <Cell key={i} fill={entry.수면시간 >= 7 ? "#34d399" : entry.수면시간 >= 5 ? "#fbbf24" : "#f87171"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 최근 기록 */}
          <ChartCard title="최근 기록" delay={450}>
            <div className="space-y-2.5">
              {/* 헤더 행 */}
              <div className="flex items-center justify-between text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-medium px-1">
                <span className="w-12">날짜</span>
                <span className="w-14 text-center">수면</span>
                <span className="w-12 text-center">효율</span>
                <span className="w-8 text-center">기분</span>
              </div>
              {entries.slice(-5).reverse().map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm py-2 px-1 rounded-xl transition-colors hover:bg-white/[0.02] animate-card-stagger"
                  style={{ animationDelay: `${500 + i * 60}ms` }}
                >
                  <span className="text-[var(--color-muted)] text-xs w-12">{entry.date.slice(5)}</span>
                  <span className="text-[var(--color-primary-light)] font-medium text-xs w-14 text-center">
                    {formatMinutesToHM(entry.totalSleepTime)}
                  </span>
                  <span className={`font-medium text-xs w-12 text-center ${
                    entry.sleepEfficiency >= 85 ? "text-[var(--color-success)]" :
                    entry.sleepEfficiency >= 70 ? "text-[var(--color-warning)]" : "text-red-400"
                  }`}>
                    {entry.sleepEfficiency}%
                  </span>
                  <span className="text-base w-8 text-center">{MOOD_EMOJI[entry.morningMood] || "—"}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      )}

      {/* ━━━ 트렌드 ━━━ */}
      {activeTab === "trend" && (
        <div className="space-y-4">
          {/* 수면효율 추이 */}
          <ChartCard title="수면효율 추이 (%)" delay={0}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,36,56,0.8)" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#141927",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  }}
                  labelStyle={{ color: "#64748b" }}
                />
                <Line
                  type="monotone"
                  dataKey="수면효율"
                  stroke="url(#efficiencyGradient)"
                  strokeWidth={2.5}
                  dot={{ fill: "#6366f1", r: 4, strokeWidth: 2, stroke: "#0a0e1a" }}
                  activeDot={{ fill: "#818cf8", r: 6, strokeWidth: 2, stroke: "#0a0e1a" }}
                />
                <defs>
                  <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 수면시간 추이 */}
          <ChartCard title="수면시간 추이 (시간)" delay={100}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,36,56,0.8)" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                <YAxis domain={[0, 12]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#141927",
                    border: "1px solid rgba(52,211,153,0.2)",
                    borderRadius: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  }}
                  labelStyle={{ color: "#64748b" }}
                />
                <Line
                  type="monotone"
                  dataKey="수면시간"
                  stroke="url(#sleepTimeGradient)"
                  strokeWidth={2.5}
                  dot={{ fill: "#34d399", r: 4, strokeWidth: 2, stroke: "#0a0e1a" }}
                  activeDot={{ fill: "#6ee7b7", r: 6, strokeWidth: 2, stroke: "#0a0e1a" }}
                />
                <defs>
                  <linearGradient id="sleepTimeGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#6ee7b7" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 수면 품질 추이 */}
          <ChartCard title="수면 품질 추이 (1~5)" delay={200}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,36,56,0.8)" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                <YAxis domain={[0, 5]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#141927",
                    border: "1px solid rgba(167,139,250,0.2)",
                    borderRadius: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  }}
                  labelStyle={{ color: "#64748b" }}
                />
                <Line
                  type="monotone"
                  dataKey="수면품질"
                  stroke="url(#qualityGradient)"
                  strokeWidth={2.5}
                  dot={{ fill: "#a78bfa", r: 4, strokeWidth: 2, stroke: "#0a0e1a" }}
                  activeDot={{ fill: "#c4b5fd", r: 6, strokeWidth: 2, stroke: "#0a0e1a" }}
                />
                <defs>
                  <linearGradient id="qualityGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#c4b5fd" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ━━━ 상관관계 ━━━ */}
      {activeTab === "correlation" && (
        <div className="space-y-4">
          {correlationData.length >= 2 ? (
            <ChartCard title="스트레스 vs 수면 품질">
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,36,56,0.8)" />
                  <XAxis
                    type="number" dataKey="스트레스" name="스트레스"
                    domain={[0, 10]}
                    tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false}
                    label={{ value: "스트레스", position: "insideBottom", offset: -5, fill: "#64748b", fontSize: 11 }}
                  />
                  <YAxis
                    type="number" dataKey="수면품질" name="수면품질"
                    domain={[0, 5]}
                    tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false}
                    label={{ value: "수면품질", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#141927",
                      border: "1px solid rgba(99,102,241,0.2)",
                      borderRadius: 12,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                    }}
                    cursor={{ strokeDasharray: "3 3" }}
                  />
                  <Scatter data={correlationData} fill="#6366f1">
                    {correlationData.map((_, i) => (
                      <Cell key={i} fill="#818cf8" />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-[var(--color-muted)] text-center mt-2 uppercase tracking-wider">
                데이터가 쌓일수록 패턴이 더 명확해집니다
              </p>
            </ChartCard>
          ) : (
            <div
              className="rounded-2xl p-6 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(20,25,39,0.95), rgba(30,36,56,0.8))",
                border: "1px solid rgba(99,102,241,0.12)",
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(167,139,250,0.15))",
                }}
              >
                📈
              </div>
              <p className="text-sm font-medium mb-1">상관관계 분석</p>
              <p className="text-xs text-[var(--color-muted)]">
                저녁 기록(스트레스 수준)이 2개 이상 쌓이면<br />
                스트레스-수면 상관관계를 분석합니다
              </p>
            </div>
          )}

          {/* 인사이트 카드 */}
          <div
            className="rounded-2xl p-5 animate-card-stagger"
            style={{
              background: "linear-gradient(135deg, rgba(20,25,39,0.95), rgba(30,36,56,0.8))",
              border: "1px solid rgba(251,191,36,0.15)",
              animationDelay: "100ms",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(251,191,36,0.15)" }}
              >
                <span className="text-sm">💡</span>
              </div>
              <h3 className="text-xs font-semibold text-[var(--color-warning)] uppercase tracking-wider">
                인사이트
              </h3>
            </div>
            <ul className="text-xs text-[var(--color-muted)] space-y-2.5">
              {avgEfficiency >= 85 ? (
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-success)] mt-0.5 flex-shrink-0">✓</span>
                  <span>수면효율이 85% 이상으로 양호합니다!</span>
                </li>
              ) : (
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-warning)] mt-0.5 flex-shrink-0">!</span>
                  <span>수면효율이 {avgEfficiency}%입니다. 침대에서 보내는 시간을 줄여보세요.</span>
                </li>
              )}
              {parseFloat(avgQuality) >= 3.5 ? (
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-success)] mt-0.5 flex-shrink-0">✓</span>
                  <span>주관적 수면 품질이 괜찮은 편입니다.</span>
                </li>
              ) : (
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-warning)] mt-0.5 flex-shrink-0">!</span>
                  <span>수면 품질이 낮은 편입니다. 이완 도구를 활용해보세요.</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-primary-light)] mt-0.5 flex-shrink-0">i</span>
                <span>데이터가 많을수록 더 정확한 분석이 가능합니다. 매일 기록해보세요!</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ━━━ AI 분석 ━━━ */}
      {activeTab === "ai" && (
        <div className="space-y-4">
          {!aiAnalysis && !aiLoading && !aiError && (
            <div
              className="rounded-2xl p-8 text-center relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(20,25,39,0.95))",
                border: "1px solid rgba(99,102,241,0.15)",
              }}
            >
              {/* 배경 오라 */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)" }}
              />
              <div className="relative">
                <CoachCharacter size={80} className="mx-auto mb-4 animate-float" />
                <p className="text-lg font-bold mb-2">AI 수면 분석</p>
                <p className="text-sm text-[var(--color-muted)] mb-5">
                  최근 수면 데이터를 AI가 종합 분석하여<br />
                  맞춤형 인사이트를 제공합니다
                </p>
                <button
                  onClick={fetchAIAnalysis}
                  className="px-6 py-3 rounded-xl font-medium text-sm cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #818cf8)",
                    color: "white",
                    boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                  }}
                >
                  분석 시작하기
                </button>
              </div>
            </div>
          )}

          {aiLoading && (
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(20,25,39,0.95), rgba(30,36,56,0.8))",
                border: "1px solid rgba(99,102,241,0.15)",
              }}
            >
              <div className="flex justify-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full animate-typing-bounce" style={{ background: "#6366f1", animationDelay: "0ms" }} />
                <span className="w-2.5 h-2.5 rounded-full animate-typing-bounce" style={{ background: "#818cf8", animationDelay: "200ms" }} />
                <span className="w-2.5 h-2.5 rounded-full animate-typing-bounce" style={{ background: "#a78bfa", animationDelay: "400ms" }} />
              </div>
              <p className="text-sm text-[var(--color-muted)]">AI가 수면 데이터를 분석하고 있어요...</p>
            </div>
          )}

          {aiError && (
            <div
              className="rounded-2xl p-5 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(248,113,113,0.08), rgba(20,25,39,0.95))",
                border: "1px solid rgba(248,113,113,0.2)",
              }}
            >
              <p className="text-sm text-red-400 mb-3">{aiError}</p>
              <button
                onClick={() => { setAiError(""); setAiAnalysis(null); }}
                className="px-4 py-2 text-sm rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                style={{
                  background: "rgba(248,113,113,0.1)",
                  border: "1px solid rgba(248,113,113,0.2)",
                  color: "#f87171",
                }}
              >
                다시 시도
              </button>
            </div>
          )}

          {aiAnalysis && (
            <>
              {/* ━━━ 수면 건강 점수 ━━━ */}
              <div
                className="rounded-2xl p-6 text-center relative overflow-hidden animate-scale-in"
                style={{
                  background: "linear-gradient(135deg, rgba(20,25,39,0.95), rgba(30,36,56,0.8))",
                  border: `1px solid ${
                    aiAnalysis.score >= 80 ? "rgba(52,211,153,0.2)" :
                    aiAnalysis.score >= 60 ? "rgba(251,191,36,0.2)" : "rgba(248,113,113,0.2)"
                  }`,
                }}
              >
                {/* 배경 glow */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full pointer-events-none animate-glow-pulse"
                  style={{
                    background: `radial-gradient(circle, ${
                      aiAnalysis.score >= 80 ? "rgba(52,211,153,0.12)" :
                      aiAnalysis.score >= 60 ? "rgba(251,191,36,0.12)" : "rgba(248,113,113,0.12)"
                    } 0%, transparent 70%)`,
                  }}
                />

                <p className="text-[10px] text-[var(--color-muted)] mb-3 uppercase tracking-wider font-semibold relative">
                  수면 건강 점수
                </p>

                <div className="relative inline-flex items-center justify-center w-28 h-28 mb-3">
                  <SleepScoreRing value={aiAnalysis.score} size={112} strokeWidth={8} />
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-bold animate-number-reveal">{aiAnalysis.score}</span>
                    <span className="text-[10px] text-[var(--color-muted)]">/ 100</span>
                  </div>
                </div>

                <p className={`text-2xl font-bold mb-1 ${
                  aiAnalysis.score >= 80 ? "text-[var(--color-success)]" :
                  aiAnalysis.score >= 60 ? "text-[var(--color-warning)]" : "text-red-400"
                }`}>
                  {aiAnalysis.grade}
                </p>
                <p className="text-sm text-[var(--color-muted)] relative">{aiAnalysis.summary}</p>

                <div
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                  style={{
                    background: aiAnalysis.weeklyTrend === "improving"
                      ? "rgba(52,211,153,0.12)"
                      : aiAnalysis.weeklyTrend === "stable"
                      ? "rgba(100,116,139,0.12)"
                      : "rgba(248,113,113,0.12)",
                    border: `1px solid ${
                      aiAnalysis.weeklyTrend === "improving"
                        ? "rgba(52,211,153,0.2)"
                        : aiAnalysis.weeklyTrend === "stable"
                        ? "rgba(100,116,139,0.2)"
                        : "rgba(248,113,113,0.2)"
                    }`,
                  }}
                >
                  <span>{aiAnalysis.weeklyTrend === "improving" ? "📈" : aiAnalysis.weeklyTrend === "stable" ? "➡️" : "📉"}</span>
                  <span className="text-[var(--color-muted)]">
                    {aiAnalysis.weeklyTrend === "improving" ? "개선 중" : aiAnalysis.weeklyTrend === "stable" ? "유지 중" : "주의 필요"}
                  </span>
                </div>
              </div>

              {/* 잘하고 있는 점 */}
              {aiAnalysis.highlights.length > 0 && (
                <div
                  className="rounded-2xl p-5 animate-card-stagger"
                  style={{
                    background: "linear-gradient(135deg, rgba(52,211,153,0.06), rgba(20,25,39,0.95))",
                    border: "1px solid rgba(52,211,153,0.15)",
                    animationDelay: "100ms",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(52,211,153,0.15)" }}
                    >
                      <span className="text-sm">✓</span>
                    </div>
                    <h3 className="text-xs font-semibold text-[var(--color-success)] uppercase tracking-wider">
                      잘하고 있는 점
                    </h3>
                  </div>
                  <ul className="space-y-2.5">
                    {aiAnalysis.highlights.map((h, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-[var(--color-foreground)]">
                        <span className="text-[var(--color-success)] shrink-0 mt-0.5">✓</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 주의할 점 */}
              {aiAnalysis.concerns.length > 0 && (
                <div
                  className="rounded-2xl p-5 animate-card-stagger"
                  style={{
                    background: "linear-gradient(135deg, rgba(251,191,36,0.06), rgba(20,25,39,0.95))",
                    border: "1px solid rgba(251,191,36,0.15)",
                    animationDelay: "200ms",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(251,191,36,0.15)" }}
                    >
                      <span className="text-sm">!</span>
                    </div>
                    <h3 className="text-xs font-semibold text-[var(--color-warning)] uppercase tracking-wider">
                      주의할 점
                    </h3>
                  </div>
                  <ul className="space-y-2.5">
                    {aiAnalysis.concerns.map((c, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-[var(--color-foreground)]">
                        <span className="text-[var(--color-warning)] shrink-0 mt-0.5">!</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 이번 주 실천 팁 */}
              <div
                className="rounded-2xl p-5 animate-card-stagger"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(20,25,39,0.95))",
                  border: "1px solid rgba(99,102,241,0.15)",
                  animationDelay: "300ms",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(99,102,241,0.15)" }}
                  >
                    <span className="text-sm">💡</span>
                  </div>
                  <h3 className="text-xs font-semibold text-[var(--color-primary-light)] uppercase tracking-wider">
                    이번 주 실천 팁
                  </h3>
                </div>
                <ul className="space-y-2.5">
                  {aiAnalysis.tips.map((t, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-[var(--color-foreground)]">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                        style={{
                          background: "rgba(99,102,241,0.15)",
                          color: "var(--color-primary-light)",
                        }}
                      >
                        {i + 1}
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 다시 분석 */}
              <button
                onClick={() => { setAiAnalysis(null); }}
                className="w-full py-3 text-sm text-[var(--color-muted)] cursor-pointer hover:text-[var(--color-foreground)] transition-colors rounded-xl"
                style={{
                  background: "rgba(20,25,39,0.5)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                다시 분석하기
              </button>
            </>
          )}
        </div>
      )}
    </main>
  );
}
