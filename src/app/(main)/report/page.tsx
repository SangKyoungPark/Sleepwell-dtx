"use client";

import { useState, useEffect } from "react";
import { cn, formatMinutesToHM } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ScatterChart, Scatter, Cell,
  BarChart, Bar,
} from "recharts";

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

type Tab = "weekly" | "trend" | "correlation";

const MOOD_EMOJI: Record<string, string> = {
  terrible: "😫", bad: "😕", neutral: "😐", good: "🙂", great: "😊",
};

export default function ReportPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("weekly");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("sleepDiary") || "[]");
    setEntries(data);
  }, []);

  if (entries.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto pb-20">
        <p className="text-4xl mb-4">📊</p>
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
  const trendData = entries.map((e, i) => ({
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

  return (
    <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold mb-1">나의 리포트</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {entries.length}일간의 수면 데이터
        </p>
      </div>

      {/* 탭 */}
      <div className="flex gap-1.5 mb-6">
        {([
          { id: "weekly" as Tab, label: "주간 요약" },
          { id: "trend" as Tab, label: "트렌드" },
          { id: "correlation" as Tab, label: "상관관계" },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-2 rounded-xl text-sm transition-colors cursor-pointer",
              activeTab === tab.id
                ? "bg-[var(--color-primary)] text-white font-medium"
                : "bg-[var(--color-surface)] text-[var(--color-muted)]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 주간 요약 */}
      {activeTab === "weekly" && (
        <div className="space-y-4">
          {/* 핵심 수치 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--color-surface)] rounded-2xl p-4 text-center">
              <p className="text-xs text-[var(--color-muted)] mb-1">평균 수면시간</p>
              <p className="text-2xl font-bold text-[var(--color-primary-light)]">
                {formatMinutesToHM(avgSleepTime)}
              </p>
            </div>
            <div className="bg-[var(--color-surface)] rounded-2xl p-4 text-center">
              <p className="text-xs text-[var(--color-muted)] mb-1">평균 수면효율</p>
              <p className={`text-2xl font-bold ${
                avgEfficiency >= 85 ? "text-[var(--color-success)]" :
                avgEfficiency >= 70 ? "text-[var(--color-warning)]" : "text-red-400"
              }`}>
                {avgEfficiency}%
              </p>
            </div>
            <div className="bg-[var(--color-surface)] rounded-2xl p-4 text-center">
              <p className="text-xs text-[var(--color-muted)] mb-1">평균 수면 품질</p>
              <p className="text-2xl font-bold text-[var(--color-accent)]">
                {avgQuality} <span className="text-sm">/ 5</span>
              </p>
            </div>
            <div className="bg-[var(--color-surface)] rounded-2xl p-4 text-center">
              <p className="text-xs text-[var(--color-muted)] mb-1">평균 깬 횟수</p>
              <p className="text-2xl font-bold text-[var(--color-foreground)]">
                {avgAwakenings}<span className="text-sm">회</span>
              </p>
            </div>
          </div>

          {/* 요일별 수면시간 */}
          <div className="bg-[var(--color-surface)] rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
              요일별 평균 수면시간
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dayStats}>
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 10]} />
                <Bar dataKey="수면시간" radius={[6, 6, 0, 0]}>
                  {dayStats.map((entry, i) => (
                    <Cell key={i} fill={entry.수면시간 >= 7 ? "#34d399" : entry.수면시간 >= 5 ? "#fbbf24" : "#f87171"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 최근 기록 */}
          <div className="bg-[var(--color-surface)] rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
              최근 기록
            </h3>
            <div className="space-y-2">
              {entries.slice(-5).reverse().map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-muted)]">{entry.date.slice(5)}</span>
                  <span className="text-[var(--color-primary-light)]">{formatMinutesToHM(entry.totalSleepTime)}</span>
                  <span className={`${entry.sleepEfficiency >= 85 ? "text-[var(--color-success)]" : entry.sleepEfficiency >= 70 ? "text-[var(--color-warning)]" : "text-red-400"}`}>
                    {entry.sleepEfficiency}%
                  </span>
                  <span>{MOOD_EMOJI[entry.morningMood] || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 트렌드 */}
      {activeTab === "trend" && (
        <div className="space-y-4">
          {/* 수면효율 추이 */}
          <div className="bg-[var(--color-surface)] rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
              수면효율 추이 (%)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2438" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#141927", border: "1px solid #1e2438", borderRadius: 12 }}
                  labelStyle={{ color: "#64748b" }}
                />
                <Line type="monotone" dataKey="수면효율" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 수면시간 추이 */}
          <div className="bg-[var(--color-surface)] rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
              수면시간 추이 (시간)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2438" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                <YAxis domain={[0, 12]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#141927", border: "1px solid #1e2438", borderRadius: 12 }}
                  labelStyle={{ color: "#64748b" }}
                />
                <Line type="monotone" dataKey="수면시간" stroke="#34d399" strokeWidth={2} dot={{ fill: "#34d399", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 수면 품질 추이 */}
          <div className="bg-[var(--color-surface)] rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
              수면 품질 추이 (1~5)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2438" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                <YAxis domain={[0, 5]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#141927", border: "1px solid #1e2438", borderRadius: 12 }}
                  labelStyle={{ color: "#64748b" }}
                />
                <Line type="monotone" dataKey="수면품질" stroke="#a78bfa" strokeWidth={2} dot={{ fill: "#a78bfa", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 상관관계 */}
      {activeTab === "correlation" && (
        <div className="space-y-4">
          {correlationData.length >= 2 ? (
            <div className="bg-[var(--color-surface)] rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
                스트레스 vs 수면 품질
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2438" />
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
                    contentStyle={{ backgroundColor: "#141927", border: "1px solid #1e2438", borderRadius: 12 }}
                    cursor={{ strokeDasharray: "3 3" }}
                  />
                  <Scatter data={correlationData} fill="#6366f1">
                    {correlationData.map((_, i) => (
                      <Cell key={i} fill="#818cf8" />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <p className="text-xs text-[var(--color-muted)] text-center mt-2">
                데이터가 쌓일수록 패턴이 더 명확해집니다
              </p>
            </div>
          ) : (
            <div className="bg-[var(--color-surface)] rounded-2xl p-6 text-center">
              <p className="text-3xl mb-3">📈</p>
              <p className="text-sm font-medium mb-1">상관관계 분석</p>
              <p className="text-xs text-[var(--color-muted)]">
                저녁 기록(스트레스 수준)이 2개 이상 쌓이면<br />
                스트레스-수면 상관관계를 분석합니다
              </p>
            </div>
          )}

          {/* 인사이트 */}
          <div className="bg-[var(--color-surface)] rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-2">💡 인사이트</h3>
            <ul className="text-xs text-[var(--color-muted)] space-y-2">
              {avgEfficiency >= 85 ? (
                <li>✅ 수면효율이 85% 이상으로 양호합니다!</li>
              ) : (
                <li>⚠️ 수면효율이 {avgEfficiency}%입니다. 침대에서 보내는 시간을 줄여보세요.</li>
              )}
              {parseFloat(avgQuality) >= 3.5 ? (
                <li>✅ 주관적 수면 품질이 괜찮은 편입니다.</li>
              ) : (
                <li>⚠️ 수면 품질이 낮은 편입니다. 이완 도구를 활용해보세요.</li>
              )}
              <li>📊 데이터가 많을수록 더 정확한 분석이 가능합니다. 매일 기록해보세요!</li>
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
